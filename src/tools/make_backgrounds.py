"""Background video loops for the Natural and Parties & Seasons sections.

Downloads each clip once (cache: M:\\CMM-Site\\media-src\\backgrounds), cuts 8 seconds, and writes
  M:\\CMM-Site\\media\\images\\backgrounds\\<set>\\<name>-1080.mp4   1920x1080 (desktop / big screens)
                                                <name>-720.mp4    1280x720  (phones)
                                                <name>.jpg        poster frame
then upload with tools/upload_media.py (same as the rest of the media).

Footage: Pexels (pexels.com/license - free to use, no credit required). Source pages are listed below.
Run:  python tools/make_backgrounds.py
"""
import os, subprocess, sys, urllib.request, json
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
CACHE = r'M:\CMM-Site\media-src\backgrounds'
OUT = r'M:\CMM-Site\media\images\backgrounds'
LEN = 8

# name: (pexels id, file url, start second)
CLIPS = {
    'natural': [
        ('natural-01-waves',       31879939, 'https://videos.pexels.com/video-files/31879939/13580099_1920_1080_30fps.mp4', 2),
        ('natural-02-beach-above',  8257626, 'https://videos.pexels.com/video-files/8257626/8257626-hd_1920_1080_30fps.mp4', 3),
        ('natural-03-forest',      31693357, 'https://videos.pexels.com/video-files/31693357/13503273_1920_1080_30fps.mp4', 1),
        ('natural-04-mountains',   35325909, 'https://videos.pexels.com/video-files/35325909/14967325_1920_1080_60fps.mp4', 1),
        ('natural-05-horizon',     34228902, 'https://videos.pexels.com/video-files/34228902/14506493_1920_1080_30fps.mp4', 4),
        ('natural-06-city',        33646383, 'https://videos.pexels.com/video-files/33646383/14298774_1920_1080_24fps.mp4', 3),
    ],
    'parties': [
        ('parties-01-concert',     34059094, 'https://videos.pexels.com/video-files/34059094/14445520_1920_1080_30fps.mp4', 1),
        ('parties-02-fireworks',   29999748, 'https://videos.pexels.com/video-files/29999748/12871365_1920_1080_42fps.mp4', 0.5),
        ('parties-03-stage',       39204687, 'https://videos.pexels.com/video-files/39204687/16681866_1920_1080_24fps.mp4', 2),
        ('parties-04-brass-band',  36218484, 'https://videos.pexels.com/video-files/36218484/15359164_1920_1440_24fps.mp4', 2),
        ('parties-05-nightclub',   30077981, 'https://videos.pexels.com/video-files/30077981/12900606_1920_1080_120fps.mp4', 0),
        ('parties-06-wedding',     12350372, 'https://videos.pexels.com/video-files/12350372/12350372-hd_1920_1080_24fps.mp4', 4),
        ('parties-07-birthday',     7424513, 'https://videos.pexels.com/video-files/7424513/7424513-hd_1920_1080_30fps.mp4', 2),
        ('parties-08-christmas',   35090387, 'https://videos.pexels.com/video-files/35090387/14865924_1920_1080_60fps.mp4', 1),
        ('parties-09-new-year',     5751105, 'https://videos.pexels.com/video-files/5751105/5751105-hd_2048_1080_25fps.mp4', 1),
        ('parties-10-toast',        8058103, 'https://videos.pexels.com/video-files/8058103/8058103-hd_1920_1080_25fps.mp4', 0),
    ],
}
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36', 'Referer': 'https://www.pexels.com/'}

def fetch(url, dst):
    if os.path.exists(dst) and os.path.getsize(dst) > 100000: return
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=180) as r, open(dst + '.part', 'wb') as f:
        while True:
            b = r.read(1 << 20)
            if not b: break
            f.write(b)
    os.replace(dst + '.part', dst)

def duration(src):
    p = subprocess.run([FF, '-i', src], capture_output=True, text=True)
    import re
    m = re.search(r'Duration: (\d+):(\d+):([\d.]+)', p.stderr)
    return int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3)) if m else 0

def enc(src, dst, start, w, h, crf, maxrate):
    vf = 'scale=%d:%d:force_original_aspect_ratio=increase:flags=lanczos,crop=%d:%d,fps=30,format=yuv420p' % (w, h, w, h)
    cmd = [FF, '-y', '-loglevel', 'error', '-ss', str(start), '-i', src, '-t', str(LEN), '-an', '-vf', vf,
           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', str(crf), '-maxrate', maxrate, '-bufsize', maxrate,
           '-profile:v', 'high', '-movflags', '+faststart', dst]
    subprocess.run(cmd, check=True)

credits = []
for group, clips in CLIPS.items():
    os.makedirs(os.path.join(OUT, group), exist_ok=True)
    os.makedirs(CACHE, exist_ok=True)
    for name, pid, url, start in clips:
        src = os.path.join(CACHE, '%s-%d.mp4' % (name, pid))
        fetch(url, src)
        d = duration(src)
        if d and start + LEN > d: start = max(0, d - LEN - 0.05)
        base = os.path.join(OUT, group, name)
        enc(src, base + '-1080.mp4', start, 1920, 1080, 27, '4M')
        enc(src, base + '-720.mp4', start, 1280, 720, 28, '2M')
        subprocess.run([FF, '-y', '-loglevel', 'error', '-ss', str(start + 0.2), '-i', src, '-frames:v', '1',
                        '-vf', 'scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720', '-q:v', '4', base + '.jpg'], check=True)
        s = [os.path.getsize(base + x) // 1024 for x in ('-1080.mp4', '-720.mp4', '.jpg')]
        print('%-24s src %5.1fs  1080p %5d KB  720p %5d KB  poster %4d KB' % (name, d, s[0], s[1], s[2]), flush=True)
        credits.append({'file': 'backgrounds/%s/%s' % (group, name), 'source': 'https://www.pexels.com/video/%d/' % pid, 'license': 'Pexels License'})
json.dump(credits, open(os.path.join(CACHE, 'credits.json'), 'w'), indent=1)
print('done')
