"""Make web-ready copies of every image and clip for Supabase Storage (the heavy content).
Source: final-draft/images (icons stay with the site on GitHub; lessons are hidden so skipped).
Output: M:\\CMM-Site\\media\\images\\...  plus media/manifest.json  {original path: new path}
  gallery photos (inspiration, chanel, products) -> name.webp (1600 wide, q88) + name.m.webp (800 wide)
  affiliate avatars -> 480 wide, affiliate grid photos -> 720 wide, comment avatars -> 96 wide (webp)
  brand logos -> copied as they are (small, and their paths are built at runtime)
  clips -> 1080 wide H.264 CRF 21, no audio, faststart; posters -> 720 wide webp
New file names: lower case, spaces -> '-', '@' dropped, so URLs need no escaping.
Re-run safe: existing outputs are kept. Usage: python tools/optimize_media.py
"""
import json, os, re, subprocess, sys
from concurrent.futures import ProcessPoolExecutor
from PIL import Image, ImageOps
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(SITE, 'images')
OUT = r'M:\CMM-Site\media'
SKIP = ('icons', 'lessons')
IMG = ('.jpg', '.jpeg', '.png', '.webp')

def clean(rel):
    rel = rel.replace('\\', '/')
    return re.sub(r'-{2,}', '-', rel.lower().replace(' ', '-').replace('@', ''))

def save(im, path, width, q):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.exists(path): return
    im = im.copy()
    if im.width > width: im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    if im.mode not in ('RGB', 'RGBA'): im = im.convert('RGBA' if 'A' in im.mode else 'RGB')
    im.save(path, 'WEBP', quality=q, method=5)

def do_image(rel):
    src = os.path.join(SRC, rel); parts = rel.replace('\\', '/').split('/')
    top = parts[0]; base = os.path.splitext(clean('images/' + rel))[0]
    if top == 'brands':
        new = clean('images/' + rel); dst = os.path.join(OUT, *new.split('/'))
        new = 'images/' + rel.replace('\\', '/'); dst = os.path.join(OUT, *new.split('/'))   # keep exact name: built at runtime
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if not os.path.exists(dst):
            with open(src, 'rb') as a, open(dst, 'wb') as b: b.write(a.read())
        return rel, new
    im = ImageOps.exif_transpose(Image.open(src))
    if top == 'affiliates':
        w = 480 if len(parts) == 3 else 720
        save(im, os.path.join(OUT, *(base + '.webp').split('/')), w, 82); return rel, base + '.webp'
    if top == 'chanel' and len(parts) > 1 and parts[1] == 'comments':
        save(im, os.path.join(OUT, *(base + '.webp').split('/')), 96, 78); return rel, base + '.webp'
    if top == 'videos':   # clip poster
        save(im, os.path.join(OUT, *(base + '.webp').split('/')), 720, 80); return rel, base + '.webp'
    save(im, os.path.join(OUT, *(base + '.webp').split('/')), 1600, 88)
    save(im, os.path.join(OUT, *(base + '.m.webp').split('/')), 800, 82)
    return rel, base + '.webp'

def do_video(rel):
    import imageio_ffmpeg
    new = clean('images/' + rel); dst = os.path.join(OUT, *new.split('/'))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if not os.path.exists(dst):
        subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-i', os.path.join(SRC, rel), '-an', '-c:v', 'libx264',
                        '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p', '-vf', "scale='min(1080,iw)':-2", '-movflags', '+faststart', dst + '.tmp.mp4'], check=True)
        os.replace(dst + '.tmp.mp4', dst)
    return rel, new

if __name__ == '__main__':
    imgs, vids = [], []
    for root, dirs, files in os.walk(SRC):
        rel_root = os.path.relpath(root, SRC)
        if rel_root.split(os.sep)[0] in SKIP: continue
        for f in files:
            rel = os.path.normpath(os.path.join(rel_root, f)) if rel_root != '.' else f
            ext = os.path.splitext(f)[1].lower()
            if ext in IMG: imgs.append(rel)
            elif ext == '.mp4' and not f.endswith('.tmp.mp4'): vids.append(rel)
    man = {}
    with ProcessPoolExecutor(max_workers=6) as ex:
        for rel, new in ex.map(do_image, imgs, chunksize=8): man['images/' + rel.replace('\\', '/')] = new
        for rel, new in ex.map(do_video, vids): man['images/' + rel.replace('\\', '/')] = new
    json.dump(man, open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    total = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(OUT) for f in fs)
    print(len(imgs), 'images,', len(vids), 'clips ->', round(total / 1e6), 'MB in', OUT)
