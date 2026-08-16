(() => {
  const CATS=['Виски','Ром','Джин','Текила','Водка','Ликёры','Вермуты','Коньяк / бренди','Пиво','Белое вино','Красное вино','Шампанское / игристое вино','Безалкогольное вино','Напитки','Кофе / чай'];
  window.barProducts=[]; window.barMenuDirty=false;
  let loaded=false, selected=null, q='', cat='Все';
  const chosen=new Set();
  const $=id=>document.getElementById(id);
  const safe=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const n=v=>v===''||v==null?null:(Number.isFinite(Number(v))?Number(v):null);
  const money=v=>v==null||v===''?'—':new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(Number(v))+' BYN';
  const cats=()=>[...new Set([...CATS,...window.barProducts.map(x=>x.category).filter(Boolean)])];
  const touch=()=>{window.barMenuDirty=true;try{markDirty()}catch(_){}};
  const idgen=()=>`product-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;

  async function loadJson(path,fallback=[]){
    try{const x=await api(`/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`);return JSON.parse(dec(x.content))}
    catch(e){if(String(e.message||e).includes('404')||String(e.message||e).includes('Not Found'))return fallback;throw e}
  }

  function styles(){
    if($('barProdStyles'))return;
    const s=document.createElement('style');s.id='barProdStyles';s.textContent=`
    .bp-grid{display:grid;grid-template-columns:minmax(680px,52%) 1fr;gap:16px}
    .bp-toolbar{display:grid;grid-template-columns:minmax(360px,1fr) minmax(260px,330px);gap:10px;margin-bottom:10px}
    .bp-head,.bp-row{display:grid;grid-template-columns:28px minmax(250px,1fr) 95px 115px 105px 125px;gap:9px;align-items:center}
    .bp-head{padding:4px 10px 8px;color:var(--muted);font-size:10px;font-weight:850;text-transform:uppercase;letter-spacing:.35px}
    .bp-row{padding:10px;border:1px solid transparent;border-radius:12px;cursor:pointer}.bp-row:hover,.bp-row.active{background:var(--panel2);border-color:var(--line)}.bp-row.off{opacity:.45}
    .bp-name{min-width:0}.bp-name b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bp-name small{color:var(--muted)}
    .bp-cell{white-space:nowrap;font-size:12px}.bp-price{font-weight:850;color:#fff}
    .bp-check{width:18px;height:18px;accent-color:var(--accent)}
    .bp-printbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0}.bp-printbar .muted{margin-left:auto}
    .bp-modal{position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.84);display:none;overflow:auto;padding:22px}.bp-modal.show{display:block}
    .bp-modalbar{position:sticky;top:0;z-index:610;display:flex;justify-content:center;gap:8px;align-items:center;background:#18181c;border:1px solid #33333a;border-radius:14px;padding:10px;max-width:920px;margin:0 auto 16px}
    .bp-pages{display:grid;gap:18px;justify-content:center}.bp-a4{position:relative;width:210mm;height:297mm;padding:12mm 12mm 11mm;background:#fff;color:#111;box-sizing:border-box;font-family:Arial,Helvetica,sans-serif;overflow:hidden;box-shadow:0 14px 45px #0008;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .bp-a4-head{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #111;padding-bottom:3mm;margin-bottom:3mm}.bp-a4-head b{font-size:16pt}.bp-a4-head span{font-size:8pt;color:#666}
    .bp-cat{font-size:10pt;font-weight:900;text-transform:uppercase;margin-top:2.3mm;padding:1.7mm 0 1mm;border-bottom:.7px solid #111}
    .bp-cols,.bp-pr{display:grid;grid-template-columns:minmax(0,1fr) 25mm 27mm 27mm 30mm;gap:2.5mm;align-items:center}.bp-cols{font-size:7pt;font-weight:850;color:#555;padding:1.2mm 0;border-bottom:.4px solid #aaa}.bp-pr{font-size:8.2pt;min-height:6.1mm;padding:.75mm 0;border-bottom:.25px solid #ddd}
    .bp-pr .nm{font-weight:700;min-width:0}.bp-pr .country{font-size:6.6pt;color:#777;margin-left:1.2mm}.bp-r{text-align:right;white-space:nowrap}.bp-a4-foot{position:absolute;bottom:6mm;left:12mm;right:12mm;display:flex;justify-content:space-between;font-size:6.5pt;color:#777}
    @media(max-width:1250px){.bp-grid{grid-template-columns:1fr}.bp-toolbar{grid-template-columns:1fr 280px}}
    @media print{@page{size:A4 portrait;margin:0}body>*:not(#barPrintModal){display:none!important}#barPrintModal{display:block!important;position:static!important;background:#fff!important;padding:0!important}.bp-modalbar{display:none!important}.bp-pages{display:block!important}.bp-a4{box-shadow:none!important;margin:0!important;page-break-after:always;break-after:page}.bp-a4:last-child{page-break-after:auto;break-after:auto}}
    `;document.head.appendChild(s)
  }

  function install(){
    styles(); const nav=document.querySelector('.nav'),main=document.querySelector('#app main'); if(!nav||!main)return false;
    if(!document.querySelector('[data-view="barProducts"]')){const b=document.createElement('button');b.dataset.view='barProducts';b.textContent='Продукция';b.onclick=()=>open();nav.appendChild(b)}
    if(!$('barProducts')){const sec=document.createElement('section');sec.id='barProducts';sec.className='view hidden';sec.innerHTML=`
      <div class="top"><div><div class="title">Продукция</div><div class="muted">Алкогольная и безалкогольная продукция · цены в белорусских рублях</div></div><div class="actions"><button id="bpAdd" class="ghost">+ Добавить позицию</button><button class="primary publish">Опубликовать</button></div></div>
      <div class="bp-grid">
       <div class="card">
        <div class="bp-toolbar"><input id="bpSearch" class="search" placeholder="Поиск продукции, бренда или страны"><select id="bpCat"></select></div>
        <div class="bp-printbar"><button id="bpVisible" class="ghost">Выбрать видимые</button><button id="bpAll" class="ghost">Выбрать все активные</button><button id="bpClear" class="ghost">Снять выбор</button><button id="bpPrint" class="primary">Печать выбранного A4</button><span id="bpCount" class="muted"></span></div>
        <div class="bp-head"><span></span><span>Наименование</span><span>Граммовка</span><span>Цена</span><span>Бутылка</span><span>Цена бутылки</span></div><div id="bpList"></div>
       </div>
       <div id="bpEditor" class="card"><div class="empty">Выберите позицию слева</div></div>
      </div>`;main.appendChild(sec);
      const modal=document.createElement('div');modal.id='barPrintModal';modal.className='bp-modal';modal.innerHTML='<div class="bp-modalbar"><button id="bpDoPrint" class="primary">Печать / PDF</button><button id="bpClosePrint" class="ghost">Закрыть</button><span class="muted">A4 · несколько листов · только выбранные позиции</span></div><div id="bpPages" class="bp-pages"></div>';document.body.appendChild(modal);
      $('bpAdd').onclick=add;$('bpSearch').oninput=e=>{q=e.target.value;renderList()};$('bpCat').onchange=e=>{cat=e.target.value;renderList()};
      $('bpVisible').onclick=()=>{visible().forEach(p=>chosen.add(p.id));renderList()};$('bpAll').onclick=()=>{window.barProducts.filter(p=>p.active!==false).forEach(p=>chosen.add(p.id));renderList()};$('bpClear').onclick=()=>{chosen.clear();renderList()};
      $('bpPrint').onclick=previewPrint;$('bpDoPrint').onclick=()=>window.print();$('bpClosePrint').onclick=()=>$('barPrintModal').classList.remove('show');
    }
    return true
  }

  function open(){
    if(!install())return; document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$('barProducts').classList.remove('hidden');document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view==='barProducts'));ensure().then(render)
  }
  async function ensure(){if(loaded)return;window.barProducts=await loadJson('data/products.json',[]);loaded=true;render()}
  function visible(){const x=q.trim().toLowerCase();return window.barProducts.filter(p=>(cat==='Все'||p.category===cat)&&(!x||[p.name,p.country,p.category].join(' ').toLowerCase().includes(x))).sort((a,b)=>(CATS.indexOf(a.category)-CATS.indexOf(b.category))||Number(a.order||0)-Number(b.order||0)||String(a.name).localeCompare(String(b.name),'ru'))}
  function render(){renderCats();renderList();renderEditor()}
  function renderCats(){if(!$('bpCat'))return;const opts=['Все',...cats()];$('bpCat').innerHTML=opts.map(x=>`<option ${x===cat?'selected':''}>${safe(x)}</option>`).join('')}
  function renderList(){if(!$('bpList'))return;const arr=visible();$('bpList').innerHTML=arr.map(p=>`<div class="bp-row ${p.id===selected?'active':''} ${p.active===false?'off':''}" data-id="${safe(p.id)}"><input class="bp-check" type="checkbox" data-check="${safe(p.id)}" ${chosen.has(p.id)?'checked':''}><div class="bp-name"><b>${safe(p.name)}</b><small>${safe(p.country||'')} · ${safe(p.category||'')}</small></div><div class="bp-cell">${safe(p.portionLabel||'—')}</div><div class="bp-cell bp-price">${money(p.portionPrice)}</div><div class="bp-cell">${safe(p.bottleVolume||'—')}</div><div class="bp-cell bp-price">${money(p.bottlePrice)}</div></div>`).join('')||'<div class="empty">Ничего не найдено</div>';
    $('bpList').querySelectorAll('.bp-row').forEach(r=>r.onclick=e=>{if(e.target.matches('input'))return;selected=r.dataset.id;renderList();renderEditor()});
    $('bpList').querySelectorAll('[data-check]').forEach(c=>c.onchange=()=>{c.checked?chosen.add(c.dataset.check):chosen.delete(c.dataset.check);count()});count()
  }
  function count(){if($('bpCount'))$('bpCount').textContent=`Для печати выбрано: ${chosen.size}`}
  function renderEditor(){if(!$('bpEditor'))return;const p=window.barProducts.find(x=>x.id===selected);if(!p){$('bpEditor').innerHTML='<div class="empty">Выберите позицию слева</div>';return}
    $('bpEditor').innerHTML=`<div class="section-title" style="margin-top:0">Карточка продукции</div><label>Наименование</label><input id="peName" value="${safe(p.name)}"><div class="two"><div><label>Категория</label><input id="peCat" value="${safe(p.category||'')}"></div><div><label>Страна / подпись</label><input id="peCountry" value="${safe(p.country||'')}"></div></div><div class="two"><div><label>Граммовка / порция</label><input id="pePortion" value="${safe(p.portionLabel||'')}" placeholder="40 мл"></div><div><label>Цена порции, BYN</label><input id="pePrice" type="number" step="0.01" value="${p.portionPrice??''}"></div></div><div class="two"><div><label>Объём бутылки</label><input id="peBottle" value="${safe(p.bottleVolume||'')}" placeholder="700 мл"></div><div><label>Цена бутылки, BYN</label><input id="peBottlePrice" type="number" step="0.01" value="${p.bottlePrice??''}"></div></div><div class="two"><div><label>Порядок</label><input id="peOrder" type="number" value="${p.order??0}"></div><div><label>Отображать</label><select id="peActive"><option value="true">Да</option><option value="false">Нет / архив</option></select></div></div><div class="actions" style="margin-top:16px"><button id="peSave" class="primary">Сохранить</button><button id="peCopy" class="ghost">Дублировать</button><button id="peArchive" class="danger">${p.active===false?'Вернуть':'В архив'}</button></div>`;$('peActive').value=String(p.active!==false);
    $('peSave').onclick=()=>{p.name=$('peName').value.trim();p.category=$('peCat').value.trim();p.country=$('peCountry').value.trim();p.portionLabel=$('pePortion').value.trim();p.portionPrice=n($('pePrice').value);p.bottleVolume=$('peBottle').value.trim();p.bottlePrice=n($('peBottlePrice').value);p.order=n($('peOrder').value)||0;p.active=$('peActive').value==='true';touch();render();toast('Позиция сохранена локально. Нажмите «Опубликовать».')};
    $('peCopy').onclick=()=>{const c={...p,id:idgen(),name:p.name+' — копия',order:Number(p.order||0)+1};window.barProducts.push(c);selected=c.id;touch();render()};
    $('peArchive').onclick=()=>{p.active=p.active===false;touch();render()}
  }
  function add(){const p={id:idgen(),category:cat==='Все'?'Виски':cat,name:'Новая позиция',country:'',portionLabel:'40 мл',portionPrice:null,bottleVolume:'',bottlePrice:null,active:true,order:999};window.barProducts.push(p);selected=p.id;touch();render()}
  function pageMarkup(items,page,total){
    let html=`<div class="bp-a4"><div class="bp-a4-head"><b>BALI · ПЕРЕЧЕНЬ ПРОДУКЦИИ</b><span>Страница ${page} из ${total}</span></div><div class="bp-cols"><span>Наименование</span><span class="bp-r">Граммовка</span><span class="bp-r">Цена</span><span class="bp-r">Бутылка</span><span class="bp-r">Цена бутылки</span></div>`;
    let current='';for(const p of items){if(p.category!==current){current=p.category;html+=`<div class="bp-cat">${safe(current)}</div>`}html+=`<div class="bp-pr"><div class="nm">${safe(p.name)}${p.country?`<span class="country">${safe(p.country)}</span>`:''}</div><div class="bp-r">${safe(p.portionLabel||'—')}</div><div class="bp-r bp-price">${money(p.portionPrice)}</div><div class="bp-r">${safe(p.bottleVolume||'—')}</div><div class="bp-r bp-price">${money(p.bottlePrice)}</div></div>`}
    html+=`<div class="bp-a4-foot"><span>BALI NIGHTCLUB</span><span>Цены указаны в белорусских рублях (BYN)</span></div></div>`;return html
  }
  function paginate(items){
    const pages=[];let page=[],units=0,last='';
    for(const p of items){const need=1+(p.category!==last?1.7:0);if(page.length&&units+need>30){pages.push(page);page=[];units=0;last=''}if(p.category!==last){units+=1.7;last=p.category}page.push(p);units+=1}if(page.length)pages.push(page);return pages
  }
  function previewPrint(){
    const items=window.barProducts.filter(p=>chosen.has(p.id)).sort((a,b)=>(CATS.indexOf(a.category)-CATS.indexOf(b.category))||Number(a.order||0)-Number(b.order||0)||String(a.name).localeCompare(String(b.name),'ru'));
    if(!items.length)return toast('Выберите продукцию для печати',true);const pages=paginate(items);$('bpPages').innerHTML=pages.map((x,i)=>pageMarkup(x,i+1,pages.length)).join('');$('barPrintModal').classList.add('show')
  }

  const baseLoad=window.loadAll;
  if(typeof baseLoad==='function')window.loadAll=async function(...args){const r=await baseLoad.apply(this,args);try{await ensure()}catch(_){}return r};
  const obs=new MutationObserver(()=>install());obs.observe(document.documentElement,{childList:true,subtree:true});install();
  window.renderBarProducts=render;
})();