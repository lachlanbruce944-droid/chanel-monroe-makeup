"""Builds REGISTER.csv: one line for every image, clip, product, brand and affiliate on the site,
plus Instagram posts already reviewed and rejected, so nothing is added twice.
Run after any change:  python tools/build_register.py
Before adding anything new, check its Instagram code / URL / name against REGISTER.csv
(kind, key, name, section, file, status, source).  key = Instagram post code, product URL,
brand name or affiliate handle.
"""
import csv, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def js(name, var):
    p = os.path.join(ROOT, 'data', name)
    if not os.path.exists(p): return None
    t = open(p, encoding='utf-8').read()
    m = re.search(r'window\.' + var + r'\s*=\s*', t)
    if var == 'BRANDS_INFO':  # JS object literal with bare keys
        t = t[:m.end()] + re.sub(r'([{,]\s*)(est|origin|founder|about):', r'\1"\2":', t[m.end():])
    return json.JSONDecoder().raw_decode(t[m.end():])[0]
code = lambda u: (re.search(r'/(?:p|reel)/([^/?]+)', u or '') or [None, ''])[1]
ov = js('overrides.js', 'SITE_OVERRIDES') or {}
hidden = set(ov.get('hidden', []))
rows = []
for m in js('media.js', 'MEDIA') or []:
    src = re.sub('%20', ' ', m['src'])
    rows.append(dict(kind='own-photo' if m.get('own') else m['type'], key=code(m.get('post')), name=m.get('d', ''), section=m['g'] + ' / ' + m['s'],
                     file=src, status='hidden' if m['src'] in hidden or src in hidden else 'live', source=m.get('by', '') + ' ' + (m.get('post') or '')))
for p in js('products.js', 'PRODUCTS') or []:
    rows.append(dict(kind='kit-product', key=p['url'], name=p['brand'] + ' ' + p['name'], section=p['g'], file=p.get('img', ''), status='live', source=''))
for p in (js('catalog.js', 'CATALOG') or {}).get('items', []):
    rows.append(dict(kind='catalogue-product', key=p['url'], name=p['brand'] + ' ' + p['name'], section=p['cat'], file=p['img'], status='live', source=p['src']))
for b, info in (js('brands-info.js', 'BRANDS_INFO') or {}).items():
    rows.append(dict(kind='brand', key=b, name=b, section='Brands', file='', status='live', source=' / '.join(x for x in (info.get('est', ''), info.get('origin', ''), info.get('founder', '')) if x)))
for a in js('affiliates.js', 'AFFILIATES') or []:
    rows.append(dict(kind='affiliate', key='@' + a['h'], name=a.get('name', ''), section=a.get('cat', ''), file=a.get('avatar', ''), status='live (message before launch)', source=a.get('site', '')))
rej = os.path.join(ROOT, 'data', 'rejected.json')   # {"code": "reason"} posts reviewed and not used
for c, why in (json.load(open(rej, encoding='utf-8')) if os.path.exists(rej) else {}).items():
    rows.append(dict(kind='rejected-post', key=c, name='', section='', file='', status='rejected: ' + why, source='https://www.instagram.com/p/%s/' % c))
for l in js('lessons.js', 'LESSONS') or []:
    rows.append(dict(kind='lesson', key=code(l['post']), name=l['title'], section='Lessons / ' + l['topic'], file=re.sub('%20', ' ', l['src']), status='live', source=l['by'] + ' ' + l['post']))
rmp = os.path.join(ROOT, 'data', 'removed.json')   # applied removals (tools/apply_removals.py); files in M:\CMM-Site\_removed
for r in (json.load(open(rmp, encoding='utf-8')) if os.path.exists(rmp) else []):
    rows.append(dict(kind='removed', key=r['code'], name='', section=r['section'], file=r['file'], status='removed %s: %s' % (r['removed'], r['reason']),
                     source='https://www.instagram.com/p/%s/' % r['code'] if r['code'] else ''))
with open(os.path.join(ROOT, 'REGISTER.csv'), 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=['kind', 'key', 'name', 'section', 'file', 'status', 'source']); w.writeheader(); w.writerows(rows)
dupes = {}
for r in rows:
    if r['key'] and r['kind'] != 'rejected-post': dupes.setdefault((r['kind'].split('-')[-1], r['key']), []).append(r['file'] or r['name'])
d = {k: v for k, v in dupes.items() if len(v) > 1}
counts = {}
for r in rows: counts[r['kind']] = counts.get(r['kind'], 0) + 1
print(len(rows), 'rows', counts); print('duplicate keys:', len(d)); [print(' ', k, v) for k, v in list(d.items())[:20]]
