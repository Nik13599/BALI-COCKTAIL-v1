(() => {
const state={publishing:false};
function pathUrl(path){return path.split('/').map(encodeURIComponent).join('/')}
async function getContentMeta(path){const r=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${pathUrl(path)}?ref=${encodeURIComponent(BRANCH)}`,{headers:{'Accept':'application/vnd.github+json','Authorization':'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'}});if(r.status===404)return null;if(!r.ok)throw new Error((await r.text())||String(r.status));return r.json()}
async function putContent(path,contentBase64,message){const meta=await getContentMeta(path);const body={message,content:contentBase64,branch:BRANCH};if(meta?.sha)body.sha=meta.sha;const r=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${pathUrl(path)}`,{method:'PUT',headers:{'Accept':'application/vnd.github+json','Authorization':'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error((await r.text())||String(r.status));return r.json()}
function jsonB64(v){return btoa(unescape(encodeURIComponent(JSON.stringify(v,null,2))))}
function setPublishing(on){state.publishing=on;document.querySelectorAll('.publish').forEach(b=>{b.disabled=on;b.textContent=on?'Публикация…':'Опубликовать'})}
async function publishFixed(){if(state.publishing)return;const productsDirty=Boolean(window.barMenuDirty);if(!dirty&&pendingFiles.size===0&&!productsDirty)return toast('Нет изменений для публикации');setPublishing(true);const oldVersion=Number(manifest?.catalogVersion||0),nextVersion=oldVersion+1;const nextManifest={...(manifest||{}),catalogVersion:nextVersion,updatedAt:new Date().toISOString()};try{
for(const [path,b64] of pendingFiles){await putContent(path,b64,`BALI ADMIN: upload ${path}`)}
await putContent('data/cocktails.json',jsonB64(cocktails),`BALI ADMIN: cocktails v${nextVersion}`);
await putContent('data/ingredients.json',jsonB64(ingredients),`BALI ADMIN: ingredients v${nextVersion}`);
if(Array.isArray(barProducts))await putContent('data/products.json',jsonB64(barProducts),`BALI ADMIN: products v${nextVersion}`);
await putContent('data/manifest.json',jsonB64(nextManifest),`BALI ADMIN: publish v${nextVersion}`);
manifest=nextManifest;pendingFiles.clear();window.barMenuDirty=false;window.ingredientsSynthesized=0;markClean();if($('versionText'))$('versionText').textContent=`Каталог v${nextVersion}`;if($('kVersion'))$('kVersion').textContent=nextVersion;renderAll();toast(`Опубликовано. Версия ${nextVersion}. Мобильные приложения получат обновление при синхронизации.`)
}catch(e){const msg=String(e?.message||e);if(msg.includes('Resource not accessible by personal access token')||msg.includes('403'))toast('GitHub отклонил публикацию. У token должно быть Repository access к BALI-COCKTAIL-v1 и Repository permissions → Contents → Read and write.',true);else toast('Ошибка публикации: '+msg,true)}finally{setPublishing(false);bind()}}
function bind(){document.querySelectorAll('.publish').forEach(b=>{b.onclick=publishFixed;b.dataset.publishFixed='1'})}
window.publishFixed=publishFixed;window.BALI_putContent=putContent;bind();new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
})();
