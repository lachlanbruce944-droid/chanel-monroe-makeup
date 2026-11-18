/* Brisbane consultation picker: slots contain availability only, never client records. */
(function(root){
 const zone='Australia/Brisbane',pad=n=>String(n).padStart(2,'0');
 const localNow=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const monthOf=d=>d.slice(0,7), shift=(month,n)=>{const d=new Date(month+'-01T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+n);return d.toISOString().slice(0,7)};
 const label=t=>{const h=+t.slice(11,13);return `${h%12||12}:00 ${h<12?'am':'pm'}`};
 function valid(value,eventAt,now=Date.now()){
  if(!/^\d{4}-\d{2}-\d{2}T(09|1[0-6]):00$/.test(value))return 'Choose a time on the hour between 9:00 am and 4:00 pm Brisbane time';
  const at=+new Date(value+':00+10:00');
  if(!Number.isFinite(at)||at<=now)return 'Choose a future consultation time';
  if(new Date(at+10*3600000).toISOString().slice(0,16)!==value)return 'Choose a valid date';
  if(eventAt&&at+15*60000>=+new Date(eventAt))return 'Your phone consultation must finish before your makeup appointment';
  return true;
 }
 async function fetchSlots(config,month,signal){
  const r=await fetch(config.supabaseUrl+'/rest/v1/rpc/consultation_availability',{method:'POST',signal,headers:{apikey:config.supabaseAnonKey,'Content-Type':'application/json',...(/^sb_/.test(config.supabaseAnonKey)?{}:{Authorization:'Bearer '+config.supabaseAnonKey})},body:JSON.stringify({p_month:month+'-01'})});
  if(!r.ok)throw Error('Could not check calendar availability. Please retry.');
  const rows=await r.json();if(!Array.isArray(rows))throw Error('Calendar availability is unavailable. Please retry.');
  return rows.filter(x=>typeof x.local_start==='string'&&typeof x.available==='boolean');
 }
 function mount(host,options){
  const today=localNow(),lastMonth=monthOf(new Date(Date.now()+365*86400000).toLocaleDateString('sv-SE',{timeZone:zone}));
  let month=monthOf(/^\d{4}-\d{2}-\d{2}T/.test(options.initial||'')?options.initial:today),day='',selected='',rows=[],loading=false,error='',seq=0,controller;
  if(month<monthOf(today))month=monthOf(today);
  host.classList.add('consult-picker');host.dataset.layout=options.layout||'tiles';
  function button(text,cls,fn,disabled=false){const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=text;b.disabled=disabled;b.onclick=fn;return b}
  function draw(){
   host.replaceChildren();host.setAttribute('aria-busy',String(loading));
   const top=document.createElement('div');top.className='cp-head';
   const title=document.createElement('strong');title.textContent=new Date(month+'-01T12:00Z').toLocaleDateString('en-AU',{month:'long',year:'numeric',timeZone:zone});
   const prev=button('‹','cp-nav',()=>load(shift(month,-1)),loading||month<=monthOf(today));prev.setAttribute('aria-label','Previous month');
   const next=button('›','cp-nav',()=>load(shift(month,1)),loading||month>=lastMonth);next.setAttribute('aria-label','Next month');top.append(prev,title,next);
   const intro=document.createElement('p');intro.className='cp-info';intro.textContent='1. Choose a day · 2. Choose a time';
   const body=document.createElement('div');body.className='cp-body';const calendar=document.createElement('div');calendar.className='cp-month';
   const week=document.createElement('div');week.className='cp-week';['M','T','W','T','F','S','S'].forEach((x,i)=>{const el=document.createElement('span');el.textContent=x;el.title=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][i];week.append(el)});
   const grid=document.createElement('div');grid.className='cp-grid';grid.setAttribute('role','group');grid.setAttribute('aria-label','Choose consultation day');
   const first=new Date(month+'-01T12:00Z'),offset=(first.getUTCDay()+6)%7,count=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
   for(let i=0;i<offset;i++){const blank=document.createElement('span');blank.className='cp-blank';grid.append(blank)}
   for(let n=1;n<=count;n++){
    const date=month+'-'+pad(n),available=rows.filter(s=>s.local_start.startsWith(date)&&s.available&&valid(s.local_start,options.eventAt)===true).length;
    const b=button(String(n),'cp-day'+(date===day?' is-selected':'')+(date===today?' is-today':''),()=>{day=date;selected='';draw()},loading||!!error||!available);
    b.setAttribute('aria-label',new Date(date+'T12:00Z').toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'})+(available?`, ${available} available times`:', unavailable'));b.setAttribute('aria-pressed',String(date===day));
    if(available){const dot=document.createElement('i');dot.setAttribute('aria-hidden','true');b.append(dot)}grid.append(b);
   }
   calendar.append(week,grid);const times=document.createElement('section');times.className='cp-times';const heading=document.createElement('strong');heading.textContent=day?new Date(day+'T12:00Z').toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'}):'Choose a day above';times.append(heading);
   if(day){const slots=document.createElement('div');slots.className='cp-slots';for(let h=9;h<17;h++){
    const value=day+'T'+pad(h)+':00',slot=rows.find(s=>s.local_start===value),ok=slot?.available===true&&valid(value,options.eventAt)===true;
    const b=button(label(value),'cp-slot'+(value===selected?' is-selected':''),()=>{selected=value;draw()},!ok||loading||!!error);b.setAttribute('aria-pressed',String(value===selected));b.setAttribute('aria-label',label(value)+(ok?'':', unavailable'));slots.append(b);
   }times.append(slots)}
   const status=document.createElement('p');status.className='cp-status';status.setAttribute('role','status');status.textContent=loading?'Checking CRM availability…':error||(!rows.some(s=>s.available&&valid(s.local_start,options.eventAt)===true)?'No available times this month. Try another month.':selected?`${label(selected)} · Brisbane time`:'Unavailable days and times are greyed out.');
   if(error)status.append(button('Retry','cp-retry',()=>load(month)));
   const note=document.createElement('p');note.className='cp-note';note.textContent='Mon–Sun · 9 am–5 pm AEST · Free 15-minute call. Hourly start times. Your request needs Chanel’s approval.';
   if(selected&&options.eventAt&&+new Date(options.eventAt)-+new Date(selected+':00+10:00')<3*86400000)note.textContent+=' Short notice: Chanel must approve an exception.';
   const confirm=button(selected?'Request '+label(selected):'Select a time','cp-confirm',async()=>{confirm.disabled=true;try{const fresh=await options.fetchSlots(month);if(!host.isConnected)return;if(!fresh.some(x=>x.local_start===selected&&x.available)&&!options.demo)throw Error('That time has just become unavailable. Please choose another.');await options.onSelect(selected);if(options.demo)confirm.disabled=false}catch(e){error=e.message;selected='';rows=[];draw()}},!selected||loading||!!error);
   body.append(calendar,times);host.append(intro,top,body,status,confirm,note);
  }
  async function load(value){month=value;day='';selected='';rows=[];error='';loading=true;controller?.abort();controller=new AbortController();const token=++seq;draw();try{const data=await options.fetchSlots(month,controller.signal);if(token!==seq||!host.isConnected)return;rows=data;loading=false;draw()}catch(e){if(token!==seq||e.name==='AbortError')return;loading=false;error=e.message;draw()}}
  load(month);return {refresh:()=>load(month),destroy:()=>{seq++;controller?.abort()}};
 }
 root.ConsultationCalendar={mount,fetchSlots,valid,localNow,shift,label};
})(typeof window==='undefined'?globalThis:window);
