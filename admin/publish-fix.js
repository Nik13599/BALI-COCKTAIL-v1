(() => {
const state={publishing:false};
function pathUrl(path){return path.split('/').map(encodeURIComponent).join('/')}
function clearSavedToken(){for(const k of ['baliAdminToken','baliMobileAdminToken','githubToken','token']){try{localStorage.removeItem(k)}catch{}}}
async function gh(url,opt={}){
  const make=scheme=>fetch(url,{...opt,headers:{'Accept':'application/vnd.github+json','Authorization':scheme+' '+token,'X-GitHub-Api-Version':'2022-11-28',...(opt.headers||{})}});
  let r=await make('Bearer');
  if((r.status===401||r.status===403)&&token) r=await make('token');
  if(!r.ok){let text='';try{text=await r.text()}catch{};let msg=text;try{const j=JSON.parse(text);msg=j.message||text}catch{};const e=new Error(msg||`GitHub HTTP ${r.status}`);e.status=r.status;e.body=text;throw e}
  return r.status===204?null:r.json();
}
async function repoPermission(){const r=await gh(`https://api.github.com/repos/${OWNER}/${REPO}`);return r.permissions||{}}
async function getContentMeta(path){try{return await gh(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${pathUrl(path)}?ref=${encodeURIComponent(BRANCH)}`)}catch(e){if(e.status===404)return null;throw e}}
async function putContent(path,contentBase64,message){const meta=await getContentMeta(path);const body={message,content:contentBase64,branch:BRANCH};if(meta?.sha)body.sha=meta.sha;return gh(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${pathUrl(path)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
function jsonB64(v){return btoa(unescape(encodeURIComponent(JSON.stringify(v,null,2))))}
function setPublishing(on){state.publishing=on;document.querySelectorAll('.publish').forEach(b=>{b.disabled=on;b.textContent=on?'Публикация…':'Опубликовать'})}
async function publishFixed(){
  if(state.publishing)return;
  const productsDirty=Boolean(window.barMenuDirty);
  if(!dirty&&pendingFiles.size===0&&!productsDirty)return toast('Нет изменений для публикации');
  setPublishing(true);
  const oldVersion=Number(manifest?.catalogVersion||0),nextVersion=oldVersion+1;
  const nextManifest={...(manifest||{}),catalogVersion:nextVersion,updatedAt:new Date().toISOString()};
  try{
    const perm=await repoPermission();
    if(perm.push===false){const e=new Error('Этот token может читать репозиторий, но GitHub сообщает permissions.push=false.');e.status=403;throw e}
    // Важен порядок: сначала медиа, затем каталоги, manifest всегда последним.
    for(const [path,b64] of pendingFiles) await putContent(path,b64,`BALI ADMIN: upload ${path}`);
    await putContent('data/cocktails.json',jsonB64(cocktails),`BALI ADMIN: cocktails v${nextVersion}`);
    await putContent('data/ingredients.json',jsonB64(ingredients),`BALI ADMIN: ingredients v${nextVersion}`);
    if(Array.isArray(barProducts)) await putContent('data/products.json',jsonB64(barProducts),`BALI ADMIN: products v${nextVersion}`);
    await putContent('data/manifest.json',jsonB64(nextManifest),`BALI ADMIN: publish v${nextVersion}`);
    manifest=nextManifest;pendingFiles.clear();window.barMenuDirty=false;window.ingredientsSynthesized=0;markClean();
    if($('versionText'))$('versionText').textContent=`Каталог v${nextVersion}`;if($('kVersion'))$('kVersion').textContent=nextVersion;renderAll();
    toast(`Опубликовано. Версия ${nextVersion}. Мобильные приложения получат обновление при синхронизации.`);
  }catch(e){
    const msg=String(e?.message||e);
    if(e?.status===401||e?.status===403||msg.includes('Resource not accessible by personal access token')){
      clearSavedToken();
      toast('GitHub отклонил право записи. Сохранённый token удалён, чтобы приложение не продолжало использовать старый ключ. Переподключитесь с Fine-grained PAT: Repository access → BALI-COCKTAIL-v1; Contents → Read and write. Ответ GitHub: '+msg,true);
    }else toast('Ошибка публикации: '+msg,true);
  }finally{setPublishing(false);bind()}
}
function bind(){document.querySelectorAll('.publish').forEach(b=>{b.onclick=publishFixed;b.dataset.publishFixed='2'})}
window.publishFixed=publishFixed;window.BALI_putContent=putContent;window.BALI_checkWriteAccess=repoPermission;bind();new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
})();
