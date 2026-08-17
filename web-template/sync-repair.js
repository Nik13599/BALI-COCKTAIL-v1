(() => {
  let running = false;
  const MEDIA_CACHE='bali-cocktail-media-v12';
  const DATA_CACHE='bali-cocktail-data-v12';

  const canonical=u=>{const x=new URL(u,location.href);x.search='';x.hash='';return x.toString()};

  async function cacheResponse(url,cacheName){
    const cache=await caches.open(cacheName);
    const key=canonical(url);
    const existing=await cache.match(key);
    if(existing) return true;
    const r=await fetch(url,{cache:'no-store'});
    if(!r.ok&&r.type!=='opaque') throw new Error('HTTP '+r.status);
    await cache.put(key,r.clone());
    return true;
  }

  function mediaPaths(c,i){
    return [...new Set([
      ...(Array.isArray(c)?c:[]).map(x=>x?.officialImage),
      ...(Array.isArray(i)?i:[]).map(x=>x?.officialImage)
    ].filter(Boolean))];
  }

  async function cacheAllMedia(c,i,version){
    const paths=mediaPaths(c,i),state=document.getElementById('syncState');
    let done=0;
    for(let n=0;n<paths.length;n+=4){
      await Promise.allSettled(paths.slice(n,n+4).map(async p=>{
        await cacheResponse(REMOTE+p+'?v='+version+'&ts='+Date.now(),MEDIA_CACHE);done++;
      }));
      if(state&&paths.length)state.textContent=`Сохраняем фото офлайн · ${Math.min(done,paths.length)}/${paths.length}`;
    }
    localStorage.setItem('baliOfflineMediaVersion',String(version));
    localStorage.setItem('baliOfflineMediaCount',String(done));
    return done;
  }

  async function saveJsonFallback(nextManifest,c,i){
    localStorage.setItem('baliCocktails', JSON.stringify(c));
    localStorage.setItem('baliIngredients', JSON.stringify(i));
    localStorage.setItem('baliCatalogVersion', String(nextManifest.catalogVersion));
    localStorage.setItem('baliManifest',JSON.stringify(nextManifest));
    try{
      const cache=await caches.open(DATA_CACHE);
      await Promise.all([
        cache.put(canonical(REMOTE+'data/manifest.json'),new Response(JSON.stringify(nextManifest),{headers:{'Content-Type':'application/json'}})),
        cache.put(canonical(REMOTE+(nextManifest.cocktails||'data/cocktails.json')),new Response(JSON.stringify(c),{headers:{'Content-Type':'application/json'}})),
        cache.put(canonical(REMOTE+(nextManifest.ingredients||'data/ingredients.json')),new Response(JSON.stringify(i),{headers:{'Content-Type':'application/json'}}))
      ]);
    }catch{}
  }

  async function refreshCatalog(reason = 'auto') {
    if (running || !navigator.onLine) return;
    running = true;
    const state = document.getElementById('syncState');
    try {
      if (state) state.textContent = 'Проверка обновлений…';
      const stamp = Date.now();
      const nextManifest = await fetchJson(REMOTE + 'data/manifest.json?ts=' + stamp);
      const [c, i] = await Promise.all([
        fetchJson(REMOTE + nextManifest.cocktails + '?v=' + nextManifest.catalogVersion + '&ts=' + stamp),
        fetchJson(REMOTE + nextManifest.ingredients + '?v=' + nextManifest.catalogVersion + '&ts=' + stamp)
      ]);

      await saveJsonFallback(nextManifest,c,i);
      await cacheAllMedia(c,i,nextManifest.catalogVersion);

      manifest = nextManifest;
      all = c;
      ingredients = i;
      renderChips();
      renderList();
      if (currentId && all.some(x => x.id === currentId)) openDetail(currentId, false);
      if (state) state.textContent = 'Каталог v' + nextManifest.catalogVersion + ' · сохранён на iPhone';
    } catch (e) {
      try{
        all=JSON.parse(localStorage.getItem('baliCocktails')||'[]');
        ingredients=JSON.parse(localStorage.getItem('baliIngredients')||'[]');
        manifest=JSON.parse(localStorage.getItem('baliManifest')||'null')||{catalogVersion:Number(localStorage.getItem('baliCatalogVersion')||0)};
        renderChips();renderList();
        if(currentId&&all.some(x=>x.id===currentId))openDetail(currentId,false);
      }catch{}
      if (state) state.textContent = all.length ? 'Офлайн · сохранённый каталог v'+(manifest?.catalogVersion||'?') : 'Не удалось загрузить каталог';
    } finally {
      running = false;
    }
  }

  async function warmOfflineFromCurrent(){
    if(!navigator.onLine||!Array.isArray(all)||!all.length)return;
    try{await cacheAllMedia(all,ingredients,manifest?.catalogVersion||0)}catch{}
  }

  window.baliRefreshCatalog = refreshCatalog;
  window.baliWarmOffline = warmOfflineFromCurrent;
  window.addEventListener('online', () => refreshCatalog('online'));
  window.addEventListener('offline',()=>{const s=document.getElementById('syncState');if(s)s.textContent='Офлайн · сохранённый каталог v'+(manifest?.catalogVersion||localStorage.getItem('baliCatalogVersion')||'?')});
  window.addEventListener('pageshow', () => refreshCatalog('pageshow'));
  window.addEventListener('focus', () => refreshCatalog('focus'));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshCatalog('visible');
  });
  setTimeout(() => refreshCatalog('startup-repair'), 50);
})();
