const CORE='bali-mobile-admin-core-v6-offline';
const MEDIA='bali-mobile-admin-media-v6';
const REMOTE_ICON='https://raw.githubusercontent.com/Nik13599/BALI-COCKTAIL-v1/main/branding/app-icon.png';
const CORE_FILES=['./','./index.html','./admin-v3.html','./iphone-offline.html','./manifest.webmanifest','./admin-runtime-fix.js','./offline-first.js','./app-icon.png',REMOTE_ICON];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CORE).then(c=>Promise.allSettled(CORE_FILES.map(x=>c.add(x)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{const keep=new Set([CORE,MEDIA]);e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>!keep.has(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
function canonical(req){const u=new URL(req.url);u.search='';u.hash='';return new Request(u.toString(),{method:'GET',mode:req.mode,credentials:req.credentials})}
async function cachedRemote(req){const c=await caches.open(MEDIA),key=canonical(req),cached=await c.match(key);const core=await caches.open(CORE),coreHit=await core.match(key);const fresh=fetch(req,{cache:'no-store'}).then(async r=>{if(r.ok||r.type==='opaque')await c.put(key,r.clone());return r}).catch(()=>null);if(cached){fresh.catch(()=>{});return cached}if(coreHit){fresh.catch(()=>{});return coreHit}const r=await fresh;if(r)return r;throw new Error('offline media missing')}
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.hostname==='api.github.com')return;
  if(u.hostname==='raw.githubusercontent.com'&&(u.pathname.includes('/media/')||u.pathname.includes('/images/')||u.pathname.includes('/branding/'))){e.respondWith(cachedRemote(e.request));return}
  if(u.origin===self.location.origin){
    e.respondWith((async()=>{const c=await caches.open(CORE);try{const r=await fetch(e.request,{cache:'no-store'});if(r.ok)await c.put(e.request,r.clone());return r}catch{const hit=await c.match(e.request,{ignoreSearch:true});if(hit)return hit;if(e.request.mode==='navigate')return await c.match('./iphone-offline.html')||await c.match('./admin-v3.html')||await c.match('./index.html');throw new Error('offline shell missing')}})());
  }
});
