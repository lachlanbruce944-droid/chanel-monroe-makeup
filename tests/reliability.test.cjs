const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const html=fs.readFileSync('src/enquire.html','utf8');
const fn=(name,end)=>html.slice(html.indexOf(name),html.indexOf(end,html.indexOf(name)));
function run(source,ctx={}){vm.createContext(ctx);vm.runInContext(source,ctx);return ctx}
test('every inline script parses, including refresh controls',()=>{const clean=html.replace(/<!--[\s\S]*?-->/g,'');for(const m of clean.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);});
test('Australian mobile and explicit international formats reject short placeholders',()=>{const c=run(fn('function validPhone(','function makeupStart'));for(const v of ['0491570006','+61 491 570 006','61491570006','+447700900123'])assert.equal(c.validPhone(v),true,v);for(const v of ['12345678','1234567890','abcdef','+11111111111','+614123'])assert.equal(c.validPhone(v),false,v)});
test('makeup timing uses selected CRM duration and Brisbane offset',()=>{const S={answers:{event_date:'2027-01-15',ready_by:'07:30'},timing:{duration_mins:270}};const c=run(fn('function appointmentMinutes()','function validPhone')+fn('function makeupStart()','function renderAppointmentCalendar'),{S,startMode:()=>false});assert.equal(c.makeupStart(),'2027-01-14T17:00:00.000Z');});
test('slot rejection restores reset and opens the affected calendar',async()=>{const reset={disabled:false},btn={disabled:false,textContent:''};let edited;const S={sent:false,answers:{},selfie:null};const c=run(fn('async function submit()','async function notifyEnquiry()'),{S,QUESTIONS:[{id:'consult_at',validate:()=>true}],val:()=>'',document:{querySelectorAll:()=>[],querySelector:()=>null},$:id=>id==='#resetChat'?reset:btn,buildRow:()=>({}),saveToSupabase:async()=>{throw Error('ENQUIRY_MAKEUP_SLOT_UNAVAILABLE')},editAnswer:async id=>edited=id,toast:()=>{}});await c.submit();assert.equal(reset.disabled,false);assert.equal(S.submitting,false);assert.equal(edited,'event_date')});
test('draft saves answers and picks in tab storage and expires safely',()=>{let saved;const S={answers:{name:'Test'},refs:[{src:'a.webp'}],affs:[{h:'artist'}],timing:{duration_mins:90},history:['name']};const storage={setItem:(k,v)=>saved=JSON.parse(v),removeItem:()=>saved=null};const c=run(fn("const DRAFT_KEY=",'/* ---------- after sending:'),{S,sessionStorage:storage,Date,addEventListener:()=>{}});c.saveDraft();assert.equal(saved.answers.name,'Test');assert.equal(saved.refs[0].src,'a.webp');assert.equal(saved.affs[0].h,'artist');S.sent=true;c.saveDraft();c.clearDraft();assert.equal(saved,null)});
test('notification HTTP failure is distinct from enquiry saving',async()=>{let shown;const S={enquiryId:'test',sent:true};const c=run(fn('async function notifyEnquiry()','function notificationCard'),{S,CONFIG:{supabaseUrl:'https://example.com'},AbortSignal,fetch:async()=>({ok:false,json:async()=>({ok:false})}),saveSent:()=>({id:S.enquiryId,notificationState:S.notificationState}),showSent:r=>shown=r});await c.notifyEnquiry();assert.equal(S.notificationState,'failed');assert.equal(shown.notificationState,'failed');assert.equal(S.enquiryId,'test')});
test('failed old selfie upload cannot overwrite replacement photo path',async()=>{let finish;const fetch=()=>new Promise(r=>finish=r);const old={id:'old',blob:'old'},fresh={id:'new',blob:'new',path:'new.jpg'},S={selfie:old};const c=run(fn('async function uploadSelfie(','async function takeSelfie'),{S,liveMode:()=>true,CONFIG:{supabaseUrl:'https://example.com',supabaseAnonKey:'sb_test'},fetch,saveDraft(){}});const pending=c.uploadSelfie(old);S.selfie=fresh;finish({ok:true});await pending;assert.equal(old.path,'old.jpg');assert.equal(S.selfie.path,'new.jpg');});

test('live enquiry clears legacy persistent recaps without writing fresh contact details', () => {
  let removed;
  const c = run(fn('const SENT_KEY', 'function showSent'), {
    localStorage: {removeItem: key => removed = key, setItem: () => assert.fail('recap persisted')},
    S: {answers: {name: 'Synthetic Client'}, refs: [], affs: [], enquiryId: 'synthetic'},
    val: () => null, estimate: () => null, activeQs: () => []
  });
  assert.equal(c.sentRecord(), null);
  assert.equal(removed, 'cmm-enquiry-sent');
  assert.equal(c.saveSent().id, 'synthetic');
});
