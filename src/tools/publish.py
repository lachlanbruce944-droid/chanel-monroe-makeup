"""Publish the working copy to the GitHub repository in one step.

Usage:
    python tools/publish.py C:\\Users\\USER\\repos\\chanel-monroe-makeup

What it does:
  1. Rebuilds the content register (REGISTER.csv) so every item on the site is logged.
  2. Builds the deployable site into <repo>/site  (tools/build_site.py).
  3. Mirrors only the source files the site and its build need into <repo>/src.
     Anything else in <repo>/src is removed, so the repo never collects stray or duplicate files.
  4. Copies the register to <repo>/docs/content-register.csv.
Then review `git status`, add a CHANGELOG.md entry, commit and push. GitHub Actions deploys site/.

Heavy media (photos, clips) is not mirrored: it lives in Supabase Storage (bucket `media`),
with the local master copies under M:\\CMM-Site.
"""
import fnmatch, hashlib, os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Source files kept in the repo (paths relative to the working copy, '/' separated)
KEEP = [
    'index.html', 'robots.txt', 'site.webmanifest',
    'settings/*.js',
    'data/*.js', 'data/*.json', 'data/*.csv',
    'images/icons/*.png', 'images/icons/*.ico',
    'images/brands/*', 'images/about/*',
    'images/inspiration/credits.csv', 'images/inspiration/lip-credits.csv',
    'images/videos/videos.csv', 'images/chanel/index.csv', 'images/chanel/ABOUT.txt',
    'images/affiliates/affiliates.csv', 'images/lessons/lessons.csv',
    'tools/*.py', 'tools/*/*.py', 'tools/*/*.json',
]
SKIP = ['data/*-raw.json', 'data/raw/*', '*/__pycache__/*', '*.pyc']


def wanted():
    out = set()
    for dirpath, _, files in os.walk(ROOT):
        for f in files:
            rel = os.path.relpath(os.path.join(dirpath, f), ROOT).replace(os.sep, '/')
            if any(fnmatch.fnmatch(rel, p) for p in KEEP) and not any(fnmatch.fnmatch(rel, p) for p in SKIP):
                out.add(rel)
    return out


def same(a, b):
    if not os.path.exists(b) or os.path.getsize(a) != os.path.getsize(b): return False
    h = lambda p: hashlib.sha1(open(p, 'rb').read()).hexdigest()
    return h(a) == h(b)


def main(repo):
    py = sys.executable
    man = r'M:\CMM-Site\media\manifest.json'   # map of every media file to its Supabase name (written by optimize_media.py)
    if os.path.exists(man): shutil.copy2(man, os.path.join(ROOT, 'data', 'media-manifest.json'))
    subprocess.run([py, os.path.join(ROOT, 'tools', 'build_register.py')], check=True, cwd=ROOT)
    subprocess.run([py, os.path.join(ROOT, 'tools', 'build_site.py'), os.path.join(repo, 'site')], check=True, cwd=ROOT)
    src = os.path.join(repo, 'src')
    keep = wanted()
    added = changed = removed = 0
    for rel in sorted(keep):
        a, b = os.path.join(ROOT, rel), os.path.join(src, rel)
        if same(a, b): continue
        existed = os.path.exists(b)
        os.makedirs(os.path.dirname(b), exist_ok=True); shutil.copy2(a, b)
        changed += existed; added += not existed
    for dirpath, _, files in os.walk(src, topdown=False):
        for f in files:
            rel = os.path.relpath(os.path.join(dirpath, f), src).replace(os.sep, '/')
            if rel not in keep: os.remove(os.path.join(dirpath, f)); removed += 1
        if not os.listdir(dirpath) and dirpath != src: os.rmdir(dirpath)
    os.makedirs(os.path.join(repo, 'docs'), exist_ok=True)
    shutil.copy2(os.path.join(ROOT, 'REGISTER.csv'), os.path.join(repo, 'docs', 'content-register.csv'))
    print('src/: %d added, %d updated, %d removed; docs/content-register.csv refreshed' % (added, changed, removed))
    print('Next: git -C "%s" status, add a CHANGELOG.md entry, commit, push.' % repo)


if __name__ == '__main__':
    if len(sys.argv) < 2: print(__doc__); sys.exit(2)
    main(sys.argv[1])
