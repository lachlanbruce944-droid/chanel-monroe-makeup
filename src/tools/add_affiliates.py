"""Merge a new affiliates batch into the site.
Input: a folder holding meta.json  [{cat,u,name,bio,url,cat2,followers,posts,imgs:[{code,video}]}]
       and the images  <cat>/<u>.jpg (avatar) + <cat>/<u>/01.jpg..09.jpg  (lower-case cat folders).
Run:   python tools/add_affiliates.py <batch folder>     then  python tools/build_people.py
Skips any handle already in affiliates.csv or listed as removed/rejected in REGISTER.csv.
"""
import csv, json, os, shutil, sys
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AFF = os.path.join(ROOT, 'images', 'affiliates')
src = sys.argv[1]
meta = json.load(open(os.path.join(src, 'meta.json'), encoding='utf-8'))
csvp = os.path.join(AFF, 'affiliates.csv')
rows = list(csv.DictReader(open(csvp, encoding='utf-8-sig', newline='')))
have = {r['handle'].lstrip('@').lower() for r in rows}
regp = os.path.join(ROOT, 'REGISTER.csv')
if os.path.exists(regp):
    for r in csv.DictReader(open(regp, encoding='utf-8-sig')):
        if r['kind'] in ('affiliate', 'removed') and r['key'].startswith('@'): have.add(r['key'][1:].lower())
rawp = os.path.join(ROOT, 'data', 'affiliates-raw.json')
raw = json.load(open(rawp, encoding='utf-8'))
added = {}
for m in meta:
    h, cat = m['u'], m['cat']; c = cat.lower()
    if h.lower() in have: continue
    av_src = os.path.join(src, c, h + '.jpg')
    if not os.path.exists(av_src): print('no avatar', h); continue
    os.makedirs(os.path.join(AFF, c, h), exist_ok=True)
    shutil.copy(av_src, os.path.join(AFF, c, h + '.jpg'))
    imgs = []
    for i, im in enumerate(m['imgs'][:9], 1):
        f = '%02d.jpg' % i; p = os.path.join(src, c, h, f)
        if os.path.exists(p):
            shutil.copy(p, os.path.join(AFF, c, h, f)); imgs.append({'file': f, 'code': im['code'], 'video': im['video']})
    w = Image.open(av_src).size[0]
    rows.append({'category': cat, 'handle': '@' + h, 'name': m['name'] or h, 'profile': 'https://www.instagram.com/%s/' % h, 'file': '%s/%s.jpg' % (c, h), 'width': str(w)})
    raw.append({'cat': cat, 'h': h, 'name': m['name'], 'bio': m['bio'], 'url': m['url'], 'cat2': m.get('cat2', ''), 'followers': m['followers'], 'posts': m['posts'], 'imgs': imgs})
    have.add(h.lower()); added[cat] = added.get(cat, 0) + 1
with open(csvp, 'w', encoding='utf-8', newline='') as f:
    wr = csv.DictWriter(f, fieldnames=['category', 'handle', 'name', 'profile', 'file', 'width'], quoting=csv.QUOTE_ALL); wr.writeheader(); wr.writerows(rows)
json.dump(raw, open(rawp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('added', added, 'total', len(rows))
