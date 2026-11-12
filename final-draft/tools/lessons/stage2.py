"""Stage 2: encode the kept lessons (H.264 + AAC, faststart), make posters, append to the site's lessons.csv.
Usage: python stage2.py keep.json     keep.json = {"<index in order.json>": ["title", "topic override or empty"]}"""
import csv, json, os, re, sys, subprocess, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
H = os.path.dirname(os.path.abspath(__file__))
OUT = r'M:\CMM-Site\final-draft\images\lessons'
os.makedirs(OUT, exist_ok=True)
meta = json.load(open(os.path.join(H, 'meta.json'), encoding='utf-8'))
order = json.load(open(os.path.join(H, 'order.json')))
keep = json.load(open(sys.argv[1], encoding='utf-8'))
csvp = os.path.join(OUT, 'lessons.csv')
F = ['file', 'poster', 'topic', 'title', 'artist', 'post_url', 'width', 'height', 'seconds']
rows = list(csv.DictReader(open(csvp, encoding='utf-8-sig', newline=''))) if os.path.exists(csvp) else []
have = {re.search(r'/p/([^/]+)/', r['post_url']).group(1) for r in rows}
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:30]
for idx, (title, topic) in keep.items():
    code = order[int(idx)]; m = meta[code]; topic = topic or m['topic']
    if code in have: continue
    base = '%s_%s_%s' % (slug(topic), m['by'].lstrip('@'), code)
    src, mp4, jpg = os.path.join(H, 'mux', code + '.mp4'), os.path.join(OUT, base + '.mp4'), os.path.join(OUT, base + '.jpg')
    if not os.path.exists(mp4):
        subprocess.run([FF, '-y', '-loglevel', 'error', '-i', src, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p',
                        '-vf', "scale='min(1080,iw)':-2", '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', mp4], check=True)
    if not os.path.exists(jpg):
        subprocess.run([FF, '-y', '-loglevel', 'error', '-ss', '1.2', '-i', mp4, '-frames:v', '1', '-vf', 'scale=540:-2', '-q:v', '3', jpg], check=True)
    rows.append(dict(file=base + '.mp4', poster=base + '.jpg', topic=topic, title=title, artist=m['by'], post_url='https://www.instagram.com/p/%s/' % code,
                     width=1080, height=round(1080 * m['h'] / m['w']), seconds=round(m['dur'], 1)))
    have.add(code); print('ok', idx, base)
with open(csvp, 'w', encoding='utf-8', newline='') as f:
    w = csv.DictWriter(f, fieldnames=F, quoting=csv.QUOTE_ALL); w.writeheader(); w.writerows(rows)
print(len(rows), 'lessons in csv')
