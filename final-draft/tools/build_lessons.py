"""Builds data/lessons.js for the Lessons tab from images/lessons/lessons.csv.
Columns: file, poster, topic, title, artist, post_url, width, height, seconds  (clips keep their sound).
Run: python tools/build_lessons.py
"""
import csv, json, os, urllib.parse
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'images', 'lessons')
url = lambda p: urllib.parse.quote(os.path.relpath(p, ROOT).replace('\\', '/'))
out = []
p = os.path.join(D, 'lessons.csv')
for r in (csv.DictReader(open(p, encoding='utf-8-sig', newline='')) if os.path.exists(p) else []):
    f, th = os.path.join(D, r['file']), os.path.join(D, r['poster'])
    if not os.path.exists(f): continue
    out.append(dict(topic=r['topic'], title=r['title'], src=url(f), poster=url(th) if os.path.exists(th) else '', by=r['artist'],
                    post=r['post_url'], w=int(r['width']), h=int(r['height']), dur=float(r['seconds'])))
# creators whose clips have no burnt-in captions: shown first within each topic (captions are allowed, just not preferred)
CLEAN = {'carewithkate', 'taylorchristinee', 'biancaferrox', 'annaannora', 'fionaannee', 'amyradastur', 'drdermavive', 'danicolexx',
         'thecosmeticemporium', 'unicastudio', 'jay.j.brows', 'sayjayjohnson', 'byleah.x', 'allybnails', 'tipsymuse', 'styledbysierramiles',
         'makeup.by.dea', 'elnaz_golrokh', 'taylahjaynee', 'withambernicole', 'deejay.101'}
out.sort(key=lambda x: x['by'].lstrip('@').rstrip('_') not in CLEAN)   # stable: csv order kept otherwise
with open(os.path.join(ROOT, 'data', 'lessons.js'), 'w', encoding='utf-8') as f:
    f.write('/* Built by tools/build_lessons.py from images/lessons/lessons.csv. Clips belong to the credited creators. */\n')
    f.write('window.LESSONS = ' + json.dumps(out, ensure_ascii=False) + ';\n')
c = {}
for x in out: c[x['topic']] = c.get(x['topic'], 0) + 1
print(len(out), 'lessons', c)
