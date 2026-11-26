const {test}=require('node:test'),assert=require('node:assert/strict');
const {canonical,gesture}=require('../src/data/image-review.js');
function fixture(){let next=0;const timers=new Map(),calls=[];const clock={set:fn=>{timers.set(++next,fn);return next;},clear:id=>timers.delete(id)};return {g:gesture(x=>calls.push(x),clock),calls,fire:()=>{const queued=[...timers.values()];timers.clear();queued.forEach(fn=>fn());}}}
const event={pointerId:1,clientX:20,clientY:40,button:0};
test('thumbnail and full-size URLs identify the same media',()=>{assert.equal(canonical('https://qxiugfatpybldluipcyy.supabase.co/storage/v1/object/public/media/gallery/bridal/a-800.webp?x=1'),'gallery/bridal/a.webp');assert.equal(canonical('images/inspiration/a.m.webp'),'images/inspiration/a.webp');assert.equal(canonical('images/inspiration/a.webp'),'images/inspiration/a.webp');assert.equal(canonical('javascript:alert(1)'),'')});
test('a stationary hold flags once',()=>{const f=fixture();f.g.start(event,'image');f.fire();f.fire();assert.deepEqual(f.calls,['image'])});
test('normal taps and cancelled pointers never flag',()=>{const f=fixture();f.g.start(event,'image');f.g.end();f.fire();assert.deepEqual(f.calls,[])});
test('swiping or a second pointer cancels the pending flag',()=>{for(const move of [{...event,clientX:40},{...event,pointerId:2}]){const f=fixture();f.g.start(event,'image');f.g.move(move);f.fire();assert.deepEqual(f.calls,[])}});
test('right-click and small movements do not cause accidental flags',()=>{const f=fixture();f.g.start({...event,button:2},'wrong');f.fire();assert.deepEqual(f.calls,[]);f.g.start(event,'image');f.g.move({...event,clientX:24});f.fire();assert.deepEqual(f.calls,['image'])});
