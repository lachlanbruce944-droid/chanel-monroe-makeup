"""Naming rules for media in Supabase Storage (bucket `media`). One place, used by every media tool.

    gallery/<style-group>/<style>/<style>-<nnn>-<artist>.webp      inspiration photo, 1600 px wide
    gallery/<style-group>/<style>/<style>-<nnn>-<artist>-800.webp  same photo, 800 px wide (phones, 1x screens)
    clips/<style-group>/<style>/<style>-<nn>-<artist>.mp4          short clip, 1080 px wide, no audio
    clips/<style-group>/<style>/<style>-<nn>-<artist>-poster.webp  its cover frame
    chanel/work/<section>/<name>.webp  (+ -800.webp)               Chanel's own work
    chanel/comment-avatars/<handle>.webp                           avatars beside Instagram comments
    affiliates/<category>/<handle>/profile.webp                    affiliate profile picture
    affiliates/<category>/<handle>/post-<nn>.webp                  affiliate's recent posts
    products/<product>.webp  (+ -800.webp)                         product photos

Every part is lower case, words joined with '-', no '@', '.', '_' or spaces. The artist's Instagram post code is
not in the file name: it is kept in the credit records and docs/content-register.csv.
Brand logos, icons and the About photo are not here: they ship with the site on GitHub.
"""
import json, os, re

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GROUP_SLUG = {'natural': 'natural', 'glam': 'glam', 'bridal': 'bridal', 'editorial': 'editorial',
              'fx': 'character-and-fx', 'parties': 'parties-and-seasons'}
SMALL = '-800'      # suffix of the 800 px copy
POSTER = '-poster'  # suffix of a clip's cover frame


def slug(s):
    s = re.sub(r'[^a-z0-9]+', '-', (s or '').lower().replace('@', ''))
    return re.sub(r'-{2,}', '-', s).strip('-')


def _style_groups():
    """Style folder name (e.g. 'SFX and prosthetics') -> group id (e.g. 'fx'), read from data/media.js."""
    t = open(os.path.join(SITE, 'data', 'media.js'), encoding='utf-8').read()
    items = json.JSONDecoder().raw_decode(t[t.index('['):])[0]
    out = {}
    for m in items:
        src = m['src'].replace('%20', ' ').replace('%40', '@')
        p = src.split('/')
        if len(p) > 3 and p[1] == 'inspiration': out[slug(p[2])] = m['g']
        if m.get('s'): out.setdefault(slug(m['s']), m['g'])
    return out


_GROUPS = None
def group_of(style):
    global _GROUPS
    if _GROUPS is None: _GROUPS = _style_groups()
    return GROUP_SLUG.get(_GROUPS.get(slug(style), ''), 'other')


# <style>_<nnn>_@<handle>_<11-char post code>[-k].ext   (handles may contain '_' and '.')
INSP = re.compile(r'^(?P<style>.+?)_(?P<n>\d{3})_@?(?P<handle>.+)_(?P<code>[A-Za-z0-9_-]{11})(?P<k>-\d+)?$')
# <group>_<style>_@<handle>_<code>      (clips)
CLIP = re.compile(r'^(?P<group>[a-z]+)_(?P<style>[a-z0-9-]+)_@?(?P<handle>.+)_(?P<code>[A-Za-z0-9_-]{10,12})$', re.I)


def storage_names(sources):
    """sources: original paths like 'images/inspiration/Soft glam/soft-glam_001_@x_ABC.jpg'.
    Returns {source: (main storage name, small-copy name or None)} following the rules above."""
    out, used, clip_n = {}, set(), {}
    def take(name):
        base, ext = os.path.splitext(name); cand, i = name, 2
        while cand in used: cand = '%s-%d%s' % (base, i, ext); i += 1
        used.add(cand); return cand
    for src in sorted(sources):
        p = src.replace('\\', '/').split('/')
        stem, ext = os.path.splitext(p[-1]); ext = ext.lower(); top = p[1] if len(p) > 1 else ''
        if top == 'inspiration':
            m = INSP.match(stem)
            style = slug(p[2])
            name = '%s-%s-%s%s' % (style, m['n'], slug(m['handle']), m['k'] or '') if m else slug(stem)
            main = take('gallery/%s/%s/%s.webp' % (group_of(p[2]), style, name))
            out[src] = (main, main[:-5] + SMALL + '.webp')
        elif top == 'videos':
            m = CLIP.match(stem)
            if m:
                style = slug(m['style']); g = GROUP_SLUG.get(m['group'].lower(), slug(m['group']))
                k = (g, style); clip_n.setdefault(k, {})
                key = (slug(m['handle']), m['code'].lower())
                if key not in clip_n[k]: clip_n[k][key] = len(clip_n[k]) + 1
                base = 'clips/%s/%s/%s-%02d-%s' % (g, style, style, clip_n[k][key], key[0])
            else:
                base = 'clips/other/' + slug(stem)
            out[src] = ((base + '.mp4') if ext == '.mp4' else (base + POSTER + '.webp'), None)
        elif top == 'chanel' and len(p) > 2 and p[2] == 'comments':
            out[src] = (take('chanel/comment-avatars/%s.webp' % slug(stem)), None)
        elif top == 'chanel':
            main = take('chanel/work/%s/%s.webp' % (slug(p[2]), slug(stem)))
            out[src] = (main, main[:-5] + SMALL + '.webp')
        elif top == 'affiliates':
            cat = slug(p[2])
            if len(p) == 4: out[src] = (take('affiliates/%s/%s/profile.webp' % (cat, slug(stem))), None)
            else: out[src] = (take('affiliates/%s/%s/post-%s.webp' % (cat, slug(p[3]), slug(stem))), None)
        elif top == 'products':
            main = take('products/%s.webp' % slug(stem))
            out[src] = (main, main[:-5] + SMALL + '.webp')
    return out
