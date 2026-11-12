/* =====================================================================
   GALLERY CONTENT: every image on the site, in gallery order.
   - Change "src" to your own photo (e.g. 'https://qxiugfatpybldluipcyy.supabase.co/storage/v1/object/public/media/images/about-01.jpg'). Leave it '' to show a grey placeholder.
   - "text" is the short description shown under the image.
   - Prices are NOT here: they come from ../settings/pricing-settings.js (LOOK_PRICES).
   - Business name, email and social links come from ../settings/site-settings.js.
   ===================================================================== */
(function () {
  function px(id) { return 'https://qxiugfatpybldluipcyy.supabase.co/storage/v1/object/public/media/images/gallery/' + id + '.jpg'; }   /* photos live in images/gallery/ */
  function tile(text, src, extra) { var t = { text: text, src: src || '' }; for (var k in extra || {}) t[k] = extra[k]; return t; }
  function many(n, text) { var a = []; for (var i = 1; i <= n; i++) a.push(tile(text + ' ' + i)); return a; }

  /* ---------- ABOUT: photos of you. The lines below rotate under the gallery as these photos pass. ---------- */
  var ABOUT_LINES = [
    "Hi, I'm [your name]",
    '[One line: who you are and the kind of makeup you love doing.]',
    '[Two or three sentences: how you started, what you specialise in, and what clients say it feels like to work with you.]',
    'Training: [Qualification, school, year]',
    'Training: [Course or certificate]',
    'Insured: [public liability, provider]',
    'Hygiene: [clean brushes and disposables for every client]',
    'Where I work: [studio, mobile, areas covered]',
    '[What makes your service different]'
  ];

  /* ---------- STYLES: the looks come from LOOK_PRICES. Add photos for each look here by its key. ----------
     Each look gets its own run of photos; before-and-after photos go in the same list. */
  var LOOK_PHOTOS = {
    'bridal-look':  [tile('Soft bridal glow beneath the veil', px(10673499)), tile('Classic bride, timeless and polished', px(1358841)), tile('Bridal before and after')],
    'bridal-party': [tile('Bridal party'), tile('Bridal party before and after')],
    'formal':       [tile('Evening glamour, sculpted and luminous', px(20178151)), tile('Formal before and after')],
    'gala':         [tile('Studio glam for the camera', px(2320890)), tile('Gala before and after')],
    'milestone':    [tile('Masquerade night', px(3745430)), tile('Milestone before and after')],
    'trial':        [tile('Wedding trial'), tile('Trial before and after')],
    'shoot-look':   [tile('Editorial skin and a quiet gaze', px(734478)), tile('Photoshoot before and after')],
    'close-up':     [tile('Up close: blended colour on the lid', px(11628000)), tile('Close-up before and after')],
    'statement':    [tile('Avant-garde, in black and white', px(28599316)), tile('Bold colour, strong lines', px(2712611))],
    'sfx':          [tile('Gothic face art with a full costume', px(34223820)), tile('SFX before and after')],
    'body-paint':   [tile('Body paint'), tile('Body paint before and after')],
    'half-day':     [tile('Half day on set')],
    'full-day':     [tile('Full day on set')],
    'halloween':    [tile('Devil glam, sharp liner and a scarlet lip', px(18930235)), tile('Half skull for Halloween', px(12940679)), tile('Zombie bride, gothic and beautiful', px(28976678)), tile('Intricate skull art, gothic to the last detail', px(29348155))],
    'easter':       [tile('Easter'), tile('Easter before and after')],
    'christmas':    [tile('Wet-look shine with a high-gloss finish', px(4312028)), tile('Christmas before and after')],
    'birthday':     [tile('Luminous neon lip and lid', px(7858126)), tile('Birthday before and after')],
    'festival':     [tile('Pink glitter for the festival crowd', px(2566451)), tile('Gold leaf and glitter across the cheekbones', px(2250619))],
    'hens':         [tile('Hens night'), tile('Hens before and after')],
    'character':    [tile('Full character'), tile('Character before and after')],
    'mini-paint':   [tile('Mini face paint')],
    'natural':      [tile('Bare-skin natural, lit by the morning', px(15569274)), tile('Fresh, camera-ready and natural', px(3484670))],
    'headshot':     [tile('Defined brows, a soft-focus finish', px(14411628)), tile('Headshot before and after')],
    'portrait':     [tile('Golden hour, nothing heavy', px(17823747)), tile('Soft portrait, warm and simple', px(247297))],
    'sensitive':    [tile('Sensitive skin'), tile('Sensitive skin before and after')],
    'lesson':       [tile('Makeup lesson')]
  };
  /* gallery order of the four styles (ids match LOOK_PRICES sections) */
  var STYLE_ORDER = [['natural', 'Natural'], ['special', 'Special occasions'], ['editorial', 'Editorial'], ['parties', 'Parties']];

  /* ---------- INSPIRATION: style references. Clicking credits the original artist. Set each "handle". ---------- */
  var INSPO = ['Soft glam', 'Editorial graphic liner', 'Halloween character', 'Dewy glass skin', 'Classic bridal', 'Natural radiant bride',
    'Full glam', 'Old Hollywood', 'Bronzed coastal glam', 'Race day glam', 'Mature skin glam', 'Groom grooming', 'Graphic liner',
    'Colour block and gloss', 'Beauty close-up', 'Avant-garde', 'Stage and theatre', 'Music video and album art', 'SFX and prosthetics',
    'Body paint', 'Cosplay recreation', 'Kids face paint', 'Glitter bar and gems', 'UV neon', 'Easter', 'Christmas and New Year',
    'Holiday specials', 'Express designs', 'Fancy dress', 'No-makeup makeup', 'Sun-kissed bronze', 'Fresh lift', 'Clean polished',
    'Mature natural', 'Sensitive skin', 'Maternity glow', 'Makeup lesson'];
  var COPYRIGHT = 'Inspiration images belong to the artists credited and are shown for reference only. Tap an image to see the original artist. To have your work credited differently or removed, email hello@example.com.';

  /* ---------- AFFILIATES (not yet asked: message each person before listing them) ---------- */
  function people(list) { return list.map(function (p) { return tile(p[0] + ' · ' + p[1], '', { handle: p[2] }); }); }
  var AFFILIATES = [
    { name: 'Hair', tiles: people([['Petula Jade', 'Hair stylist', 'petulajadehairstylist'], ['Lacey', 'Hairdresser', 'hairbylaceygc'], ['Teiha Olsen', 'Hair stylist', 'hairbyteihaolsen'], ['Corey Bromley', 'Hair stylist', 'coreybromleyhair'], ['Indy Colour', 'Colour', 'indycolour']]) },
    { name: 'Nail', tiles: people([['Kana', 'Nail art', 'kanasalterego'], ['Penny Barns', 'BIAB and education', 'pennysnailbar'], ['Jem', 'Nail artistry', 'geldbyjem'], ['Jessie', 'Nails', 'cupid.nailstudio'], ['JuicyT', 'Acrylics', 'juicynailzz']]) },
    { name: 'Tattoo', tiles: people([['Jessica', 'Fine line', 'jessicat__tattoos'], ['Garry', 'Fine line', 'garryfineline'], ['Tommy Baker', 'Tattoo artist', 'tommybakertattoo'], ['Ink Garden', 'Microrealism studio', 'ink_garden_tattoo'], ['Your Neighbourhood Studio', 'Fine line studio', 'your_neighbourhood_studio']]) },
    { name: 'Cosmetics', tiles: people([['Amanda', 'Lashes and brows', 'goddesslashesx'], ['Monique', 'Lash lifts and brows', 'jungle.artistry'], ['The iBrow Effect', 'Brow and lash lifts', 'theibroweffect'], ['Miss Lash', 'Lashes', 'misslashthestudio'], ['Bella Bronzed', 'Mobile spray tan', 'bellabronzed']]) },
    { name: 'Photography', tiles: people([['S. Hobart Photography', 'Weddings and family', 's.hobart.photography'], ['Mick, Bliss Photography', 'Weddings', 'mick_blissphotography'], ['Ell, Ethereal', 'Weddings', 'etherealbyell'], ['Isa Milla', 'Photographer', 'themoodyshot'], ['Mandy Martin', 'Portraits', 'mandymartin_photography']]) }
  ];

  /* ---------- BRANDS: logos from images/brands/ ---------- */
  function logos(list) { return list.map(function (b) { return tile(b[0], 'https://qxiugfatpybldluipcyy.supabase.co/storage/v1/object/public/media/images/brands/' + b[1], { logo: true }); }); }
  var BRANDS = [
    { name: 'National', tiles: logos([['Ultra Violette', 'ultra-violette.svg'], ['Nude by Nature', 'nude_by_nature.png'], ['MCoBeauty', 'mcobeauty.svg'], ['Designer Brands', 'designer-brands.png'], ['Napoleon Perdis', 'napoleon-perdis.svg'], ['Adorn Cosmetics', 'adorn.svg'], ['Bloom Cosmetics', 'bloom.png'], ['INIKA Organic', 'inika.png'], ['Bali Body', 'bali-body.png'], ['Natio', 'natio-logo.png'], ['Ere Perez', 'ere-perez.svg'], ['ModelCo', 'modelco.jpg'], ['Lanolips', 'lanolips.png'], ['Frank Body', 'frank-body.svg'], ['Sand & Sky', 'sand-and-sky.png'], ['Go-To Skincare', 'go-to.svg'], ['LaGlam Minerals', 'laglam.jpg'], ['MECCA Cosmetica', 'mecca.png']]) },
    { name: 'Global', tiles: logos([['NARS', 'nars.png'], ['Charlotte Tilbury', 'charlotte-tilbury.png'], ['Fenty Beauty', 'fenty.svg'], ['Rare Beauty', 'rare-beauty.jpg'], ['Laura Mercier', 'laura-mercier.png'], ['Huda Beauty', 'huda.svg'], ['Anastasia Beverly Hills', 'abh.png'], ['MAC Cosmetics', 'mac-cosmetics.png'], ['Bobbi Brown', 'bobbi-brown.png'], ['Lancôme', 'lancome.png'], ['Clinique', 'clinique-logo.png'], ['Dior Beauty', 'dior-logo.png'], ['Danessa Myricks Beauty', 'danessa-myricks.png'], ['Kryolan', 'kryolan.svg'], ['Mehron', 'mehron.webp'], ['Ben Nye', 'ben_nye.png'], ['Fusion Body Art', 'fusion-body-art.png'], ['Real Techniques', 'real-techniques.jpg'], ['Embryolisse', 'embryolisse.png']]) },
    { name: 'Local', tiles: logos([['Alpha-H', 'alpha-h.png'], ['MooGoo', 'moogoo.png'], ['Issada', 'issada.svg'], ['Skin O2', 'skin-o2.png'], ['Roccoco Botanicals', 'roccoco.png'], ['Cannabella', 'cannabella.png'], ['Cedar & Stone', 'cedar-and-stone.jpg'], ["Oil 'o' Eve", 'Oil_o_Eve.png'], ['Garbo & Kelly', 'garbo-and-kelly.png'], ['Makeup Cartel', 'makeup-cartel.png'], ['Clean Beauty Market', 'clean-beauty-market.png'], ['Loving Tan', 'loving-tan.svg'], ['Lash & Brow Professional', 'lash-and-brow.png'], ['Lust Minerals', 'lust-minerals.png'], ['Noosa Naturals', 'ethical-brand-co.jpg'], ['Eye of Horus', 'eye-of-horus.png']]) }
  ];

  /* ---------- PRODUCTS ---------- */
  function prods(list) { return list.map(function (p) { return tile(p); }); }
  var PRODUCTS = [
    { name: 'Skin prep', tiles: prods(['Embryolisse Lait-Crème Concentré', 'Ultra Violette Queen Screen SPF 50+', 'Clinique Take The Day Off Cleansing Balm']) },
    { name: 'Face', tiles: prods(['MAKE UP FOR EVER HD Skin Hydraglow Foundation', 'MAKE UP FOR EVER HD Skin Foundation', 'MAKE UP FOR EVER HD Skin Concealer', 'Laura Mercier Translucent Loose Setting Powder', 'Rare Beauty Soft Pinch Liquid Blush', 'MAKE UP FOR EVER Ultra HD Soft Light Liquid Highlighter']) },
    { name: 'Eyes', tiles: prods(['Anastasia Beverly Hills Mini Soft Glam Palette', 'Danessa Myricks Colorfix (bright shades)', 'Danessa Myricks Colorfix Matte, Blackout', 'Lancôme Lash Idôle Mascara', 'Ardell Wispies Strip Lashes']) },
    { name: 'Lips', tiles: prods(['Fenty Beauty Gloss Bomb Lip Luminizer', 'NARS [Classic red lipstick]', 'Charlotte Tilbury Lip Cheat Lip Liner, Pillow Talk']) },
    { name: 'Face paint and SFX', tiles: prods(['Fusion Body Art Sampler Face Painting Palette', 'Cosmetic glitter', 'MYO Bling skin-safe gems', 'Scar wax and SFX kit']) },
    { name: 'Brushes and tools', tiles: prods(['Real Techniques face brush set', 'Real Techniques eye brush set', 'Real Techniques Miracle Complexion Sponge', 'Lash applicator and tweezers']) },
    { name: 'Kit and equipment', tiles: prods(['Rolling makeup case', 'LED ring light or panel', 'Lighted mirror', 'Brush cleanser', 'Folding makeup chair', 'Palette and product organiser']) }
  ];

  /* ---------- WHY EACH CONNECTION IS HERE: these lines rotate under the gallery as each section passes (edit freely) ---------- */
  var AFFILIATE_LINES = [
    'The local artists I trust and work alongside: hair, nails, tattoo, cosmetics and photography.',
    'Every one is someone I would send a friend to.',
    'Planning a wedding or a shoot? I can recommend the whole team.',
    'Are you an artist on the Gold Coast? Let\'s collaborate.'
  ];
  var BRAND_LINES = [
    'The brands in my kit, from Gold Coast makers to global names.',
    'Chosen for how they wear on skin in our heat and humidity.',
    'Local and Australian first, wherever the quality is there.',
    'Some brands are partners. I only feature brands I use or would use myself.'
  ];
  var PRODUCT_LINES = [
    'The products I actually reach for on clients.',
    'Picked for long wear, sensitive skin and how they look on camera.',
    'Every retailer listed ships from within Australia.',
    'Some links are affiliate links, so I may earn a small commission at no extra cost to you.'
  ];

  /* ---------- the whole gallery, in order ---------- */
  var LP = window.LOOK_PRICES || { sections: [] };
  var styleGroups = [];
  STYLE_ORDER.forEach(function (s) {
    var sec = LP.sections.filter(function (x) { return x.id === s[0]; })[0];
    (sec ? sec.looks : []).forEach(function (l) {
      styleGroups.push({ key: l.key, name: l.name, style: s[0], styleName: s[1], tiles: LOOK_PHOTOS[l.key] || [tile(l.name)] });
    });
  });

  /* ---------- STYLE POP-UPS: page one of each style's pop-up (page two is its price list from LOOK_PRICES) ---------- */
  window.STYLE_INFO = {
    natural:   { tagline: 'Fresh skin, natural light, nothing to hide.',
                 text: 'Skin-first makeup that looks like you on your best day: even, glowing and comfortable for hours, for work, photos or everyday.' },
    special:   { tagline: 'Your most important days, calm from the first consult.',
                 text: 'Bridal, formal and milestone makeup planned around you, and built to last from the first photo to the last dance.' },
    editorial: { tagline: 'Make the face the story.',
                 text: 'Camera-ready looks for shoots, campaigns and stage, from flawless beauty close-ups to statement looks, SFX and body paint.' },
    parties:   { tagline: 'Every celebration needs a character.',
                 text: 'Seasonal and party looks for Halloween, Easter, Christmas, birthdays, festivals and hens nights, from glam to full character.' }
  };

  /* ---------- BOOKING LINKS: where Enquire > Proceed and each Book button go. Paste your real links over the [brackets].
     Styles use their own link; every other section uses "general". Until a link is set, the button opens an email to you. ---------- */
  window.BOOKING_LINKS = {
    general:   'https://cal.com/chanelmonroe/enquiry',
    natural:   'https://cal.com/chanelmonroe/enquiry',
    special:   'https://cal.com/chanelmonroe/enquiry',
    editorial: 'https://cal.com/chanelmonroe/enquiry',
    parties:   'https://cal.com/chanelmonroe/enquiry'
  };

  /* ---------- BIO VIDEO: plays in the opening intro, before Explore. Put the file in gallery-site/video/ and set src,
     e.g. src: 'video/bio.mp4', poster: 'video/bio.jpg'. Keep it short (10 to 20 seconds) and under about 8 MB. ---------- */
  window.INTRO_VIDEO = { src: '', poster: '' };

  /* ---------- BIO LINES: personal lines shown beside the bio video in the intro (swipeable).
     They start as the same lines as About; replace with their own list if you want different ones. ---------- */
  window.BIO_LINES = ABOUT_LINES;

  /* ---------- OPENING INTRO: these lines play one after another when the site opens, then the Explore button appears ---------- */
  window.INTRO_LINES = [
    'Makeup for every kind of day, from barely there to full character.',
    'Four styles live here: Natural, Special occasions, Editorial and Parties.',
    'The gallery moves on its own. Drag, swipe or scroll to move it yourself.',
    'Tap any photo to see it up close, or tap a style to see its prices and book.'
  ];

  /* ---------- END OF THE SITE: these lines play when the gallery reaches the end, then "Explore further" appears ---------- */
  window.OUTRO_LINES = [
    'Thank you for spending time here.',
    'I hope you found a look you love.',
    'Would you like to keep exploring?'
  ];

  window.GALLERY_SECTIONS = [
    { id: 'about', label: 'About', groups: [{ name: 'About', tiles: many(6, 'Photo of you') }], lines: ABOUT_LINES },
    { id: 'styles', label: 'Styles', groups: styleGroups, order: STYLE_ORDER },
    { id: 'clients', label: 'Clients', groups: [{ name: 'From Instagram', tiles: many(12, 'Client photo') }] },
    { id: 'inspiration', label: 'Inspiration', groups: [{ name: 'Style reference', tiles: INSPO.map(function (n) { return tile(n, '', { handle: 'artist-handle', credit: true }); }) }], note: COPYRIGHT },
    { id: 'affiliates', label: 'Affiliates', groups: AFFILIATES, lines: AFFILIATE_LINES, spread: true },   /* spread: the lines are shared out across the whole section; the last one shows for the final 4 images */
    { id: 'brands', label: 'Brands', groups: BRANDS, lines: BRAND_LINES },
    { id: 'products', label: 'Products', groups: PRODUCTS, lines: PRODUCT_LINES }
  ];
})();
