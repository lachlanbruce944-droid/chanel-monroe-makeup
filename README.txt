CHANEL MONROE MAKEUP: WEBSITE FILES
=====================================

OPEN THE SITE
  Double-click index.html (Chrome, Edge or Safari).

WHAT'S IN THIS FOLDER
  index.html                        The website itself (layout, look, animations).
  gallery-data.js                   The content: photos, captions, bio lines, intro lines,
                                    brands, products, booking links, bio video.
  settings\site-settings.js         Business name, email, suburb, Instagram and other socials.
  settings\pricing-settings.js      Prices for every look (shown in the style pop-ups).
  images\gallery\                   Gallery photos (currently free stock placeholders from Pexels).
  images\brands\                    Brand logos used in the Brands section.
  video\                            Put your short bio video here (e.g. bio.mp4).
  chanel-monroe-makeup-email.html   ONE-FILE copy with every photo and logo built in, to email.
                                    It does not update by itself: ask Claude to rebuild it
                                    after you make changes.

COMMON EDITS (open the file in Notepad, change the text between the quotes, save)
  Business name, email, Instagram ......... settings\site-settings.js
  Prices ................................... settings\pricing-settings.js
  Booking links (cal.com) .................. gallery-data.js  ->  BOOKING_LINKS
  Bio lines beside the intro video ......... gallery-data.js  ->  ABOUT_LINES / BIO_LINES
  Site intro lines (after the video) ....... gallery-data.js  ->  INTRO_LINES
  End-of-site thank-you lines .............. gallery-data.js  ->  OUTRO_LINES
  Bio video ................................ put bio.mp4 in video\, then in gallery-data.js set
                                             INTRO_VIDEO = { src: 'video/bio.mp4', poster: '' }

SWAPPING IN YOUR OWN PHOTOS
  1. Copy your photo into images\gallery\  (e.g. bride-01.jpg). Keep it under about 300 KB,
     around 900 px wide.
  2. In gallery-data.js, find the look (e.g. 'bridal-look') and replace px(10673499) with
     'images/gallery/bride-01.jpg'  (keep the quotes).
  3. Save and refresh the browser.

TIP: keep a copy of this folder before big changes.
