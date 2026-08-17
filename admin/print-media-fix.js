(() => {
  const cache = new Map();
  const pathUrl = path => String(path||'').split('/').map(encodeURIComponent).join('/');
  const mimeFor = path => /\.png$/i.test(path) ? 'image/png' : /\.webp$/i.test(path) ? 'image/webp' : 'image/jpeg';

  async function mediaData(path){
    if(!path) return '';
    const pending = window.pendingFiles?.get?.(path) || (typeof pendingFiles!=='undefined' ? pendingFiles.get(path) : null);
    if(pending) return `data:${mimeFor(path)};base64,${pending}`;
    if(cache.has(path)) return cache.get(path);
    const url=`https://api.github.com/repos/${OWNER}/${REPO}/contents/${pathUrl(path)}?ref=${encodeURIComponent(BRANCH)}&_bali=${Date.now()}`;
    const headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
    if(typeof token!=='undefined' && token) headers.Authorization='Bearer '+token;
    let r=await fetch(url,{headers,cache:'no-store'});
    if((r.status===401||r.status===403) && typeof token!=='undefined' && token){headers.Authorization='token '+token;r=await fetch(url,{headers,cache:'no-store'})}
    if(!r.ok) throw new Error(`Фото ${path}: GitHub HTTP ${r.status}`);
    const x=await r.json();
    const data=`data:${mimeFor(path)};base64,${String(x.content||'').replace(/\n/g,'')}`;
    cache.set(path,data);
    return data;
  }

  function byCocktailName(name){return (Array.isArray(cocktails)?cocktails:[]).find(c=>String(c.name||'').trim()===String(name||'').trim())}
  function byIngredientName(name){const n=String(name||'').trim().toLocaleLowerCase('ru');return (Array.isArray(ingredients)?ingredients:[]).find(i=>String(i.name||'').trim().toLocaleLowerCase('ru')===n)}

  async function hydrateCard(card){
    const title=card.querySelector('.tech-print-title')?.textContent?.trim();
    const cocktail=byCocktailName(title);
    if(cocktail?.officialImage){
      const top=card.querySelector('.tech-print-top');
      let img=top?.querySelector('.tech-print-photo');
      if(!img && top){
        const empty=top.querySelector('.tech-print-no-photo');
        img=document.createElement('img');img.className='tech-print-photo';img.alt='';
        if(empty) empty.replaceWith(img); else top.prepend(img);
      }
      if(img){
        img.dataset.mediaPath=cocktail.officialImage;
        try{img.src=await mediaData(cocktail.officialImage);img.dataset.hydrated='1'}catch(e){img.title=String(e?.message||e)}
      }
    }

    const jobs=[];
    card.querySelectorAll('.tech-print-ing').forEach(row=>{
      const name=row.querySelector('.tech-print-ing-name')?.textContent?.trim();
      const ref=byIngredientName(name);
      if(!ref?.officialImage) return;
      jobs.push((async()=>{
        let img=row.querySelector('img.ing-img');
        if(!img){
          const old=row.querySelector('.ing-sprite,.empty-vis');
          img=document.createElement('img');img.className='ing-img';img.alt='';
          if(old) old.replaceWith(img); else row.prepend(img);
        }
        img.dataset.mediaPath=ref.officialImage;
        try{img.src=await mediaData(ref.officialImage);img.dataset.hydrated='1'}catch(e){img.title=String(e?.message||e)}
      })());
    });
    await Promise.allSettled(jobs);
  }

  async function hydrateAll(){
    const cards=[...document.querySelectorAll('.tech-print-card')];
    await Promise.allSettled(cards.map(hydrateCard));
  }
  window.BALI_hydratePrintMedia=hydrateAll;

  let timer=0;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(()=>hydrateAll(),25)};
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});

  const nativePrint=window.print.bind(window);
  window.print=function(){
    const printing=document.getElementById('bartenderPrintRoot')?.classList.contains('printing');
    if(!printing) return nativePrint();
    hydrateAll().then(()=>new Promise(r=>setTimeout(r,80))).then(()=>nativePrint()).catch(()=>nativePrint());
  };

  document.addEventListener('change',e=>{
    if(e.target?.id==='cPhoto'||e.target?.id==='iPhoto') setTimeout(()=>{cache.clear();hydrateAll()},120);
  },true);
  document.addEventListener('click',e=>{
    if(e.target?.id==='saveCocktail'||e.target?.id==='saveIngredient'||e.target?.classList?.contains('publish')) setTimeout(()=>{cache.clear();hydrateAll()},200);
  },true);
  setTimeout(hydrateAll,250);
})();
