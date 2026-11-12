"""Stage 1: mux each downloaded clip (video + audio) and make frame sheets for review.
Usage: python stage1.py <zip> [<zip> ...]   (zips hold CODE_v.mp4, CODE_a.mp4 and meta.json)"""
import json, os, sys, zipfile, subprocess, imageio_ffmpeg
from PIL import Image, ImageDraw
FF = imageio_ffmpeg.get_ffmpeg_exe()
H = os.path.dirname(os.path.abspath(__file__))
RAW, MUX, FR, SH = [os.path.join(H, d) for d in ('raw', 'mux', 'frames', 'sheets')]
for d in (RAW, MUX, FR, SH): os.makedirs(d, exist_ok=True)
mp = os.path.join(H, 'meta.json'); meta = json.load(open(mp, encoding='utf-8')) if os.path.exists(mp) else {}
for z in sys.argv[1:]:
    with zipfile.ZipFile(z) as zf:
        zf.extractall(RAW)
        if 'meta.json' in zf.namelist():
            for m in json.loads(zf.read('meta.json')): meta[m['code']] = m
json.dump(meta, open(mp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
order = []
for code, m in meta.items():
    v, a, o = os.path.join(RAW, code + '_v.mp4'), os.path.join(RAW, code + '_a.mp4'), os.path.join(MUX, code + '.mp4')
    if not os.path.exists(v): continue
    if not os.path.exists(o):
        subprocess.run([FF, '-y', '-loglevel', 'error', '-i', v, '-i', a, '-map', '0:v:0', '-map', '1:a:0', '-c', 'copy', '-shortest', o], check=False)
    if not os.path.exists(o): print('mux failed', code); continue
    fr = [os.path.join(FR, '%s_%d.jpg' % (code, i)) for i in range(6)]
    if not os.path.exists(fr[-1]):
        for i, f in enumerate(fr):
            t = max(0.3, m['dur'] * (i + 0.5) / 6)
            subprocess.run([FF, '-y', '-loglevel', 'error', '-ss', '%.2f' % t, '-i', o, '-frames:v', '1', '-vf', 'scale=180:-2', f], check=False)
    order.append(code)
import csv
lp = r'M:\CMM-Site\final-draft\images\lessons\lessons.csv'
done = {r['post_url'].rstrip('/').split('/')[-1] for r in csv.DictReader(open(lp, encoding='utf-8-sig'))} if os.path.exists(lp) else set()
rej = set(json.load(open(os.path.join(H, 'rejected.json')))) if os.path.exists(os.path.join(H, 'rejected.json')) else set()
order = [c for c in order if c not in done and c not in rej]   # review sheets show only clips not yet decided
order.sort(key=lambda c: (meta[c]['topic'], c))
json.dump(order, open(os.path.join(H, 'order.json'), 'w'), indent=0)
W, R = 180, 320
for s in range(0, len(order), 6):
    rows = order[s:s + 6]
    img = Image.new('RGB', (160 + 6 * W, len(rows) * (R + 6)), 'white'); d = ImageDraw.Draw(img)
    for r, code in enumerate(rows):
        m = meta[code]; y = r * (R + 6)
        d.text((4, y + 4), '%d\n%s\n%s\n%s\n%ds' % (s + r, code, m['topic'][:22], m['by'][:20], m['dur']), fill='black')
        for i in range(6):
            f = os.path.join(FR, '%s_%d.jpg' % (code, i))
            if os.path.exists(f): img.paste(Image.open(f).resize((W, R)), (160 + i * W, y))
    img.save(os.path.join(SH, 'L%02d.jpg' % (s // 6)), quality=82)
print(len(order), 'clips;', (len(order) + 5) // 6, 'sheets')
