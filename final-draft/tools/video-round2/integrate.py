"""Copy the round-2 clips that passed the text-overlay review into the site.
Transcodes to H.264 (Safari/iOS safe), no audio, faststart; poster from 1s in."""
import json, os, csv, re, subprocess, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
R2 = os.path.dirname(os.path.abspath(__file__))
SITE = r'M:\CMM-Site\final-draft'
VD = os.path.join(SITE, 'images', 'videos')
KEEP = [0,1,4,5,7,9,10,12,13,14,16,19,20,21,22,24,25,27,30,31,32,33,34,35,
        36,37,39,40,42,44,46,47,48,51,53,54,55]
order = json.load(open(os.path.join(R2, 'clip_order.json')))
picked = {p['code']: p for p in json.load(open(os.path.join(R2, 'picked.json')))}
csvp = os.path.join(VD, 'videos.csv')
old = list(csv.DictReader(open(csvp, encoding='utf-8-sig', newline='')))
have = {re.search(r'/p/([^/]+)/', r['post_url']).group(1) for r in old}
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
new = []
for i in KEEP:
    code = order[i]
    if code in have: continue
    p = picked[code]
    src = os.path.join(R2, 'clips', code + '.mp4')
    if not os.path.exists(src): print('missing', code); continue
    base = f"{p['g']}_{slug(p['s'])}_{p['by'].lstrip('@')}_{code}"
    out, pos = os.path.join(VD, base + '.mp4'), os.path.join(VD, base + '.jpg')
    if not os.path.exists(out):
        subprocess.run([FF, '-y', '-loglevel', 'error', '-i', src, '-an', '-c:v', 'libx264', '-preset', 'veryfast',
                        '-crf', '20', '-pix_fmt', 'yuv420p', '-vf', "scale='min(1080,iw)':-2", '-movflags', '+faststart', out], check=True)
    if not os.path.exists(pos):
        subprocess.run([FF, '-y', '-loglevel', 'error', '-ss', '1', '-i', out, '-frames:v', '1', '-vf', 'scale=720:-2', '-q:v', '3', pos], check=True)
    new.append(dict(file=base + '.mp4', poster=base + '.jpg', group=p['g'], style=p['s'], artist=p['by'],
                    post_url=f'https://www.instagram.com/p/{code}/', width=1080, height=round(1080 * p['h'] / p['w']), seconds=p['dur']))
    print('ok', i, base)
with open(csvp, 'w', encoding='utf-8', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(old[0].keys()), quoting=csv.QUOTE_ALL)
    w.writeheader(); w.writerows(old + new)
print('added', len(new), 'total', len(old) + len(new))
