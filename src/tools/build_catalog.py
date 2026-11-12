"""Builds data/catalog.js (the Products page catalogue) from raw retailer data.
Inputs (data/raw/, git-ignored):
  adore.json     [{brand,url,name,desc,img,price}]  scraped from Adore Beauty product pages
  shop-*.json    {brand,domain,items:[{name,type,tags,url,img,desc,price}]}  brand Shopify stores
Run: python tools/build_catalog.py      (re-run after adding raw files)
Rules: gift cards / bundles / samples dropped; one entry per brand+name; up to CAP per category,
spread round-robin across brands; 'Trending now' is picked from TRENDING name patterns.
"""
import json, os, re, glob, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'data', 'raw')
CAP = 25
DROP = re.compile(r'gift ?card|e-?gift|voucher|sample|tester|mystery|bundle|\bset\b|\bkit\b|\bduo\b|\btrio\b|\bpack\b|refill|value|collection|advent|hamper|box\b|shipping|insurance|subscription|keychain|charm\b|\bmini\b|\bedit\b|merch|tote|candle|gwp|\bbag\b|pouch|holder|\bcase\b|% off|\bonly \$|free gift|gift with|razor', re.I)
RULES = [  # (category, name pattern, type pattern) first match wins
 ('Brushes & tools', r'brush|sponge|blender|applicator|curler|sharpener|tweezer|puff|mirror', r'brush|tool|accessor'),
 ('Face paint & SFX', r'face ?paint|body ?paint|aqua|\bcake\b|prosthetic|\bscars?\b|\bblood\b|\bfx\b|\buv\b|neon|stencil|split cake|one ?stroke|glitter gel|chunky glitter|bioglitter|gems', r'face paint|body paint|sfx|glitter|stencil'),
 ('Lip liner', r'lip ?liner|lip pencil|lip line|lip contour', r'lip ?liner'),
 ('Lip care', r'lip balm|lip mask|lip scrub|lip treatment|lip serum|\b101\b|lip butter|lip conditioner|lip ointment|lip sleeping', r'lip care|lip balm'),
 ('Lip gloss & oil', r'gloss|lip oil|lip glaze|lip glow|plump', r'gloss|lip oil'),
 ('Lipstick', r'lipstick|lip colou?r|lip tint|liquid lip|lip crayon|lip stain|matte lip|lip cream|rouge|\blip\b', r'lipstick|lip'),
 ('Mascara', r'mascara', r'mascara'),
 ('Lashes', r'lash', r'lash'),
 ('Brows', r'brow', r'brow'),
 ('Eyeliner', r'eye ?liner|kohl|kajal|\bliner\b', r'liner'),
 ('Eyeshadow', r'eye ?shadow|shadow|eye pigment|eye palette|eye colou?r|eye gloss|eye paint', r'shadow|eye'),
 ('Primer & setting', r'primer|prime\b|setting spray|setting mist|fix(ing)? spray|grip|makeup setting|set(ting)? spray', r'primer|setting'),
 ('Concealer & correct', r'conceal|correct', r'conceal'),
 ('Foundation & base', r'foundation|skin tint|\bbb\b|\bcc\b|tinted moistur|serum foundation|base\b|second skin', r'foundation|base'),
 ('Bronzer & contour', r'bronz|contour|sculpt', r'bronz|contour'),
 ('Blush', r'blush|cheek', r'blush|cheek'),
 ('Highlighter', r'highlight|illuminat|strob|luminis|luminiz|glow drops|shimmer', r'highlight'),
 ('Powder', r'powder|translucent|mineral veil', r'powder'),
 ('SPF', r'\bspf|sunscreen|skinscreen|sun ?screen|sun cream', r'sun|spf'),
 ('Body & tan', r'\btan\b|tanning|self.?tan|body|coffee scrub|bronzing mousse|bronzing oil|hand cream|deodorant', r'tan|body'),
 ('Skin prep', r'moistur|serum|cleans|toner|cream|mask|essence|mist|exfoli|eye gel|facial oil|face oil|hydrat|micellar|peel|balm|gel\b|lotion|oil\b', r'skin|face|moistur|serum|cleans'),
]
TRENDING = [r'soft pinch', r'gloss bomb', r'queen screen', r'makeup grip|grip primer', r'easy bake', r'lip glow oil', r'lip contour|lip liner stain',
            r'positive light', r'warm wishes', r'pro filt.?r', r'brow freeze|brow harmony', r'airbrush', r'\b101\b ointment', r'beach bum|bronzing (oil|mousse)',
            r'lip treatment', r'lip (&|and|to) cheek|cheek (&|and) lip|blush stick', r'liquid blush', r'glow drops', r'tanning (jelly|mousse)']
clean = lambda s: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))).strip()

def classify(name, typ=''):
    for cat, np, tp in RULES:
        if re.search(np, name, re.I): return cat
    for cat, np, tp in RULES:
        if typ and re.search(tp, typ, re.I): return cat
    return None

def trim(s, n=480):  # whole sentences only
    if len(s) <= n: return s
    cut = s[:n]; i = max(cut.rfind('. '), cut.rfind('! '))
    return cut[:i + 1] if i > 120 else cut.rsplit(' ', 1)[0] + '…'
def money(p):
    m = re.search(r'\d+(\.\d+)?', str(p or ''))
    return '' if not m else '$%.2f' % float(m.group()) if '.' in m.group() else '$' + m.group()
items, seen = [], set()
def add(brand, name, url, img, desc, price, src, typ=''):
    name = re.sub(r'[\U0001F000-\U0001FFFF☀-➿]', '', clean(name)).strip(' -|')
    if not name or not url or DROP.search(name): return
    first = re.sub(r'[^a-z]', '', brand.split()[0].lower().replace('ô', 'o'))
    if src == 'Adore Beauty' and first not in re.sub(r'[^a-z]', '', name.lower().replace('ô', 'o')): return  # brand page fell back to other products
    short = re.sub('^' + re.escape(brand) + r'\s*', '', name, flags=re.I) or name
    cat = classify(short, typ)
    if brand in ('Fusion Body Art', 'Mehron', 'Ben Nye') and cat not in ('Brushes & tools', 'Face paint & SFX'): cat = 'Face paint & SFX' if not cat or cat in ('Skin prep',) else cat
    if not cat: return
    base = re.split(r'\s[-–—|]\s', short)[0]                       # drop " - shade" suffixes
    base = re.sub(r'\b\d+(\.\d+)?\s?(ml|g|oz|gm)\b|\bjumbo\b|\btravel\b|^dior\b', '', base, flags=re.I)
    k = (brand.lower(), re.sub(r'\W+', '', base.lower())[:60])       # same product in another size/shade = duplicate
    if k in seen or url in seen: return
    seen.add(k); seen.add(url)
    disp = re.sub(r'\s{2,}', ' ', base).strip(' -,') or short             # clean card title: no size/shade
    items.append(dict(brand=brand, name=disp[0].upper() + disp[1:], cat=cat, url=url, img=img or '', desc=trim(clean(desc)), price=money(price), src=src))

ad = os.path.join(RAW, 'adore.json')
if os.path.exists(ad):
    for r in json.load(open(ad, encoding='utf-8')):
        add(r['brand'], r.get('name'), r['url'].split('?')[0], r.get('img'), r.get('desc'), r.get('price'), 'Adore Beauty')
for f in sorted(glob.glob(os.path.join(RAW, 'shop-*.json'))):
    d = json.load(open(f, encoding='utf-8'))
    for r in d['items']:
        img = r.get('img') or ''
        if 'cdn.shopify' in img and 'width=' not in img: img += ('&' if '?' in img else '?') + 'width=600'
        add(d['brand'], r.get('name'), r.get('url'), img, r.get('desc'), r.get('price'), d.get('domain') or d['brand'], r.get('type', ''))
items = [x for x in items if x['img']]

out, bycat = [], {}
for x in items: bycat.setdefault(x['cat'], []).append(x)
def spread(lst, cap):
    by = {}
    for x in sorted(lst, key=lambda x: not x['desc']): by.setdefault(x['brand'], []).append(x)  # described items first
    res, q = [], list(by.values())
    while q and len(res) < cap:
        for b in list(q):
            if b: res.append(b.pop(0))
            if not b: q.remove(b)
            if len(res) >= cap: break
    return res
trend = spread([x for x in items if x['cat'] != 'Brushes & tools' and any(re.search(p, x['name'], re.I) for p in TRENDING)], CAP)
tk = {x['url'] for x in trend}
out += [dict(x, cat='Trending now') for x in trend]          # each product appears once only
for cat, lst in bycat.items(): out += spread([x for x in lst if x['url'] not in tk], CAP)
with open(os.path.join(ROOT, 'data', 'catalog.js'), 'w', encoding='utf-8') as f:
    f.write('/* Generated by tools/build_catalog.py from data/raw/: do not edit by hand. */\n')
    f.write('window.CATALOG = ' + json.dumps({'items': out}, ensure_ascii=False) + ';\n')
counts = {}
for x in out: counts[x['cat']] = counts.get(x['cat'], 0) + 1
print(len(items), 'classified;', len(out), 'in catalogue'); print(json.dumps(counts, indent=0))
