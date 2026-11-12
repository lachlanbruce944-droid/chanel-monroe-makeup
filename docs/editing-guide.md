# Editing guide

Open `index.html` in Chrome or Edge. Every reload picks a fresh random set of photos for each section
(25 by default, Chanel's own work first) with short clips spread evenly through them.

## Change the design
`settings/design-settings.js`: one letter per option (navigation, background theme, captions, pricing window,
mix), plus how many photos and clips each section shows.

## Make manual adjustments (Edit mode)
1. Press **E** on the site (or open `index.html?edit`).
2. On any photo or clip: **📌** pin it (pinned items always show first, in order), **✕** hide it,
   pick a new style from the menu to move it, or click the caption box to rewrite its description.
3. Drag tiles to reorder them. Dragged tiles are pinned in their new spot.
4. **Show every image in this section** lists everything in the section, including hidden ones, so you can pin
   photos that are not in the current random mix.
5. **Save to overrides.js**: choose `data/overrides.js` the first time. Every save adds a dated entry to the
   file's `log`, so there is always a record of what changed and when.

Edits never touch the photos themselves or `media.js`; they live only in `data/overrides.js`.

## Add or remove photos and clips
- Put images in `images/inspiration/<Style name>/` and add a row to `images/inspiration/credits.csv`
  (or `lip-credits.csv`). Clips go in `images/videos/` with a row in `videos.csv`.
- Then run `python tools/build_media.py` to rebuild `data/media.js`.

## Files
| Path | What it is |
|---|---|
| `index.html` | The site |
| `settings/site-settings.js` | Business name, email, socials |
| `settings/pricing-settings.js` | All prices (the only place prices live) |
| `settings/design-settings.js` | Design options |
| `data/site-content.js` | Bio lines, affiliates, brands, products, booking links |
| `data/media.js` | Generated list of every photo and clip with its style and credit |
| `data/overrides.js` | Your Edit-mode changes and their log |
| `images/` | chanel (her work), inspiration (credited references), videos, affiliates, brands |
| `tools/build_media.py` | Rebuilds `data/media.js` |

Images in `images/inspiration` and `images/videos` belong to the credited artists. They are reference
material and are not in the public GitHub repo. Ask permission before publishing them.
