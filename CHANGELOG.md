# Changelog

All notable changes to the Chanel Monroe Makeup website, newest first. Every change to the site gets a dated entry here in the same commit.

### 2026-11-14 (reference photos from the site's carousel; beauty team windows)
- Inside the site, the chat's glass now blurs the real site behind it, and its separate photo gallery is gone. At the reference-photos step, "Browse looks" lifts the glass: every carousel photo gets a + button, a pill shows how many are saved, and "Back to your enquiry" returns to the chat with the picks added. Opened on its own (enquire.html), the chat keeps its own style-sorted gallery.
- Beauty team: artists are shown in one window per category (Hair, Nails, Lashes brows & tan, Photographers, Tattoo).

### 2026-11-14 (chat opens over the site, booking inside the chat, tidier tiles)
- Enquire and Book now open the chat over the site in the same window (an overlay; full screen is kept). "✕ Close" or Esc returns to the site.
- End of the chat: a short prompt and a "Schedule your phone call" card; "Choose a time" opens Chanel's cal.com Enquiry form embedded right in the page, with name, email, phone, Style and notes filled in ("open in a new tab" as a fallback).
- Shorter opening and closing messages.
- The chat's photo gallery is sorted into style categories (section, then sub-style, with counts and jump buttons); the client's own style is shown first.
- Main site: more padding in the section title tile and the photo caption bar, the title tile now sits just below the nav instead of joined to it, and Pricing / Enquire lose their white edge.

### 2026-11-14 (chat enquiry saves to Supabase)
- New table `public.enquiries` in the Supabase project: row-level security on, the public key can only insert (consent required, size limits on every field), nobody can read rows without the service role. `enquire.html` now has the publishable key, so every sent enquiry is saved. Add `?localdb` to the address to practise without saving.

### 2026-11-14 (chat enquiry page)
- New `enquire.html`: a chat-style enquiry over frosted glass, with an animated orb for the assistant. It asks for the booking type and style (from a list, with styles from the site's sections), date, time, suburb (distance and travel check), how many, skin, allergies and patch test, lashes, extra services, reference photos (+ on any gallery photo) and beauty-team artists. Detail tiles (style, date, time, suburb, estimate) build up above the chat. It ends with a summary, a price estimate from `settings/pricing-settings.js`, and "Choose a time for your phone consult", which opens cal.com/chanelmonroe/enquiry with name, email, phone, Style and notes filled in.
- Every Enquire and Book button now opens the chat (`data/site-content.js` BOOKING_LINKS). Section buttons pass `?for=<section>`: Natural, Editorial and Parties fill in the booking type; Special events offers Bridal or Glam.
- Travel is now included within 20 km (was 50) in `settings/pricing-settings.js`; the pricing page footer follows.
- `tools/publish.py` keeps `enquire.html` in `src/`; `tools/build_site.py` copies it into `site/`.
- Enquiries are not saved to Supabase yet: until `CONFIG.supabaseAnonKey` is set in `enquire.html` they stay in the visitor's browser only, and the cal.com booking notes carry the details. Add `?test` to the address for the Test panel.

### 2026-11-14 (intro redesign: turn sideways, then full screen; iPhone Home Screen sheet)
- Entry screen on phones and tablets redesigned (dark plum, drifting light, gold-shimmer name, frosted step card) and given the legacy mock-up's two-step logic: 1. turn sideways (stays until the phone is landscape, returns if it turns upright; rotation-lock tip after 7 s); 2. go full screen. Leaving full screen brings step 2 back unless the visitor chose to continue without it (remembered for the visit).
- Android and iPad: Enter full screen also locks landscape; "Continue without full screen" appears if the browser refuses.
- iPhone (no full-screen support in any iPhone browser): the same short screen with Enter full screen, which opens a 3-step sheet (Share, with an arrow to the browser bar > Add to Home Screen > open from the Home Screen), plus Continue in Safari/Chrome/Edge. Opened from the Home Screen the site runs full screen.
- New `site.webmanifest` (full screen, landscape, icons) and Apple web-app meta tags; `tools/build_site.py` and `tools/publish.py` now ship the manifest.
- Test on a computer with `?gate` (or `?gate=ios` for the iPhone version). Previous index.html kept at `M:\CMM-Site\_archive\index-before-intro-redesign-2026-11-14.html`.

### 2026-11-12 (settings, pricing layouts, product cut-outs, clips)
- Settings button (gear) at the end of the nav: Affiliate tile size (standard, medium 55%, large 80%) and Pricing layout (fit to window, photo stays in view). Choices are remembered per device.
- Pricing: no position dots on the photo gallery; 'fit' scales the price list so the whole page fits; slimmer style menu.
- Products: tools/cutout_products.py makes transparent cut-outs of 513 of 544 product photos (M:\CMM-Site\media\products\cutout, 15 MB). The site uses them once uploaded (tools/upload_media.py) and falls back to the original photo until then.
- Clips: autoplay and loop with no player controls; tap to pause or play. New mix button removed. Entry button reads Explore.

### 2026-11-12 (content guidelines, popups, products)
- Added docs/content-guidelines.md (what photos, clips, lessons, affiliates, brands and products are suitable, file standards) and CLAUDE.md (start-here notes for AI assistants).
- Brand and product popups now work like the affiliate popup: fixed height, nothing scrolls, text panel scales to fit, brand product grid fills its box.
- Products: no card backgrounds, white photo backgrounds blended into the page, sized like the style gallery photos.
- Media naming rules (tools/media_names.py) and a one-off rename tool (tools/migrate_media_names.py, dry run done: 3,269 renames, 43 unused files to delete). The rename runs when the owner enters the Supabase secret key.

### 2026-11-12 (repository clean-up)
- Repository now holds only what the site and its build need. Removed the first mock-up (`legacy/`, archived at `M:\CMM-Site\_archive\legacy-mockup`), Chanel's and affiliates' original photos (served from Supabase), the unused font file, and one-off pipeline scripts (archived at `M:\CMM-Site\_archive\repo-tools`).
- Documentation renamed for review: `WORKLOG.md` split into `CHANGELOG.md`, `docs/project-status.md` and `docs/instagram-review-log.md`; `REGISTER.csv` â†’ `docs/content-register.csv`; editing guide and SEO plan moved to `docs/`; workflow renamed `deploy-pages.yml`. Added `README.md` (architecture, layout, publishing) and `CONTRIBUTING.md` (content rules).
- New `tools/publish.py`: rebuilds the register, builds `site/`, mirrors only whitelisted source into `src/` (removes anything else) and refreshes the register in `docs/`.
- New `tools/check_duplicate.py`: checks an Instagram link, post code, @handle, product URL or name against the register, removed and rejected logs before anything is added.

### 2026-11-12 (pricing gallery, affiliate popup, removals)
- Pricing: each style shows up to 8 whole, uncropped photos as a crossfading gallery (about 4 s each) over a blurred fill, with position dots.
- Affiliate popup: no scrolling on any screen; the profile panel scales to fit and the 3Ã—3 photo grid fills its box. Smaller bio text.
- About: bigger photo tile, top-aligned with the name, whole picture shown.
- Carousels: widths measured once, only on-screen rows animate, rows pause while the page scrolls, swipe direction locked (vertical swipes scroll the page).
- Removed the @chris_mufx SFX and prosthetics image (moved to `_removed`, logged in `data/removed.json`).

### 2026-11-12 (mobile pass)
- About photo popup on phones: photo left, comments right. Chanel photo tile beside her name; `src/images/about/chanel.jpg` is only the 150px Instagram avatar, replace it with a proper headshot.
- Close button is a white tile with a bold X (all popups). Pricing/Enquire, brand and captions fade while any popup is open (body.pop-open). Photo popup description sits beside the image in landscape.
- Galleries: one strip per style, grouped by sub-category, with a live sub-category label beside the title; sub-chip row removed. Photos sized as a share of screen height (--img-pct). Captions wait until scrolling stops, and shrink only when the description wraps. Clips never sit side by side; Clip tag removed.
- Nav: fits on screen, inset from the edges, no underline; title sits closer. Phone-landscape sizes scale with the screen (checked at 667x375 and 874x402).
- Carousels: touch drag with flick and no freezing (pointercancel handled, hover pauses for mouse only). Affiliates on phones: desktop layout scaled down; profile popup stays side by side.
- Brand logos and the About photo ship with the site (12 SVG logos were missing on Supabase). css/js links are version-stamped so phones pick up changes.
- Entry gate on touch devices: landscape and full screen first (fallback link when full screen is refused), with rotating welcome lines.
- Personal intros for Affiliates, Brands and Products.

### 2026-11-12 (hosting: GitHub Pages + Supabase Storage; landscape-only phones)
- **Repo restructured** (see README.md): `site/` = built site served by GitHub Pages (workflow `.github/workflows/pages.yml`); `src/` = editable source (was `final-draft/`); `legacy/` = the first mock-up.
- **Media â†’ Supabase Storage** (project `makeup-website`, ref qxiugfatpybldluipcyy, Free plan: 1 GB storage, 5 GB egress a month). Public bucket `media` created.
  - `tools/optimize_media.py` turned 1.24 GB into **746 MB** at `M:\CMM-Site\media` (first 226 MB, raised at Lachlan's request):
    - photos are WebP at 1600px (q88) plus an 800px copy (`.m.webp`)
    - affiliate photos are 720px and avatars 480px
    - clips are 1080p H.264 CRF 21 with 720px WebP posters
    - about 250 MB of the 1 GB free storage is left; Free plan egress is 5 GB a month, so bigger files mean fewer free visits
    - names are lower case with no spaces or @
  - `media/manifest.json` maps the old paths to the new ones (copy in `src/data/media-manifest.json`).
  - Lessons clips are not uploaded (the tab is hidden).
  - **Upload still to run:** `python tools/upload_media.py` asks for the Supabase secret key in the terminal. A temporary public upload window was refused, rightly. It skips files already uploaded, and every file gets a one-year cache header.
- **Build:** `python tools/build_site.py <repo>\site`.
  - Splits index.html into css/site.css + js/app.js + js/config.js.
  - Repoints every `images/...` path in the scripts and data at Supabase (icons stay on GitHub).
  - Output is about 1.2 MB.
  - A second argument points it at a local media server for testing: `python -m http.server 8767 --directory M:\CMM-Site\media`.
- **Speed:**
  - srcset gives phones and 1x screens the 540px copy.
  - Lazy loading and async decoding on every photo; only the first 2 tiles are high priority and only the first 3 load straight away.
  - Clips load and play only while visible.
  - The About grid uses the 540px copies.
  - A preconnect to Supabase is added.
  - Tested: only 8 of 29 gallery tiles were fetched on first load.
- **Phones landscape only:**
  - Portrait (â‰¤760px wide) shows a "Turn your phone sideways" screen in the spectrum-night style, with a Go full screen button. That button also locks landscape on Android; iPhone ignores both.
  - New compact layout for landscape phones (height â‰¤520px). Tested at 874Ã—402: photos, caption and buttons all fit.
- Lessons tab hidden (`SHOW_LESSONS=false` in renderNav).
- **To do:** enable GitHub Pages (Settings â†’ Pages â†’ Source: GitHub Actions), run the upload, then check the live site.
### 2026-11-12 (Lessons tab, 100 more affiliates, footer)
- **Lessons tab:** new nav item after Parties & Seasons, with a divider on each side.
  - 60 tutorial clips with sound, mostly 20â€“60 s, in 15 chapters: skin prep, diet, daily routine, skincare, SPF, check-ups (derms, skin checks, allergies), wardrobe, colours, makeup looks, hair, nails, cosmetic tattoo, tattoos & unique features (cover-ups, vitiligo, freckles), make it last, removal & cleaning.
  - Captions were allowed. Clips without captions are listed first in each chapter (CLEAN list in `tools/build_lessons.py`).
  - Clicking a card opens a player with sound, the creator credit and an Instagram link. It stops playing when closed.
  - Data: `images/lessons/lessons.csv` â†’ `python tools/build_lessons.py` â†’ `data/lessons.js`. The clips are other creators' work, so the files are git-ignored.
  - Pipeline scripts are in `tools/lessons/` (stage1 = mux + frame sheets, stage2 = encode + csv, trim, shrink to 720p). Reviewed and unused codes are in `M:\CMM-Site\CMM-Lessons\rejected.json`.
- **Affiliates:** 100 more Gold Coast accounts, 20 per section, so each section now has 25 (125 in total).
  - Found through Instagram keyword search. Each was checked: public, Gold Coast or a suburb in the bio or name, 250+ followers, 9+ posts, relevant to the section.
  - Script: `tools/add_affiliates.py <batch>` then `build_people.py`. The batch is at `M:\CMM-Site\CMM-Affiliates\batch2`.
  - Backups: `M:\CMM-Site\affiliates-before-batch2.csv` and `affiliates-raw-before-batch2.json`.
  - **Message each one before going live.**
- **Footer:** the bottom row now has 12px above and below it. `--foot` is 84px; the caption is centred with the buttons.
- **Nav mockups** (not built): Design canvas "Chanel Monroe Makeup: compact nav options" (https://claude.ai/artifact/9Y1okd9xGskgiS5Yusoz41). It shows the current nav plus options A (one-line switcher), B (slim tabs), C (menu button + floating title) and D (side rail).
- REGISTER.csv now lists lessons (kind `lesson`) and all 125 affiliates.
### 2026-11-12 (removals applied)
- Applied removals: all 59 items hidden in Edit mode are off the site (44 inspiration photos, 14 clips, 1 of Chanel's photos: shoot-look_05 Scared to Love).
  - The files and video posters (73 files) were moved, not deleted, to `M:\CMM-Site\_removed\final-draft\â€¦`. Copy one back and re-add its CSV row to undo.
  - Rows were dropped from credits.csv, videos.csv and chanel/index.csv.
  - The hidden list in overrides.js is now empty. A backup is at `M:\CMM-Site\overrides-before-removals.js`.
- Each removed item is listed in `data/removed.json` with its Instagram code and shows in REGISTER.csv as kind `removed`. **Never re-add these.**
- Script: `tools/apply_removals.py`. Run it again whenever more items are hidden, then `build_media.py` and `build_register.py`.
- Clips now total 55. Natural has 4 left: top it up.
### 2026-11-12 (catalogue, clips round 2, SEO, register)
- **REGISTER.csv** (`final-draft/`, built by `tools/build_register.py`): every photo, clip, kit product, catalogue product, brand and affiliate, plus 139 Instagram posts already reviewed and rejected (`data/rejected.json`). **Check it before adding anything**; re-run the script after any change.
- **Clips:** 37 more (69 total), all checked frame by frame for text overlays, captions and watermarks. Transcoded to H.264 with no audio for iPhone/Safari. Scripts in `tools/video-round2/`.
- **Catalogue:** `data/catalog.js` holds 526 products from 41 of the listed brands, in 22 categories plus "Trending now", up to 25 each. Every product appears once, and other sizes or shades of the same product are dropped. Clicking a product opens a popup with its description (credited to Adore Beauty or the brand site), price and shop link. Rebuild with `tools/build_catalog.py` from `data/raw/` (git-ignored: adore.json, shop-*.json).
- **Brand popup:** logo, est. / from / founder (`data/brands-info.js`), one line, site link, and 9 products.
- **Layout:**
  - Brand wordmark sits bottom left, Pricing and Enquire bottom right, inline with the rotating caption. On About the brand replaces the title, and Pricing and Enquire are hidden.
  - Compact top nav that scrolls on small screens. Phone layout follows iPhone 17 Pro and Pro Max sizes.
- **About:**
  - Timeline in one row.
  - Each of Chanel's photos shows once.
  - Instagram popup no longer shows dates, hearts, the comment icon or the arrow.
- **Other changes:**
  - New mix shows unseen images in new positions.
  - Parties uses the "Blush editorial" background.
  - Affiliates show as large circles.
  - Favicon is a rose-gold script M (`images/icons/`).
- **SEO:** title, description, OG tags, BeautySalon JSON-LD (15 suburbs), noscript H1 and robots.txt. Competitor review and next steps are in `SEO.md`.
### 2026-11-12 (carousels, popups, Chanel only in About)
- Style sections now show inspiration only. Chanel's own photos appear only in About (`pick()` skips `own`; the `mix` option no longer adds her photos).
- About: clicking a tile opens an Instagram-style popup: photo on the left; caption and her real Instagram comments (with replies, avatars, dates) pinned on the right. Arrows or â† â†’ move between photos. Data: `data/comments.js` (`window.IG_POSTS`, keyed by post URL, 18 posts, 89 comments), built by `tools/build_people.py` from `data/comments-raw.json`. Commenter avatars: `images/chanel/comments/` (local only).
- Affiliates, Brands, Products are now horizontal auto-rotating carousels (loop, pause on hover, drag or trackpad to move; rows alternate direction).
- Affiliates: click a card for a popup with avatar, bio, posts/followers, a 3 x 3 grid of their 9 latest posts (each links to the post), Instagram and website buttons. Data: `data/affiliates.js`, built from `data/affiliates-raw.json` + `images/affiliates/affiliates.csv`. Photos: `images/affiliates/<cat>/<handle>/01-09.jpg` (local only). @goddesslashesx is private: no photos.
- Brands: every logo links to the brand's official site (`BRAND_URL` in index.html, checked 2026-11-12). ModelCo closed in 2025 (link redirects to MCoBeauty); LaGlam has no site (links to its Australian Made listing).
- Products: one clear product photo each, linking to an Australian product page where one exists. Source list: `data/products.csv` (edit it, then `python tools/fetch_products.py`, which downloads to `images/products/` and writes `data/products.js`). Generic kit items show as an "Also in the kit" list.
- Affiliate photos, product photos and commenter avatars belong to other people, so they are git-ignored like the inspiration images.

### 2026-11-12
- Removed 9 near-duplicate slides from Chanel's work (now 21 photos). Copies kept at `M:\CMM-Site\chanel\_removed-duplicates`. Added the scrape register above so they are not downloaded again.
- About grid still has 36 tiles, so each photo shows 1 to 2 times; repeats never sit next to or above each other.

### 2026-11-11 (pricing link)
- Removed the underlined '<section> prices' link from each section heading. Prices open only from the Pricing button in the header.

### 2026-11-11 (About grid)
- About section: Chanel's work now shows as a 36-tile grid (9 x 4 on desktop, 4 x 9 on phones). Fresh order on every visit, one tile fades to another photo every 2.6 s, preferring photos not already on screen; no photo sits next to or above itself. Click a tile to open it large. With 30 photos, 6 tiles repeat until more of her work is added.
- Bio lines with [placeholder] brackets are no longer shown.

### 2026-11-11 (later)
- Added `final-draft/`: full desktop site with six-group nav plus About, Affiliates, Brands, Products; pricing window (side tabs); random 25 per section with clips spaced evenly; Edit mode with save-to-file log; README.
- Added Lip art sub-style (Editorial) and 32 short clips. Fixed swapped descriptions on Chanel's "Sinner" (red-cross gothic glam) and "ghoulish" (SFX creature) photos.
- Added WORKLOG.md (this file). `.gitignore` now keeps other artists' photos and clips out of the public repo.
- C: drive filled up; big working files moved to `M:\CMM-Site\` (CMM-Inspiration, CMM-Mock). `CMM-Inspiration.zip` moved to `M:\`.

### 2026-11-11
- Removed 213 images with text/products: 211 inspiration references (moved to `M:\CMM-Site\CMM-Inspiration\_removed\`, dropped from `inspiration/credits.csv`) and Chanel's 2 Halloween flyers (`images/instagram/Parties/halloween_01..., halloween_05...`). Commit a2a149f.
- Built design mock with switchable options (nav A/B/C, background A/B/C, captions A/B/C, pricing window A/B/C, gallery mix A/B). Random 25 images per group on each load.
- Added affiliate profile pictures: `images/affiliates/<category>/<handle>.jpg` + `affiliates.csv` (25 accounts). Commit 80e0d07.
- Created repo with website, gallery and brand images, Chanel's 32 Instagram photos (`images/instagram/`, `index.csv`), inspiration `credits.csv`. Commit 7e424f8.
