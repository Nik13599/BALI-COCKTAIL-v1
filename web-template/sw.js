const CORE_CACHE='bali-cocktail-core-v10-offline-first';
const DATA_CACHE='bali-cocktail-data-v10';
const MEDIA_CACHE='bali-cocktail-media-v10';
const CORE=['./','./index.html','./cocktails.json','./manifest.webmanifest','./images/ic_launcher.png','./ingredient-zoom.js','./readonly-mobile.js','./sort-alpha.js','./sync-repair.js'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CORE_CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  const keep=new Set([CORE_CACHE,DATA_CACHE,MEDIA_CACHE]);
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>!keep.has(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

function canonical(req){const u=new URL(req.url);u.search='';u.hash='';return new Request(u.toString(),{method:'GET',mode:req.mode,credentials:req.credentials,headers:req.headers})}

async function networkFirst(req,cacheName){
  const cache=await caches.open(cacheName),key=canonical(req);
  try{const r=await fetch(req,{cache:'no-store'});if(r&&r.ok)await cache.put(key,r.clone());return r}catch(e){const c=await cache.match(key);if(c)return c;throw e}
}
async function staleMedia(req){
  const cache=await caches.open(MEDIA_CACHE),key=canonical(req),cached=await cache.match(key);
  const update=fetch(req,{cache:'no-store'}).then(async r=>{if(r&&(r.ok||r.type==='opaque'))await cache.put(key,r.clone());return r}).catch(()=>null);
  if(cached){self.registration?.navigationPreload;update.catch(()=>{});return cached}
  const fresh=await update;if(fresh)return fresh;throw new Error('offline media missing')
}

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.hostname==='raw.githubusercontent.com'&&u.pathname.includes('/Nik13599/BALI-COCKTAIL-v1/')){
    if(u.pathname.includes('/media/')){e.respondWith(staleMedia(e.request));return}
    if(u.pathname.includes('/data/')){e.respondWith(networkFirst(e.request,DATA_CACHE));return}
  }
  if(u.origin===self.location.origin){
    if(e.request.mode==='navigate'){
      e.respondWith(fetch(e.request).then(async r=>{if(r.ok){const c=await caches.open(CORE_CACHE);await c.put('./index.html',r.clone())}return r}).catch(async()=>await caches.match('./index.html')||await caches.match('./')));return;
    }
    e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CORE_CACHE).then(c=>c.put(e.request,copy))}return r})));return;
  }
});
