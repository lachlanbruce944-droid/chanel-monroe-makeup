# Content guidelines

The standard every photo, clip, affiliate, brand and product must meet before it goes on the site.
These are the rules the current content was chosen by. Follow them for anything new, and check every
candidate with `tools/check_duplicate.py` first (see [CONTRIBUTING.md](../CONTRIBUTING.md)).

## What the site is for

A portfolio and booking site for Chanel Monroe, a mobile makeup artist on the Gold Coast. Visitors browse looks by
style, see prices, find local artists Chanel works with, and see the brands and products in her kit, then enquire.
Everything shown should help a visitor picture their own look and book it.

## Styles

Six style groups, each with sub-styles. Content is filed under exactly one sub-style.

| Group | Sub-styles |
|---|---|
| Natural | No-makeup makeup, Clean polished, Fresh lift, Dewy glass skin, Sun-kissed bronze, Mature natural, Sensitive skin, Maternity glow, Makeup lesson |
| Glam | Soft glam, Full glam, Bronzed coastal glam, Old Hollywood, Race day glam, Mature skin glam |
| Bridal | Classic bridal, Natural radiant bride, Groom grooming |
| Editorial | Beauty close-up, Graphic liner, Editorial graphic liner, Colour block and gloss, Avant-garde, Music video and album art, Stage and theatre, Lip art |
| Character & FX | SFX and prosthetics, Body paint, Cosplay recreation, Halloween character, Fancy dress, UV neon |
| Parties & Seasons | Glitter bar and gems, Kids face paint, Express designs, Easter, Christmas and New Year, Holiday specials |

A look must clearly match its sub-style: a heavy, dramatic look does not belong in Natural, for example.

## Photos (style galleries and pricing)

**Suitable**
- A clear makeup look on a face (or body, for body paint and FX), well lit, in focus, true colour.
- Portrait framing where the makeup is the subject. Close-ups are welcome in Beauty close-up and Lip art.
- At least **1080 px on the short side**; 1440 × 1920 or larger is ideal. The site serves 1600 px and 800 px copies.
- A public Instagram post from a makeup artist, with the artist's **@handle and post link recorded** in the credit file.
- One slide per distinct look, pose or angle. Drop near-identical slides from the same post.

**Not suitable**
- Any **text** on the image: captions, titles, prices, quotes, hashtags, "swipe", before/after labels.
- **Logos, watermarks**, signage, posters, film or TV stills, screenshots, collages and grids.
- **Product shots** or product-led images (bottles, palettes, swatches) in the style galleries.
- Hair-only, nails-only, outfit-only or anything where the makeup is not the point.
- Cosmetic injectables or lip filler results, cosmetic tattoo procedures (Lip art is makeup only).
- Blurry, heavily filtered, distorted or low-resolution images; anything showing a person under 18 in glam styles.
- Anything already on the site, rejected before or removed (the duplicate check catches these).

**Pricing window**: uses style photos only (never Chanel's own work), credited to each artist.

## Clips (short videos in the galleries)

**Suitable**
- **No captions or text overlays** at any point in the clip (check the whole clip, not just the cover frame).
- **3 to 20 seconds**, a single look being applied or revealed, smooth and well lit.
- **Vertical, at least 1080 × 1920**. The site re-encodes to 1080 px wide H.264, no audio.
- No sound is needed: clips play muted. Avoid clips that rely on a voiceover to make sense.
- Credited like photos: artist @handle and post link in `images/videos/videos.csv`.

**Not suitable**
- Talking-head tutorials, product hauls, giveaways, trend audio memes, slideshows of stills.
- Watermarks (including TikTok or CapCut marks), logos, end cards, subtitles, emoji stickers.
- Two clips side by side in a gallery: the site spaces them out automatically, so just add them.

## Lessons (tab currently hidden)

- Tutorial, tip or vlog clips of 25 to 45 seconds, **with audio**. Captions are acceptable, but clips **without**
  captions are preferred.
- High quality, one clear tip per clip, from makeup artists, skin professionals or stylists.
- Topics in order: skin prep and maintenance, diet for skin, daily routine, skincare, sun protection, check-ups
  (dermatologists, skin cancer checks, allergies), wardrobe, colours, makeup looks, hair, nails, cosmetic tattoo,
  tattoos and unique features, lasting all day, removal and cleaning.

## Chanel's own work (About only)

- From @chanelmonroemakeup only, and shown only in About, never in the style galleries or pricing.
- One slide per distinct pose or angle; drop near-identical slides and any with text, logos or products.
- Record every reviewed post in [instagram-review-log.md](instagram-review-log.md).

## Affiliates

- Gold Coast (or close) businesses and artists Chanel would genuinely recommend: hair, nails, brows and lashes,
  photography, tattoo, cosmetic services.
- An active, public Instagram with recent, good-quality work. Up to 9 recent posts are shown with the profile picture.
- **Message each person before they go live** on the site.

## Brands

- Brands Chanel uses or stocks in her kit, with a clean logo: **SVG preferred, otherwise PNG with a transparent
  background**, placed in `images/brands/` (logos ship with the site, not Supabase).
- Brand facts (founded, origin, founder, short description) must be confirmed from the brand's own site; leave a fact
  blank rather than guess.

## Products

- Products Chanel actually uses, or that suit a look on the site, sold by an Australian retailer.
- Product photo on a **plain white background** (the site blends the white into the page so the product appears cut
  out). Packshot only: no models, swatches or lifestyle scenes.
- Link to the retailer's product page; the description comes from that page and is credited.

## File standards

| Content | Upload as | Served as |
|---|---|---|
| Photo | JPG or PNG, 1080 px+ short side | WebP 1600 px + 800 px |
| Clip | MP4, vertical 1080 × 1920+ | MP4 1080 px wide, no audio + 720 px poster |
| Affiliate profile / posts | JPG from their Instagram | WebP 480 px / 720 px |
| Product | JPG or PNG on white | WebP 1600 px + 800 px |
| Brand logo | SVG, or PNG with transparency | as is, with the site |

Storage names are set by `tools/media_names.py`; never name media files by hand.
