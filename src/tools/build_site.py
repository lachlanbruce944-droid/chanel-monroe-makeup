"""Build the lightweight site for GitHub Pages from the working copy (final-draft).
- index.html is split into css/site.css + js/app.js (cacheable files) and a slim page
- every 'images/...' path in the scripts and data (except icons) is pointed at Supabase Storage,
  using media/manifest.json from optimize_media.py (new names, .webp copies)
- icons, robots.txt and small data files ship with the site; photos and clips stay on Supabase
Usage: python tools/build_site.py <output folder>     e.g. C:\\Users\\USER\\repos\\chanel-monroe-makeup\\site
"""
import json, os, re, shutil, sys, urllib.parse
SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1]
BASE = sys.argv[2] if len(sys.argv) > 2 else 'https://qxiugfatpybldluipcyy.supabase.co/storage/v1/object/public/media/'   # 2nd arg: test against a local media server
MAN = json.load(open(r'M:\CMM-Site\media\manifest.json', encoding='utf-8'))

def to_cdn(path):
    raw = urllib.parse.unquote(path)
    if raw.startswith(('images/icons/', 'images/brands/', 'images/about/')): return path   # icons, brand logos, About photo ship with the site
    if raw in MAN: return BASE + MAN[raw]
    return BASE + raw   # folder prefixes built at runtime (e.g. 'images/brands/'), brand logos keep their names

LIT = re.compile(r'''(["'])(images/[^"'\n]*)\1''')
def rewrite(text): return LIT.sub(lambda m: m.group(1) + to_cdn(m.group(2)) + m.group(1), text)

if os.path.exists(OUT):
    for name in os.listdir(OUT):
        p = os.path.join(OUT, name)
        if name in ('.nojekyll', 'CNAME'): continue
        shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
os.makedirs(os.path.join(OUT, 'css'), exist_ok=True); os.makedirs(os.path.join(OUT, 'js'), exist_ok=True)

html = open(os.path.join(SRC, 'index.html'), encoding='utf-8').read()
import hashlib; V = hashlib.sha1(html.encode('utf-8')).hexdigest()[:8]   # cache-buster: changes whenever the page changes
styles = re.findall(r'<style>(.*?)</style>', html, re.S)
first = True
def style_sub(m):
    global first
    if first: first = False; return '<link rel="stylesheet" href="css/site.css?v=' + V + '">'
    return ''
html = re.sub(r'<style>.*?</style>\n?', style_sub, html, flags=re.S)
scripts = re.findall(r'<script>(.*?)</script>', html, re.S)          # inline app code (not JSON-LD, not src=)
first = True
def script_sub(m):
    global first
    if first: first = False; return '<script src="js/config.js?v=' + V + '"></script>\n<script src="js/app.js?v=' + V + '"></script>'
    return ''
html = re.sub(r'<script>.*?</script>\n?', script_sub, html, flags=re.S)
html = html.replace('<link rel="preconnect" href="https://fonts.googleapis.com">',
                    '<link rel="preconnect" href="https://qxiugfatpybldluipcyy.supabase.co" crossorigin>\n<link rel="preconnect" href="https://fonts.googleapis.com">', 1)
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(html)
open(os.path.join(OUT, 'css', 'site.css'), 'w', encoding='utf-8').write('\n'.join(s.strip('\n') for s in styles) + '\n')
open(os.path.join(OUT, 'js', 'app.js'), 'w', encoding='utf-8').write(rewrite(';\n'.join(s.strip('\n') for s in scripts)) + '\n')
open(os.path.join(OUT, 'js', 'config.js'), 'w', encoding='utf-8').write(
    "/* Hosted build: photos and clips come from Supabase Storage (bucket 'media'). */\n"
    "window.MEDIA_BASE = '%s';\nwindow.MEDIA_M = true;   /* gallery photos have 540px copies (name.m.webp) */\n" % BASE)
for folder in ('data', 'settings'):
    os.makedirs(os.path.join(OUT, folder), exist_ok=True)
    for f in os.listdir(os.path.join(SRC, folder)):
        if not f.endswith('.js'): continue
        text = open(os.path.join(SRC, folder, f), encoding='utf-8').read()
        if f == 'lessons.js': text = '/* Lessons tab hidden for now. */\nwindow.LESSONS = [];\n'
        open(os.path.join(OUT, folder, f), 'w', encoding='utf-8').write(rewrite(text))
shutil.copytree(os.path.join(SRC, 'images', 'icons'), os.path.join(OUT, 'images', 'icons'), ignore=shutil.ignore_patterns('*.ttf'))
for d in ('brands', 'about'):
    if os.path.isdir(os.path.join(SRC, 'images', d)): shutil.copytree(os.path.join(SRC, 'images', d), os.path.join(OUT, 'images', d))
for f in ('robots.txt',):
    if os.path.exists(os.path.join(SRC, f)): shutil.copy(os.path.join(SRC, f), OUT)
open(os.path.join(OUT, '.nojekyll'), 'w').close()
size = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(OUT) for f in fs)
left = [m for m in LIT.findall(open(os.path.join(OUT, 'js', 'app.js'), encoding='utf-8').read()) if not m[1].startswith(('images/icons', 'images/brands', 'images/about'))]
print('site built:', round(size / 1024), 'KB;', len(styles), 'style blocks,', len(scripts), 'scripts; local media paths left:', len(left))
