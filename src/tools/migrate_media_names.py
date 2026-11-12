"""One-off: rename every file in Supabase Storage (bucket `media`) to the naming rules in tools/media_names.py,
delete files the site no longer uses, rename the local mirror to match, and publish the site with the new links.

    python tools/migrate_media_names.py            dry run: writes M:\\CMM-Site\\media-rename-plan.csv, changes nothing
    python tools/migrate_media_names.py --apply    asks for the Supabase secret key, then does it

The secret key (Supabase dashboard > Project Settings > API Keys > Secret keys, 'sb_secret_...') is typed into this
window only. It is not shown, not saved, and only sent to Supabase. Files are moved (not re-uploaded), so it is quick,
keeps the cache settings, and uses no extra storage. Safe to re-run: anything already moved is skipped.
The live site shows broken images only between the moves and the publish at the end (a few minutes).
"""
import csv, getpass, json, os, subprocess, sys, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from media_names import storage_names, SMALL

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'https://qxiugfatpybldluipcyy.supabase.co'
BUCKET = 'media'
MIRROR = r'M:\CMM-Site\media'
REPO = r'C:\Users\USER\repos\chanel-monroe-makeup'
PLAN = r'M:\CMM-Site\media-rename-plan.csv'


def old_small(name):  # the 800 px copy under the old names
    return name[:-5] + '.m.webp' if name.endswith('.webp') and name.startswith(('images/inspiration/', 'images/chanel/', 'images/products/')) and '/comments/' not in name else None


def plan():
    man = json.load(open(os.path.join(MIRROR, 'manifest.json'), encoding='utf-8'))
    live = [s for s in man if not s.startswith('images/brands/') and os.path.exists(os.path.join(SITE, *s.split('/')))]
    new = storage_names(live)
    moves, deletes = [], []
    for s in live:
        old, (main, small) = man[s], new[s]
        if old != main: moves.append((old, main))
        o = old_small(old)
        if o and small and o != small: moves.append((o, small))
    for s, old in man.items():
        if s in new: continue
        deletes.append(old); o = old_small(old)
        if o: deletes.append(o)
    return man, new, moves, deletes


def main(apply):
    man, new, moves, deletes = plan()
    with open(PLAN, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f); w.writerow(['action', 'current name', 'new name'])
        for a, b in moves: w.writerow(['rename', a, b])
        for a in deletes: w.writerow(['delete', a, ''])
    print('%d renames, %d deletes (brand logos now ship with the site; removed content). Plan: %s' % (len(moves), len(deletes), PLAN))
    if not apply: print('Dry run only. Review the plan, then run again with --apply.'); return

    key = os.environ.get('SUPABASE_SECRET_KEY') or getpass.getpass('Supabase secret key (hidden): ').strip()
    H = {'apikey': key, 'Content-Type': 'application/json'}
    if key.count('.') == 2: H['Authorization'] = 'Bearer ' + key

    def call(method, path, body):
        req = urllib.request.Request(URL + path, data=json.dumps(body).encode(), headers=H, method=method)
        try:
            with urllib.request.urlopen(req, timeout=60) as r: return r.status, r.read().decode()
        except urllib.error.HTTPError as e: return e.code, e.read().decode()

    def exists(name):
        try:
            with urllib.request.urlopen(urllib.request.Request('%s/storage/v1/object/public/%s/%s' % (URL, BUCKET, name), method='HEAD'), timeout=30) as r: return r.status == 200
        except Exception: return False

    def move(pair):
        a, b = pair
        st, txt = call('POST', '/storage/v1/object/move', {'bucketId': BUCKET, 'sourceKey': a, 'destinationKey': b})
        if st == 200: return 'moved'
        if exists(b): return 'already'
        return 'FAILED %s %s: %s' % (st, a, txt[:120])

    st, txt = call('POST', '/storage/v1/object/list/' + BUCKET, {'prefix': '', 'limit': 1})
    if st != 200: print('Key not accepted by Supabase (%s). Nothing changed.' % st); return
    with ThreadPoolExecutor(8) as ex: res = list(ex.map(move, moves))
    fails = [r for r in res if r.startswith('FAILED')]
    print('moved %d, already done %d, failed %d' % (res.count('moved'), res.count('already'), len(fails)))
    for r in fails[:10]: print('  ' + r)
    if fails: print('Some moves failed: fix and re-run before publishing. Nothing else was changed.'); return

    for i in range(0, len(deletes), 100):
        st, txt = call('DELETE', '/storage/v1/object/' + BUCKET, {'prefixes': deletes[i:i + 100]})
        if st != 200: print('delete batch failed (%s): %s' % (st, txt[:120]))
    print('deleted %d unused files' % len(deletes))

    # local mirror: same names as storage
    for a, b in moves:
        pa, pb = os.path.join(MIRROR, *a.split('/')), os.path.join(MIRROR, *b.split('/'))
        if os.path.exists(pa) and not os.path.exists(pb): os.makedirs(os.path.dirname(pb), exist_ok=True); os.replace(pa, pb)
    for a in deletes:
        p = os.path.join(MIRROR, *a.split('/'))
        if os.path.exists(p):
            dst = os.path.join(r'M:\CMM-Site\_removed\media', *a.split('/')); os.makedirs(os.path.dirname(dst), exist_ok=True); os.replace(p, dst)
    for root, dirs, files in os.walk(os.path.join(MIRROR, 'images'), topdown=False):
        if not os.listdir(root): os.rmdir(root)
    json.dump({s: new[s][0] for s in new}, open(os.path.join(MIRROR, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('local mirror and manifest updated')

    # publish the site with the new links straight away
    subprocess.run([sys.executable, os.path.join(SITE, 'tools', 'publish.py'), REPO], check=True)
    g = lambda *a: subprocess.run(['git', '-C', REPO] + list(a), check=True)
    g('add', '-A'); g('commit', '-q', '-m', 'Media: storage renamed to the naming rules in tools/media_names.py; unused files removed')
    g('push', '-q')
    print('Done. The site is redeploying with the new links (about a minute).')


if __name__ == '__main__':
    main('--apply' in sys.argv)
