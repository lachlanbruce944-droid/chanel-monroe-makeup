"""Upload the optimised media (M:\\CMM-Site\\media\\images\\...) to the public Supabase Storage bucket 'media'.
Run it yourself:   python tools/upload_media.py
It asks for your project's SECRET key (Supabase dashboard > Project Settings > API Keys > Secret keys, 'sb_secret_...',
or the legacy service_role key). The key is typed into this window only: not shown, not saved, never sent anywhere but Supabase.
Files already in the bucket are skipped, so it is safe to re-run after adding media.
Every file gets Cache-Control: one year (names never change; a changed file gets a new name), so browsers and the CDN keep them.
"""
import getpass, json, mimetypes, os, sys, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
URL = 'https://qxiugfatpybldluipcyy.supabase.co'
BUCKET = 'media'
ROOT = r'M:\CMM-Site\media'
mimetypes.add_type('image/webp', '.webp')

key = os.environ.get('SUPABASE_SECRET_KEY') or getpass.getpass('Supabase secret key (hidden): ').strip()
H = {'apikey': key}
if key.count('.') == 2: H['Authorization'] = 'Bearer ' + key   # legacy JWT service_role key

def req(method, path, data=None, headers=None):
    r = urllib.request.Request(URL + path, data=data, method=method, headers={**H, **(headers or {})})
    with urllib.request.urlopen(r, timeout=120) as resp: return resp.status, resp.read()

def existing():
    have, off = set(), 0
    def walk(prefix):
        nonlocal off
        start = 0
        while True:
            body = json.dumps({'prefix': prefix, 'limit': 1000, 'offset': start}).encode()
            _, out = req('POST', '/storage/v1/object/list/' + BUCKET, body, {'Content-Type': 'application/json'})
            items = json.loads(out)
            for it in items:
                name = prefix + it['name']
                if it.get('id') is None: walk(name + '/')     # folder
                else: have.add(name)
            if len(items) < 1000: break
            start += 1000
    walk('images/')
    return have

files = []
for r, _, fs in os.walk(os.path.join(ROOT, 'images')):
    for f in fs:
        if f.endswith('.tmp.mp4'): continue
        p = os.path.join(r, f); files.append((os.path.relpath(p, ROOT).replace('\\', '/'), p))
try:
    have = existing()
except urllib.error.HTTPError as e:
    sys.exit('Could not list the bucket (HTTP %s). Check the key is the SECRET key for this project.' % e.code)
todo = [(k, p) for k, p in files if k not in have]
print(len(files), 'files,', len(have), 'already uploaded,', len(todo), 'to upload')

def up(item):
    k, p = item
    ctype = mimetypes.guess_type(p)[0] or 'application/octet-stream'
    with open(p, 'rb') as fh: data = fh.read()
    for attempt in range(3):
        try:
            req('POST', '/storage/v1/object/%s/%s' % (BUCKET, k), data,
                {'Content-Type': ctype, 'Cache-Control': 'max-age=31536000', 'x-upsert': 'true'})
            return k, None
        except urllib.error.HTTPError as e:
            err = '%s %s' % (e.code, e.read()[:200])
        except Exception as e:
            err = str(e)
    return k, err

done = fails = 0
with ThreadPoolExecutor(8) as ex:
    for k, err in ex.map(up, todo):
        done += 1
        if err: fails += 1; print('FAILED', k, err)
        if done % 100 == 0: print(done, '/', len(todo))
print('finished:', done - fails, 'uploaded,', fails, 'failed')
