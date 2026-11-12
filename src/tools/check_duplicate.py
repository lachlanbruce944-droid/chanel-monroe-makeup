"""Check whether something is already on the site, or was reviewed and turned down, before adding it.

Usage:
    python tools/check_duplicate.py <item> [<item> ...]

An item can be an Instagram post or reel link, a post code (e.g. DfIHzmAjbfk), an @handle,
a product URL, a brand or product name, or a file name.

It searches the content register (REGISTER.csv: every photo, clip, product, brand and affiliate,
plus rejected and removed items), data/removed.json and data/rejected.json.
Exit code 0 = not found (safe to add), 1 = already registered (do not add again).
Rebuild the register first if you have just changed content:  python tools/build_register.py
"""
import csv, json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def norm(s):
    s = (s or '').strip()
    m = re.search(r'instagram\.com/(?:[^/]+/)?(?:p|reel|tv)/([A-Za-z0-9_-]+)', s)
    if m: return m.group(1).lower()                      # Instagram link -> post code
    m = re.search(r'instagram\.com/([A-Za-z0-9._]+)/?$', s)
    if m: return m.group(1).lower()                      # profile link -> handle
    s = re.sub(r'^@', '', s)
    s = re.sub(r'^https?://(www\.)?', '', s).split('?')[0].rstrip('/')
    return s.lower()


def records():
    out = []
    reg = os.path.join(ROOT, 'REGISTER.csv')
    if os.path.exists(reg):
        for r in csv.DictReader(open(reg, encoding='utf-8')):
            out.append(('register', r.get('kind', ''), r.get('status', ''), ' | '.join(r.get(k, '') for k in ('key', 'name', 'section', 'file', 'source'))))
    for name in ('removed.json', 'rejected.json'):
        p = os.path.join(ROOT, 'data', name)
        if os.path.exists(p):
            data = json.load(open(p, encoding='utf-8'))
            for r in (data if isinstance(data, list) else data.values() if isinstance(data, dict) else []):
                out.append((name, 'removed' if name.startswith('removed') else 'rejected', '', json.dumps(r, ensure_ascii=False)))
    return out


def main(items):
    if not items: print(__doc__); return 2
    recs, found = records(), False
    for raw in items:
        key = norm(raw)
        hits = [r for r in recs if key and key in r[3].lower().replace('www.', '')]
        if hits:
            found = True
            print('ALREADY REGISTERED: %s  (%d match%s)' % (raw, len(hits), '' if len(hits) == 1 else 'es'))
            for src, kind, status, text in hits[:8]:
                print('   - [%s] %s %s  %s' % (src, kind, ('(' + status + ')') if status else '', text[:160]))
        else:
            print('not found, OK to add: %s' % raw)
    return 1 if found else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
