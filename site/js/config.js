/* Hosted build: photos and clips come from Supabase Storage (bucket 'media'). */
window.MEDIA_BASE = 'https://qxiugfatpybldluipcyy.supabase.co/storage/v1/object/public/media/';
window.MEDIA_M = true;   /* gallery photos have 540px copies (name.m.webp) */
/* Relative design: landscape screens bigger than the 874 x 402 phone design show that design scaled up evenly. */
(function(){var DW=874,DH=402,r=document.documentElement;
  function fit(){var w=innerWidth,h=innerHeight,s=w>h?Math.max(1,Math.min(w/DW,h/DH)):1;window.UIZ=s;
    r.style.zoom=s===1?'':s;r.style.setProperty('--uvh',h/s/100+'px');r.style.setProperty('--uvw',w/s/100+'px')}
  fit();addEventListener('resize',fit)})();
