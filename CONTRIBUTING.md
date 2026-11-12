# Contributing

How to add, change or remove content so that nothing is added twice and the repository stays clean.
All commands run from the working copy, `M:\CMM-Site\final-draft`.

## 1. Check before you add anything

Every photo, clip, product, brand and affiliate on the site is in the content register, together with every Instagram post that was reviewed and rejected, and everything that was removed.

```powershell
python tools\check_duplicate.py https://www.instagram.com/p/XXXXXXXXXXX/ @handle "Brand Name"
```

- `not found, OK to add` → go ahead.
- `ALREADY REGISTERED` → do not add it. The output says whether it is live, hidden, rejected or removed, and where.

The checker accepts Instagram post or reel links, post codes, @handles, profile links, product URLs, brand or product names, and file names.

## 2. Add content

| Content | Where | Then run |
|---|---|---|
| Style photo or clip | File in `images/inspiration/<Style>/` or `images/videos/`, plus a row in its `credits.csv` / `videos.csv` (artist handle and post link) | `tools/build_media.py`, `tools/optimize_media.py`, `tools/upload_media.py` |
| Chanel's own work | `images/chanel/<Section>/` and `images/chanel/index.csv` | same as above |
| Affiliate | `tools/add_affiliates.py` | `tools/build_media.py` |
| Catalogue products | `data/raw/` exports | `tools/build_catalog.py` |
| Brand logo | `images/brands/<brand>.svg` or `.png` (ships with the site) | — |
| Prices | `settings/pricing-settings.js` | — |
| Text and intros | `data/site-content.js` or `index.html` | — |

File names: lower case, words joined with `-`, no spaces or `@` in new files.

## 3. Remove content

1. Hide the item in Edit mode (press **E** on the site, then ✕ on the item) and save to `data/overrides.js`.
2. Run `python tools\apply_removals.py`.
   The file moves to `M:\CMM-Site\_removed\` (so it can be restored), its credit row is dropped, and it is logged in `data/removed.json` so it is never re-added.
3. Run `python tools\build_media.py`.

## 4. Publish

```powershell
python tools\publish.py C:\Users\USER\repos\chanel-monroe-makeup
```

Then, in the repository: review `git status`, add a dated entry to `CHANGELOG.md`, commit with a short imperative message (for example `Add bridal clips from @artist`), and push. GitHub Actions deploys `site/` within a minute or two.

## Rules

- **One source of truth.** Edit the working copy, never `site/` or `src/` directly; `publish.py` overwrites both.
- **Register everything.** The register is rebuilt on every publish; if something cannot be registered, it does not go on the site.
- **Credit everything.** Every inspiration photo and clip carries its artist's handle and post link.
- **No secrets in the repo.** The Supabase secret key is typed in when `upload_media.py` asks for it and is never saved.
- **Heavy media stays out of git.** Photos and clips live on Supabase and in `M:\CMM-Site`; the repo keeps only their credit records.
- **Log every change** in `CHANGELOG.md`, and keep `docs/project-status.md` current.
