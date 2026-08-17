(() => {
  const DB_NAME = 'bali-cocktail-admin-offline-v1';
  const DB_VERSION = 1;
  const MEDIA_STORE = 'media';
  const META_STORE = 'meta';

  const mimeFor = path => /\.png$/i.test(path) ? 'image/png' : /\.webp$/i.test(path) ? 'image/webp' : 'image/jpeg';
  const pathUrl = path => String(path||'').split('/').map(encodeURIComponent).join('/');

  function openDb(){
    return new Promise((resolve,reject)=>{
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db=req.result;
        if(!db.objectStoreNames.contains(MEDIA_STORE)) db.createObjectStore(MEDIA_STORE,{keyPath:'path'});
        if(!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE,{keyPath:'key'});
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
  }

  async function dbGet(store,key){
    const db=await openDb();
    try{return await new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly');const r=tx.objectStore(store).get(key);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
    finally{db.close()}
  }
  async function dbPut(store,value){
    const db=await openDb();
    try{await new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(value);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
    finally{db.close()}
  }

  async function cacheDataUrl(path,dataUrl,version){
    if(!path||!dataUrl) return dataUrl||'';
    await dbPut(MEDIA_STORE,{path,dataUrl,version:Number(version||0),savedAt:Date.now()});
    return dataUrl;
  }

  async function readCached(path){
    const row=await dbGet(MEDIA_STORE,path);
    return row?.dataUrl||'';
  }

  async function fetchFromGitHub(path){
    const headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
    if(typeof token!=='undefined'&&token) headers.Authorization='Bearer '+token;
    const url=`https://api.github.com/repos/${OWNER}/${REPO}/contents/${pathUrl(path)}?ref=${encodeURIComponent(BRANCH)}&_offline=${Date.now()}`;
    let r=await fetch(url,{headers,cache:'no-store'});
    if((r.status===401||r.status===403)&&typeof token!=='undefined'&&token){headers.Authorization='token '+token;r=await fetch(url,{headers,cache:'no-store'})}
    if(!r.ok) throw new Error(`GitHub HTTP ${r.status}`);
    const x=await r.json();
    if(!x?.content) throw new Error('empty image');
    const dataUrl=`data:${mimeFor(path)};base64,${String(x.content).replace(/\n/g,'')}`;
    await cacheDataUrl(path,dataUrl,manifest?.catalogVersion||0);
    return dataUrl;
  }

  async function getMedia(path,{refresh=false}={}){
    if(!path) return '';
    const pending=(typeof pendingFiles!=='undefined'&&pendingFiles?.get)?pendingFiles.get(path):null;
    if(pending){
      const dataUrl=`data:${mimeFor(path)};base64,${pending}`;
      cacheDataUrl(path,dataUrl,manifest?.catalogVersion||0).catch(()=>{});
      return dataUrl;
    }
    const cached=await readCached(path).catch(()=> '');
    if(cached&&!refresh){
      if(navigator.onLine) setTimeout(()=>fetchFromGitHub(path).catch(()=>{}),0);
      return cached;
    }
    try{return await fetchFromGitHub(path)}catch(e){if(cached)return cached;throw e}
  }

  async function cacheCatalogMedia(){
    const paths=[
      ...(Array.isArray(cocktails)?cocktails:[]).map(x=>x?.officialImage),
      ...(Array.isArray(ingredients)?ingredients:[]).map(x=>x?.officialImage)
    ].filter(Boolean);
    const unique=[...new Set(paths)];
    for(let i=0;i<unique.length;i+=4){
      await Promise.allSettled(unique.slice(i,i+4).map(async p=>{
        const cached=await readCached(p).catch(()=> '');
        if(!cached&&navigator.onLine) await fetchFromGitHub(p);
      }));
    }
    await dbPut(META_STORE,{key:'lastMediaSync',version:Number(manifest?.catalogVersion||0),savedAt:Date.now(),count:unique.length}).catch(()=>{});
    return unique.length;
  }

  window.BALI_getOfflineMedia = getMedia;
  window.BALI_cacheMediaDataUrl = cacheDataUrl;
  window.BALI_cacheCatalogMedia = cacheCatalogMedia;

  async function hydratePreview(id,path){
    const img=document.getElementById(id);if(!img||!path)return;
    try{img.src=await getMedia(path)}catch{}
  }

  const baseQueue=typeof queueImage==='function'?queueImage:null;
  if(baseQueue){
    queueImage=function(file,base,done){
      return baseQueue(file,base,path=>{
        const b64=(typeof pendingFiles!=='undefined'&&pendingFiles?.get)?pendingFiles.get(path):null;
        if(b64) cacheDataUrl(path,`data:${mimeFor(path)};base64,${b64}`,manifest?.catalogVersion||0).catch(()=>{});
        done?.(path);
      });
    };
  }

  const oldC=window.renderCocktailEditor;
  if(oldC) window.renderCocktailEditor=function(){oldC();const c=cocktails?.find(x=>x.id===selectedCocktail);if(c?.officialImage)hydratePreview('cPreview',c.officialImage)};
  const oldI=window.renderIngredientEditor;
  if(oldI) window.renderIngredientEditor=function(){oldI();const i=ingredients?.find(x=>x.id===selectedIngredient);if(i?.officialImage)hydratePreview('iPreview',i.officialImage)};

  const oldLoad=window.loadAll;
  if(oldLoad) window.loadAll=async function(){
    const out=await oldLoad();
    cacheCatalogMedia().catch(()=>{});
    return out;
  };

  window.addEventListener('online',()=>cacheCatalogMedia().catch(()=>{}));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&navigator.onLine)cacheCatalogMedia().catch(()=>{})});
  setTimeout(()=>cacheCatalogMedia().catch(()=>{}),700);
})();
