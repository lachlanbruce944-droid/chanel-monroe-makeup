"""Make transparent cut-out copies of every product photo (catalogue and kit), for product tiles and popups.

    python tools/cutout_products.py

1. Downloads each product photo once (cached in M:\\CMM-Site\\media-src\\products) - retailer photos are on Adore Beauty
   and brand Shopify stores; kit photos are in images/products.
2. Removes the plain background: near-white (or flat light) pixels connected to the photo's edge become transparent,
   with soft, de-haloed edges. Whites inside the product (a white bottle, a label) are kept because they do not touch
   the edge. Photos that are not on a plain background (lifestyle shots) are left as they are.
3. Trims to the product, fits it in 800 x 800, and saves WebP with transparency to
   M:\\CMM-Site\\media\\products\\cutout\\<name>.webp  (upload with tools/upload_media.py).
4. Writes data/product-cutouts.json  {original image: storage name}. The site shows the cut-out when it is there and
   falls back to the original photo if it is not uploaded yet.
"""
import hashlib, json, os, re, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image
from scipy import ndimage

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = r'M:\CMM-Site\media-src\products'
OUT = r'M:\CMM-Site\media'
PREFIX = 'products/cutout/'
os.makedirs(CACHE, exist_ok=True)


def slug(s):
    return re.sub(r'-{2,}', '-', re.sub(r'[^a-z0-9]+', '-', s.lower())).strip('-')


def js(name, var):
    t = open(os.path.join(SITE, 'data', name), encoding='utf-8').read()
    m = re.search(r'window\.' + var + r'\s*=\s*', t)
    return json.JSONDecoder().raw_decode(t[m.end():])[0]


def sources():
    out = {}
    for p in js('catalog.js', 'CATALOG')['items']:
        if p.get('img'): out[p['img']] = slug(p.get('brand', '') + ' ' + p.get('name', ''))[:70]
    for p in js('products.js', 'PRODUCTS'):
        if p.get('img'): out[p['img']] = slug(p.get('brand', '') + ' ' + p.get('name', ''))[:70]
    return out


def fetch(src):
    if not src.startswith('http'):
        return os.path.join(SITE, *src.split('/'))
    path = os.path.join(CACHE, hashlib.sha1(src.encode()).hexdigest()[:16] + os.path.splitext(src.split('?')[0])[1][:5])
    if not os.path.exists(path):
        req = urllib.request.Request(src, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=40) as r, open(path, 'wb') as f: f.write(r.read())
    return path


def cutout(path):
    im = Image.open(path)
    if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
        rgba = np.asarray(im.convert('RGBA')).astype(np.float32)
        if (rgba[..., 3] < 250).mean() > 0.05: return Image.fromarray(rgba.astype(np.uint8), 'RGBA'), 'already transparent'
    rgb = np.asarray(im.convert('RGB')).astype(np.float32)
    h, w = rgb.shape[:2]
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg = np.median(border, 0)                                   # the backdrop colour (usually white or off-white)
    if bg.min() < 200: return None, 'dark or busy background'
    dist = np.sqrt(((rgb - bg) ** 2).sum(-1))
    near = dist < 24
    if near[[0, -1], :].mean() < 0.6 and near[:, [0, -1]].mean() < 0.6: return None, 'not a plain background'
    lab, n = ndimage.label(near)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bgmask = np.isin(lab, edge[edge > 0])
    bgmask = ndimage.binary_opening(bgmask, iterations=1)
    # soft edge: alpha ramps over ~1.5 px using distance from the background colour near the boundary
    a = 1.0 - bgmask.astype(np.float32)
    ring = ndimage.binary_dilation(bgmask, iterations=2) & ~ndimage.binary_erosion(bgmask, iterations=2)
    a[ring] = np.clip((dist[ring] - 6) / 30, 0, 1)
    a = ndimage.gaussian_filter(a, 0.6)
    a[bgmask & ~ring] = 0
    r = max(2, int(0.006 * max(h, w)))          # drop thin frame lines some shop photos have at their edge
    a[:r, :] = 0; a[-r:, :] = 0; a[:, :r] = 0; a[:, -r:] = 0
    if a.mean() < 0.02 or a.mean() > 0.97: return None, 'nothing to cut out'
    # remove the backdrop colour bleeding into edge pixels (no white halo)
    aa = np.clip(a, 1e-3, 1)[..., None]
    rgb = np.clip((rgb - (1 - aa) * bg) / aa, 0, 255)
    out = np.dstack([rgb, a * 255]).astype(np.uint8)
    ys, xs = np.where(a > 0.05)
    pad = max(4, int(0.03 * max(h, w)))
    y0, y1, x0, x1 = max(0, ys.min() - pad), min(h, ys.max() + pad), max(0, xs.min() - pad), min(w, xs.max() + pad)
    img = Image.fromarray(out[y0:y1, x0:x1], 'RGBA')
    img.thumbnail((800, 800), Image.LANCZOS)
    return img, 'cut out'


def job(item):
    src, name = item
    try:
        img, how = cutout(fetch(src))
    except Exception as e:
        return src, None, 'failed: %s' % str(e)[:80]
    if img is None: return src, None, how
    key = PREFIX + name + '.webp'
    dst = os.path.join(OUT, *key.split('/'))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    img.save(dst, 'WEBP', quality=88, method=6)
    return src, key, how


if __name__ == '__main__':
    src = sources()
    seen, uniq = set(), {}
    for s, n in src.items():                      # unique names
        k, i = n, 2
        while k in seen: k = '%s-%d' % (n, i); i += 1
        seen.add(k); uniq[s] = k
    with ThreadPoolExecutor(8) as ex: res = list(ex.map(job, uniq.items()))
    mp = {s: k for s, k, how in res if k}
    json.dump(mp, open(os.path.join(SITE, 'data', 'product-cutouts.json'), 'w', encoding='utf-8'), indent=0)
    open(os.path.join(SITE, 'data', 'product-cutouts.js'), 'w', encoding='utf-8').write(
        '/* Transparent product photos (tools/cutout_products.py): original image -> storage name. */\nwindow.PRODUCT_CUTOUTS = ' + json.dumps(mp) + ';\n')
    from collections import Counter
    print(Counter(h.split(':')[0] for _, _, h in res))
    print('%d of %d photos cut out -> %s' % (len(mp), len(res), os.path.join(OUT, 'products', 'cutout')))
