(() => {
const state={publishing:false};
function pathUrl(path){return path.split('/').map(encodeURIComponent).join('/')}
function clearSavedToken(){for(const k of ['baliAdminToken','baliMobileAdminToken','githubToken','token']){try{localStorage.removeItem(k)}catch{}}}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function gh(url,opt={}){
  const make=scheme=>fetch(url,{cache:'no-store',...opt,headers:{'Accept':'application/vnd.github+json','Authorization':scheme+' '+token,'X-GitHub-Api-Version':'2022-11-28','Cache-Control':'no-cache, no-store, max-age=0','Pragma':'no-cache',...(opt.headers||{})}});
  let r=await make('Bearer');
  if((r.status===401||r.status===403)&&token) r=await make('token');
  if(!r.ok){let text='';try{text=await r.text()}catch{};let msg=text;try{const j=JSON.parse(text);msg=j.message||text}catch{};const e=new Error(msg||`GitHub HTTP ${r.status}`);e.status=r.status;e.body=text;throw e}
  return r.status===204?null:r.json();
}
async function repoPermission(){const r=await gh(`https://api.github.com/repos/${OWNER}/${REPO}?_bali=${Date.now()}`);return r.permissions||{}}
async function getContentMeta(path){
  try{return await gh(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${pathUrl(path)}?ref=${encodeURIComponent(BRANCH)}&_bali=${Date.now()}-${Math.random()}`)}
  catch(e){if(e.status===404)return null;throw e}
}
function conflictError(e){const m=String(e?.message||e).toLowerCase();return e?.status===409||e?.status===422||m.includes('does not match')||m.includes('sha')&&m.includes('match')}
async function putContent(path,contentBase64,message){
  let lastErr=null;
  for(let attempt=1;attempt<=4;attempt++){
    try{
      const meta=await getContentMeta(path);
      const body={message,content:contentBase64,branch:BRANCH};
      if(meta?.sha)body.sha=meta.sha;
      return await gh(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${pathUrl(path)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    }catch(e){
      lastErr=e;
      if(!conflictError(e)||attempt===4)throw e;
      await sleep(350*attempt);
    }
  }
  throw lastErr||new Error('Не удалось записать '+path);
}
function jsonB64(v){return btoa(unescape(encodeURIComponent(JSON.stringify(v,null,2))))}
function setPublishing(on){state.publishing=on;document.querySelectorAll('.publish').forEach(b=>{b.disabled=on;b.textContent=on?'Публикация…':'Опубликовать'})}

// Все новые официальные изображения нормализуются в админке до точного размера 500×500 px.
// Коктейль: квадратный center-crop. Ингредиент: contain на прозрачном квадрате, чтобы не обрезать бутылку.
async function normalizeImage500(file,base){
  const isIngredient=String(base||'').includes('/ingredients/');
  const bitmap=await createImageBitmap(file);
  const canvas=document.createElement('canvas');canvas.width=500;canvas.height=500;
  const ctx=canvas.getContext('2d',{alpha:true});ctx.clearRect(0,0,500,500);
  const iw=bitmap.width,ih=bitmap.height;
  if(isIngredient){
    const scale=Math.min(460/iw,460/ih);const w=iw*scale,h=ih*scale;
    ctx.drawImage(bitmap,(500-w)/2,(500-h)/2,w,h);
  }else{
    const scale=Math.max(500/iw,500/ih);const w=iw*scale,h=ih*scale;
    ctx.drawImage(bitmap,(500-w)/2,(500-h)/2,w,h);
  }
  bitmap.close?.();
  const mime=isIngredient?'image/png':'image/jpeg';
  const ext=isIngredient?'.png':'.jpg';
  const dataUrl=canvas.toDataURL(mime,isIngredient?undefined:0.92);
  return {path:String(base).replace(/\.(png|jpe?g|webp)$/i,'')+ext,b64:dataUrl.split(',')[1],dataUrl};
}
window.BALI_normalizeImage500=normalizeImage500;
try{
  queueImage=function(file,base,done){
    if(!file)return;
    normalizeImage500(file,base).then(x=>{
      pendingFiles.set(x.path,x.b64);done(x.path);
      toast('Изображение подготовлено: 500 × 500 px');
    }).catch(e=>toast('Не удалось обработать изображение: '+(e?.message||e),true));
  };
}catch{}

async function publishFixed(){
  if(state.publishing)return false;
  const productsDirty=Boolean(window.barMenuDirty);
  if(!dirty&&pendingFiles.size===0&&!productsDirty){toast('Нет изменений для публикации');return false}
  setPublishing(true);
  const oldVersion=Number(manifest?.catalogVersion||0),nextVersion=oldVersion+1;
  const nextManifest={...(manifest||{}),catalogVersion:nextVersion,updatedAt:new Date().toISOString()};
  try{
    const perm=await repoPermission();
    if(perm.push===false){const e=new Error('Этот token может читать репозиторий, но GitHub сообщает permissions.push=false.');e.status=403;throw e}
    let uploadedMedia=0;
    for(const [path,b64] of pendingFiles){await putContent(path,b64,`BALI ADMIN: upload ${path}`);uploadedMedia++}
    cocktails.sort((a,b)=>String(a?.name||'').localeCompare(String(b?.name||''),'ru',{sensitivity:'base'}));
    ingredients.sort((a,b)=>String(a?.name||'').localeCompare(String(b?.name||''),'ru',{sensitivity:'base'}));
    await putContent('data/cocktails.json',jsonB64(cocktails),`BALI ADMIN: cocktails v${nextVersion}`);
    await putContent('data/ingredients.json',jsonB64(ingredients),`BALI ADMIN: ingredients v${nextVersion}`);
    if(Array.isArray(window.barProducts)) await putContent('data/products.json',jsonB64(window.barProducts),`BALI ADMIN: products v${nextVersion}`);
    await putContent('data/manifest.json',jsonB64(nextManifest),`BALI ADMIN: publish v${nextVersion}`);
    manifest=nextManifest;pendingFiles.clear();window.barMenuDirty=false;window.ingredientsSynthesized=0;markClean();
    if($('versionText'))$('versionText').textContent=`Каталог v${nextVersion}`;if($('kVersion'))$('kVersion').textContent=nextVersion;renderAll();
    toast(`Опубликовано. Версия ${nextVersion}${uploadedMedia?` · фото: ${uploadedMedia}`:''}. Мобильные приложения обновятся автоматически при наличии интернета.`);
    return true;
  }catch(e){
    const msg=String(e?.message||e);
    if(e?.status===401||e?.status===403||msg.includes('Resource not accessible by personal access token')){
      clearSavedToken();
      toast('GitHub отклонил право записи. Сохранённый token удалён. Переподключитесь с Fine-grained PAT: Repository access → BALI-COCKTAIL-v1; Contents → Read and write. Ответ GitHub: '+msg,true);
    }else if(conflictError(e)){
      toast('GitHub изменил SHA файла во время публикации. Автоповтор не помог. Нажмите «↻ Обновить с сервера» и повторите публикацию. Ответ: '+msg,true);
    }else toast('Ошибка публикации: '+msg,true);
    return false;
  }finally{setPublishing(false);bind()}
}
function bind(){document.querySelectorAll('.publish').forEach(b=>{b.onclick=publishFixed;b.dataset.publishFixed='4'})}
window.publishFixed=publishFixed;window.BALI_putContent=putContent;window.BALI_checkWriteAccess=repoPermission;bind();new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
})();