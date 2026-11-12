"""Zip the complete site (all pages, data, images and videos) ready to upload. Skips raw scrape data and build tools."""
import os, zipfile, datetime
SRC = r'M:\CMM-Site\final-draft'
OUT = r'M:\CMM-Site\chanel-monroe-makeup-site-%s.zip' % datetime.date.today().isoformat()
SKIP_DIRS = {os.path.join(SRC, 'data', 'raw'), os.path.join(SRC, 'tools'), os.path.join(SRC, '__pycache__')}
SKIP_EXT = {'.py', '.pyc', '.tmp'}
n = size = 0
with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_STORED, allowZip64=True) as z:   # media is already compressed
    for root, dirs, files in os.walk(SRC):
        dirs[:] = [d for d in dirs if os.path.join(root, d) not in SKIP_DIRS]
        for f in files:
            if os.path.splitext(f)[1].lower() in SKIP_EXT or f.endswith('.tmp.mp4'): continue
            p = os.path.join(root, f); arc = os.path.join('chanel-monroe-makeup', os.path.relpath(p, SRC))
            z.write(p, arc); n += 1; size += os.path.getsize(p)
print(n, 'files', round(size / 1e6), 'MB ->', OUT)
