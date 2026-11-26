## Refresh controls removed (26 November 2026)

Removed the public Refresh site and Reset chat testing buttons and handlers.

## Connections wording (26 November 2026)

Public Affiliates labels now read Connections, with a curated Gold Coast recommendations introduction and matching About/application wording. Existing page routes and data fields retained for compatibility.

## 26 November 2026 — Enquiry update prompts

Back arrows and summary edits use short prompts tailored to the detail being updated, including previously answered dates cleared by a scheduling change. Initial questions keep their original wording.

## 26 November 2026 — Remove patch-test references

Removed the patch-test enquiry question, pricing text, lesson tile and email wording. Legacy database field remains false for new website enquiries.

## About descriptions (26 November 2026)

About tour descriptions and action buttons now appear immediately when each chapter loads. Typing timers removed; chapter rotation retained. The Become an associate button is temporarily hidden.

## About photo controls (26 November 2026)

Profile photo is static again. Removed portrait and work carousel pause buttons; work photos continue rotating with previous/next navigation and hover/focus pausing.

## About carousels (26 November 2026)

Profile cycles every two seconds through the original portrait and catalogued selfie. Work photos use a large centred carousel. Repeated tour label removed. Existing 50 tests pass. Remaining work photos lack person labels; subject tagging is supported with `subject: "chanel"`. Browser layout verification remains outstanding.

## 26 November 2026 — Gallery return bar
Approved design 4 implemented for gallery browsing: live total pick count and short Enquiry return button, retaining current enquiry selections and progress.

## 26 November 2026 — Enquiry return arrow
Implemented the selected Option 1: one fading curved arrow beside the answer nearest the middle of the chat. Uses existing answer editing and dependency clearing; draft answers remain editable on reload. Automated suite: 44 passing checks. Visual browser verification remains outstanding (Chromium executable unavailable in this workspace).

## Pre-enquiry beauty team selection (25 November 2026)
- Unlocked beauty team and reference selections before entering a name; incomplete drafts retain picks. My picks remains inside the enquiry only; removed the site-wide button.

## Enquiry picks (25 November 2026)
- Removed header Browse looks; retained Reset chat. Added pre-enquiry beauty team selection and My picks browsing from the first (Natural) gallery, with tab persistence and enquiry prefill.
- Verified live Supabase refs/affiliates JSONB columns and CRM booking sync function; no schema migration required.

## Enquiry operating hours (25 November 2026)
- Makeup appointments: within operating hours 6:00 am – 5:00 pm, or outside hours (3:00 am – 8:00 pm starts) by the client's choice, enforced on the server. Spray tan and the lashes question removed from the enquiry chat.
- Suggestions not yet built: let Chanel edit the hours in CRM Settings; show the outside-hours fee amount; half-hour start times.

## Webpage Scene Clips (24 November 2026)
Added [Webpage Scene Clips](webpage-scene-clips.md) with links to the Drive collection, 60-candidate expansion, original 18-reference list, selection board and ChatGPT clipping instructions. This is documentation only: no video files downloaded or published. Nineteen new chapter-based windows are provisional; 41 require timing selection, and all need visual/rights review.

## About work gallery (21 November 2026)
Portrait and work gallery retained. The catalogued glam-selfie post CJil6Ijg8aP is excluded from About only. Style galleries are unchanged. Remaining photos are not labelled by subject; no complete person-specific audit is claimed.

## About portrait retained (21 November 2026)
Chanel’s portrait remains in About. Only the work photo grid is removed pending archived Instagram replacements.

## About images (21 November 2026)
Chanel’s portrait and work photo grid are removed from About on mobile and desktop pending archived Instagram replacements. Biography, timeline and Instagram link remain.

## Associates and gallery review (21 November 2026)
Mock Associates removed; public list comes only from connected/contacted/published CRM profiles. 25 researched makeup businesses remain CRM-only. Style definitions are available for all 38 styles. The 964 registry pairs pass metadata validation, but visual inspection is pending because image tooling and Chrome were unavailable. No visual removals/reclassifications are claimed.

## Popup text (21 November 2026)
Instagram post popup uses wrapping headers and a bounded scrollable caption/comment panel in desktop, portrait and landscape layouts. Product and brand text panels scroll at normal text size. Browser visual verification remains outstanding.

# Project status

The current state of the site and the open items. Update it in the same commit as any change it describes.

## Chat heading (21 November 2026)
The assistant identity scrolls with the conversation instead of staying above every message. Chat controls remain accessible.

## Enquiry refresh control (21 November 2026)
Removed the duplicate Refresh site button from the enquiry page; the main site retains its refresh button.

## Chat keyboard (21 November 2026)
Text fields wait for a tap. Embedded chat follows the visual viewport; standalone chat reserves keyboard space. While typing, details tiles hide to preserve room for the prompt and composer. Device keyboard verification remains outstanding.

## Refresh button (21 November 2026)
The website Refresh site button stays at the top left on desktop and mobile, with safe-area spacing.

## Publication check (19 November 2026)
GitHub and Supabase connections are verified. CRM consultation migration, owner scheduling service and Apple connector are deployed; Cal synchronization is retired. The enquiry-email update remains blocked by automatic approval review because its existing payload forwards private client selfies and enquiry details to Resend and the business inbox. Explicit user approval is required before updating that function. Its old production version remains, so initial acknowledgement copy/pending time is not fully updated. Apple credentials and live signed-in end-to-end verification remain outstanding.

## CRM phone consultations (18 November 2026; not deployed)
Supersedes the Cal.com flow below. Client requests a preferred Brisbane time in the enquiry; acknowledgement includes pending time. Chanel schedules/approves in the CRM and approval sends the confirmed call email. No client acceptance. The companion CRM migration/function enforces owner approval, calendar conflicts, consultation completion before makeup confirmation and a usual 72-hour gap with recorded short-notice exceptions. Deploy the migration and functions before the form. 22 CRM and 10 website mocked tests passed; live migration/email verification remains outstanding. Historical Cal appointments need manual review; this change does not cancel them.

## Previous consultation flow (17 November 2026; superseded)
Embedded phone consultation completion displays confirmed/pending dates in Brisbane time. Confirmed calls reveal selected-affiliate photo tiles and Instagram DM links. Full enquiry UUID is included in Cal notes and metadata; server verification checks host/event/attendee/reference. Existing CRM booking is updated through crm_link_consultation; no duplicate client or appointment. Frontend stores a retryable result if linking fails. Rollback: CONFIG.embeddedConsultation=false; external fallback always visible. The client sees only an approval/email confirmation message after submission; technical linking and approval refresh buttons are hidden. Background linking still runs on completion/reopening. Background approval/cancellation and external-tab completion require a future authenticated webhook. The private selfie policy still needs action-time approval.

## Pricing booking buttons (2026-11-17)

Each displayed service has a booking button under its price. enquire.html?service=<key> validates against the configured price list and maps to an existing booking category; the client still chooses their preferred style. Different selections reopen the matching form. Descriptions occupy a separate grid column.

## Desktop affiliate popup (2026-11-17)

Affiliate popup fills available desktop window space; profile centres vertically beside full-height photo rows. Long text scales to 85% with scroll fallback.

## Enquiry style search and navigation (2026-11-17)

Booking-type step has local phrase search across existing styles. STYLE_PHRASES in src/enquire.html owns aliases; selection keeps the existing service/pricing flow. Pricing/photo overlays close when enquiry opens or lifts to browse, releasing the mobile navigation lock. Browse looks decoration no longer rewrites unchanged button text, preventing an observer loop that froze parent navigation.

## Associate terminology (2026-11-17)

About and application calls to action use Associates / Become an associate. The application continues to use type=team for existing database compatibility.

## Latest fix (2026-11-17)

Mobile affiliate popups have bounded profile/photo areas, compact text, uniform photo rows and an accessible close button. Very long profiles can scroll. Source and built output must be published together.

## Current state (2026-11-12)

**Live site:** https://lachlanbruce944-droid.github.io/chanel-monroe-makeup/ (GitHub Pages, deployed from `site/` by `.github/workflows/deploy-pages.yml`)
**Repository:** github.com/lachlanbruce944-droid/chanel-monroe-makeup (public, branch `main`)
**Working folder (since 2026-11-15):** `M:\CMM-Site\chanel-monroe-makeup`, the git clone itself. Edit `src/`, run `python src\tools\publish.py`, then commit and push from this folder (see CONTRIBUTING.md). Original photos and clips are in `src\images` locally (ignored by git).
**Old copies (reference only, do not edit):** `M:\CMM-Site-Assets\final-draft` (previous working copy), `C:\Users\USER\repos\chanel-monroe-makeup` (previous clone)
**CRM:** `C:\Users\USER\OneDrive\Desktop\ChanelMonroe-CRM` (local trial build, not in git); its sidebar links to the live site and this folder
**Media:** Supabase Storage bucket `media` (project ref qxiugfatpybldluipcyy); optimised mirror `local\media`, originals in `src\images` (local, ignored by git)
**Archive (not in git):** `M:\CMM-Site-Assets\_archive` (first mock-up, one-off pipeline scripts), `local\_removed` (removed content, restorable)

**Site structure (decided 2026-11-11):** six main style groups replace Natural / Special occasions / Editorial / Parties:

| Group | Sub-styles | Price-list looks |
|---|---|---|
| Natural | No-makeup makeup, Clean polished, Fresh lift, Dewy glass skin, Sun-kissed bronze, Mature natural, Sensitive skin, Maternity glow, Makeup lesson | natural, headshot, portrait, sensitive, lesson |
| Glam | Soft glam, Full glam, Bronzed coastal glam, Old Hollywood, Race day glam, Mature skin glam | formal, gala, milestone |
| Bridal | Classic bridal, Natural radiant bride, Groom grooming | bridal-look, bridal-party, trial |
| Editorial | Beauty close-up, Graphic liner, Editorial graphic liner, Colour block and gloss, Avant-garde, Music video and album art, Stage and theatre, **Lip art (new)** | shoot-look, close-up, statement, half-day, full-day |
| Character & FX | SFX and prosthetics, Body paint, Cosplay recreation, Halloween character, Fancy dress, UV neon | sfx, body-paint, character, halloween |
| Parties & Seasons | Glitter bar and gems, Kids face paint, Express designs, Easter, Christmas and New Year, Holiday specials | easter, christmas, birthday, festival, hens, mini-paint |

Prices live only in `settings/pricing-settings.js` (LOOK_PRICES). Do not copy prices into other files.

**Image rules:** no images with text, captions, logos, watermarks, product shots, signage, posters or film stills. Hair-only, outfit-only and non-makeup images are out too. Pricing window shows inspiration images only (not Chanel's work).

**Sections (2026-11-16):** About | Natural, Glam, Bridal, Editorial, Character & FX, Parties & Seasons | Lessons, Reviews, Affiliates. Brands and Products removed. Phones get the vertical one-page version.

**Site source:** `src/` mirrors the working copy (only what the site and its build need).
- Design options: `src/settings/design-settings.js`. Prices: `src/settings/pricing-settings.js` only.
- Media list: `src/data/media.js`, generated by `tools/build_media.py`. Never hand-edit it.
- Manual adjustments: Edit mode (press E) saves to `data/overrides.js` with a dated `log`.
- Content register: `docs/content-register.csv` (rebuilt on every publish). Check new items with `tools/check_duplicate.py`.
- Pricing shows inspiration photos only (not Chanel's work), credited to each artist, as a rotating gallery.

## Open items
- **Database step (needs approval):** run `supabase/crm_people.sql` from the CRM repo (also creates the selfie storage). Until then: team and affiliate applications are emailed but not stored in the CRM, the About team shows placeholders, and selfies are left out of enquiries.
- Placeholders to replace with Chanel: lesson offers and prices, tutorial videos, reviews, team (all in `src/data/pages-content.js`; the team comes from the CRM once people are added). New intro for phones still to design.
- Mobile site: check on a real iPhone (Safari) and Android phone.
- Enquiry emails are live (domain verified, key saved, test delivered). Optional: run `docs/enquiry-emails.sql` to record when each email went out and add a database trigger as a backup.
- Selfies: run `docs/enquiry-selfies.sql` in Supabase (SQL editor) once so the chat's selfies are stored and attached to Chanel's email. Consider deleting old selfies from the `selfies` bucket after each booking is done.
- Chat enquiry (`enquire.html`): enquiries now save to Supabase (`public.enquiries`, view them in the Supabase Table Editor). Set `CONFIG.base` to Chanel's real suburb (Robina is a placeholder) and, if wanted, `travelPerKm`. Do one test booking to check cal.com ticks the "Style" box from the link. Google Calendar events for enquiries still need the Supabase Edge Function.
- Confirm or change the design options (mock at `M:\CMM-Site-Assets\CMM-Mock\mock.html` shows all of them). Final draft uses A, B, C, B, B.
- Clips were checked by their cover frame only: watch each once and hide any that show text later (Edit mode, ✕).
- Bio lines (ABOUT_LINES) and business name are still placeholders in `data/site-content.js` / `settings/site-settings.js`.
- Inspiration images belong to other artists. Decide before publishing them publicly: keep repo public with credits only, make it private, or get permission.
- Affiliates: message each person before listing them on the live site.
- Free space on C: (was full on 2026-11-11, 1.1 GB free on 2026-11-12). Big work now lives on M:.
- Products with no photo yet (show the brand logo instead): Danessa Myricks Colorfix x2 (site blocks downloads), NARS red lipstick (Dragon Girl is a placeholder shade), MUFE Ultra HD Soft Light (no longer sold in Australia: replace or drop). Placeholder picks to confirm: Real Techniques Everything Eye Set, MYO Bling (links to The Face Paint Shop gems).
- Confirm the About timeline with Chanel: Huxley School of Makeup in 2017 (from her competition post), Trace Cosmetic Tattoo Academy in 2021 (from a tag).
- Brand facts left blank where they couldn't be confirmed: LaGlam, Oil 'o' Eve, Makeup Cartel, Loving Tan, Lash & Brow, Noosa Naturals, Fusion, Danessa's year and Mehron's founder.
- No catalogue products yet for Charlotte Tilbury, NARS, Laura Mercier, MECCA Cosmetica, Danessa Myricks, Mehron, Ben Nye, Cannabella, Clean Beauty Market or LaGlam: they're not on Adore Beauty and have no public Shopify feed. 152 catalogue items have no description, so their popup shows the shop link only.
- SEO steps that need the domain or Chanel: canonical URL, sitemap.xml, Google Business Profile, directories (see docs/seo-plan.md).
- Retry checklist and Google Business Profile draft: Claude Doc "Chanel Monroe Makeup: retry checklist & Google Business Profile" (https://claude.ai/artifact/LQjkivoQJEEE5taw4wBx2N).
- Re-scrape affiliate photos and Chanel's comments now and then; both are snapshots from 2026-11-12.


## Verification (17 November 2026)

Six automated enquiry/search/navigation checks passed. Live checks: all 26 pricing rows have booking buttons below the price with clear description columns; booking opens the matching service form; pricing closes before the enquiry; Browse looks allows desktop section navigation and return without losing answers. Mobile menu opened and navigated while browsing at 390 × 844. Desktop affiliate popup filled available space at 1440 × 900 with centred profile and equal-height photo rows. No test enquiry was submitted.


26 November 2026: Phone consultations automatically confirm for 30 minutes, with half-hour availability and confirmation in the enquiry email.


26 November 2026: Hold-to-flag image review added to gallery and image viewers. Local flags can be reviewed, undone and exported as chanel-image-removal-flags.js for editorial removal.
