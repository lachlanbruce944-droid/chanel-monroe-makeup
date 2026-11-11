"""Builds data/affiliates.js (bios + 9 photos each) and data/comments.js (Chanel's Instagram comments).
Inputs: data/affiliates-raw.json + images/affiliates/affiliates.csv, data/comments-raw.json.  Usage: python tools/build_people.py"""
import csv, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
raw = {a['h']: a for a in json.load(open(P('data', 'affiliates-raw.json'), encoding='utf-8'))}
out = []
for r in csv.DictReader(open(P('images', 'affiliates', 'affiliates.csv'), encoding='utf-8-sig')):
    h = r['handle'].lstrip('@'); a = raw.get(h, {}); cat = r['category'].lower()
    imgs = []
    for i, m in enumerate(a.get('imgs', [])):
        f = 'images/affiliates/%s/%s/%s' % (cat, h, m['file'])
        if os.path.exists(P(*f.split('/'))): imgs.append({'src': f, 'post': 'https://www.instagram.com/p/%s/' % m['code'], 'video': bool(m.get('video'))})
    av = 'images/affiliates/' + r['file']
    if not os.path.exists(P(*av.split('/'))):
        alt = os.path.splitext(av)[0] + '.webp'; av = alt if os.path.exists(P(*alt.split('/'))) else ''
    out.append({'cat': r['category'], 'h': h, 'role': r['name'], 'name': a.get('name') or h, 'bio': a.get('bio', ''),
                'site': a.get('url') or '', 'followers': a.get('followers'), 'posts': a.get('posts'), 'avatar': av, 'imgs': imgs})
open(P('data', 'affiliates.js'), 'w', encoding='utf-8').write('/* Built by tools/build_people.py. Bios and photos come from each affiliate\'s public Instagram. */\nwindow.AFFILIATES = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
print('affiliates:', len(out), 'with 9 photos:', sum(1 for o in out if len(o['imgs']) == 9))
cm = json.load(open(P('data', 'comments-raw.json'), encoding='utf-8'))
def av(u):
    f = 'images/chanel/comments/%s.jpg' % u
    return f if os.path.exists(P(*f.split('/'))) else ''
def fix(c): return {'u': c['u'], 'av': av(c['u']), 't': c['t'], 'at': c['at'], 'l': c.get('l', 0), 'r': [fix(x) for x in c.get('r', [])]}
posts = {}
for p in cm:
    posts['https://www.instagram.com/p/%s/' % p['code']] = {'caption': p['caption'], 'date': p['date'], 'count': p['count'], 'comments': [fix(c) for c in p['comments']]}
open(P('data', 'comments.js'), 'w', encoding='utf-8').write('/* Built by tools/build_people.py from Chanel\'s public Instagram posts (caption + comments), keyed by post URL. */\nwindow.IG_POSTS = ' + json.dumps(posts, ensure_ascii=False, indent=1) + ';\n')
print('posts with comments:', len(posts), 'comments:', sum(len(p['comments']) for p in posts.values()))
