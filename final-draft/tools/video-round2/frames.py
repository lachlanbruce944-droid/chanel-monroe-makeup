"""Unzip round-2 clips, pull 6 evenly spaced frames from each, and build review sheets (one row per clip),
so text overlays/captions anywhere in the clip can be spotted, not just on the cover."""
import glob, json, os, subprocess, zipfile
from PIL import Image, ImageDraw
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe(); R = r'M:\CMM-Site\CMM-Videos\round2'
os.makedirs(R + r'\clips', exist_ok=True); os.makedirs(R + r'\frames', exist_ok=True); os.makedirs(R + r'\fsheets', exist_ok=True)
for z in glob.glob(r'M:\cmm-clips-*.zip'):
    zf = zipfile.ZipFile(z)
    for n in zf.namelist():
        out = os.path.join(R, n.replace('/', os.sep))
        if not os.path.exists(out): zf.extract(n, R)
picked = {v['code']: v for v in json.load(open(R + r'\picked.json'))}
clips = sorted(glob.glob(R + r'\clips\*.mp4')); rows = []
for c in clips:
    code = os.path.basename(c)[:-4]; dur = picked.get(code, {}).get('dur') or 8
    fr = []
    for i in range(6):
        t = dur * (i + .5) / 6; f = R + r'\frames\%s_%d.jpg' % (code, i)
        if not os.path.exists(f): subprocess.run([FF, '-v', 'error', '-ss', '%.2f' % t, '-i', c, '-frames:v', '1', '-vf', 'scale=180:-1', '-y', f])
        if os.path.exists(f): fr.append(f)
    rows.append((code, fr))
W, H = 180, 320
for s in range(0, len(rows), 6):
    sheet = Image.new('RGB', (W * 6 + 160, (H + 6) * len(rows[s:s + 6])), 'white'); d = ImageDraw.Draw(sheet)
    for r, (code, fr) in enumerate(rows[s:s + 6]):
        y = r * (H + 6); v = picked.get(code, {})
        d.text((4, y + 6), '%d\n%s\n%s\n%s' % (s + r, code, v.get('g', ''), v.get('s', '')[:18]), fill='black')
        for i, f in enumerate(fr):
            im = Image.open(f).convert('RGB'); im.thumbnail((W, H)); sheet.paste(im, (160 + i * W, y))
    sheet.save(R + r'\fsheets\f%02d.jpg' % (s // 6), quality=78)
json.dump([c for c, _ in rows], open(R + r'\clip_order.json', 'w'))
print(len(rows), 'clips,', (len(rows) + 5) // 6, 'sheets')
