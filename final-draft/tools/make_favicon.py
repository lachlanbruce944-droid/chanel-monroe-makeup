"""Favicon: a single script 'M' (Pinyon Script) in rose gold on an ivory rounded square.
Writes images/icons/favicon.ico (16/32/48), favicon-32.png, apple-touch-icon.png (180), icon-192.png, icon-512.png."""
import os, urllib.request
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(ROOT, 'images', 'icons'); os.makedirs(out, exist_ok=True)
ttf = os.path.join(out, 'PinyonScript-Regular.ttf')
if not os.path.exists(ttf):
    urllib.request.urlretrieve('https://github.com/google/fonts/raw/main/ofl/pinyonscript/PinyonScript-Regular.ttf', ttf)
S = 1024; IVORY = (251, 248, 242, 255); ROSE = (201, 144, 122, 255)
def draw(size, radius_frac=.22, pad=1.0):
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, S - 1, S - 1), radius=int(S * radius_frac), fill=IVORY)
    sw = int(S * (.03 if size <= 48 else .006))  # thicker strokes so the M stays readable at 16-48 px
    f = ImageFont.truetype(ttf, int(S * .78 * pad))
    l, t, r, b = d.textbbox((0, 0), 'M', font=f, stroke_width=sw)
    d.text(((S - (r - l)) / 2 - l, (S - (b - t)) / 2 - t + S * .02), 'M', font=f, fill=ROSE, stroke_width=sw, stroke_fill=ROSE)
    return im.resize((size, size), Image.LANCZOS)
draw(32).save(os.path.join(out, 'favicon-32.png'))
draw(180, radius_frac=0).save(os.path.join(out, 'apple-touch-icon.png'))   # iOS rounds the corners itself
draw(192).save(os.path.join(out, 'icon-192.png')); draw(512).save(os.path.join(out, 'icon-512.png'))
draw(48).save(os.path.join(out, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
print('icons written to', out)
