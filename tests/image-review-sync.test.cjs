const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const script=fs.readFileSync('src/data/image-review.js','utf8');
const FLAG='cm-image-removal-flags-v1',SYNC='cm-image-removal-sync-v1';
function setup(fetch,stored=new Map()){
 const events={},online={},timers=[];
 class Element{
  constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.classList={toggle(){}};this.value='';}
  appendChild(c){this.children.push(c);return c} replaceChildren(){this.children=[]} setAttribute(){} addEventListener(){} showModal(){this.open=true} close(){this.open=false}
  querySelector(){return this.all().find(x=>x.dataset.syncStatus)} all(){return this.children.flatMap(c=>[c,...c.all()])}
 }
 const document={head:new Element('head'),body:new Element('body'),createElement:t=>new Element(t),querySelectorAll:()=>[],addEventListener:(name,fn)=>events[name]=fn};
 const window={localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)},addEventListener:(name,fn)=>online[name]=fn};
 let n=0;vm.runInNewContext(script,{document,window,fetch,crypto:{randomUUID:()=>`00000000-0000-4000-8000-${String(++n).padStart(12,'0')}`},URL,URLSearchParams,location:{search:''},setTimeout:fn=>{timers.push(fn);return timers.length},clearTimeout(){},AbortSignal,MutationObserver:class{observe(){}},requestAnimationFrame(){}});
 const dialog=document.body.children.find(c=>c.id==='cm-review-dialog');
 return {stored,online,dialog,events,timers,button:text=>dialog.all().find(c=>c.tag==='button'&&c.textContent===text),hold(){const img={src:'https://example.com/images/chanel/test.webp',alt:'Test About photo',closest:()=>true};events.pointerdown({target:{closest:()=>img},pointerId:1,clientX:10,clientY:10,button:0});timers.pop()();}};
}
const settle=()=>new Promise(r=>setImmediate(r));
test('About hold confirms before submitting; saves flag and undo in order',async()=>{
 const sent=[];const c=setup(async(url,opts)=>{assert.match(url,/image_removal_events$/);sent.push(JSON.parse(opts.body));return {ok:true}});
 c.hold();assert.equal(sent.length,0);c.button('Save removal request').onclick();await settle();
 assert.equal(sent.length,1);assert.equal(sent[0].section,'about');assert.equal(sent[0].action,'flag');assert.equal(JSON.parse(c.stored.get(SYNC)).pending.length,0);
 c.button('Undo flag').onclick();await settle();assert.equal(sent[1].action,'undo');assert.equal(sent[1].source,sent[0].source);assert.equal(JSON.parse(c.stored.get(FLAG)).length,0);
});
test('offline flag stays queued; online retry reuses its id and reload does not duplicate it',async()=>{
 const sent=[];let ok=false;const fetch=async(_,opts)=>{sent.push(JSON.parse(opts.body));return {ok}};
 const c=setup(fetch);c.hold();c.button('Save removal request').onclick();await settle();
 assert.equal(JSON.parse(c.stored.get(SYNC)).pending.length,1);assert.match(c.dialog.querySelector().textContent,/pending/);
 ok=true;await c.online.online();assert.equal(sent[0].id,sent[1].id);assert.equal(JSON.parse(c.stored.get(SYNC)).pending.length,0);
 setup(fetch,c.stored);await settle();assert.equal(sent.length,2);
});
test('legacy local About flags migrate once with references intact',async()=>{
 const stored=new Map([[FLAG,JSON.stringify([{source:'images/chanel/old.webp',url:'https://example.com/images/chanel/old.webp',reason:'Remove selfie'}])]]),sent=[];
 setup(async(_,opts)=>{sent.push(JSON.parse(opts.body));return {ok:true}},stored);await settle();
 assert.equal(sent.length,1);assert.equal(sent[0].section,'about');assert.equal(sent[0].details.reason,'Remove selfie');
});

test('mobile caption hold opens the photo prompt and consumes the following click',()=>{
 const c=setup(async()=>({ok:true}));
 const img={src:'https://example.com/images/chanel/mobile.webp',alt:'Mobile About photo',closest:()=>true};
 const surface={querySelector:()=>img};
 const caption={closest:selector=>selector.includes('.tile img')?null:surface};
 c.events.pointerdown({target:caption,pointerId:7,pointerType:'touch',clientX:30,clientY:50,button:0});
 c.timers.pop()();
 assert.equal(c.dialog.open,true);
 assert.ok(c.button('Save removal request'));
 let prevented=false,stopped=false;
 c.events.click({target:caption,preventDefault(){prevented=true},stopImmediatePropagation(){stopped=true}});
 assert.equal(prevented,true);assert.equal(stopped,true);
});
