(() => {
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const isConflict=e=>{const m=String(e?.message||e).toLowerCase();return e?.status===409||e?.status===422||m.includes('does not match')||(m.includes('sha')&&m.includes('match'))};

  request=async function(url,opt={}){
    const make=scheme=>fetch(url,{cache:'no-store',...opt,headers:{Accept:'application/vnd.github+json',Authorization:scheme+' '+token,'X-GitHub-Api-Version':'2022-11-28','Cache-Control':'no-cache, no-store, max-age=0','Pragma':'no-cache',...(opt.headers||{})}});
    let r=await make('Bearer');if((r.status===401||r.status===403)&&token)r=await make('token');
    if(!r.ok){let body='';try{body=await r.text()}catch{};let msg=body;try{const j=JSON.parse(body);msg=j.message||body}catch{};const e=new Error(msg||`GitHub HTTP ${r.status}`);e.status=r.status;e.body=body;throw e}
    return r.status===204?null:r.json();
  };
  api=async function(path,opt={}){return request('https://api.github.com'+path,opt)};
  meta=async function(path){try{return await api(`/repos/${OWNER}/${REPO}/contents/${pathUrl(path)}?ref=${BRANCH}&_bali=${Date.now()}-${Math.random()}`)}catch(e){if(e.status===404)return null;throw e}};
  put=async function(path,content,message){let last;for(let n=1;n<=4;n++){try{const m=await meta(path),body={message,content,branch:BRANCH};if(m?.sha)body.sha=m.sha;return await api(`/repos/${OWNER}/${REPO}/contents/${pathUrl(path)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}catch(e){last=e;if(!isConflict(e)||n===4)throw e;await sleep(300*n)}}throw last};

  async function serverJson(path){const x=await meta(path);return JSON.parse(unb64(x.content))}
  const basePublish=publish;
  publish=async function(){
    await basePublish();
    if(dirty||pending.size)return;
    try{
      const m=await serverJson('data/manifest.json');
      manifest=m;
      $('version').textContent=`Каталог v${m.catalogVersion||0}`;
      toast(`Опубликовано и проверено на сервере · каталог v${m.catalogVersion||0}`);
    }catch(e){toast('Публикация выполнена, но контрольное чтение не прошло: '+(e?.message||e),true)}
  };
  $('publish').onclick=publish;

  // При входе/возврате в приложение всегда перечитываем сервер, чтобы не видеть устаревшую карточку.
  const forceReload=()=>{if(token&&!dirty)load().catch(()=>{})};
  window.addEventListener('focus',()=>setTimeout(forceReload,150));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(forceReload,150)});
})();