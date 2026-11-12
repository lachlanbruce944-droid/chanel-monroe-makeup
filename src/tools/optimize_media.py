"""Make web-ready copies of every image and clip for Supabase Storage (bucket `media`).

Source: final-draft/images (icons, brand logos and the About photo ship with the site on GitHub; lessons are hidden).
Output: M:\\CMM-Site\\media\\<storage name>  plus  M:\\CMM-Site\\media\\manifest.json  {source path: storage name}
Storage names follow tools/media_names.py (gallery/..., clips/..., chanel/..., affiliates/..., products/...).
  gallery, Chanel's work, products -> name.webp (1600 wide, q88) + name-800.webp (800 wide, q82)
  affiliate profile -> 480 wide, affiliate posts -> 720 wide, comment avatars -> 96 wide
  clips -> 1080 wide H.264 CRF 21, no audio, faststart; posters -> 720 wide
Re-run safe: existing outputs are kept. Then upload new files with tools/upload_media.py.
Usage: python tools/optimize_media.py
"""
import json, os, subprocess, sys
from concurrent.futures import ProcessPoolExecutor
from PIL import Image, ImageOps
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from media_names import storage_names

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(SITE, 'images')
OUT = r'M:\CMM-Site\media'
SKIP = ('icons', 'lessons', 'brands', 'about')
IMG = ('.jpg', '.jpeg', '.png', '.webp')


def save(im, name, width, q):
    path = os.path.join(OUT, *name.split('/'))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.exists(path): return
    im = im.copy()
    if im.width > width: im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    if im.mode not in ('RGB', 'RGBA'): im = im.convert('RGBA' if 'A' in im.mode else 'RGB')
    im.save(path, 'WEBP', quality=q, method=5)


def do_image(job):
    src, main, small = job
    im = ImageOps.exif_transpose(Image.open(os.path.join(SITE, *src.split('/'))))
    top = main.split('/')[0]
    if top == 'affiliates': save(im, main, 480 if main.endswith('/profile.webp') else 720, 82)
    elif main.startswith('chanel/comment-avatars/'): save(im, main, 96, 78)
    elif top == 'clips': save(im, main, 720, 80)            # clip poster
    else:
        save(im, main, 1600, 88)
        if small: save(im, small, 800, 82)
    return src, main


def do_video(job):
    import imageio_ffmpeg
    src, main, _ = job
    dst = os.path.join(OUT, *main.split('/'))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if not os.path.exists(dst):
        subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-i', os.path.join(SITE, *src.split('/')), '-an', '-c:v', 'libx264',
                        '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p', '-vf', "scale='min(1080,iw)':-2", '-movflags', '+faststart', dst + '.tmp.mp4'], check=True)
        os.replace(dst + '.tmp.mp4', dst)
    return src, main


if __name__ == '__main__':
    srcs = []
    for root, dirs, files in os.walk(SRC):
        rel_root = os.path.relpath(root, SRC)
        if rel_root.split(os.sep)[0] in SKIP: continue
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in IMG or (ext == '.mp4' and not f.endswith('.tmp.mp4')):
                srcs.append('images/' + os.path.normpath(os.path.join(rel_root, f) if rel_root != '.' else f).replace('\\', '/'))
    names = storage_names(srcs)
    imgs = [(s, *names[s]) for s in srcs if not s.endswith('.mp4')]
    vids = [(s, *names[s]) for s in srcs if s.endswith('.mp4')]
    man = {}
    with ProcessPoolExecutor(max_workers=6) as ex:
        for src, new in ex.map(do_image, imgs, chunksize=8): man[src] = new
        for src, new in ex.map(do_video, vids): man[src] = new
    json.dump(man, open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    total = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(OUT) for f in fs)
    print(len(imgs), 'images,', len(vids), 'clips ->', round(total / 1e6), 'MB in', OUT)
