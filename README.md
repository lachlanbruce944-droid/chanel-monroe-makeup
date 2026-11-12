# Chanel Monroe Makeup — website

The website for **Chanel Monroe Makeup**, a mobile makeup artist on the Gold Coast (Instagram [@chanelmonroemakeup](https://www.instagram.com/chanelmonroemakeup/)).
Visitors browse looks by style (natural, glam, bridal, editorial, character & FX, parties), see pricing, local affiliate artists, and the brands and products in Chanel's kit, then enquire.

**Live site:** https://lachlanbruce944-droid.github.io/chanel-monroe-makeup/

## Architecture

| Layer | Where | What |
|---|---|---|
| Pages, styles, scripts, data | GitHub Pages (`site/`) | Light static files, about 2.5 MB. Deployed by GitHub Actions on every push to `main`. |
| Photos and video clips | Supabase Storage, public bucket `media` | About 750 MB of optimised WebP and MP4, served from Supabase's CDN with long cache headers. |
| Master media | `M:\CMM-Site` (local) | Original files and the optimised mirror that is uploaded to Supabase. Not in this repository. |

Pages only download what is on screen: images use lazy loading and responsive sizes (800px and 1600px copies), and clips load only while visible.

## Repository layout

```
.github/workflows/deploy-pages.yml   Deploys site/ to GitHub Pages
site/                                Built site, served as is (do not edit by hand)
src/                                 Source the site is built from
  index.html                         Markup, styles and scripts (split into site/css and site/js by the build)
  settings/                          Business details, prices, design options
  data/                              Content: media list, affiliates, brands, catalogue, overrides, removed/rejected logs
  images/icons, brands, about        Small assets shipped with the site
  images/**/*.csv                    Credit records for every photo and clip (the files themselves live on Supabase)
  tools/                             Build, publish, media and content scripts (Python 3.12)
docs/
  content-register.csv               Every item on the site, plus everything rejected or removed
  project-status.md                  Current state and open items
  editing-guide.md                   Edit mode and day-to-day content changes
  instagram-review-log.md            Chanel's Instagram posts already reviewed
  seo-plan.md                        Local SEO plan
CHANGELOG.md                         Dated log of every change
CONTRIBUTING.md                      How to add, change or remove content without duplicates
```

## Build and publish

Work happens in the working copy (`M:\CMM-Site\final-draft`, which mirrors `src/`). To publish:

```powershell
cd M:\CMM-Site\final-draft
python tools\publish.py C:\Users\USER\repos\chanel-monroe-makeup
cd C:\Users\USER\repos\chanel-monroe-makeup
git status            # review
# add an entry to CHANGELOG.md, then:
git add -A; git commit -m "Short description"; git push
```

`publish.py` rebuilds the content register, builds `site/`, mirrors only the needed source files into `src/` (removing anything else), and refreshes `docs/content-register.csv`.
New or replaced photos and clips go through `tools/optimize_media.py` and `tools/upload_media.py` first. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Phones and tablets

The site is designed for landscape. On touch devices an entry screen asks visitors to turn the phone and go full screen, with a fallback when the browser refuses full screen (iPhone).

## Ownership and credits

Photos in the style galleries are inspiration from other artists and are credited on every image; they are not Chanel's work. Chanel's own work appears only in About. Affiliates must be contacted before the site launches.
