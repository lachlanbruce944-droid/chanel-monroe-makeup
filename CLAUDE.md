# Working on this repository (for Claude and other assistants)

Read these before changing anything, in this order:

1. `README.md` — what the site is, how it is hosted (GitHub Pages + Supabase Storage), folder layout.
2. `docs/content-guidelines.md` — what content is suitable (photos, clips, lessons, affiliates, brands, products).
3. `CONTRIBUTING.md` — how to add, remove and publish content without duplicates.
4. `docs/project-status.md` — current state and open items.
5. The top entries of `CHANGELOG.md` — what changed most recently.

## Ground rules

- **Never add anything twice.** Check every candidate with `python tools/check_duplicate.py <link|code|@handle|name>`
  against `docs/content-register.csv` (live, hidden, rejected and removed items). If it is registered, skip it.
- **Edit the working copy, not the build.** The working copy is `M:\CMM-Site\final-draft` (it mirrors `src/`).
  Publish with `python tools/publish.py <repo>`, which rebuilds `site/`, mirrors `src/` and refreshes the register.
- **Media goes to Supabase**, named by `tools/media_names.py`: run `tools/optimize_media.py` then
  `tools/upload_media.py` (it asks the owner for the secret key; never store or print keys).
- **Credit everything** from other artists (handle + post link). Chanel's own work appears only in About.
- **Log every change** with a dated entry at the top of `CHANGELOG.md`, and keep `docs/project-status.md` current.
- The site is landscape-first on phones; check changes at phone landscape sizes (for example 874 × 402 and 667 × 375)
  as well as desktop.

## Picking up where the last session stopped

Start with `docs/project-status.md` (Open items) and the newest `CHANGELOG.md` entries, then ask the owner which item
to continue. To add content, follow `docs/content-guidelines.md` exactly and run the duplicate check before anything else.
