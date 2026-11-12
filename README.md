# Chanel Monroe Makeup: website

Mobile makeup artist on the Gold Coast. Read **WORKLOG.md** before changing anything.

## How it is hosted
| Part | Where | What |
|---|---|---|
| Site (pages, styles, scripts, small data) | **GitHub Pages**, from `site/` | about 1 MB; deployed automatically by `.github/workflows/pages.yml` on every push to `main` |
| Photos and clips (the heavy content) | **Supabase Storage**, public bucket `media` | about 746 MB: WebP photos (1600px + 800px copies), affiliate photos 720px, 1080p clips |

Media URLs look like `https://qxiugfatpybldluipcyy.supabase.co/storage/v1/object/public/media/images/...`.

## Folders
```
site/        the built site that GitHub Pages serves (do not edit by hand: rebuild it)
  index.html  slim page
  css/site.css, js/app.js, js/config.js   (config.js holds the media address)
  data/, settings/                         small data files, paths already pointing at Supabase
  images/icons/                            favicon + app icons (the only images on GitHub)
src/         the editable source (mirror of the working copy M:\CMM-Site\final-draft, without media)
  index.html, data/, settings/, tools/, SEO.md, REGISTER.csv
legacy/      the first mock-up site, kept for reference
```
Working copy with all original media: `M:\CMM-Site\final-draft`. Optimised media mirror: `M:\CMM-Site\media`.

## Updating the site
1. Edit in `M:\CMM-Site\final-draft` (open index.html there to preview with local media).
2. New photos/clips: `python tools/optimize_media.py` then `python tools/upload_media.py` (asks for the Supabase secret key).
3. `python tools/build_site.py C:\Users\USER\repos\chanel-monroe-makeup\site`
4. Copy changed source files into `src/`, commit, push. Pages redeploys in about a minute.

## Speed
- Only what is on screen loads: photos use `loading="lazy"` + `decoding="async"`, clips load and play only while visible
  (IntersectionObserver, `preload="none"`), popups load their photos when opened.
- Phones and 1x screens get the 540px copy through `srcset`; only the first two photos are high priority.
- CSS and JS are separate files, so browsers cache them; media is served with a one-year cache header from Supabase's CDN.
- Phones: landscape only. Portrait shows a "turn your phone sideways" screen with a full-screen button.
