(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`modulepreload`,t=function(e){return`/work-to-parents/`+e},n={},r=function(r,i,a){let o=Promise.resolve();if(i&&i.length>0){let r=document.getElementsByTagName(`link`),s=document.querySelector(`meta[property=csp-nonce]`),c=s?.nonce||s?.getAttribute(`nonce`);function l(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function u(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}o=l(i.map(i=>{if(i=t(i,a),i=u(i),i in n)return;n[i]=!0;let o=i.endsWith(`.css`);for(let e=r.length-1;e>=0;e--){let t=r[e];if(t.href===i&&(!o||t.rel===`stylesheet`))return}let s=document.createElement(`link`);if(s.rel=o?`stylesheet`:e,o||(s.as=`script`),s.crossOrigin=``,s.href=i,c&&s.setAttribute(`nonce`,c),document.head.appendChild(s),o)return new Promise((e,t)=>{s.addEventListener(`load`,e),s.addEventListener(`error`,()=>t(Error(`Unable to preload CSS for ${i}`)))})}))}function s(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return o.then(e=>{for(let t of e||[])t.status===`rejected`&&s(t.reason);return r().catch(s)})},i=`true`,a=`false`,o=i===`true`,s=a===`true`;function c(e={}){let{immediate:t=!1,onNeedReload:n,onNeedRefresh:i,onOfflineReady:a,onRegistered:c,onRegisteredSW:l,onRegisterError:u}=e,d,f,p,m=async(e=!0)=>{await f,o||p?.()};async function h(){if(`serviceWorker`in navigator){if(d=await r(async()=>{let{Workbox:e}=await import(`./workbox-window.prod.es5-Bd17z0YL.js`);return{Workbox:e}},[]).then(({Workbox:e})=>new e(`/work-to-parents/sw.js`,{scope:`/work-to-parents/`,type:`classic`})).catch(e=>{u?.(e)}),!d)return;if(p=()=>{d?.messageSkipWaiting()},!s){if(o)d.addEventListener(`activated`,e=>{(e.isUpdate||e.isExternal)&&(n?n():window.location.reload())}),d.addEventListener(`installed`,e=>{e.isUpdate||a?.()});else{let e=!1,t=()=>{e=!0,d?.addEventListener(`controlling`,e=>{e.isUpdate&&(n?n():window.location.reload())}),i?.()};d.addEventListener(`installed`,n=>{n.isUpdate===void 0?n.isExternal===void 0?!e&&a?.():n.isExternal?t():!e&&a?.():n.isUpdate||a?.()}),d.addEventListener(`waiting`,t)}}d.register({immediate:t}).then(e=>{l?l(`/work-to-parents/sw.js`,e):c?.(e)}).catch(e=>{u?.(e)})}}return f=h(),m}function l(){return{url:`https://kfptchtfvapkoeizewlu.supabase.co`.replace(/\/$/,``),key:`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRjaHRmdmFwa29laXpld2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTEzODIsImV4cCI6MjEwNDA2NzM4Mn0.4rEqOCO0uR2PlPPptDRxCfqiC8VwSoUTjvXrlh8wviE`}}function u(){let{url:e,key:t}=l();return!!(e&&t)}function d(e={}){let{key:t}=l();return{apikey:t,Authorization:`Bearer ${t}`,...e}}function f(e){let{url:t}=l();return`${t}/storage/v1/object/public/class-photos/${e}`}async function p(){let{url:e}=l(),t;try{t=await fetch(`${e}/rest/v1/wall_config?id=eq.1&select=pin_hash`,{headers:d({Accept:`application/json`})})}catch(e){throw e instanceof TypeError?Error(`Could not reach photo cloud. Clear Safari cache for this site or reopen the link (old app used a broken address).`):e}if(!t.ok){let e=await t.text();throw Error(`Could not load class PIN (${t.status}): ${e.slice(0,160)}`)}return(await t.json())[0]?.pin_hash??null}async function m(e){let{url:t}=l(),n=await fetch(`${t}/rest/v1/wall_config`,{method:`POST`,headers:d({"Content-Type":`application/json`,Prefer:`resolution=merge-duplicates,return=minimal`}),body:JSON.stringify({id:1,pin_hash:e,updated_at:new Date().toISOString()})});if(!n.ok){let e=await n.text();throw Error(`Could not save class PIN (${n.status}): ${e.slice(0,160)}`)}}async function h(){let{url:e}=l(),t;try{t=await fetch(`${e}/rest/v1/photos?select=id,caption,created_at,storage_path&order=created_at.desc`,{headers:d({Accept:`application/json`})})}catch(e){throw e instanceof TypeError?Error(`Could not reach photo cloud. Clear Safari cache for this site or reopen the link (old app used a broken address).`):e}if(!t.ok){let e=await t.text();throw Error(`Could not load gallery (${t.status}): ${e.slice(0,160)}`)}return(await t.json()).map(e=>({id:e.id,caption:e.caption??``,createdAt:e.created_at,path:e.storage_path,url:f(e.storage_path)}))}async function g(e,t,n){let{url:r}=l(),i=crypto.randomUUID(),a=n.split(`.`).pop()?.toLowerCase()||(e.type.includes(`png`)?`png`:`jpg`),o=`${i}.${a}`,s=e.type||(a===`png`?`image/png`:`image/jpeg`),c=await fetch(`${r}/storage/v1/object/class-photos/${o}`,{method:`POST`,headers:d({"Content-Type":s,"x-upsert":`false`}),body:e});if(!c.ok){let e=await c.text();throw Error(`Upload failed (${c.status}): ${e.slice(0,160)}`)}let u=new Date().toISOString(),p=await fetch(`${r}/rest/v1/photos`,{method:`POST`,headers:d({"Content-Type":`application/json`,Prefer:`return=representation`}),body:JSON.stringify({id:i,caption:t,storage_path:o,created_at:u})});if(!p.ok){let e=await p.text();throw Error(`Saved file but not metadata (${p.status}): ${e.slice(0,160)}`)}return{id:i,caption:t,createdAt:u,path:o,url:f(o)}}async function ee(e,t){let{url:n}=l();await fetch(`${n}/storage/v1/object/class-photos`,{method:`DELETE`,headers:d({"Content-Type":`application/json`}),body:JSON.stringify({prefixes:[t]})});let r=await fetch(`${n}/rest/v1/photos?id=eq.${encodeURIComponent(e)}`,{method:`DELETE`,headers:d({Prefer:`return=minimal`})});if(!r.ok){let e=await r.text();throw Error(`Delete failed (${r.status}): ${e.slice(0,160)}`)}}var _=`classPhotoWall.pinHash`,v=`classPhotoWall.unlocked`;async function y(e){let t=new TextEncoder().encode(e),n=await crypto.subtle.digest(`SHA-256`,t);return[...new Uint8Array(n)].map(e=>e.toString(16).padStart(2,`0`)).join(``)}function b(){return localStorage.getItem(_)}function x(e){localStorage.setItem(_,e)}function te(){return sessionStorage.getItem(v)===`1`}function S(){sessionStorage.removeItem(v)}async function C(){if(!u())return!!b();try{let e=await p();if(e)return x(e),!0}catch{}let e=b();if(e){try{await m(e)}catch{}return!0}return!1}async function w(e){let t=e.trim();if(t.length<4)throw Error(`PIN must be at least 4 characters`);let n=await y(t);u()&&await m(n),x(n),sessionStorage.setItem(v,`1`)}async function T(e){let t=b();if(u())try{let e=await p();e&&(x(e),t=e)}catch{}if(!t)return!1;let n=await y(e.trim())===t;return n&&sessionStorage.setItem(v,`1`),n}var ne=`class-photo-wall`,re=1,E=`photos`;function D(){return new Promise((e,t)=>{let n=indexedDB.open(ne,re);n.onupgradeneeded=()=>{let e=n.result;e.objectStoreNames.contains(E)||e.createObjectStore(E,{keyPath:`id`})},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error??Error(`IndexedDB open failed`))})}function O(e){return new Promise((t,n)=>{e.oncomplete=()=>t(),e.onerror=()=>n(e.error??Error(`IndexedDB tx failed`)),e.onabort=()=>n(e.error??Error(`IndexedDB tx aborted`))})}async function k(){let e=await D(),t=await new Promise((t,n)=>{let r=e.transaction(E,`readonly`).objectStore(E).getAll();r.onsuccess=()=>t(r.result??[]),r.onerror=()=>n(r.error??Error(`list failed`))});return e.close(),t.map(e=>({id:e.id,caption:e.caption,createdAt:e.createdAt,path:e.path,url:URL.createObjectURL(e.blob)})).sort((e,t)=>t.createdAt.localeCompare(e.createdAt))}async function ie(e,t){let n=crypto.randomUUID(),r=new Date().toISOString(),i=`local/${n}`,a={id:n,caption:t,createdAt:r,path:i,blob:e},o=await D(),s=o.transaction(E,`readwrite`);return s.objectStore(E).put(a),await O(s),o.close(),{id:n,caption:t,createdAt:r,path:i,url:URL.createObjectURL(e)}}async function A(e){let t=await D(),n=t.transaction(E,`readwrite`);n.objectStore(E).delete(e),await O(n),t.close()}function j(){return u()?`supabase`:`local`}async function M(){return j()===`supabase`?h():k()}async function N(e,t,n){return j()===`supabase`?g(e,t,n):ie(e,t)}async function P(e){return j()===`supabase`?ee(e.id,e.path):A(e.id)}c({immediate:!0});function ae(){let e=new URLSearchParams(location.search),t=(e.get(`view`)||``).toLowerCase(),n=(e.get(`mode`)||``).toLowerCase();return t===`1`||t===`true`||t===`parent`||n===`view`}function F(){return`${location.origin}/work-to-parents/`}function I(){let e=F();return e.includes(`?`)?`${e}&view=1`:`${e}?view=1`}var L={screen:`unlock`,photos:[],drafts:[],caption:``,pinInput:``,pinConfirm:``,toast:``,busy:!1,error:``,lightbox:null,loadingGallery:!1,booting:!0,viewOnly:ae(),selectMode:!1,selectedIds:new Set};function R(e){L.toast=e,Q(),window.setTimeout(()=>{L.toast===e&&(L.toast=``,Q())},2600)}function z(){for(let e of L.drafts)URL.revokeObjectURL(e.url);L.drafts=[],L.caption=``}function B(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function V(e){try{return new Date(e).toLocaleString(void 0,{month:`short`,day:`numeric`,hour:`numeric`,minute:`2-digit`})}catch{return e}}async function H(){L.loadingGallery=!0,L.error=``,Q();try{for(let e of L.photos)e.url.startsWith(`blob:`)&&URL.revokeObjectURL(e.url);L.photos=await M()}catch(e){L.error=e instanceof Error?e.message:`Could not load photos`}finally{L.loadingGallery=!1,Q()}}function U(e){L.viewOnly&&(e===`capture`||e===`review`||e===`setup`)&&(e=`gallery`),e!==`gallery`&&L.selectMode&&q(),L.screen=e,L.error=``,Q(),e===`gallery`&&H()}function W(e){if(L.viewOnly)return;let t=[...e].filter(e=>e.type.startsWith(`image/`)||!e.type);if(t.length===0)return;z();let n=Date.now();L.drafts=t.map((e,t)=>({blob:e,url:URL.createObjectURL(e),filename:e.name||`photo-${n}-${t+1}.jpg`})),L.caption=``,L.screen=`review`,L.error=``,Q()}async function G(e=!1){if(L.viewOnly||L.drafts.length===0||L.busy)return;L.busy=!0,L.error=``,Q();let t=e?``:L.caption.trim(),n=L.drafts.length,r=0;try{for(;L.drafts.length>0;){let e=L.drafts[0];await N(e.blob,t,e.filename),URL.revokeObjectURL(e.url),L.drafts=L.drafts.slice(1),r+=1,Q()}L.caption=``,R(r===1?`Photo added to the wall`:`${r} photos added`),U(`gallery`)}catch(e){L.error=e instanceof Error?r>0?`${r} of ${n} uploaded, then failed: ${e.message}`:e.message:`Upload failed`,L.busy=!1,Q();return}L.busy=!1}async function K(e){if(!(L.viewOnly||L.busy)&&window.confirm(`Remove this photo from the class wall?`)){L.busy=!0,L.error=``,Q();try{await P(e),e.url.startsWith(`blob:`)&&URL.revokeObjectURL(e.url),L.photos=L.photos.filter(t=>t.id!==e.id),L.lightbox?.id===e.id&&(L.lightbox=null),R(`Photo removed`)}catch(e){L.error=e instanceof Error?e.message:`Delete failed`}finally{L.busy=!1,Q()}}}function q(){L.selectMode=!1,L.selectedIds=new Set}function oe(){L.viewOnly||(L.selectMode?q():(L.selectMode=!0,L.selectedIds=new Set,L.lightbox=null),L.error=``,Q())}function se(e){if(!L.selectMode||L.viewOnly)return;let t=new Set(L.selectedIds);t.has(e)?t.delete(e):t.add(e),L.selectedIds=t,Q()}async function ce(){if(L.viewOnly||L.busy||!L.selectMode)return;let e=[...L.selectedIds];if(e.length===0)return;let t=e.length;if(!window.confirm(`Remove ${t} photo${t===1?``:`s`} from the class wall?`))return;L.busy=!0,L.error=``,Q();let n=0;try{for(let t of e){let e=L.photos.find(e=>e.id===t);if(!e){L.selectedIds.delete(t);continue}await P(e),e.url.startsWith(`blob:`)&&URL.revokeObjectURL(e.url),L.photos=L.photos.filter(t=>t.id!==e.id),L.selectedIds.delete(t),L.lightbox?.id===e.id&&(L.lightbox=null),n+=1}R(n===1?`Photo removed`:`${n} photos removed`),q()}catch(e){L.error=e instanceof Error?e.message:`Delete failed`}finally{L.busy=!1,Q()}}function J(e,t,n){return`<header class="topbar">
    <div class="topbar-slot left">${t}</div>
    <h1>${B(e)}</h1>
    <div class="topbar-slot right">${n}</div>
  </header>`}function le(){if(L.booting)return`<div class="screen gate">
    ${J(`Class Photo Wall`,``,``)}
    <div class="body gate-body">
      <div class="hero-card">
        <p class="muted center">Loading…</p>
      </div>
    </div>
  </div>`;let e=L.viewOnly?`Enter class PIN to view the wall`:`Enter class PIN`,t=L.viewOnly?`View-only link — enter the class PIN your teacher shared.`:`Same PIN for viewing the wall and uploading photos.`;return`<div class="screen gate">
    ${J(`Class Photo Wall`,``,``)}
    <div class="body gate-body">
      <div class="hero-card">
        <p class="eyebrow">${L.viewOnly?`Parents`:`Parents &amp; teachers`}</p>
        <h2>${e}</h2>
        <p class="muted">${t}</p>
        <form id="pin-form" class="pin-form">
          <input id="pin-input" class="pin-input" type="password" inputmode="numeric" autocomplete="one-time-code" placeholder="Class PIN" maxlength="32" value="${B(L.pinInput)}" />
          ${L.error?`<p class="error">${B(L.error)}</p>`:``}
          <button class="btn primary big" type="submit" ${L.busy?`disabled`:``}>Unlock</button>
        </form>
      </div>
    </div>
  </div>`}function Y(){return`<div class="screen gate">
    ${J(`Class Photo Wall`,``,``)}
    <div class="body gate-body">
      <div class="hero-card">
        <p class="eyebrow">View only</p>
        <h2>Photo wall isn’t ready yet</h2>
        <p class="muted">Ask your teacher for the class link PIN — wall not set up yet. Your teacher will share the PIN after they create it on the full teacher link.</p>
      </div>
    </div>
  </div>`}function ue(){return`<div class="screen gate">
    ${J(`Class Photo Wall`,``,``)}
    <div class="body gate-body">
      <div class="hero-card">
        <p class="eyebrow">Teacher setup</p>
        <h2>Create a class PIN</h2>
        <p class="muted">This PIN is shared for the whole class link. Parents on any device enter it to open the gallery. Store it somewhere safe.</p>
        <form id="setup-form" class="pin-form">
          <input id="pin-input" class="pin-input" type="password" inputmode="numeric" autocomplete="new-password" placeholder="New PIN (4+ chars)" maxlength="32" value="${B(L.pinInput)}" />
          <input id="pin-confirm" class="pin-input" type="password" inputmode="numeric" autocomplete="new-password" placeholder="Confirm PIN" maxlength="32" value="${B(L.pinConfirm)}" />
          ${L.error?`<p class="error">${B(L.error)}</p>`:``}
          <button class="btn primary big" type="submit" ${L.busy?`disabled`:``}>Save PIN &amp; open wall</button>
        </form>
      </div>
    </div>
  </div>`}function X(){let e=j(),t=L.photos.map(e=>{let t=L.selectMode&&L.selectedIds.has(e.id),n=L.selectMode?` select-mode${t?` selected`:``}`:``,r=L.selectMode?`<span class="tile-check" aria-hidden="true">${t?`✓`:``}</span>`:``,i=L.selectMode?t?`Deselect photo`:`Select photo`:`Open photo`;return`<button type="button" class="tile${n}" data-id="${B(e.id)}" aria-label="${i}" aria-pressed="${t?`true`:`false`}">
        ${r}
        <img src="${B(e.url)}" alt="" loading="lazy" />
        ${e.caption?`<span class="tile-cap">${B(e.caption)}</span>`:``}
      </button>`}).join(``),n=!L.loadingGallery&&L.photos.length===0?L.viewOnly?`<div class="empty-wall">
        <div class="empty-art" aria-hidden="true">📷</div>
        <h2>Class photo wall</h2>
        <p class="muted">No photos yet. Check back after your teacher adds snapshots.</p>
      </div>`:`<div class="empty-wall">
        <div class="empty-art" aria-hidden="true">📷</div>
        <h2>Your class photo wall</h2>
        <p class="muted">Tap <strong>Take photo</strong> to add the first snapshot. Parents open the parent link and enter the class PIN.</p>
      </div>`:``,r=L.viewOnly?`<div class="chip-row">
        <div class="mode-chip view-only">View only</div>
        <div class="mode-chip ${e}">${e===`supabase`?`Cloud gallery`:`Demo mode (this device)`}</div>
      </div>`:`<div class="chip-row">
        <div class="mode-chip ${e}">${e===`supabase`?`Cloud gallery`:`Demo mode (this device)`}</div>
        ${L.photos.length>0?`<button type="button" class="icon-btn select-toggle${L.selectMode?` active`:``}" id="btn-select">${L.selectMode?`Selecting…`:`Select`}</button>`:``}
      </div>`,i=L.selectedIds.size,a=!L.viewOnly&&L.selectMode?`<div class="select-bar" role="toolbar" aria-label="Selection">
        <span class="select-count">${i} selected</span>
        <button type="button" class="btn danger" id="btn-delete-selected" ${L.busy||i===0?`disabled`:``}>Delete selected</button>
        <button type="button" class="btn secondary" id="btn-cancel-select" ${L.busy?`disabled`:``}>Cancel</button>
      </div>`:``,o=L.viewOnly||L.selectMode?``:`<div class="fab-bar">
      <button type="button" class="btn primary big fab" id="btn-capture">Take photo</button>
    </div>`;return`<div class="screen">
    ${J(`Class Photo Wall`,`<button type="button" class="icon-btn ghost" id="btn-settings">Settings</button>`,`<button type="button" class="icon-btn ghost" id="btn-lock">Lock</button>`)}
    <div class="body gallery-body${L.viewOnly?` view-only`:``}${L.selectMode?` select-mode`:``}">
      ${r}
      ${a}
      ${L.error?`<p class="error">${B(L.error)}</p>`:``}
      ${L.loadingGallery?`<p class="muted center">Loading wall…</p>`:``}
      ${n}
      <div class="masonry">${t}</div>
    </div>
    ${o}
    ${L.lightbox?de(L.lightbox):``}
  </div>`}function de(e){let t=L.viewOnly?``:`<button type="button" class="btn danger" id="lightbox-delete" ${L.busy?`disabled`:``}>Remove photo</button>`;return`<div class="lightbox" id="lightbox" role="dialog" aria-modal="true">
    <button type="button" class="lightbox-close" id="lightbox-close" aria-label="Close">×</button>
    <img src="${B(e.url)}" alt="" />
    <div class="lightbox-meta">
      <p class="lightbox-cap">${e.caption?B(e.caption):`<span class="muted">No caption</span>`}</p>
      <p class="muted">${B(V(e.createdAt))}</p>
      ${t}
    </div>
  </div>`}function Z(){return L.viewOnly?X():`<div class="screen">
    ${J(`Add photos`,`<button type="button" class="icon-btn ghost" id="btn-back-gallery">Back</button>`,``)}
    <div class="body capture-body">
      <p class="lead">Snap classroom moments for the shared wall. Parents see them after you upload.</p>
      <label class="btn primary big file-btn">
        Take photo
        <input id="file-camera" type="file" accept="image/*" capture="environment" multiple hidden />
      </label>
      <label class="btn secondary big file-btn">
        Choose from Photos
        <input id="file-library" type="file" accept="image/*" multiple hidden />
      </label>
      <p class="hint">Pick several from Photos at once, or snap one with the rear camera on iPad.</p>
    </div>
  </div>`}function fe(){if(L.viewOnly||L.drafts.length===0)return L.viewOnly?X():Z();let e=L.drafts.length>1,t=e?`<div class="multi-preview">
        <p class="multi-count"><strong>${L.drafts.length}</strong> photos ready</p>
        <div class="thumb-row">
          ${L.drafts.map(e=>`<div class="thumb"><img src="${B(e.url)}" alt="" /></div>`).join(``)}
        </div>
      </div>`:`<div class="preview-wrap">
        <img class="preview" src="${B(L.drafts[0].url)}" alt="Preview" />
      </div>`,n=e?`Shared caption <span class="optional">(optional — applies to all)</span>`:`Caption <span class="optional">(optional)</span>`,r=L.busy?e?`Uploading… (${L.drafts.length} left)`:`Uploading…`:e?`Upload all (${L.drafts.length})`:`Upload`,i=e?`Upload all without caption`:`Upload without caption`;return`<div class="screen">
    ${J(e?`Add photos`:`Add to wall`,`<button type="button" class="icon-btn ghost" id="btn-retake"${L.busy?` disabled`:``}>${e?`Cancel`:`Retake`}</button>`,``)}
    <div class="body review-body">
      ${t}
      <label class="field">
        <span>${n}</span>
        <input id="caption-input" type="text" maxlength="120" placeholder="e.g. Science fair builds" value="${B(L.caption)}" ${L.busy?`disabled`:``} />
      </label>
      ${L.error?`<p class="error">${B(L.error)}</p>`:``}
      <button type="button" class="btn primary big" id="btn-upload" ${L.busy?`disabled`:``}>
        ${r}
      </button>
      <button type="button" class="btn secondary" id="btn-upload-fast" ${L.busy?`disabled`:``}>
        ${i}
      </button>
    </div>
  </div>`}function pe(){if(L.viewOnly)return`<div class="screen">
    ${J(`Settings`,`<button type="button" class="icon-btn ghost" id="btn-back-gallery">Back</button>`,``)}
    <div class="body">
      <section class="card">
        <div class="mode-chip view-only">View only</div>
        <h2>Parent gallery</h2>
        <p class="muted">You’re on the view-only link. Photos can be added from the teacher link.</p>
        <button type="button" class="btn secondary" id="btn-lock">Lock</button>
      </section>
    </div>
  </div>`;let e=j(),t=F(),n=I();return`<div class="screen">
    ${J(`Settings`,`<button type="button" class="icon-btn ghost" id="btn-back-gallery">Back</button>`,``)}
    <div class="body">
      <section class="card">
        <h2>Share with parents</h2>
        <p class="muted">Send the <strong>parent link</strong> below. They enter the class PIN to view the wall (no upload).</p>
        <p class="share-label">Parent link (view only)</p>
        <p class="share-link">${B(n)}</p>
        <button type="button" class="btn primary" id="btn-copy-parent-link">Copy parent link</button>
        <p class="share-label">Teacher link (full app)</p>
        <p class="share-link">${B(t)}</p>
        <button type="button" class="btn secondary" id="btn-copy-link">Copy teacher link</button>
      </section>
      <section class="card">
        <h2>Class PIN</h2>
        <p class="muted">One PIN unlocks viewing and uploading for the whole class link on every device.</p>
        <form id="change-pin-form" class="pin-form">
          <input id="pin-input" class="pin-input" type="password" inputmode="numeric" autocomplete="new-password" placeholder="New PIN" maxlength="32" />
          <input id="pin-confirm" class="pin-input" type="password" inputmode="numeric" autocomplete="new-password" placeholder="Confirm new PIN" maxlength="32" />
          ${L.error?`<p class="error">${B(L.error)}</p>`:``}
          <button class="btn secondary" type="submit">Update PIN</button>
        </form>
      </section>
      <section class="card">
        <h2>Storage</h2>
        <p><strong>${e===`supabase`?`Supabase cloud`:`Local demo (IndexedDB)`}</strong></p>
        <p class="muted">${e===`supabase`?`Photos sync for parents on other devices.`:`Photos stay on this iPad only. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then rebuild, for a shared cloud gallery. See README.`}</p>
      </section>
      <section class="card">
        <h2>Privacy note</h2>
        <p class="muted">Classroom-trust security: the PIN is a soft gate in the app. It is not bank-grade auth. Share the link and PIN only with your class families.</p>
      </section>
    </div>
  </div>`}function Q(){let e=document.getElementById(`app`);if(!e)return;let t=``;switch(L.screen){case`unlock`:t=le();break;case`waiting`:t=Y();break;case`setup`:t=ue();break;case`gallery`:t=X();break;case`capture`:t=Z();break;case`review`:t=fe();break;case`settings`:t=pe()}L.toast&&(t+=`<div class="toast" role="status">${B(L.toast)}</div>`),e.innerHTML=t,me()}async function $(e,t){try{await navigator.clipboard.writeText(e),R(t)}catch{window.prompt(`Copy this link:`,e)}}function me(){document.getElementById(`pin-form`)?.addEventListener(`submit`,async e=>{e.preventDefault(),L.pinInput=document.getElementById(`pin-input`).value,L.busy=!0,L.error=``,Q();let t=await T(L.pinInput);if(L.busy=!1,!t){L.error=`Incorrect PIN`,Q();return}L.pinInput=``,U(`gallery`)}),document.getElementById(`setup-form`)?.addEventListener(`submit`,async e=>{if(e.preventDefault(),L.viewOnly)return;let t=document.getElementById(`pin-input`).value,n=document.getElementById(`pin-confirm`).value;if(L.pinInput=t,L.pinConfirm=n,t.trim().length<4){L.error=`PIN must be at least 4 characters`,Q();return}if(t!==n){L.error=`PINs do not match`,Q();return}L.busy=!0,Q();try{await w(t),L.pinInput=``,L.pinConfirm=``,U(`gallery`)}catch(e){L.error=e instanceof Error?e.message:`Could not save PIN`,Q()}finally{L.busy=!1}}),document.getElementById(`change-pin-form`)?.addEventListener(`submit`,async e=>{if(e.preventDefault(),L.viewOnly)return;let t=document.getElementById(`pin-input`).value,n=document.getElementById(`pin-confirm`).value;if(t.trim().length<4){L.error=`PIN must be at least 4 characters`,Q();return}if(t!==n){L.error=`PINs do not match`,Q();return}try{await w(t),L.error=``,R(`PIN updated`),Q()}catch(e){L.error=e instanceof Error?e.message:`Could not update PIN`,Q()}}),document.getElementById(`btn-settings`)?.addEventListener(`click`,()=>U(`settings`)),document.getElementById(`btn-lock`)?.addEventListener(`click`,()=>{S(),L.pinInput=``,q(),U(`unlock`)}),document.getElementById(`btn-capture`)?.addEventListener(`click`,()=>{L.viewOnly||U(`capture`)}),document.getElementById(`btn-back-gallery`)?.addEventListener(`click`,()=>U(`gallery`)),document.getElementById(`btn-retake`)?.addEventListener(`click`,()=>{L.viewOnly||(z(),U(`capture`))});let e=document.getElementById(`file-camera`);e?.addEventListener(`change`,()=>{e.files&&e.files.length>0&&W(e.files),e.value=``});let t=document.getElementById(`file-library`);t?.addEventListener(`change`,()=>{t.files&&t.files.length>0&&W(t.files),t.value=``});let n=document.getElementById(`caption-input`);n?.addEventListener(`input`,()=>{L.caption=n.value}),document.getElementById(`btn-upload`)?.addEventListener(`click`,()=>void G(!1)),document.getElementById(`btn-upload-fast`)?.addEventListener(`click`,()=>void G(!0)),document.getElementById(`btn-select`)?.addEventListener(`click`,()=>oe()),document.getElementById(`btn-cancel-select`)?.addEventListener(`click`,()=>{q(),Q()}),document.getElementById(`btn-delete-selected`)?.addEventListener(`click`,()=>void ce()),document.querySelectorAll(`.tile`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.id;if(t){if(L.selectMode&&!L.viewOnly){se(t);return}L.lightbox=L.photos.find(e=>e.id===t)??null,Q()}})}),document.getElementById(`lightbox-close`)?.addEventListener(`click`,()=>{L.lightbox=null,Q()}),document.getElementById(`lightbox`)?.addEventListener(`click`,e=>{e.target===e.currentTarget&&(L.lightbox=null,Q())}),document.getElementById(`lightbox-delete`)?.addEventListener(`click`,()=>{!L.viewOnly&&L.lightbox&&K(L.lightbox)}),document.getElementById(`btn-copy-link`)?.addEventListener(`click`,()=>{$(F(),`Teacher link copied`)}),document.getElementById(`btn-copy-parent-link`)?.addEventListener(`click`,()=>{$(I(),`Parent link copied`)})}async function he(){Q();let e=await C();L.booting=!1,L.screen=e?te()?`gallery`:`unlock`:L.viewOnly?`waiting`:`setup`,Q(),L.screen===`gallery`&&H()}he();