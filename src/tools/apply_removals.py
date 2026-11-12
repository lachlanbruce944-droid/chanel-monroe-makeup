"""Apply removals: everything hidden in Edit mode (data/overrides.js "hidden") is taken off the site for good.
- Files (and video posters) are MOVED to M:\\CMM-Site\\_removed\\<same path>, not deleted, so it can be undone.
- Their rows are dropped from inspiration/credits.csv, lip-credits.csv, videos/videos.csv, chanel/index.csv.
- Each is recorded in data/removed.json (with its Instagram code) so it is never re-added; REGISTER.csv lists them.
- The hidden list in overrides.js is cleared and the action logged. Then re-run build_media.py and build_register.py.
Run: python tools/apply_removals.py
"""
import csv, json, os, re, shutil, urllib.parse, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BIN = r'M:\CMM-Site\_removed'
OVP = os.path.join(ROOT, 'data', 'overrides.js')
t = open(OVP, encoding='utf-8').read()
m = re.search(r'window\.SITE_OVERRIDES\s*=\s*', t)
head, ov = t[:m.start()], json.JSONDecoder().raw_decode(t[m.end():])[0]
hidden = [urllib.parse.unquote(h) for h in ov.get('hidden', [])]
if not hidden: print('nothing hidden'); raise SystemExit
section = {}
for entry in ov.get('log', []):
    for c in entry.get('changes', []):
        section[urllib.parse.unquote(c['image'])] = c.get('section', '')
stem = lambda p: os.path.splitext(os.path.basename(p))[0]
gone = {stem(h) for h in hidden}
today = datetime.date.today().isoformat()
rp = os.path.join(ROOT, 'data', 'removed.json')
removed = json.load(open(rp, encoding='utf-8')) if os.path.exists(rp) else []
moved = 0
for h in hidden:
    code = (re.search(r'_([A-Za-z0-9_-]{9,12})(-\d)?$', stem(h)) or [None, ''])[1]
    targets = [h]
    if h.endswith('.mp4'): targets.append(h[:-4] + '.jpg')
    base = os.path.splitext(h)[0]
    targets += [base + e for e in ('.jpg', '.webp') if base + e not in targets]
    for rel in targets:
        src = os.path.join(ROOT, *rel.split('/'))
        if os.path.exists(src):
            dst = os.path.join(BIN, 'final-draft', *rel.split('/'))
            os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.move(src, dst); moved += 1
    removed.append(dict(file=h, code=code, section=section.get(h, ''), removed=today, reason='hidden in Edit mode'))
def prune(path, col):
    if not os.path.exists(path): return 0
    rows = list(csv.DictReader(open(path, encoding='utf-8-sig', newline='')))
    if not rows: return 0
    keep = [r for r in rows if stem(r[col]) not in gone]
    with open(path, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()), quoting=csv.QUOTE_ALL); w.writeheader(); w.writerows(keep)
    return len(rows) - len(keep)
dropped = {p: prune(os.path.join(ROOT, *p.split('/')), 'file') for p in
           ('images/inspiration/credits.csv', 'images/inspiration/lip-credits.csv', 'images/videos/videos.csv', 'images/chanel/index.csv')}
json.dump(removed, open(rp, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
ov.setdefault('log', []).append({'saved': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'changes': [
    {'time': today, 'action': 'apply-removals', 'section': '', 'image': '', 'detail': '%d hidden items removed; files in %s; listed in data/removed.json' % (len(hidden), BIN)}]})
ov['hidden'] = []
ov['moved'] = {k: v for k, v in ov.get('moved', {}).items() if stem(urllib.parse.unquote(k)) not in gone}
open(OVP, 'w', encoding='utf-8').write(head + 'window.SITE_OVERRIDES = ' + json.dumps(ov, indent=1, ensure_ascii=False) + ';\n')
print(len(hidden), 'removed;', moved, 'files moved to', BIN, '; csv rows dropped:', dropped)
