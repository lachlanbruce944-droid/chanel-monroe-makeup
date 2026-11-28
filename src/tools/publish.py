"""Publish the site from the repository in one step.

Usage (from the repo folder, M:\\CMM-Site\\chanel-monroe-makeup):
    python src/tools/publish.py
  The repo's src/ is the working copy: edit it, run this, then commit and push.
  (Older layout: run it from a separate working copy with the repo path as the argument.)

What it does:
  1. Rebuilds the content register (REGISTER.csv) so every item on the site is logged.
  2. Builds the deployable site into <repo>/site  (tools/build_site.py).
  3. Mirrors only the source files the site and its build need into <repo>/src.
     Anything else in <repo>/src is removed, so the repo never collects stray or duplicate files.
  4. Copies the register to <repo>/docs/content-register.csv.
Then review `git status`, add a CHANGELOG.md entry, commit and push. GitHub Actions deploys site/.

Heavy media (photos, clips) is not mirrored: it lives in Supabase Storage (bucket `media`),
with the local master copies under local\\media.
"""
import fnmatch, hashlib, os, shutil, subprocess, sys
LOCAL = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'local')   # <repo>\local: media, media-src, _removed (not in git)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Source files kept in the repo (paths relative to the working copy, '/' separated)
KEEP = [
    'index.html', 'enquire.html', 'apply.html', 'suggestions.html', 'photo-review.html', 'robots.txt', 'site.webmanifest',
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
    man = os.path.join(LOCAL, r'media\manifest.json')   # map of every media file to its Supabase name (written by optimize_media.py)
    if os.path.exists(man): shutil.copy2(man, os.path.join(ROOT, 'data', 'media-manifest.json'))
    subprocess.run([py, os.path.join(ROOT, 'tools', 'build_register.py')], check=True, cwd=ROOT)
    subprocess.run([py, os.path.join(ROOT, 'tools', 'build_site.py'), os.path.join(repo, 'site')], check=True, cwd=ROOT)
    src = os.path.join(repo, 'src')
    inside = os.path.normcase(os.path.abspath(src)) == os.path.normcase(ROOT)   # editing the repo's src/ directly
    keep = wanted()
    added = changed = removed = 0
    for rel in ([] if inside else sorted(keep)):
        a, b = os.path.join(ROOT, rel), os.path.join(src, rel)
        if same(a, b): continue
        existed = os.path.exists(b)
        os.makedirs(os.path.dirname(b), exist_ok=True); shutil.copy2(a, b)
        changed += existed; added += not existed
    for dirpath, _, files in ([] if inside else os.walk(src, topdown=False)):
        for f in files:
            rel = os.path.relpath(os.path.join(dirpath, f), src).replace(os.sep, '/')
            if rel not in keep: os.remove(os.path.join(dirpath, f)); removed += 1
        if not os.listdir(dirpath) and dirpath != src: os.rmdir(dirpath)
    os.makedirs(os.path.join(repo, 'docs'), exist_ok=True)
    shutil.copy2(os.path.join(ROOT, 'REGISTER.csv'), os.path.join(repo, 'docs', 'content-register.csv'))
    if inside: print("Built from the repo's own src/ (nothing to mirror).")
    else: print('src/: %d added, %d updated, %d removed; docs/content-register.csv refreshed' % (added, changed, removed))
    print('Next: git -C "%s" status, add a CHANGELOG.md entry, commit, push.' % repo)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        here = os.path.dirname(ROOT)   # run from inside the repo: src/tools/publish.py -> the repo is src's parent
        if os.path.basename(ROOT) == 'src' and os.path.isdir(os.path.join(here, '.git')): main(here); sys.exit()
        print(__doc__); sys.exit(2)
    main(sys.argv[1])
