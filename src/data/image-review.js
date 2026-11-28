/* Persistent editorial removal requests; never deletes live media automatically. */
(function(root){
 'use strict';
 const KEY='cm-image-removal-flags-v1';
 function canonical(src){
  try { const u=new URL(src,'https://chanelmonroe.info/');if(!['http:','https:'].includes(u.protocol))return '';return decodeURIComponent(u.pathname).replace(/^.*\/storage\/v1\/object\/public\/media\//,'').replace(/^\//,'').replace(/(?:\.m|-800)\.webp$/i,'.webp'); } catch(_){return '';}
 }
 function gesture(onHold,clock={set:setTimeout,clear:clearTimeout}){
  let pending=null;
  function cancel(){if(pending)clock.clear(pending.timer);pending=null;}
  return {start(e,item){cancel();if(e.button!==undefined&&e.button!==0)return;pending={id:e.pointerId,x:e.clientX,y:e.clientY,timer:clock.set(()=>{pending=null;onHold(item);},700)};},move(e){if(pending&&(e.pointerId!==pending.id||Math.hypot(e.clientX-pending.x,e.clientY-pending.y)>12))cancel();},end:cancel};
 }
 if(typeof module==='object'&&module.exports){module.exports={canonical,gesture};return;}
 const SELECTOR='.tile img,#lbMedia img,#igBox .ph img,#agrid .cell img,.about-hero .me img';
 let storage;
 try{storage=root.localStorage;}catch(_){}
 let flags=[];
 try{const saved=JSON.parse(storage.getItem(KEY)||'[]');if(Array.isArray(saved))flags=saved.filter(f=>f&&typeof f.source==='string'&&canonical(f.source)&&typeof f.url==='string'&&/^https?:/.test(f.url)).slice(0,2000);}catch(_){}
 const SYNC_KEY='cm-image-removal-sync-v1';
 let sync={device:crypto.randomUUID(),pending:[]},syncing=false,syncMessage='';
 try{const saved=JSON.parse(storage.getItem(SYNC_KEY)||'null');if(saved?.device&&Array.isArray(saved.pending))sync=saved;}catch(_){}
 function persistSync(){try{storage.setItem(SYNC_KEY,JSON.stringify(sync));return true;}catch(_){return false;}}
 function enqueue(item,action){
  const event={id:crypto.randomUUID(),device_id:sync.device,action,source:item.source,section:item.section||'gallery',details:item};
  sync.pending.push(event);if(!persistSync()){sync.pending.pop();node('p','Could not save the request on this device. Please free browser storage and retry.',dialog);return false;}return true;
 }
 async function flush(){
  if(syncing||!sync.pending.length)return;syncing=true;syncMessage='Saving to database…';syncStatus();
  try{while(sync.pending.length){
   const response=await fetch('https://qxiugfatpybldluipcyy.supabase.co/rest/v1/image_removal_events',{method:'POST',headers:{apikey:'sb_publishable_sGLIpIxvos66FLVI9vPSbg_qXsTT6rt','Content-Type':'application/json',Prefer:'return=minimal,resolution=ignore-duplicates'},body:JSON.stringify(sync.pending[0]),signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw new Error('Not saved');sync.pending.shift();persistSync();
  }syncMessage='Saved to database. You can ask ChatGPT to remove the flagged photos.';
  }catch(_){syncMessage='Saved on this device; database sync pending. Keep this browser data and retry when online.';}
  finally{syncing=false;syncStatus();}
 }
 function syncStatus(){const el=dialog.querySelector('[data-sync-status]');if(el)el.textContent=sync.pending.length?(syncMessage||'Database sync pending'):syncMessage;}
 function change(next,item,action){
  if(!enqueue(item,action))return false;if(action==='flag')item.cloudQueued=true;
  if(!save(next)){sync.pending.pop();persistSync();return false;}
  flush();return true;
 }
 let blockedUntil=0,activePointer=null;
 const style=document.createElement('style');style.textContent=`${SELECTOR}{-webkit-touch-callout:none}.cm-removal-flag{outline:4px solid #ae463e!important;outline-offset:-4px;filter:opacity(.65)}#cm-review-open{position:fixed;bottom:max(16px,env(safe-area-inset-bottom));left:16px;z-index:4500;border:0;border-radius:24px;padding:12px 18px;background:#3a2622;color:#fff;font:500 14px system-ui;box-shadow:0 4px 18px #0003}#cm-review-dialog{position:fixed;inset:0;margin:auto;width:min(540px,94vw);max-height:85svh;overflow:auto;padding:24px;background:#fbf3ee;color:#3a2622;border:0;border-radius:20px;font:16px/1.5 system-ui;z-index:6000}#cm-review-dialog::backdrop{background:#20120bb3}#cm-review-dialog h2{font:28px Georgia,serif;margin:0 0 14px}#cm-review-dialog img{max-width:100%;max-height:32svh;object-fit:contain;border-radius:10px}#cm-review-dialog button{font:inherit;border:0;border-radius:10px;padding:10px 16px;background:#ead8cc;color:#3a2622;cursor:pointer}#cm-review-dialog .primary{background:#3a2622;color:#fff}#cm-review-dialog .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}#cm-review-dialog input{display:block;width:100%;padding:12px;font:inherit;border:1px solid #cbb6aa;border-radius:8px}#cm-review-dialog li{margin:18px 0;overflow-wrap:anywhere}#cm-review-dialog button:focus-visible,#cm-review-open:focus-visible{outline:3px solid #ae463e;outline-offset:3px}`;
 document.head.appendChild(style);
 const launcher=document.createElement('button');launcher.id='cm-review-open';launcher.type='button';launcher.onclick=review;document.body.appendChild(launcher);
 const dialog=document.createElement('dialog');dialog.id='cm-review-dialog';document.body.appendChild(dialog);
 dialog.addEventListener('close',()=>{if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});});
 dialog.addEventListener('keydown',e=>e.stopPropagation());
 let lastFocus=null;
 function node(tag,text,parent){const el=document.createElement(tag);if(text)el.textContent=text;if(parent)parent.appendChild(el);return el;}
 function button(text,fn,parent,primary){const b=node('button',text,parent);b.type='button';if(primary)b.className='primary';b.onclick=fn;return b;}
 function show(title){if(!dialog.open)lastFocus=document.activeElement;dialog.replaceChildren();node('h2',title,dialog);if(!dialog.open)dialog.showModal();}
 function save(next){try{storage.setItem(KEY,JSON.stringify(next));flags=next;paint();return true;}catch(_){node('p','Could not save flags on this device. Free some browser storage and try again.',dialog);return false;}}
 function paint(){const title='Flagged images ('+flags.length+')';if(launcher.textContent!==title)launcher.textContent=title;launcher.hidden=!flags.length&&!new URLSearchParams(location.search).has('review');document.querySelectorAll(SELECTOR).forEach(img=>img.classList.toggle('cm-removal-flag',flags.some(f=>f.source===canonical(img.currentSrc||img.src))));}
 function inspect(img){
  const url=img.currentSrc||img.src,source=canonical(url);if(!source)return;
  const item=(root.MEDIA||[]).find(m=>canonical(m.src)===source)||{};
  show(flags.some(f=>f.source===source)?'Image already flagged':'Flag image for removal?');
  const preview=node('img','',dialog);preview.src=url;preview.alt=img.alt||'Selected image';
  node('p','Save this photo for removal review. It stays live until you ask ChatGPT to remove the flagged photos.',dialog);
  const label=node('label','Reason (optional)',dialog),reason=node('input','',label);reason.maxLength=500;reason.placeholder='e.g. Wrong category, selfie or irrelevant image';
  const actions=node('div','',dialog);actions.className='actions';button('Cancel',()=>dialog.close(),actions);
  const existing=flags.some(f=>f.source===source);
  button(existing?'Undo flag':'Save removal request',()=>{
   const next=existing?flags.filter(f=>f.source!==source):flags.concat({source,url,description:img.alt||'',section:img.closest('.about-hero,#agrid,#igBox')?'about':'gallery',category:item.g||'',style:item.s||'',credit:item.by||'',post:item.post||'',reason:reason.value.trim(),flaggedAt:new Date().toISOString()});
   if(change(next,existing?flags.find(f=>f.source===source):next[next.length-1],existing?'undo':'flag'))review();
  },actions,true);
 }
 function review(){
  show('Flagged images ('+flags.length+')');node('p','Ask ChatGPT: “Remove the flagged About photos.” Saved requests include the photo reference and your reason. Undo cancels your request.',dialog);const status=node('p','',dialog);status.dataset.syncStatus='1';status.setAttribute('role','status');syncStatus();
  const list=node('ul','',dialog);
  flags.forEach(f=>{const li=node('li','',list);const img=node('img','',li);img.src=f.url;img.alt=f.description||'Flagged image';node('p',f.description||f.source,li);if(f.reason)node('p',f.reason,li);button('Undo flag',()=>{if(change(flags.filter(x=>x.source!==f.source),f,'undo'))review();},li);});
  const actions=node('div','',dialog);actions.className='actions';button('Close',()=>dialog.close(),actions);if(sync.pending.length)button('Retry database sync',flush,actions,true);if(flags.length)button('Export removal list',exportFlags,actions);
 }
 function exportFlags(){
  const text='/* Images flagged for removal from Chanel Monroe Makeup. Review before applying. */\nwindow.SITE_REMOVAL_FLAGS = '+JSON.stringify(flags,null,2).replace(/</g,'\\u003c')+';\n';
  const url=URL.createObjectURL(new Blob([text],{type:'text/javascript'})),a=document.createElement('a');a.href=url;a.download='chanel-image-removal-flags.js';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 const hold=gesture(img=>{blockedUntil=Date.now()+1200;inspect(img);});
 document.addEventListener('pointerdown',e=>{hold.end();if(dialog.open||e.isPrimary===false)return;const img=e.target.closest?.(SELECTOR);if(!img)return;activePointer=e.pointerId;hold.start(e,img);},true);
 document.addEventListener('pointermove',e=>hold.move(e),{capture:true,passive:true});
 ['pointerup','pointercancel','lostpointercapture'].forEach(type=>document.addEventListener(type,e=>{if(e.pointerId===activePointer){if(dialog.open)blockedUntil=Date.now()+650;hold.end();activePointer=null;}},true));
 document.addEventListener('scroll',hold.end,{capture:true,passive:true});root.addEventListener('blur',hold.end);
 document.addEventListener('click',e=>{if(Date.now()<blockedUntil&&e.target.closest?.(SELECTOR)){e.preventDefault();e.stopImmediatePropagation();}},true);
 document.addEventListener('contextmenu',e=>{if(e.target.closest?.(SELECTOR))e.preventDefault();},true);
 document.addEventListener('dragstart',e=>{if(e.target.closest?.(SELECTOR))e.preventDefault();},true);
 let paintQueued=false;new MutationObserver(()=>{if(!paintQueued){paintQueued=true;requestAnimationFrame(()=>{paintQueued=false;paint();});}}).observe(document.body,{childList:true,subtree:true});
 root.addEventListener('online',flush);
 // Existing local flags join the durable review queue once, retaining export fallback.
 flags.forEach(f=>{if(!f.cloudQueued){f.section=f.section||(/chanel|about/.test(f.source)?'about':'gallery');if(enqueue(f,'flag'))f.cloudQueued=true;}});
 save(flags);flush();
})(typeof window==='object'?window:globalThis);
