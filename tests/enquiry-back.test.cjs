const {test}=require('node:test'), assert=require('node:assert/strict'), vm=require('node:vm'), fs=require('node:fs');
const html=fs.readFileSync('src/enquire.html','utf8');
test('only the centred visible answer owns the arrow; scrolling, submission and empty regions hide it',()=>{
 const button={dataset:{},style:{},classList:{toggle(_,v){this.visible=v}},setAttribute(){}};
 const bubble=(id,top)=>({dataset:{answer:id},getBoundingClientRect:()=>({top,bottom:top+40,left:150})});
 let bubbles=[bubble('name',50),bubble('date',180),bubble('phone',350)];
 const c={answerReturn:button,answerReturnFrame:0,S:{answers:{name:'A',date:'D',phone:'P'}},msgs:{getBoundingClientRect:()=>({top:0,bottom:400,left:0,height:400}),querySelectorAll:()=>bubbles},activeQs:()=>['name','date','phone'].map(id=>({id})),QUESTIONS:['name','date','phone'].map(id=>({id,label:id}))};
 vm.createContext(c);const start=html.indexOf('function updateAnswerReturn(){'),end=html.indexOf('answerReturn.onclick',start);vm.runInContext(html.slice(start,end),c);
 c.updateAnswerReturn();assert.equal(button.dataset.answer,'date');assert.equal(button.style.opacity,'1');assert.equal(button.tabIndex,0);
 bubbles=[bubble('name',180),bubble('date',350)];c.updateAnswerReturn();assert.equal(button.dataset.answer,'name');
 bubbles=[bubble('name',-30)];c.updateAnswerReturn();assert.equal(button.tabIndex,-1);assert.equal(button.style.opacity,'0');
 bubbles=[bubble('date',180)];c.S.submitting=true;c.updateAnswerReturn();assert.equal(button.dataset.answer,'');
 c.S.submitting=false;c.S.sent=true;c.updateAnswerReturn();assert.equal(button.dataset.answer,'');
});
test('changing service date invalidates ready-by and phone consult but preserves contact and picks',()=>{
 const c={S:{answers:{event_date:'2026-12-12',ready_by:'12:00',consult_at:'2026-12-11T10:00',name:'Client',refs:'added'},submissionId:'old'},msgs:{querySelectorAll:()=>[]},scheduleAnswerReturn(){}};
 vm.createContext(c);vm.runInContext(html.slice(html.indexOf('const DEPENDS ='),html.indexOf('async function goBack')),c);
 c.clearAnswer('event_date');assert.equal(c.S.answers.event_date,undefined);assert.equal(c.S.answers.ready_by,undefined);assert.equal(c.S.answers.consult_at,undefined);assert.equal(c.S.answers.name,'Client');assert.equal(c.S.answers.refs,'added');assert.equal(c.S.submissionId,null);
});
