const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const html=fs.readFileSync('src/enquire.html','utf8'),ctx={};vm.createContext(ctx);
vm.runInContext(html.slice(html.indexOf('const CATS ='),html.indexOf('\n];',html.indexOf('const CATS ='))+3)+html.slice(html.indexOf('const STYLE_PHRASES ='),html.indexOf('/* ---------- QUESTIONS ----------')),ctx);
const find=q=>ctx.searchStyles(q);
test('phrases find canonical styles across booking categories',()=>{for(const [q,sub] of [['soft glam','Soft glam'],['natural wedding makeup','Natural radiant bride'],['smokey eyes','Soft glam'],['clean girl','Clean polished'],['zombie','SFX and prosthetics'],['face painting for children','Kids face paint'],['learn makeup','Makeup lesson']])assert.ok(find(q).some(x=>x.sub===sub),q)});
test('search tolerates case, punctuation and partial words without fabricating results',()=>{assert.ok(find('I would like SOFT GLAM please!').some(x=>x.sub==='Soft glam'));assert.ok(find('glitt').some(x=>x.sub==='Glitter bar and gems'));assert.equal(find('underwater dragon moon').length,0);assert.equal(find('   ').length,0);assert.equal(find('<script>alert(1)</script>').length,0)});
test('every result points to an existing category and style',()=>{for(const q of ['natural','bridal','glam','halloween','glass skin','neon'])for(const m of find(q))assert.ok(vm.runInContext('CATS',ctx).some(c=>c.id===m.category&&(c.subs.includes(m.sub)||c.id==='lesson')))});
test('browse decoration does not re-trigger child mutation on unchanged labels',()=>{const page=fs.readFileSync('src/index.html','utf8'),start=page.indexOf('  function decorate(){'),end=page.indexOf('  function setPicked(',start);let writes=0,label='';const b={set textContent(v){writes++;label=v},get textContent(){return label},classList:{toggle(){}}};const tile={querySelector:q=>q==='img'?{getAttribute:()=>'/image.webp'}:b,classList:{toggle(){}}};const c={pickMode:true,picked:{},document:{querySelectorAll:()=>[tile]}};vm.createContext(c);vm.runInContext(page.slice(start,end),c);for(let i=0;i<100;i++)c.decorate();assert.equal(writes,1);c.picked['/image.webp']=1;c.decorate();assert.equal(label,'✓');assert.equal(writes,2);c.decorate();assert.equal(writes,2)});
test('every configured pricing service prefills a valid booking category, including trial',()=>{ctx.PRICES=JSON.parse(html.match(/const PRICE_FALLBACK = (\{[^\n]+\});/)[1]);const start=html.indexOf('function bookingPrefill(');vm.runInContext(html.slice(start,html.indexOf('const look =',start)),ctx);for(const key of Object.keys(ctx.PRICES.looks)){const selected=ctx.bookingPrefill(key);assert.ok(selected,key);assert.equal(selected.look,key)}assert.equal(ctx.bookingPrefill('trial').category,'bridal');assert.equal(ctx.bookingPrefill('not-a-service'),null);assert.equal(ctx.bookingPrefill('constructor'),null)});

test('pricing and photo overlays close before browsing or opening enquiry',()=>{const page=fs.readFileSync('src/index.html','utf8');let removed=0,bodyCleared=false;const c={document:{querySelectorAll:selector=>{assert.equal(selector,'.po.open,.mod.open,.lb.open');return [{classList:{remove:x=>{assert.equal(x,'open');removed++}}}]},body:{classList:{remove:x=>{assert.equal(x,'pop-open');bodyCleared=true}}}}};vm.createContext(c);const start=page.indexOf('  function releaseSiteOverlays()'),end=page.indexOf('  function open(href)',start);vm.runInContext(page.slice(start,end),c);c.releaseSiteOverlays();assert.equal(removed,1);assert.ok(bodyCleared);assert.ok(page.includes('function startPick(plus,list,target){\n    releaseSiteOverlays();'))});

// Client language and common spelling variants should resolve to real catalogue styles.
test('expanded everyday phrases find the intended styles',()=>{
 const examples = [
 ['Can I get a boho bride style please','Natural radiant bride'],['groomsmen','Groom grooming'],
 ['neutral glam','Soft glam'],['cut crease','Full glam'],['latte','Bronzed coastal glam'],
 ['pin up','Old Hollywood'],['fascinator','Race day glam'],['mother of the groom','Mature skin glam'],
 ['skin tint','No-makeup makeup'],['job interview','Clean polished'],['wide awake','Fresh lift'],
 ['glazed donut','Dewy glass skin'],['golden hour','Sun-kissed bronze'],['over 60','Mature natural'],
 ['fragrance free','Sensitive skin'],['baby shower','Maternity glow'],['cosmetics campaign','Beauty close-up'],
 ['floating liner','Graphic liner'],['high fashion liner','Editorial graphic liner'],['colour pop','Colour block and gloss'],
 ['ombre lips','Lip art'],['avantgarde','Avant-garde'],['album cover','Music video and album art'],
 ['ballet','Stage and theatre'],['fake blood','SFX and prosthetics'],['bodyart','Body paint'],
 ['comiccon','Cosplay recreation'],['hallowen','Halloween character'],['masquerade','Fancy dress'],
 ['blacklight','UV neon'],['face gems','Glitter bar and gems'],['unicorn','Kids face paint'],
 ['cheek art','Express designs'],['bunny nose','Easter'],['new years','Christmas and New Year'],
 ['valentines','Holiday specials'],['own kit','Makeup lesson']
 ];
 for(const [query,style] of examples) assert.ok(find(query).some(x=>x.sub===style),query+' → '+style);
});
