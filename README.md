# Chanel Monroe Makeup â€” website

The website for **Chanel Monroe Makeup**, a mobile makeup artist on the Gold Coast (Instagram [@chanelmonroemakeup](https://www.instagram.com/chanelmonroemakeup/)).
Visitors browse looks by style (natural, glam, bridal, editorial, character & FX, parties), see pricing, lessons, reviews and local affiliate artists, then enquire. Phones get a vertical one-page version of the same site.

**Live site:** https://lachlanbruce944-droid.github.io/chanel-monroe-makeup/

## Architecture

| Layer | Where | What |
|---|---|---|
| Pages, styles, scripts, data | GitHub Pages (`site/`) | Light static files, about 2.5 MB. Deployed by GitHub Actions on every push to `main`. |
| Photos and video clips | Supabase Storage, public bucket `media` | About 750 MB of optimised WebP and MP4, served from Supabase's CDN with long cache headers. |
| Master media | This folder, not in git | Original photos and clips in `src\images`; the optimised mirror uploaded to Supabase in `local\media` (with download caches and removed content in `local\`). |

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
  content-guidelines.md              What content is suitable (photos, clips, affiliates, brands, products)
  content-register.csv               Every item on the site, plus everything rejected or removed
  project-status.md                  Current state and open items
  editing-guide.md                   Edit mode and day-to-day content changes
  instagram-review-log.md            Chanel's Instagram posts already reviewed
  seo-plan.md                        Local SEO plan
CHANGELOG.md                         Dated log of every change
CONTRIBUTING.md                      How to add, change or remove content without duplicates
CLAUDE.md                            Start-here notes for AI assistants working on the repo
```

## Build and publish

Work happens in this repository's folder, **`M:\CMM-Site\chanel-monroe-makeup`**: edit `src/`, build, then commit and push from here.
(The old working copy `M:\CMM-Site-Assets\final-draft` and older builds in `M:\CMM-Site-Assets\_archive` are kept for reference only.)

```powershell
cd M:\CMM-Site\chanel-monroe-makeup
git pull                         # start from the latest version
# edit files in src\ ...
python src\tools\publish.py      # rebuilds site\ and docs\content-register.csv
git status                       # review
# add an entry to CHANGELOG.md, then:
git add -A; git commit -m "Short description"; git push
```

`publish.py` rebuilds the content register, builds `site/` from `src/`, and refreshes `docs/content-register.csv`.
The original photos and clips sit in `src/images/` on this computer only (git ignores them; the site serves them from Supabase).
New or replaced photos and clips go through `tools/optimize_media.py` and `tools/upload_media.py` first. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Everything is in this folder

Code, content, tools, the original photos and clips (`src\images`) and the working media (`local\`) are all here, so the site can be edited, built, previewed and published from this one folder.
Photos and clips are not in git: back up this folder, not just GitHub. To preview the built site on this computer:

```powershell
python -m http.server 8000 --directory site     # then open http://localhost:8000
```

Online services the site uses (accounts, not files): GitHub Pages (hosting), Supabase (photos and clips, enquiries, selfies, the `enquiry-email` function, source in `supabase/functions/`), Resend (emails), cal.com (phone-call bookings), GoDaddy (domain and email DNS).

## Phones and tablets

The site is designed for landscape. On touch devices an entry screen asks visitors to turn the phone and go full screen, with a fallback when the browser refuses full screen (iPhone).

## Ownership and credits

Photos in the style galleries are inspiration from other artists and are credited on every image; they are not Chanel's work. Chanel's own work appears only in About. Affiliates must be contacted before the site launches.
