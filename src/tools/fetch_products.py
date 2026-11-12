"""Download each product's image (img column of data/products.csv) to images/products/<slug>.<ext>,
then write data/products.js for the site.  Usage: python tools/fetch_products.py [--js-only]
img column: a direct image URL, 'shopify:<product .json url>' to take its first image, or 'done' if the file exists."""
import csv, os, sys, json, glob, time, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/png,image/*,*/*;q=0.8', 'Accept-Language': 'en-AU,en;q=0.9'}
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers=dict(UA, Referer=u.split('/')[0] + '//' + u.split('/')[2] + '/')), timeout=30).read()
rows = list(csv.DictReader(open(os.path.join(ROOT, 'data', 'products.csv'), encoding='utf-8')))
pdir = os.path.join(ROOT, 'images', 'products'); os.makedirs(pdir, exist_ok=True)
def have(slug):
    f = glob.glob(os.path.join(pdir, slug + '.*')); return f[0] if f else None
if '--js-only' not in sys.argv:
    for r in rows:
        img = r['img'].strip()
        if not img or img == 'done' or have(r['slug']): print('skip', r['slug'], bool(have(r['slug']))); continue
        try:
            if img.startswith('shopify:'):
                img = json.loads(get(img[8:]))['product']['images'][0]['src'].split('?')[0]
            data = get(img)
            ext = '.png' if data[:4] == b'\x89PNG' else '.webp' if data[8:12] == b'WEBP' else '.jpg'
            open(os.path.join(pdir, r['slug'] + ext), 'wb').write(data); print('OK', r['slug'], len(data))
        except Exception as e: print('ERR', r['slug'], str(e)[:90])
        time.sleep(1.5)
out = []
for r in rows:
    f = have(r['slug'])
    out.append({'g': r['group'], 'brand': r['brand'], 'name': r['name'], 'url': r['url'],
                'img': ('images/products/' + os.path.basename(f)) if f else '', 'note': r['note']})
open(os.path.join(ROOT, 'data', 'products.js'), 'w', encoding='utf-8').write(
    '/* Built by tools/fetch_products.py from data/products.csv. Edit the CSV, then re-run. */\nwindow.PRODUCTS = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
print('products.js:', len(out), 'items,', sum(1 for o in out if o['img']), 'with images')
