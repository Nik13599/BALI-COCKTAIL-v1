const CORE='bali-mobile-admin-core-v4-offline';
const MEDIA='bali-mobile-admin-media-v4';
const CORE_FILES=['./','./index.html','./admin-v3.html','./manifest.webmanifest','./admin-runtime-fix.js','./offline-first.js','./app-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CORE).then(c=>Promise.allSettled(CORE_FILES.map(x=>c.add(x)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{const keep=new Set([CORE,MEDIA]);e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>!keep.has(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
function canonical(req){const u=new URL(req.url);u.search='';u.hash='';return new Request(u.toString(),{method:'GET',mode:req.mode,credentials:req.credentials})}
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.hostname==='api.github.com')return;
  if(u.hostname==='raw.githubusercontent.com'&&u.pathname.includes('/media/')){
    e.respondWith((async()=>{const c=await caches.open(MEDIA),key=canonical(e.request),cached=await c.match(key);const fresh=fetch(e.request,{cache:'no-store'}).then(async r=>{if(r.ok||r.type==='opaque')await c.put(key,r.clone());return r}).catch(()=>null);if(cached){fresh.catch(()=>{});return cached}const r=await fresh;if(r)return r;throw new Error('offline media missing')})());return;
  }
  if(u.origin===self.location.origin){
    e.respondWith((async()=>{const c=await caches.open(CORE);try{const r=await fetch(e.request);if(r.ok)await c.put(e.request,r.clone());return r}catch{const hit=await c.match(e.request);if(hit)return hit;if(e.request.mode==='navigate')return await c.match('./admin-v3.html')||await c.match('./index.html');throw new Error('offline shell missing')}})());
  }
});
