var GROUPS = [
  {id:'natural',  name:'Natural',           tag:'Fresh skin, natural light, nothing to hide.',
   subs:['No-makeup makeup','Clean polished','Fresh lift','Dewy glass skin','Sun-kissed bronze','Mature natural','Sensitive skin','Maternity glow','Makeup lesson'], looks:['natural','headshot','portrait','sensitive','lesson']},
  {id:'glam',     name:'Glam',              tag:'Polished, sculpted and made to last all night.',
   subs:['Soft glam','Full glam','Bronzed coastal glam','Old Hollywood','Race day glam','Mature skin glam'], looks:['formal','gala','milestone']},
  {id:'bridal',   name:'Bridal',            tag:'Your most important day, calm from the first consult.',
   subs:['Classic bridal','Natural radiant bride','Groom grooming'], looks:['bridal-look','bridal-party','trial']},
  {id:'editorial',name:'Editorial',         tag:'Make the face the story.',
   subs:['Beauty close-up','Graphic liner','Editorial graphic liner','Colour block and gloss','Lip art','Avant-garde','Music video and album art','Stage and theatre'], looks:['shoot-look','close-up','statement','half-day','full-day']},
  {id:'fx',       name:'Character & FX',    tag:'Characters, creatures and full transformations.',
   subs:['SFX and prosthetics','Body paint','Cosplay recreation','Halloween character','Fancy dress','UV neon'], looks:['sfx','body-paint','character','halloween']},
  {id:'parties',  name:'Parties & Seasons', tag:'Every celebration needs a little sparkle.',
   subs:['Glitter bar and gems','Kids face paint','Express designs','Easter','Christmas and New Year','Holiday specials'], looks:['easter','christmas','birthday','festival','hens','mini-paint']}
];
var PAGES = [{id:'about',name:'About'},{id:'lessons',name:'Lessons'},{id:'affiliates',name:'Affiliates'},{id:'brands',name:'Brands'},{id:'products',name:'Products'}];
var DESC = {
 'No-makeup makeup':['Skin that looks like skin, only better','A barely-there base with a soft flush'],
 'Clean polished':['Clean, even skin and groomed brows','Polished, simple and camera-ready'],
 'Fresh lift':['A brightening lift for tired skin','Fresh, lifted and wide awake'],
 'Dewy glass skin':['Glassy, hydrated skin with a soft glow','A dewy finish that catches the light'],
 'Sun-kissed bronze':['Warm bronze and a sun-kissed flush','Holiday skin, all year round'],
 'Mature natural':['A light, flexible base for mature skin','Soft definition that never settles into lines'],
 'Sensitive skin':['Gentle products for reactive skin','Calm, even coverage for sensitive skin'],
 'Maternity glow':['A soft glow for maternity shoots','Radiant, comfortable maternity makeup'],
 'Makeup lesson':['Learn the looks you love','Techniques you can repeat at home'],
 'Soft glam':['Soft glam: blended lids and a nude lip','Diffused glam with a satin finish'],
 'Full glam':['Full glam: sculpted, lashed and lasting','Bold lids, full lashes and a flawless base'],
 'Bronzed coastal glam':['Bronzed glam made for the coast','Warm, sculpted and sun-ready'],
 'Old Hollywood':['Old Hollywood: winged liner and a red lip','Classic screen-siren glamour'],
 'Race day glam':['Race day glam that lasts in the heat','Polished glam for the fields'],
 'Mature skin glam':['Lifted glam for mature skin','Glamorous, luminous and lightweight'],
 'Classic bridal':['Timeless bridal, made to last all day','A classic bride, polished and photo-ready'],
 'Natural radiant bride':['Radiant, natural skin for the bride','Soft, glowing bridal makeup'],
 'Groom grooming':['Groom grooming: even skin, no shine','Camera-ready grooming for the groom'],
 'Beauty close-up':['Macro-ready skin and detail','Up close: precise, blended colour'],
 'Graphic liner':['Graphic liner with clean, sharp lines','Floating liner and negative space'],
 'Editorial graphic liner':['Editorial liner, shaped for the camera','Graphic shapes made for the lens'],
 'Colour block and gloss':['Colour-blocked lids and glossy shine','Bold colour with a high-gloss finish'],
 'Lip art':['Lip art: the lips become the canvas','Painted, glittered and gemmed lips'],
 'Avant-garde':['Avant-garde: makeup as art','Conceptual looks that break the rules'],
 'Music video and album art':['Looks for music videos and album art','Made for the screen and the cover'],
 'Stage and theatre':['Stage makeup that reads from the back row','Theatrical colour and definition'],
 'SFX and prosthetics':['SFX: wounds, prosthetics and creatures','Special effects built to fool the camera'],
 'Body paint':['Full body paint, designed and sealed','Body art in skin-safe paints'],
 'Cosplay recreation':['Character recreations for cosplay','Cosplay makeup, true to the character'],
 'Halloween character':['Halloween characters, from glam to ghoul','Skulls, witches and spooky glam'],
 'Fancy dress':['Fancy-dress faces to finish the costume','Costume makeup full of character'],
 'UV neon':['UV neon that glows under blacklight','Neon colour for the dance floor'],
 'Glitter bar and gems':['Glitter, gems and sparkle','Festival sparkle that stays put'],
 'Kids face paint':['Kids face paint: quick, bright and fun','Face painting for parties'],
 'Express designs':['Express designs in a few minutes','Quick cheek art and glitter'],
 'Easter':['Easter pastels and spring florals','Playful Easter faces'],
 'Christmas and New Year':['Festive red lips, gold lids and sparkle','Christmas and New Year’s Eve glam'],
 'Holiday specials':['Holiday looks for every celebration','Seasonal glam for the festive season']
};;
(function(){
var $=function(id){return document.getElementById(id)};
var D=Object.assign({nav:'a',theme:'b',cap:'c',price:'b',mix:'b',perGroup:25,videosPerGroup:4},window.DESIGN||{});
var SAVED=window.SITE_OVERRIDES||{}; ['hidden','log'].forEach(function(k){SAVED[k]=SAVED[k]||[]}); ['pinned','captions','moved'].forEach(function(k){SAVED[k]=SAVED[k]||{}});
var O=JSON.parse(JSON.stringify(SAVED)), BASE=(window.MEDIA||[]).map(function(x){return Object.assign({},x)});
var SITE=window.SITE||{}, BOOK=(window.BOOKING_LINKS||{}).general||'#', SECTIONS=window.GALLERY_SECTIONS||[];
var cur=0, page=null, sub=null, shown=[], centreIdx=-1, EDIT=false, showAll=false, dirty=0;
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function hash(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function items(){return BASE.map(function(x){var m=O.moved[x.src];return m?Object.assign({},x,{g:m.g,s:m.s}):x})}
function desc(it){if(O.captions[it.src])return O.captions[it.src];if(it.d)return it.d;var a=DESC[it.s]||[''];return a[hash(it.src)%a.length]}
function credit(it){return (it.own?'Chanel Monroe':'Inspiration')+(it.post?' · <a href="'+it.post+'" target="_blank" rel="noopener">'+esc(it.by)+' ↗</a>':'')}
function hid(it){return O.hidden.indexOf(it.src)>=0}
function key(g,s){return s?g.id+'|'+s:g.id}

/* ---- theme + design settings ---- */
var b=document.body.dataset;b.nav=D.nav;b.theme=D.theme;b.cap=D.cap;$('po').dataset.layout=D.price;
if(SITE.businessName&&!/^\[/.test(SITE.businessName))$('brand').textContent=SITE.businessName;
$('enquire').href=BOOK;

/* ---- choose what a section shows: pinned first, then a fresh random mix, videos spread evenly ---- */
function pick(g,onlySub){
  /* Chanel's own work lives only in About; style sections show inspiration */
  var all=items().filter(function(x){return !x.own&&x.g===g.id&&(!onlySub||x.s===onlySub)});
  var imgs=all.filter(function(x){return x.type!=='video'}), vids=all.filter(function(x){return x.type==='video'});
  if(EDIT&&showAll) return imgs.concat(vids);
  imgs=imgs.filter(function(x){return !hid(x)}); vids=vids.filter(function(x){return !hid(x)});
  var pins=(O.pinned[key(g,onlySub)]||[]).map(function(src){return imgs.concat(vids).filter(function(x){return x.src===src})[0]}).filter(Boolean);
  var used={};pins.forEach(function(x){used[x.src]=1});
  var out=[], want=D.perGroup;
  var subs=onlySub?[onlySub]:shuffle(g.subs);
  /* "New mix": skip anything shown in the last mix of this section until the section runs out, then start a fresh cycle */
  var sk=key(g,onlySub),seen=SEEN[sk]=SEEN[sk]||{};
  var fresh=imgs.filter(function(x){return !used[x.src]&&!seen[x.src]});
  if(fresh.length<want-pins.length){SEEN[sk]=seen={};fresh=imgs.filter(function(x){return !used[x.src]})}
  var buckets=subs.map(function(s){return shuffle(fresh.filter(function(x){return x.s===s}))});
  while(out.length+pins.length<want&&buckets.some(function(q){return q.length}))buckets.forEach(function(q){if(out.length+pins.length<want&&q.length)out.push(q.shift())});
  out=shuffle(out);
  var seenPost={};pins.forEach(function(x){if(x.post)seenPost[x.post]=1});
  out=out.filter(function(x){if(!x.post)return true;if(seenPost[x.post])return false;seenPost[x.post]=1;return true});
  var list=pins.filter(function(x){return x.type!=='video'}).concat(out);
  var vwant=Math.max(0,D.videosPerGroup-pins.filter(function(x){return x.type==='video'}).length);
  var vfresh=vids.filter(function(x){return !used[x.src]&&!seen[x.src]});
  if(vfresh.length<vwant)vfresh=shuffle(vfresh).concat(shuffle(vids.filter(function(x){return !used[x.src]&&seen[x.src]})));else vfresh=shuffle(vfresh);
  var vpick=vfresh.slice(0,vwant);
  vpick=pins.filter(function(x){return x.type==='video'}).concat(vpick);
  /* clips land at random, well-spread positions (never two side by side), so the layout changes every mix too */
  vpick.forEach(function(v,k){var slot=(list.length+vpick.length)/(vpick.length+1),at=Math.round((k+1)*slot+(Math.random()-.5)*slot*.7);list.splice(Math.max(1,Math.min(at,list.length)),0,v)});
  list.forEach(function(x){if(!(pins.indexOf(x)>=0))seen[x.src]=1});
  return list;
}
var SEL={},SEEN={};function remixAll(){GROUPS.forEach(function(g){SEL[g.id]=pick(g)})}

/* ---- nav ---- */
function renderNav(){
  var h='<div class="item"><button class="gbtn" data-p="about">About</button></div><span class="sep"></span>';
  h+=GROUPS.map(function(g,i){
    var subs=g.subs.map(function(s){return '<button data-g="'+i+'" data-s="'+esc(s)+'">'+esc(s)+'<small>'+items().filter(function(x){return !x.own&&x.s===s&&!hid(x)}).length+'</small></button>'}).join('');
    return '<div class="item"><button class="gbtn" data-g="'+i+'">'+g.name+'</button><div class="dd"><button data-g="'+i+'" data-s=""><b>All '+g.name+'</b></button>'+subs+'</div></div>'}).join('');
  /* Lessons tab hidden for now (redesign later): set SHOW_LESSONS = true to bring it back */
  var SHOW_LESSONS=false;
  h+='<span class="sep"></span>'+(SHOW_LESSONS?'<div class="item"><button class="gbtn" data-p="lessons">Lessons</button></div><span class="sep"></span>':'')+PAGES.slice(1).filter(function(p){return p.id!=='lessons'}).map(function(p){return '<div class="item"><button class="gbtn" data-p="'+p.id+'">'+p.name+'</button></div>'}).join('');
  $('nav').innerHTML=h;markNav();
}
function markNav(){[].forEach.call($('nav').querySelectorAll('.gbtn'),function(x){x.setAttribute('aria-current',page?x.dataset.p===page:(x.dataset.g!=null&&+x.dataset.g===cur))})}
$('nav').addEventListener('click',function(e){var x=e.target.closest('button');if(!x)return;if(x.dataset.p)return openPage(x.dataset.p);if(x.dataset.g!=null)go(+x.dataset.g,x.dataset.s||null)});
function renderSubs(){var g=GROUPS[cur];$('subs').innerHTML='<button class="chip" data-s="" aria-pressed="'+(!sub)+'">All</button>'+g.subs.map(function(s){return '<button class="chip" data-s="'+esc(s)+'" aria-pressed="'+(sub===s)+'">'+esc(s)+'</button>'}).join('')}
$('subs').addEventListener('click',function(e){var x=e.target.closest('.chip');if(x)go(cur,x.dataset.s||null)});


/* ---- gallery ---- */
var groupsOpt=null;
function moveOptions(it){if(!groupsOpt){groupsOpt=GROUPS.map(function(g){return '<optgroup label="'+g.name+'">'+g.subs.map(function(s){return '<option value="'+g.id+'|'+esc(s)+'">'+esc(s)+'</option>'}).join('')+'</optgroup>'}).join('')}
  return '<select data-a="move" title="Move to another style">'+groupsOpt.replace('value="'+it.g+'|'+esc(it.s)+'"','value="'+it.g+'|'+esc(it.s)+'" selected')+'</select>'}
/* hosted build (js/config.js sets MEDIA_M): every gallery photo is 1600px with an 800px copy, name.m.webp.
   The browser picks the smaller one on phones and 1x screens; local preview has no copies, so no srcset. */
function small(u){return window.MEDIA_M&&/\.webp$/.test(u)&&/\/images\/(inspiration|chanel)\//.test(u)&&!/\/comments\//.test(u)?u.replace(/\.webp$/,'.m.webp'):u}
function srcset(u){var s=small(u);return s===u?'':' srcset="'+s+' 800w, '+u+' 1600w" sizes="(max-height:520px) 40vw, (max-width:760px) 72vw, 34vw"'}
function tileHTML(it,k){
  var w=Math.max(.56,Math.min(1,(it.w||4)/(it.h||5))), pins=O.pinned[key(GROUPS[cur],sub)]||[], pinned=pins.indexOf(it.src)>=0;
  var media=it.type==='video'?'<video muted loop playsinline preload="none" onerror="var t=this.closest(\'.tile\');if(t)t.remove()" poster="'+(it.poster||'')+'" data-src="'+it.src+'"></video>'
    :'<img loading="'+(k<3?'eager':'lazy')+'" decoding="async"'+(k<2?' fetchpriority="high"':'')+' src="'+it.src+'"'+srcset(it.src)+' alt="'+esc(desc(it))+'" onerror="this.closest(\'.tile\').remove()">';
  return '<figure class="tile'+(pinned?' pinned':'')+(hid(it)?' isHidden':'')+'" data-k="'+k+'" draggable="'+EDIT+'" style="aspect-ratio:'+w+'">'+media+(it.own?'<span class="own">Chanel’s work</span>':'')+
    '<figcaption><b>'+esc(it.s)+'</b>'+esc(desc(it))+'<br>'+credit(it)+'</figcaption>'+
    (EDIT?'<div class="ectl"><button data-a="pin" class="'+(pinned?'on':'')+'" title="Pin: always show here, in this order">📌</button><button data-a="hide" class="'+(hid(it)?'on':'')+'" title="Hide from the site">✕</button>'+moveOptions(it)+'</div><div class="ecap" contenteditable="true" data-a="cap" title="Edit the description">'+esc(desc(it))+'</div>':'')+'</figure>';
}
function go(i,s){
  page=null;$('gallery').hidden=false;$('info').hidden=true;
  cur=i;sub=s||null;var g=GROUPS[i];document.body.dataset.g=g.id;markNav();renderSubs();
  $('gTitle').textContent=sub||g.name;$('gTag').textContent=sub?(DESC[sub]||[''])[0]+'.':g.tag;
  shown=(sub||EDIT)?pick(g,sub):bySub(g,SEL[g.id]);if(!EDIT)shown=spreadVideos(shown);
  $('track').innerHTML=shown.map(tileHTML).join('');
  $('gSub').textContent='';$('gSub').classList.remove('on');observeVideos();$('strip').scrollLeft=0;centreIdx=-1;dir=1;setTimeout(findCentre,60);closeDd();
}
function bySub(g,list){var o={};g.subs.forEach(function(s,i){o[s]=i});return list.map(function(x,i){return {x:x,i:i}}).sort(function(a,b){var p=(a.x.s in o?o[a.x.s]:999),q=(b.x.s in o?o[b.x.s]:999);return p-q||a.i-b.i}).map(function(r){return r.x})}
/* never two clips side by side: a clip that would follow another waits for the next photo */
function spreadVideos(list){var V=function(x){return x&&x.type==='video'},out=[],wait=[];
  list.forEach(function(x){if(V(x)&&V(out[out.length-1])){wait.push(x);return}out.push(x);if(!V(x)&&wait.length)out.push(wait.shift())});
  for(var i=out.length;i>0&&wait.length;i--){if(!V(out[i-1])&&!V(out[i]))out.splice(i,0,wait.shift())}
  return out.concat(wait)}
function closeDd(){var a=document.activeElement;if(a&&a.closest&&a.closest('.dd'))a.blur()}
/* long descriptions shrink to fit the caption bar instead of being cut off */
function fitCap(){var c=$('cap'),bar=c.closest('.capbar'),d=$('capDesc');d.style.removeProperty('font-size');
  var fs=parseFloat(getComputedStyle(d).fontSize)||14;
  /* shrink only while the description wraps past one line */
  function over(){var lh=parseFloat(getComputedStyle(d).lineHeight)||fs*1.2;return d.scrollHeight>lh*1.5||d.scrollWidth>d.clientWidth+1}
  while(fs>9.5&&over()){fs-=.5;d.style.setProperty('font-size',fs+'px','important')}}
window.addEventListener('resize',function(){clearTimeout(window._fc);window._fc=setTimeout(fitCap,200)});
function setCap(it){var c=$('cap');c.classList.add('out');
  setTimeout(function(){$('capSub').textContent=it.s;$('capDesc').textContent=desc(it);$('capSrc').innerHTML=credit(it);fitCap();c.classList.remove('out')},220);
  $('tint').style.backgroundImage='url("'+(it.type==='video'?(it.poster||''):it.src)+'")'}
function findCentre(){var st=$('strip'),mid=st.scrollLeft+st.clientWidth/2,best=-1,bd=1e9;
  [].forEach.call($('track').children,function(t,k){var c=t.offsetLeft+t.offsetWidth/2,d=Math.abs(c-mid);if(d<bd){bd=d;best=k}});
  if(best!==centreIdx&&best>=0){var old=$('track').children[centreIdx];if(old)old.classList.remove('centre');centreIdx=best;var t=$('track').children[best];t.classList.add('centre');$('cap').classList.add('out');clearTimeout(capT);var it=shown[+t.dataset.k];capT=setTimeout(function(){setCap(it);var gs=$('gSub');if(!sub&&it&&it.s&&gs.textContent!==it.s){gs.classList.remove('on');setTimeout(function(){gs.textContent=it.s;gs.classList.add('on')},180)}},280)}}
var capT=0;
/* videos load and play only while on screen */
var vio=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting){if(!v.src)v.src=v.dataset.src;var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()})},{root:$('strip'),threshold:.35}):null;
function observeVideos(){[].forEach.call($('track').querySelectorAll('video'),function(v){if(vio)vio.observe(v);else{v.src=v.dataset.src;v.autoplay=true}})}
var st=$('strip'),dragging=false,moved=0,sx=0,sl=0,paused=false,dir=1,raf=0;
st.addEventListener('scroll',function(){cancelAnimationFrame(raf);raf=requestAnimationFrame(findCentre)},{passive:true});
st.addEventListener('wheel',function(e){if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){st.scrollLeft+=e.deltaY;e.preventDefault()}},{passive:false});
st.addEventListener('pointerdown',function(e){if(EDIT||e.pointerType!=='mouse')return;dragging=true;moved=0;sx=e.clientX;sl=st.scrollLeft;st.classList.add('drag')});
window.addEventListener('pointermove',function(e){if(!dragging)return;moved=Math.max(moved,Math.abs(e.clientX-sx));st.scrollLeft=sl-(e.clientX-sx)});
window.addEventListener('pointerup',function(){dragging=false;st.classList.remove('drag')});
window.addEventListener('pointercancel',function(){dragging=false;st.classList.remove('drag')});
var touchT=0,touching=false;st.addEventListener('touchstart',function(){touching=true;clearTimeout(touchT)},{passive:true});
st.addEventListener('touchend',function(){clearTimeout(touchT);touchT=setTimeout(function(){touching=false},1800)},{passive:true});
st.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')paused=true});st.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse')paused=false});
(function auto(){if(!EDIT&&!page&&!paused&&!dragging&&!touching&&!$('po').classList.contains('open')&&!$('lb').classList.contains('open')){st.scrollLeft+=0.45*dir;if(st.scrollLeft+st.clientWidth>=st.scrollWidth-1)dir=-1;else if(st.scrollLeft<=0)dir=1}requestAnimationFrame(auto)})();
(function(){var els=[].slice.call(document.querySelectorAll('.po,.mod,#lb'));function chk(){document.body.classList.toggle('pop-open',els.some(function(e){return e.classList.contains('open')}))}
  var mo=new MutationObserver(chk);els.forEach(function(e){mo.observe(e,{attributes:true,attributeFilter:['class']})})})();
$('remix').onclick=function(){if(!sub)SEL[GROUPS[cur].id]=pick(GROUPS[cur]);go(cur,sub)};

/* ---- lightbox ---- */
var lbk=0;
function lbShow(k){lbk=(k+shown.length)%shown.length;var it=shown[lbk];
  $('lbMedia').innerHTML=it.type==='video'?'<video src="'+it.src+'" muted loop playsinline autoplay controls></video>':'<img src="'+it.src+'" alt="'+esc(desc(it))+'">';
  $('lbCap').innerHTML='<b>'+esc(it.s)+'</b>'+esc(desc(it))+'<br>'+credit(it)}
$('track').addEventListener('click',function(e){if(EDIT||moved>6||e.target.closest('a'))return;var t=e.target.closest('.tile');if(!t)return;lbShow(+t.dataset.k);$('lb').classList.add('open')});
function lbClose(){$('lb').classList.remove('open');$('lbMedia').innerHTML=''}
$('lbX').onclick=lbClose;$('lbL').onclick=function(){lbShow(lbk-1)};$('lbR').onclick=function(){lbShow(lbk+1)};
$('lb').addEventListener('click',function(e){if(e.target===$('lb'))lbClose()});

/* ---- pricing (style photos are inspiration only, not Chanel's work) ---- */
var LP=window.LOOK_PRICES||{sections:[]},LOOKS={};LP.sections.forEach(function(s){s.looks.forEach(function(l){LOOKS[l.key]=l})});
var cur$=LP.currency||'$';function money(n){return cur$+Number(n).toLocaleString('en-AU')}
var poIdx=0,po=$('po');
function buildPricing(){
  $('poPages').innerHTML=GROUPS.map(function(g,i){
    var four=shuffle(items().filter(function(x){return x.g===g.id&&!x.own&&x.type!=='video'&&!hid(x)})).slice(0,4);
    var imgs=four.map(function(it){return '<figure><img loading="lazy" src="'+it.src+'" alt="'+esc(desc(it))+'" onerror="this.parentNode.remove()"><figcaption>'+esc(it.s)+' · '+esc(it.by)+'</figcaption></figure>'}).join('');
    var rows=g.looks.map(function(k){var L=LOOKS[k];if(!L)return '';return '<li><b>'+esc(L.name)+'</b><span class="amt">'+(L.from?'<small>from</small>':'')+money(L.price)+'<small>'+esc(L.unit)+'</small></span><span class="inc">'+esc(L.includes)+'</span></li>'}).join('');
    return '<section class="page" data-g="'+g.id+'"><div class="page-h"><h2>'+g.name+'</h2><p>'+g.tag+'</p></div><div class="page-imgs">'+imgs+'</div><ul class="plist">'+rows+'</ul>'+
      '<div class="page-f"><span>Minimum booking '+money(LP.minimumBooking||0)+' · '+(LP.depositPct||0)+'% deposit secures your date · travel included within '+(LP.includedKm||0)+' km · style photos are inspiration, credited to their artists</span><a class="pill solid" style="text-decoration:none" href="'+((window.BOOKING_LINKS||{})[g.id]||BOOK)+'" target="_blank" rel="noopener">Book '+g.name+'</a></div></section>'}).join('');
  $('poDots').innerHTML=GROUPS.map(function(g,i){return '<button data-i="'+i+'">'+g.name+'</button>'}).join('');
  $('poTabs').innerHTML='<h3>Pricing</h3>'+GROUPS.map(function(g,i){var p=g.looks.map(function(k){return (LOOKS[k]||{}).price||0});return '<button data-i="'+i+'">'+g.name+'<span>from '+money(Math.min.apply(0,p))+'</span></button>'}).join('');
}
function poGo(i,fromScroll){poIdx=(i+GROUPS.length)%GROUPS.length;po.setAttribute('data-g',GROUPS[poIdx].id);
  [].forEach.call($('poPages').children,function(p,k){p.classList.toggle('on',k===poIdx)});
  [].forEach.call($('poDots').children,function(x,k){x.setAttribute('aria-current',k===poIdx)});
  [].forEach.call($('poTabs').querySelectorAll('button'),function(x,k){x.setAttribute('aria-current',k===poIdx)});
  if(po.dataset.layout==='a')$('poPages').style.transform='translateX('+(-100*poIdx)+'%)';
  if(po.dataset.layout==='c'&&!fromScroll){var c=$('poPages').children[poIdx],v=$('poView');v.scrollTo({left:c.offsetLeft-(v.clientWidth-c.offsetWidth)/2,behavior:'smooth'})}}
function poOpen(i){po.classList.add('open');poGo(i);if(po.dataset.layout==='c')setTimeout(function(){poGo(i)},30)}
$('openPricing').onclick=function(){poOpen(page?0:cur)};
$('poX').onclick=function(){po.classList.remove('open')};
po.addEventListener('click',function(e){if(e.target===po||(e.target===$('poView')&&po.dataset.layout==='c'))po.classList.remove('open')});
$('poPrev').onclick=function(){poGo(poIdx-1)};$('poNext').onclick=function(){poGo(poIdx+1)};
$('poDots').onclick=$('poTabs').onclick=function(e){var x=e.target.closest('button[data-i]');if(x)poGo(+x.dataset.i)};
var poRaf=0;$('poView').addEventListener('scroll',function(){if(po.dataset.layout!=='c')return;cancelAnimationFrame(poRaf);poRaf=requestAnimationFrame(function(){var v=$('poView'),mid=v.scrollLeft+v.clientWidth/2,best=0,bd=1e9;[].forEach.call($('poPages').children,function(c,k){var d=Math.abs(c.offsetLeft+c.offsetWidth/2-mid);if(d<bd){bd=d;best=k}});if(best!==poIdx)poGo(best,true)})},{passive:true});

/* ---- About, Affiliates, Brands, Products ---- */
function sec(id){return SECTIONS.filter(function(s){return s.id===id})[0]||{groups:[]}}
var aboutTimer=0;
function openPage(id){
  page=id;document.body.dataset.g=id;markNav();$('gallery').hidden=true;var el=$('info');el.hidden=false;el.scrollTop=0;clearInterval(aboutTimer);
  var ig=SITE.instagram||'https://www.instagram.com/chanelmonroemakeup/', h='';
  if(id==='about'){
    var lines=(sec('about').lines||[]).filter(function(l){return l&&!/\[[^\]]*\]/.test(l)});
    var own=shuffle(items().filter(function(x){return x.own&&x.type!=='video'&&!hid(x)}));
    h='<div class="about-hero"><figure class="me"><img src="'+(window.ABOUT_PHOTO||'images/about/chanel.jpg')+'" alt="Chanel Monroe" onerror="this.closest(\'.me\').remove()"></figure><div class="me-txt">'+
      '<h1 class="brand-title">'+$('brand').innerHTML+'</h1><p class="lead">Mobile makeup artist on the Gold Coast. Bridal, glam, editorial, character and party looks.</p>'+
      '<p class="about-lines" id="aboutLine">'+esc(lines[0]||'Makeup for every kind of day, from barely there to full character.')+'</p></div></div>'+
      '<ol class="tline">'+ABOUT_BIO.map(function(b){return '<li><span class="yr">'+esc(b[0])+'</span><b>'+esc(b[1])+'</b><span class="ln">'+esc(b[2])+'</span></li>'}).join('')+'</ol>'+
      '<h3>Chanel’s work</h3><div class="agrid" id="agrid"></div>'+
      '<p><a class="pill" style="text-decoration:none;display:inline-block;margin-top:10px" href="'+ig+'" target="_blank" rel="noopener">Follow on Instagram</a></p>'+
      (lines.length?'':'<p class="note-small">Bio lines still to write: edit ABOUT_LINES in data/site-content.js.</p>');
    if(lines.length>1){var n=0;aboutTimer=setInterval(function(){var p=$('aboutLine');if(!p)return clearInterval(aboutTimer);p.style.opacity=0;setTimeout(function(){n=(n+1)%lines.length;p.textContent=lines[n];p.style.opacity=1},400)},3800)}
  }
  if(id==='affiliates'){
    var AF=window.AFFILIATES||[],cats=[];AF.forEach(function(a){if(cats.indexOf(a.cat)<0)cats.push(a.cat)});
    h='<h1>Affiliates</h1><p class="lead">My people. These are the Gold Coast artists and creatives I trust, work alongside and happily send you to: hair, nails, brows, lashes, photographers and more. If I’m booked out, or you need a whole glam team for the big day, start here.</p><p class="hint">Tap anyone to see their work.</p>'+cats.map(function(c){
      return '<h3>'+esc(c)+'</h3>'+carousel(AF.map(function(a,i){return a.cat!==c?'':'<div class="card" data-aff="'+i+'"><img class="av" src="'+a.avatar+'" alt="" onerror="this.style.visibility=\'hidden\'"><b>'+esc(a.role)+'</b><small>@'+esc(a.h)+'</small></div>'}).join(''))}).join('');
  }
  if(id==='brands'){
    h='<h1>Brands</h1><p class="lead">The brands that have earned a spot in my kit. I choose them for how they wear on real skin in Gold Coast heat and humidity, from Aussie-made favourites to the pro brands I trust under camera lights.</p><p class="hint">Tap a logo to learn more about the brand.</p>'+sec('brands').groups.map(function(g){
      return '<h3>'+esc(g.name)+'</h3>'+carousel(g.tiles.map(function(t){return '<div class="logo" role="button" tabindex="0" data-brand="'+esc(t.text)+'" title="'+esc(t.text)+'">'+(t.src?'<img loading="lazy" src="'+t.src+'" alt="'+esc(t.text)+'">':esc(t.text))+'</div>'}).join(''))}).join('')+
      '<p class="note-small">'+esc((sec('brands').lines||[]).slice(-1)[0]||'')+' ModelCo closed in 2025: its link goes to the brand’s old site, which now points to MCoBeauty.</p>';
  }
  if(id==='lessons')h=lessonsHTML();
  if(id==='products'){
    /* catalogue: "In Chanel's kit" first, then every category (up to 25 each); tap a product for its details */
    var C=catalog(),kit=(sec('products').groups.filter(function(g){return /kit/i.test(g.name)})[0]||{tiles:[]}).tiles;
    h='<h1>Products</h1><p class="lead">The products I actually reach for on clients, sorted by what they do. Use it as a shopping list after your appointment, or to build your own kit at home. Prices and shades change, so check with the store before you buy.</p><p class="hint">Tap any product for details.</p>'+C.cats.map(function(c){
      var list=C.items.filter(function(p){return p.cat===c});if(!list.length)return '';
      return '<h3>'+esc(c)+' <small class="cnt">'+list.length+'</small></h3>'+carousel(list.slice(0,25).map(prodCard).join(''))}).join('')+
      (kit.length?'<h3>Also in the kit</h3><ul class="kitlist">'+kit.map(function(t){return '<li>'+esc(t.text)+'</li>'}).join('')+'</ul>':'')+
      '<p class="note-small">'+esc((sec('products').lines||[]).slice(-1)[0]||'')+'</p>';
  }
  el.innerHTML=h;
  if(id==='about')buildAboutGrid(own);
  startCarousels(el);
}

/* ---- About: short biography, taken from Chanel's Instagram (posts, tags and highlights). Confirm with Chanel before going live. ---- */
/* [year, title, line] in date order: shown as a one-row timeline */
var ABOUT_BIO=[
 ['2017','Makeup school','Trained at the Huxley School of Makeup; created "Gypsy Witch" for its competition.'],
 ['2017','Character & SFX','Halloween characters, SFX creatures and gothic glam.'],
 ['2018','On set','Editorial shoots with Gold Coast photographers, incl. men’s grooming.'],
 ['2021','Cosmetic tattoo','Cosmetic tattoo training with Trace Cosmetic Tattoo Academy.'],
 ['Today','Mobile on the Gold Coast','Bridal, glam, events, shoots and parties: I come to you.']
];

/* ---- brand websites (checked Nov 2026) ---- */
var BRAND_URL={'Ultra Violette':'https://www.ultraviolette.com.au','Nude by Nature':'https://www.nudebynature.com.au','MCoBeauty':'https://www.mcobeauty.com','Designer Brands':'https://www.dbcosmetics.com.au','Napoleon Perdis':'https://www.napoleonperdis.com','Adorn Cosmetics':'https://www.adorncosmetics.com.au','Bloom Cosmetics':'https://bloomcosmetics.com','INIKA Organic':'https://inikaorganic.com','Bali Body':'https://au.balibodyco.com','Natio':'https://www.natio.com.au','Ere Perez':'https://ereperez.com','ModelCo':'https://www.modelco.com','Lanolips':'https://lanolips.com','Frank Body':'https://frankbody.com','Sand & Sky':'https://au.sandandsky.com','Go-To Skincare':'https://gotoskincare.com','LaGlam Minerals':'https://australianmade.com.au/licensees/laglam-minerals','MECCA Cosmetica':'https://www.mecca.com/en-au',
 'NARS':'https://www.narscosmetics.com','Charlotte Tilbury':'https://www.charlottetilbury.com/au','Fenty Beauty':'https://fentybeauty.com/en-au','Rare Beauty':'https://www.rarebeauty.com','Laura Mercier':'https://www.lauramercier.com','Huda Beauty':'https://hudabeauty.com/en-au','Anastasia Beverly Hills':'https://www.anastasiabeverlyhills.com','MAC Cosmetics':'https://www.maccosmetics.com.au','Bobbi Brown':'https://www.bobbibrown.com.au','Lancôme':'https://www.lancome.com.au','Clinique':'https://www.clinique.com.au','Dior Beauty':'https://www.dior.com/en_au/beauty','Danessa Myricks Beauty':'https://danessamyricksbeauty.com','Kryolan':'https://global.kryolan.com','Mehron':'https://www.mehron.com','Ben Nye':'https://www.bennye.com','Fusion Body Art':'https://fusionbodyart.com','Real Techniques':'https://realtechniques.com','Embryolisse':'https://www.embryolisse.com',
 'Alpha-H':'https://www.alpha-h.com','MooGoo':'https://moogoo.com.au','Issada':'https://www.issada.com','Skin O2':'https://www.skino2.com.au','Roccoco Botanicals':'https://roccoco.com','Cannabella':'https://cannabella.com.au','Cedar & Stone':'https://cedarandstone.com.au','Oil \'o\' Eve':'https://oiloeve.com','Garbo & Kelly':'https://garboandkelly.com','Makeup Cartel':'https://makeupcartel.com.au','Clean Beauty Market':'https://cleanbeautymarket.com.au','Loving Tan':'https://lovingtan.com','Lash & Brow Professional':'https://www.lashandbrow.com.au','Lust Minerals':'https://lustminerals.com.au','Noosa Naturals':'https://noosanaturals.com.au','Eye of Horus':'https://eyeofhoruscosmetics.com'};
function brandLogo(name){var n=String(name).toLowerCase(),hit='';sec('brands').groups.forEach(function(g){g.tiles.forEach(function(t){var a=t.text.toLowerCase();if(!hit&&t.src&&(a===n||n.indexOf(a)===0||a.indexOf(n)===0))hit=t.src})});return hit}

/* ---- product catalogue: Chanel's kit (data/products.js) + brand catalogue (data/catalog.js), de-duplicated ---- */
var CAT_ORDER=['In Chanel’s kit','Trending now','Skin prep','Primer & setting','Foundation & base','Concealer & correct','Powder','Bronzer & contour','Blush','Highlighter','Eyeshadow','Eyeliner','Mascara','Brows','Lashes','Lipstick','Lip gloss & oil','Lip liner','Lip care','SPF','Body & tan','Brushes & tools','Face paint & SFX'];
var _cat=null;
function catalog(){if(_cat)return _cat;var items=[],seen={};
  function add(p){var k=(p.url||p.brand+p.name).toLowerCase().replace(/[?#].*$/,'').replace(/\/$/,'');var n=(p.brand+'|'+p.name).toLowerCase().replace(/[^a-z0-9|]/g,'');if(seen[k]||seen[n])return;seen[k]=seen[n]=1;p.i=items.length;items.push(p)}
  (window.PRODUCTS||[]).forEach(function(p){add({brand:p.brand,name:p.name,url:p.url,img:p.img,desc:p.desc||'',cat:'In Chanel’s kit',kit:1,src:p.src||''})});
  ((window.CATALOG||{}).items||[]).forEach(function(p){add(Object.assign({},p))});
  var cats=CAT_ORDER.filter(function(c){return items.some(function(p){return p.cat===c})});
  items.forEach(function(p){if(cats.indexOf(p.cat)<0)cats.push(p.cat)});
  return _cat={items:items,cats:cats}}
function prodCard(p){var im=p.img||brandLogo(p.brand);
  return '<div class="prod" role="button" tabindex="0" data-prod="'+p.i+'"><div class="pi'+(p.img?'':' logoonly')+'">'+(im?'<img loading="lazy" src="'+im+'" alt="'+esc(p.brand+' '+p.name)+'" onerror="this.style.visibility=\'hidden\'">':'')+'</div><div class="pt"><small>'+esc(p.brand)+'</small>'+esc(p.name)+(p.kit?'<em>In Chanel’s kit</em>':'')+'</div></div>'}
function shopName(u){var h=(String(u).match(/^https?:\/\/([^/]+)/)||[])[1]||'';h=h.replace(/^www\.|^au\./,'');return ({'adorebeauty.com.au':'Adore Beauty','mecca.com':'MECCA','sephora.com.au':'Sephora','spacenk.com':'Space NK','davidjones.com':'David Jones'})[h]||h}
function openProduct(p){var im=p.img||brandLogo(p.brand),B=(window.BRANDS_INFO||{})[p.brand];
  $('pmBox').innerHTML='<div class="pm-img'+(p.img?'':' logoonly')+'">'+(im?'<img src="'+im+'" alt="'+esc(p.brand+' '+p.name)+'">':'')+'</div><div class="pm-info"><small class="pm-brand">'+(B||brandLogo(p.brand)?'<button class="lnk" data-brand="'+esc(p.brand)+'">'+esc(p.brand)+' ›</button>':esc(p.brand))+'</small><h2>'+esc(p.name)+'</h2>'+
    '<p class="pm-cat">'+esc(p.cat)+(p.price?' · '+esc(p.price):'')+'</p>'+(p.kit?'<p class="pm-kit">One of the products Chanel uses on clients.</p>':'')+
    '<div class="pm-desc">'+(p.desc?esc(p.desc).replace(/\n+/g,'<br><br>'):'<span class="soft">Description coming soon.</span>')+'</div>'+
    (p.url?'<a class="pill solid" href="'+p.url+'" target="_blank" rel="noopener sponsored">View at '+esc(shopName(p.url))+' ↗</a>':'')+
    (p.desc&&p.src?'<p class="note-small">Product description from '+esc(p.src)+'.</p>':'')+'</div>';
  $('prodMod').classList.add('open')}
function openBrand(name){var B=(window.BRANDS_INFO||{})[name]||{},logo=brandLogo(name),url=BRAND_URL[name]||B.url,C=catalog();
  var mine=C.items.filter(function(p){return p.brand===name||(p.brand||'').toLowerCase()===name.toLowerCase()}).slice(0,9);
  var facts=[['Est.',B.est],['From',B.origin],['Founder',B.founder]].filter(function(f){return f[1]});
  $('bmBox').innerHTML='<div class="bm-head">'+(logo?'<img class="bm-logo" src="'+logo+'" alt="'+esc(name)+'">':'<h2>'+esc(name)+'</h2>')+
    (facts.length?'<dl class="bm-facts">'+facts.map(function(f){return '<div><dt>'+f[0]+'</dt><dd>'+esc(f[1])+'</dd></div>'}).join('')+'</dl>':'')+
    (B.about?'<p class="bm-about">'+esc(B.about)+'</p>':'')+(url?'<a class="pill solid" href="'+url+'" target="_blank" rel="noopener">Visit '+esc(name)+' ↗</a>':'')+'</div>'+
    (mine.length?'<div class="bm-grid">'+mine.map(function(p){return '<button class="bm-p" data-prod="'+p.i+'"><span class="bm-pi"><img loading="lazy" src="'+(p.img||logo)+'" alt=""></span><span>'+esc(p.name)+'</span></button>'}).join('')+'</div>':'<p class="note-small bm-none">Products from this brand are coming soon.</p>');
  $('brandMod').classList.add('open')}
document.addEventListener('click',function(e){var b=e.target.closest('[data-brand]'),p=e.target.closest('[data-prod]');
  if(p&&!e.defaultPrevented){var it=catalog().items[+p.dataset.prod];if(it){$('brandMod').classList.remove('open');openProduct(it)}return}
  if(b&&!e.defaultPrevented){$('prodMod').classList.remove('open');openBrand(b.dataset.brand)}});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.matches&&e.target.matches('[data-prod],[data-brand]'))e.target.click()});

/* ---- horizontal auto-rotating carousel: loops, pauses on hover, drag or swipe to move ---- */
function carousel(inner){return '<div class="car"><div class="rail">'+inner+'</div></div>'}
var cars=[];
function startCarousels(root){
  cars=[];[].forEach.call(root.querySelectorAll('.car'),function(c,k){
    var rail=c.querySelector('.rail');if(!rail.children.length){c.remove();return}
    /* no double-ups: a row that fits on screen stays still (centred); a longer row loops with exactly one hidden copy,
       which only comes into view after every real item has passed */
    var fits=rail.scrollWidth<=c.clientWidth;
    if(fits){c.classList.add('still');return}
    var gap=parseFloat(getComputedStyle(rail).columnGap)||16;rail.insertAdjacentHTML('beforeend',rail.innerHTML);
    [].slice.call(rail.children,rail.children.length/2).forEach(function(n){n.setAttribute('aria-hidden','true');n.tabIndex=-1});
    var s={el:c,rail:rail,x:0,v:(k%2?-0.35:0.35),hover:false,drag:false,sx:0,ox:0,moved:0,gap:gap,fl:0,lx:0,lt:0,rest:0,half:0,vis:true,sy:0,lock:'',pid:-1};
    s.half=(rail.scrollWidth+gap)/2;if(carIO){s.vis=false;carIO.observe(c)}c._car=s;
    c.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')s.hover=true});c.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'){s.hover=false;end()}});
    function end(){if(!s.drag)return;s.drag=false;s.lock='';c.classList.remove('drag');s.rest=performance.now()+1200}
    c.addEventListener('pointerdown',function(e){s.drag=true;s.lock=e.pointerType==='mouse'?'x':'';s.pid=e.pointerId;s.fl=0;s.moved=0;s.sx=e.clientX;s.sy=e.clientY;s.ox=s.x;s.lx=e.clientX;s.lt=performance.now();c.classList.add('drag')});
    c.addEventListener('pointermove',function(e){if(!s.drag)return;if(!s.lock){var ax=Math.abs(e.clientX-s.sx),ay=Math.abs(e.clientY-s.sy);if(ax<6&&ay<6)return;s.lock=ax>ay?'x':'y'}if(s.lock==='y'){end();return}s.moved=Math.max(s.moved,Math.abs(e.clientX-s.sx));s.x=s.ox+(e.clientX-s.sx);var now=performance.now(),dt=Math.max(1,now-s.lt);s.fl=0.8*s.fl+0.2*((e.clientX-s.lx)/dt*16);s.lx=e.clientX;s.lt=now;if(s.moved>6&&!c.hasPointerCapture(e.pointerId)){try{c.setPointerCapture(e.pointerId)}catch(_){}}});
    c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);c.addEventListener('lostpointercapture',end);
    c.addEventListener('click',function(e){if(s.moved>6){e.preventDefault();e.stopPropagation()}},true);
    c.addEventListener('wheel',function(e){if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){s.x-=e.deltaX;e.preventDefault()}},{passive:false});
    cars.push(s)});
}
/* rows only animate while on screen; widths are measured once (and on resize), never every frame */
var carIO=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.target._car)e.target._car.vis=e.isIntersecting})},{rootMargin:'60px 0px'}):null;
var pageScroll=0;$('info').addEventListener('scroll',function(){pageScroll=performance.now()+350},{passive:true});
window.addEventListener('resize',function(){cars.forEach(function(s){s.half=(s.rail.scrollWidth+s.gap)/2})});
(function spin(){var busy=document.querySelector('.mod.open')||document.hidden||performance.now()<pageScroll;
  cars.forEach(function(s){if(!s.vis||!s.el.isConnected)return;var half=s.half;if(!s.drag&&Math.abs(s.fl)>0.05){s.x+=s.fl;s.fl*=0.94}else if(!s.hover&&!s.drag&&!busy&&performance.now()>s.rest)s.x-=s.v;
    if(half>0){while(s.x<=-half)s.x+=half;while(s.x>0)s.x-=half}s.rail.style.transform='translate3d('+s.x.toFixed(1)+'px,0,0)'});
  requestAnimationFrame(spin)})();

/* ---- Lessons: short tutorial clips with sound (data/lessons.js), in chapter order; tap one to watch ---- */
var LESSON_ORDER=['Skin prep & maintenance','What to eat for your skin','Daily routine','Skincare','Sun protection','Check-ups: derms, skin checks & allergies','Wardrobe ideas','Colours that suit you','Makeup looks & styles','Hair styling','Nails','Cosmetic tattoo','Tattoos & unique features','Make it last all day','Removal & cleaning'];
function lessonsHTML(){var L=window.LESSONS||[];var cats=LESSON_ORDER.filter(function(c){return L.some(function(x){return x.topic===c})});
  L.forEach(function(x){if(cats.indexOf(x.topic)<0)cats.push(x.topic)});
  return '<h1>Lessons</h1><p class="lead">Short tutorials and tips from artists, skin professionals and stylists, from skin prep to taking it all off. Tap a lesson to watch it with sound.</p>'+
    (L.length?cats.map(function(c){return '<h3>'+esc(c)+'</h3>'+carousel(L.map(function(x,i){return x.topic!==c?'':'<div class="lesson" role="button" tabindex="0" data-lesson="'+i+'"><div class="lp"><img loading="lazy" src="'+x.poster+'" alt=""><span class="dur">'+Math.round(x.dur)+'s</span><span class="play" aria-hidden="true"></span></div><b>'+esc(x.title||c)+'</b><small>'+esc(x.by)+'</small></div>'}).join(''))}).join(''):'<p class="note-small">Lessons are on their way.</p>')+
    '<p class="note-small">Clips belong to the creators credited on each one. General tips only: see a GP, dermatologist or skin-check clinic for anything about your own skin.</p>'}
function openLesson(i){var x=(window.LESSONS||[])[i];if(!x)return;
  $('lsBox').innerHTML='<video controls playsinline autoplay src="'+x.src+'" poster="'+x.poster+'"></video><div class="ls-info"><small>'+esc(x.topic)+'</small><h2>'+esc(x.title||x.topic)+'</h2><p>By '+esc(x.by)+'</p><a class="pill" href="'+x.post+'" target="_blank" rel="noopener">Watch on Instagram ↗</a></div>';
  $('lessonMod').classList.add('open')}
$('info').addEventListener('click',function(e){var c=e.target.closest('[data-lesson]');if(c)openLesson(+c.dataset.lesson)});
$('info').addEventListener('keydown',function(e){var c=e.target.closest&&e.target.closest('[data-lesson]');if(c&&e.key==='Enter')openLesson(+c.dataset.lesson)});
new MutationObserver(function(){if(!$('lessonMod').classList.contains('open')){var v=$('lsBox').querySelector('video');if(v){v.pause();$('lsBox').innerHTML=''}}}).observe($('lessonMod'),{attributes:true,attributeFilter:['class']});

/* ---- affiliate popup: avatar, bio, 3 x 3 of their latest work ---- */
function fmtN(n){return n==null?'':n>=1000?(n/1000).toFixed(n>=10000?0:1).replace(/\.0$/,'')+'k':String(n)}
$('info').addEventListener('click',function(e){var c=e.target.closest('[data-aff]');if(!c)return;var a=(window.AFFILIATES||[])[+c.dataset.aff];if(!a)return;
  var ig='https://www.instagram.com/'+a.h+'/';
  $('affBox').innerHTML='<div class="side"><img class="av" src="'+a.avatar+'" alt=""><h2>'+esc(a.role)+'</h2><p class="role">'+esc(a.cat)+' · @'+esc(a.h)+'</p>'+
    (a.posts!=null?'<div class="stats"><span><b>'+fmtN(a.posts)+'</b>posts</span><span><b>'+fmtN(a.followers)+'</b>followers</span></div>':'')+
    '<p class="bio">'+esc(a.bio||'')+'</p><a class="pill solid" href="'+ig+'" target="_blank" rel="noopener">View on Instagram</a>'+(a.site?'<a class="pill" href="'+esc(a.site)+'" target="_blank" rel="noopener">Website</a>':'')+'</div>'+
    '<div class="g9">'+(a.imgs.length?a.imgs.map(function(m){return '<a href="'+m.post+'" target="_blank" rel="noopener"'+(m.video?' class="v"':'')+'><img loading="lazy" src="'+m.src+'" alt=""></a>'}).join(''):'<p class="note-small" style="padding:20px">This account is private, so no photos are shown.</p>')+'</div>';
  $('affMod').classList.add('open')});

/* ---- Instagram-style post popup for Chanel's work (photo left, caption + comments right) ---- */
var igList=[],igk=0;
function ago(t){if(!t)return '';var s=Date.now()/1000-t,d=s/86400;return d<1?Math.max(1,Math.round(s/3600))+'h':d<7?Math.round(d)+'d':d<365?Math.round(d/7)+'w':Math.round(d/365)+'y'}
function igAv(c){return c.av?'<img class="ava" src="'+c.av+'" alt="">':'<span class="ava">'+esc((c.u||'?')[0].toUpperCase())+'</span>'}
function igCom(c,rep){return '<div class="c'+(rep?' rep':'')+'">'+igAv(c)+'<div class="tx"><b>'+esc(c.u)+'</b>'+esc(c.t)+(c.l?'<span class="meta">'+c.l+' like'+(c.l>1?'s':'')+'</span>':'')+'</div></div>'+(c.r||[]).map(function(x){return igCom(x,1)}).join('')}
function igShow(k){igk=(k+igList.length)%igList.length;var it=igList[igk],P=(window.IG_POSTS||{})[it.post]||null,ig=SITE.instagram||'https://www.instagram.com/chanelmonroemakeup/';
  var me={u:'chanelmonroemakeup',av:'https://qxiugfatpybldluipcyy.supabase.co/storage/v1/object/public/media/images/chanel/comments/chanelmonroemakeup.webp'};
  var cap=P&&P.caption?P.caption:desc(it);
  $('igBox').innerHTML='<div class="ph"><img src="'+it.src+'" alt="'+esc(desc(it))+'">'+(igList.length>1?'<button class="arw l" data-ig="-1" aria-label="Previous">‹</button><button class="arw r" data-ig="1" aria-label="Next">›</button>':'')+'</div>'+
    '<div class="side"><div class="hd"><img class="ava" src="'+me.av+'" alt="" onerror="this.outerHTML=\'<span class=&quot;ava&quot;>CM</span>\'"><b>chanelmonroemakeup</b>'+(it.post?'<a href="'+it.post+'" target="_blank" rel="noopener">View post</a>':'<a href="'+ig+'" target="_blank" rel="noopener">Follow</a>')+'</div>'+
    '<div class="cm"><div class="cap">'+igCom({u:me.u,av:'',t:cap,at:P&&P.date})+'</div>'+
    (P&&P.comments.length?P.comments.map(function(c){return igCom(c)}).join(''):'<p class="none">No comments yet.<br>Be the first on Instagram.</p>')+'</div>'+
    (P&&P.count?'<div class="ft">'+P.count+' comment'+(P.count>1?'s':'')+'</div>':'')+'</div>';
  var hav=$('igBox').querySelector('.cap .ava');if(hav)hav.outerHTML='<img class="ava" src="'+me.av+'" alt="" onerror="this.outerHTML=\'<span class=&quot;ava&quot;>CM</span>\'">';}
function igOpen(list,k){igList=list;igShow(k);$('igMod').classList.add('open')}
$('igBox').addEventListener('click',function(e){var b=e.target.closest('[data-ig]');if(b)igShow(igk+(+b.dataset.ig))});
[$('affMod'),$('igMod'),$('prodMod'),$('brandMod'),$('lessonMod')].forEach(function(m){m.addEventListener('click',function(e){if(e.target===m||e.target.hasAttribute('data-close'))m.classList.remove('open')})});
/* About grid: each of Chanel's photos once, fresh order on every visit; two tiles trade places every few seconds */
var gridTimer=0;
function buildAboutGrid(own){
  clearInterval(gridTimer);var grid=$('agrid');if(!grid||!own.length)return;
  /* every photo appears exactly once; columns chosen so the rows come out even (21 photos = 7 x 3) */
  var N=own.length,COLS=[9,8,7,6,5].filter(function(c){return N%c===0})[0]||Math.min(9,N),cells=shuffle(own);
  grid.style.gridTemplateColumns=window.matchMedia('(max-width:760px)').matches?'':'repeat('+COLS+',1fr)';
  grid.innerHTML=cells.map(function(x,i){return '<div class="cell" data-i="'+i+'"><img loading="'+(i<9?'eager':'lazy')+'" decoding="async" src="'+small(x.src)+'" alt="'+esc(desc(x))+'"><span>'+esc(desc(x))+'</span></div>'}).join('');
  grid.onclick=function(e){var c=e.target.closest('.cell');if(!c)return;igOpen(own,own.indexOf(cells[+c.dataset.i]))};
  gridTimer=setInterval(function(){
    if(!document.body.contains(grid)||page!=='about'){clearInterval(gridTimer);return}
    if(document.hidden||$('lb').classList.contains('open')||$('igMod').classList.contains('open'))return;
    if(N<2)return; /* two tiles swap places with a crossfade, so the grid keeps moving without ever repeating a photo */
    var a=Math.floor(Math.random()*N),b=(a+1+Math.floor(Math.random()*(N-1)))%N;
    [[a,cells[b]],[b,cells[a]]].forEach(function(p){var cell=grid.children[p[0]],old=cell.querySelector('img:last-of-type'),next=p[1];
      var img=new Image();img.alt=desc(next);img.className='out';img.onload=function(){cell.appendChild(img);requestAnimationFrame(function(){img.classList.remove('out');old.classList.add('out')});setTimeout(function(){old.remove()},1000);cell.querySelector('span').textContent=desc(next)};img.src=small(next.src)});
    var t=cells[a];cells[a]=cells[b];cells[b]=t;
  },3200);
}

/* ---- EDIT MODE: drag to reorder (pins), pin, hide, re-caption, move; save to data/overrides.js ---- */
var changes=[],fileHandle=null,dragK=-1;
function note(action,it,detail){changes.push({time:new Date().toISOString(),action:action,section:GROUPS[cur].id+(sub?' / '+sub:''),image:it.src,detail:detail||''});
  $('editCnt').textContent=changes.length+' unsaved change'+(changes.length===1?'':'s')}
function setEdit(on){EDIT=on;showAll=false;document.body.classList.toggle('editing',on);$('eAll').textContent='Show every image in this section';if(!page)go(cur,sub)}
function pinList(){var k=key(GROUPS[cur],sub);return O.pinned[k]=O.pinned[k]||[]}
$('track').addEventListener('click',function(e){if(!EDIT)return;var x=e.target.closest('button[data-a]');if(!x)return;var t=x.closest('.tile'),it=shown[+t.dataset.k];
  if(x.dataset.a==='pin'){var p=pinList(),i=p.indexOf(it.src);if(i>=0){p.splice(i,1);note('unpin',it)}else{p.push(it.src);note('pin',it)}}
  if(x.dataset.a==='hide'){var j=O.hidden.indexOf(it.src);if(j>=0){O.hidden.splice(j,1);note('unhide',it)}else{O.hidden.push(it.src);note('hide',it)}}
  t.outerHTML=tileHTML(it,+t.dataset.k)});
$('track').addEventListener('change',function(e){if(!EDIT||e.target.dataset.a!=='move')return;var t=e.target.closest('.tile'),it=shown[+t.dataset.k],v=e.target.value.split('|');
  O.moved[it.src]={g:v[0],s:v[1]};note('move',it,'to '+v[0]+' / '+v[1]);it.g=v[0];it.s=v[1]});
$('track').addEventListener('focusout',function(e){if(!EDIT||e.target.dataset.a!=='cap')return;var t=e.target.closest('.tile'),it=shown[+t.dataset.k],txt=e.target.textContent.trim();
  if(txt&&txt!==desc(it)){O.captions[it.src]=txt;note('caption',it,txt)}});
$('track').addEventListener('dragstart',function(e){if(!EDIT)return;var t=e.target.closest('.tile');dragK=+t.dataset.k;e.dataTransfer.effectAllowed='move'});
$('track').addEventListener('dragover',function(e){if(!EDIT)return;e.preventDefault();var t=e.target.closest('.tile');[].forEach.call($('track').children,function(c){c.classList.toggle('drop',c===t)})});
$('track').addEventListener('drop',function(e){if(!EDIT)return;e.preventDefault();var t=e.target.closest('.tile');if(!t||dragK<0)return;var to=[].indexOf.call($('track').children,t),from=[].indexOf.call($('track').children,$('track').querySelector('.tile[data-k="'+dragK+'"]'));
  var order=[].map.call($('track').children,function(c){return shown[+c.dataset.k]});var it=order.splice(from,1)[0];order.splice(to,0,it);
  var p=pinList();if(p.indexOf(it.src)<0)p.push(it.src);var set={};p.forEach(function(s){set[s]=1});
  O.pinned[key(GROUPS[cur],sub)]=order.filter(function(x){return set[x.src]}).map(function(x){return x.src});
  note('reorder',it,'position '+(to+1));shown=order;$('track').innerHTML=shown.map(tileHTML).join('');observeVideos();dragK=-1});
$('eAll').onclick=function(){showAll=!showAll;this.textContent=showAll?'Back to the normal mix':'Show every image in this section';go(cur,sub)};
$('eUndo').onclick=function(){O=JSON.parse(JSON.stringify(SAVED));changes=[];$('editCnt').textContent='Changes discarded';go(cur,sub)};
$('eExit').onclick=function(){setEdit(false);if(changes.length)alertLine('You have unsaved changes: press E and Save to keep them.')};
function alertLine(t){$('editCnt').textContent=t}
$('eSave').onclick=async function(){
  if(!changes.length){alertLine('Nothing new to save');return}
  O.log=(O.log||[]).concat([{saved:new Date().toISOString(),changes:changes}]);
  var text='/* Manual adjustments saved from Edit mode (press E on the site, or open index.html?edit).\n   hidden: images never shown.  pinned: images shown first, in this order, per section.\n   captions: replacement descriptions.  moved: images moved to another section or style.\n   log: a dated record of every saved change. */\nwindow.SITE_OVERRIDES = '+JSON.stringify(O,null,1)+';\n';
  try{
    if(window.showSaveFilePicker){fileHandle=fileHandle||await window.showSaveFilePicker({suggestedName:'overrides.js',types:[{description:'Site overrides',accept:{'text/javascript':['.js']}}]});
      var w=await fileHandle.createWritable();await w.write(text);await w.close();alertLine('Saved '+changes.length+' change(s) to '+fileHandle.name+'. Keep it in the data folder.');}
    else{var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/javascript'}));a.download='overrides.js';a.click();alertLine('Downloaded overrides.js: move it into the data folder.')}
    SAVED=JSON.parse(JSON.stringify(O));changes=[];
  }catch(err){O.log.pop();alertLine('Not saved: '+err.message)}
};

/* ---- keys + start ---- */
document.addEventListener('keydown',function(e){
  var typing=e.target.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
  if(e.key==='Escape'){po.classList.remove('open');lbClose();['affMod','igMod','prodMod','brandMod','lessonMod'].forEach(function(m){$(m).classList.remove('open')})}
  if($('igMod').classList.contains('open')){if(e.key==='ArrowRight')igShow(igk+1);if(e.key==='ArrowLeft')igShow(igk-1);return}
  if(typing)return;
  if((e.key==='e'||e.key==='E')&&!e.ctrlKey&&!e.metaKey){setEdit(!EDIT);return}
  if(po.classList.contains('open')){if(e.key==='ArrowRight')poGo(poIdx+1);if(e.key==='ArrowLeft')poGo(poIdx-1)}
  else if($('lb').classList.contains('open')){if(e.key==='ArrowRight')lbShow(lbk+1);if(e.key==='ArrowLeft')lbShow(lbk-1)}
});
if(!BASE.length)document.body.insertAdjacentHTML('afterbegin','<p style="padding:14px;background:#fdd;margin:0">data/media.js is missing: run tools/build-media.ps1.</p>');
/* phones: full screen + landscape lock where the browser allows (Android); iPhone Safari ignores both, the turn-sideways screen still guides */
$('goFull').addEventListener('click',function(){var d=document.documentElement,f=d.requestFullscreen||d.webkitRequestFullscreen;
  var lock=function(){try{var p=screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape');if(p&&p.catch)p.catch(function(){})}catch(e){}};
  try{var r=f&&f.call(d);if(r&&r.then)r.then(lock,lock);else lock()}catch(e){lock()}});
(function(){var d=document.documentElement,canFs=!!(d.requestFullscreen||d.webkitRequestFullscreen),skip=false;
  var dev=matchMedia('(pointer:coarse) and (max-width:1366px)'),por=matchMedia('(orientation:portrait)');
  function isFs(){return !!(document.fullscreenElement||document.webkitFullscreenElement)||matchMedia('(display-mode:fullscreen),(display-mode:standalone)').matches||navigator.standalone===true}
  function upd(){var p=por.matches,need=dev.matches&&(p||(canFs&&!skip&&!isFs()));document.body.classList.add('gated');document.body.classList.toggle('gate',need);
    $('rotT').textContent=p?'Turn your phone sideways':'Tap to go full screen';
    $('goFull').textContent=p?'Go full screen':'Enter the site'}
  ['change'].forEach(function(ev){dev.addEventListener&&dev.addEventListener(ev,upd);por.addEventListener&&por.addEventListener(ev,upd)});
  document.addEventListener('fullscreenchange',upd);document.addEventListener('webkitfullscreenchange',upd);window.addEventListener('resize',upd);
  /* if the browser refuses full screen, offer a way in after the first try */
  $('goFull').addEventListener('click',function(){setTimeout(function(){if(!isFs()&&!por.matches)$('goOn').hidden=false;upd()},900)});
  $('goOn').onclick=function(){skip=true;upd()};
  /* welcome lines, one at a time, held long enough to read (about 16 characters a second, never under 3.5s) */
  var WL=['Hi, I’m Chanel, a mobile makeup artist on the Gold Coast. Welcome in.',
    'This is a place to explore looks: natural, glam, bridal, editorial, FX and parties.',
    'Each style has its own gallery. Swipe sideways and the details follow along.',
    'Affiliates are the local artists I trust and work with: hair, nails, brows, lashes and photographers.',
    'Brands and Products show what’s in my kit, and what I actually reach for on clients.',
    'Found a look you love? Tap Pricing or Enquire, and I’ll come to you.'],wi=0,wt=0;
  function wnext(){var el=$('wl');if(!document.body.classList.contains('gate')){wt=setTimeout(wnext,1000);return}
    el.classList.add('out');setTimeout(function(){wi=(wi+1)%WL.length;el.textContent=WL[wi];el.classList.remove('out');
      wt=setTimeout(wnext,Math.max(3500,WL[wi].length*62+1200))},450)}
  wt=setTimeout(wnext,Math.max(3500,WL[0].length*62+1200));
  upd()})();
renderNav();remixAll();buildPricing();go(0);
if(/[?&]edit/.test(location.search))setEdit(true);
})();
