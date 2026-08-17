(() => {
  const mediaCache = new Map();
  let publishGuard = false;
  let reloadRunning = false;
  let lastReloadAt = 0;

  const pathUrl = path => String(path||'').split('/').map(encodeURIComponent).join('/');
  const decode64 = s => decodeURIComponent(escape(atob(String(s||'').replace(/\n/g,''))));
  const mimeFor = path => /\.png$/i.test(path) ? 'image/png' : /\.webp$/i.test(path) ? 'image/webp' : 'image/jpeg';

  async function ghNoCache(path) {
    const url = 'https://api.github.com' + path + (path.includes('?') ? '&' : '?') + '_bali=' + Date.now();
    const headers = {
      'Accept':'application/vnd.github+json',
      'Authorization':'Bearer ' + token,
      'X-GitHub-Api-Version':'2022-11-28'
    };
    let r = await fetch(url,{headers,cache:'no-store'});
    if ((r.status===401 || r.status===403) && token) {
      headers.Authorization = 'token ' + token;
      r = await fetch(url,{headers,cache:'no-store'});
    }
    if (!r.ok) throw new Error((await r.text()) || ('GitHub HTTP '+r.status));
    return r.json();
  }

  async function readServerJson(path) {
    const x = await ghNoCache(`/repos/${OWNER}/${REPO}/contents/${pathUrl(path)}?ref=${encodeURIComponent(BRANCH)}`);
    return JSON.parse(decode64(x.content));
  }

  async function mediaDataUrl(path) {
    if (!path) return '';
    const pending = pendingFiles?.get(path);
    if (pending) return `data:${mimeFor(path)};base64,${pending}`;
    if (mediaCache.has(path)) return mediaCache.get(path);
    const x = await ghNoCache(`/repos/${OWNER}/${REPO}/contents/${pathUrl(path)}?ref=${encodeURIComponent(BRANCH)}`);
    if (!x?.content) throw new Error('GitHub не вернул содержимое изображения');
    const url = `data:${mimeFor(path)};base64,${String(x.content).replace(/\n/g,'')}`;
    mediaCache.set(path,url);
    return url;
  }

  async function hydrate(img,path) {
    if (!img || !path) return;
    img.dataset.adminMediaPath = path;
    try { img.src = await mediaDataUrl(path); }
    catch (e) {
      const v = Number(manifest?.catalogVersion||0);
      img.src = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}?v=${v}&ts=${Date.now()}`;
      img.title = 'Фото есть в каталоге, но GitHub API временно не отдал предпросмотр';
    }
  }

  const baseRawUrl = window.rawUrl;
  window.rawUrl = function(path) {
    const u = baseRawUrl ? baseRawUrl(path) : `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`;
    const sep = u.includes('?') ? '&' : '?';
    return `${u}${sep}v=${Number(manifest?.catalogVersion||0)}&ts=${Date.now()}`;
  };

  const oldCocktailEditor = window.renderCocktailEditor;
  window.renderCocktailEditor = function() {
    oldCocktailEditor?.();
    const c = cocktails?.find(x=>x.id===selectedCocktail);
    if (c?.officialImage) hydrate(document.getElementById('cPreview'),c.officialImage);
  };

  const oldIngredientEditor = window.renderIngredientEditor;
  window.renderIngredientEditor = function() {
    oldIngredientEditor?.();
    const i = ingredients?.find(x=>x.id===selectedIngredient);
    if (i?.officialImage) hydrate(document.getElementById('iPreview'),i.officialImage);
  };

  const oldLoadAll = window.loadAll;
  window.loadAll = async function() {
    await oldLoadAll();
    localStorage.setItem('baliAdminLastServerCatalog', JSON.stringify({
      manifest, cocktails, ingredients,
      products: Array.isArray(window.barProducts) ? window.barProducts : [],
      savedAt: new Date().toISOString()
    }));
    if (selectedCocktail) window.renderCocktailEditor?.();
    if (selectedIngredient) window.renderIngredientEditor?.();
    return true;
  };

  async function forceServerReload(showToast=false) {
    if (reloadRunning || !token) return false;
    reloadRunning = true;
    try {
      await window.loadAll();
      lastReloadAt = Date.now();
      document.getElementById('versionText').textContent = `Каталог v${manifest.catalogVersion} · сервер`;
      if (showToast) toast(`Загружена серверная версия каталога ${manifest.catalogVersion}`);
      return true;
    } catch(e) {
      const cached = localStorage.getItem('baliAdminLastServerCatalog');
      if (cached) {
        try {
          const x=JSON.parse(cached);
          manifest=x.manifest||manifest;cocktails=x.cocktails||cocktails;ingredients=x.ingredients||ingredients;
          if(Array.isArray(x.products))window.barProducts=x.products;
          renderAll();
          if(selectedCocktail)window.renderCocktailEditor?.();
          if(selectedIngredient)window.renderIngredientEditor?.();
          document.getElementById('versionText').textContent=`Каталог v${manifest?.catalogVersion||'?'} · локальная копия`;
        } catch {}
      }
      if (showToast) toast('Не удалось перечитать сервер: '+(e?.message||e),true);
      return false;
    } finally { reloadRunning=false; }
  }
  window.BALI_forceServerReload = forceServerReload;

  async function verifyServer(expectedVersion, expectedCocktails, expectedIngredients, expectedProducts, uploadedPaths) {
    const [m,c,i] = await Promise.all([
      readServerJson('data/manifest.json'),
      readServerJson('data/cocktails.json'),
      readServerJson('data/ingredients.json')
    ]);
    if (Number(m.catalogVersion)!==Number(expectedVersion)) throw new Error(`серверная версия ${m.catalogVersion}, ожидалась ${expectedVersion}`);
    if (JSON.stringify(c)!==expectedCocktails) throw new Error('cocktails.json на сервере отличается от опубликованного');
    if (JSON.stringify(i)!==expectedIngredients) throw new Error('ingredients.json на сервере отличается от опубликованного');
    if (expectedProducts) {
      const p = await readServerJson('data/products.json');
      if (JSON.stringify(p)!==expectedProducts) throw new Error('products.json на сервере отличается от опубликованного');
    }
    for (const path of uploadedPaths) {
      const meta = await ghNoCache(`/repos/${OWNER}/${REPO}/contents/${pathUrl(path)}?ref=${encodeURIComponent(BRANCH)}`);
      if (!meta?.sha || Number(meta.size||0)<=0) throw new Error('не подтверждено фото: '+path);
    }
    return m;
  }

  document.addEventListener('click', async e => {
    const button = e.target.closest?.('.publish');
    if (!button || publishGuard || typeof window.publishFixed!=='function') return;
    e.preventDefault();
    e.stopImmediatePropagation();
    publishGuard=true;
    try {
      const expectedVersion = Number(manifest?.catalogVersion||0)+1;
      const uploadedPaths = Array.from(pendingFiles?.keys?.()||[]);
      // publishFixed сортирует массивы перед записью — делаем то же до формирования эталона.
      cocktails.sort((a,b)=>String(a?.name||'').localeCompare(String(b?.name||''),'ru',{sensitivity:'base'}));
      ingredients.sort((a,b)=>String(a?.name||'').localeCompare(String(b?.name||''),'ru',{sensitivity:'base'}));
      if(Array.isArray(window.barProducts)) window.barProducts.sort((a,b)=>String(a?.name||'').localeCompare(String(b?.name||''),'ru',{sensitivity:'base'}));
      const expectedCocktails=JSON.stringify(cocktails);
      const expectedIngredients=JSON.stringify(ingredients);
      const expectedProducts=Array.isArray(window.barProducts)?JSON.stringify(window.barProducts):null;

      await window.publishFixed();
      if (dirty) return;

      await verifyServer(expectedVersion,expectedCocktails,expectedIngredients,expectedProducts,uploadedPaths);
      mediaCache.clear();
      await forceServerReload(false);
      toast(`Опубликовано и ПРОВЕРЕНО на сервере · каталог v${expectedVersion}${uploadedPaths.length?' · фото '+uploadedPaths.length:''}`);
    } catch(e2) {
      toast('Публикация не подтверждена сервером: '+(e2?.message||e2),true);
    } finally { publishGuard=false; }
  }, true);

  function ensureReloadButton(){
    if(document.getElementById('serverReloadBtn'))return;
    const status=document.querySelector('.side .status');
    if(!status)return;
    const b=document.createElement('button');b.id='serverReloadBtn';b.className='ghost';b.style.cssText='width:100%;margin-top:10px';b.textContent='↻ Обновить с сервера';
    b.onclick=()=>forceServerReload(true);status.insertAdjacentElement('afterend',b);
  }
  ensureReloadButton();

  // После того как все модули Electron загружены, обязательно перечитываем сервер заново.
  setTimeout(async()=>{
    ensureReloadButton();
    const saved=localStorage.getItem('baliAdminToken');
    if(saved){
      token=saved;
      const input=document.getElementById('token');if(input)input.value=saved;
      try{
        await forceServerReload(false);
        document.getElementById('login')?.classList.add('hidden');
        document.getElementById('app')?.classList.remove('hidden');
      }catch{}
    }
  },350);

  window.addEventListener('focus',()=>{
    if(token && Date.now()-lastReloadAt>15000) forceServerReload(false);
  });
})();
