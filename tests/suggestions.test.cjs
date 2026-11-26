const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('src/suggestions.html','utf8');
function setup(fetch){
  let submit;
  const form={elements:{category:{value:'navigation'},message:{value:'Please make the gallery easier to find.'},website:{value:''}},reportValidity:()=>true,reset(){this.resetCalled=true},addEventListener(_,fn){submit=fn}};
  const button={},status={dataset:{}};
  const document={getElementById:id=>({suggestionForm:form,sendSuggestion:button,status})[id]};
  vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],{document,fetch,AbortSignal});
  return {form,button,status,submit:()=>submit({preventDefault(){}})};
}
test('successful submission saves category and trimmed message without personal data',async()=>{
  let payload;
  const c=setup(async(url,opts)=>{assert.match(url,/rest\/v1\/website_suggestions$/);payload=JSON.parse(opts.body);return {ok:true}});
  await c.submit();assert.deepEqual(payload,{category:'navigation',message:'Please make the gallery easier to find.',source:'mobile_navigation'});assert.equal(c.form.resetCalled,true);assert.match(c.status.textContent,/saved/);assert.equal(c.button.disabled,false);
});
test('server failure preserves input and permits retry',async()=>{
  const c=setup(async()=>({ok:false}));await c.submit();assert.equal(c.form.resetCalled,undefined);assert.equal(c.status.dataset.error,'1');assert.equal(c.button.disabled,false);
});
test('duplicate clicks, blank suggestions and honeypot do not send extra requests',async()=>{
  let count=0,finish;const c=setup(()=>{count++;return new Promise(r=>finish=r)});
  const first=c.submit();await c.submit();assert.equal(count,1);finish({ok:true});await first;
  c.form.elements.message.value='          ';await c.submit();assert.equal(count,1);
  c.form.elements.message.value='A longer suggestion';c.form.elements.website.value='spam';await c.submit();assert.equal(count,1);
});
