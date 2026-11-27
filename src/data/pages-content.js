/* ==========================================================================
   Content for the About team section, Lessons and Reviews (added 2026-11-16).
   Everything here is a PLACEHOLDER until Chanel confirms it: edit the text, then publish.
   ========================================================================== */

/* Lessons with Chanel. price: a number shows "from $X" (or "$X" with from:false); null shows "Price on enquiry".
   The Book button opens the enquiry chat on Makeup lesson. */
window.LESSON_OFFERS = [
  { title: 'Everyday makeup lesson', who: 'One to one', time: 'About 2 hours', price: 280, from: false,
    text: 'Your own face, your own kit. Learn a quick everyday look you can repeat at home, with a face chart and product list to keep.' },
  { title: 'Event and glam lesson', who: 'One to one', time: 'About 2.5 hours', price: null,
    text: 'Soft glam to full glam for formals, weddings and nights out: base that lasts, eyes, lashes and a lip that stays put.' },
  { title: 'Bride-to-be prep lesson', who: 'One to one', time: 'About 2 hours', price: null,
    text: 'Skin prep plan for the months before, touch-ups for the day, and how to keep your look fresh from first photo to last dance.' },
  { title: 'Group lesson', who: '2 to 6 people', time: 'About 2.5 hours', price: null,
    text: 'A fun session for friends, hens or a birthday: everyone learns a look on their own face, with tips for their skin and kit.' },
  { title: 'Kit clean-out and shopping list', who: 'One to one', time: 'About 1.5 hours', price: null,
    text: 'Bring your makeup bag. Keep what works, retire what doesn’t, and leave with a short list of what is actually worth buying.' }
];

/* Video tutorials: placeholders for now. Add  src: 'images/lessons/<file>.mp4', poster: '...jpg'  when a tutorial is ready;
   until then each tile shows "Coming soon". */
window.LESSON_VIDEOS = [
  { title: 'Skin prep that lasts all day', topic: 'Skin prep' },
  { title: 'A five-minute everyday face', topic: 'Daily routine' },
  { title: 'Brows that suit your face', topic: 'Brows' },
  { title: 'Soft smoky eye', topic: 'Eyes' },
  { title: 'Lashes without the fuss', topic: 'Lashes' },
  { title: 'Make it last in Gold Coast heat', topic: 'Make it last' },
  { title: 'Taking it all off properly', topic: 'Removal' }
];

/* Reviews. Reviews stays hidden until this list contains a client review.
   Real review:  { name: 'Sarah', event: 'Wedding, March 2026', stars: 5, text: '...', source: 'Google' }
   Only add reviews the client has agreed to share. */
window.REVIEWS = [
  { placeholder: true }, { placeholder: true }, { placeholder: true }, { placeholder: true }
];

/* About → The team: shown until the CRM has active team members ticked "Show on website" (Supabase site_team()). */
/* Associates come only from approved CRM publications; no placeholder profiles. */
