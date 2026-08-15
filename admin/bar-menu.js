(() => {
  const CATEGORY_ORDER = [
    'Виски','Ром','Джин','Текила','Водка','Ликёры','Вермуты','Коньяк / бренди','Пиво',
    'Белое вино','Красное вино','Шампанское / игристое вино','Безалкогольное вино','Напитки','Кофе / чай'
  ];
  const CATEGORY_CODE = {
    'Виски':'whisky','Ром':'rum','Джин':'gin','Текила':'tequila','Водка':'vodka','Ликёры':'liqueurs','Вермуты':'vermouth',
    'Коньяк / бренди':'brandy','Пиво':'beer','Белое вино':'white-wine','Красное вино':'red-wine',
    'Шампанское / игристое вино':'sparkling','Безалкогольное вино':'nonalc-wine','Напитки':'soft-drinks','Кофе / чай':'coffee-tea'
  };

  const SOURCE_ROWS = {
    'Виски':[
      ['Laphroaig Selekt','Scotland',60,'700 мл',1500],['Macallan 12','Scotland',90,'700 мл',1575],['Macallan 15','Scotland',null,'700 мл',2500],['Macallan 18','Scotland',null,'700 мл',5000],
      ['Glenfiddich 12','Scotland',34,'700 мл',595],['Glenfiddich 15','Scotland',86,'700 мл',1505],['Johnnie Walker RED Label','Scotland',22,'1000 мл',550],['Johnnie Walker BLACK Label','Scotland',36,'1000 мл',900],
      ['Johnnie Walker BLUE Label','Scotland',null,'700 мл',3000],['Tullamore D.E.W.','Ireland',30,'700 мл',525],["Jack Daniel's",'USA',30,'700 мл',750],["Jack Daniel's Fire",'USA',38,'700 мл',665],
      ['The Deacon','Scotland',34,'700 мл',595],['Monkey Shoulder','Scotland',34,'700 мл',850],["Maker's Mark",'USA',36,'1000 мл',900],["Jack Daniel's Honey",'USA',32,'700 мл',560],
      ['Bushmills','Ireland',18,'1000 мл',450],['Chivas Regal 12','Scotland',32,'1000 мл',800],['Chivas Regal 18','Scotland',null,'700 мл',1500],['Chivas Regal 21','Scotland',null,'700 мл',2200],
      ['Jameson','Ireland',23,'1000 мл',575],['Jameson Crested','Ireland',32,'700 мл',560],['Jameson Stout Edition','Ireland',28,'700 мл',490]
    ],
    'Ром':[
      ['Bumbu The Original','Barbados',32,'700 мл',560],['Bumbu XO','Barbados',40,'700 мл',700],['Matusalem Gran Reserva 15','Dominican',34,'700 мл',595],['Matusalem Gran Reserva 23','Dominican',null,'700 мл',1300],
      ['Plantation Original Dark','France',24,'700 мл',420],['Plantation Pineapple','France',34,'700 мл',595],['Plantation XO','France',44,'700 мл',770],['Dictador 12','Columbia',34,'700 мл',595],
      ['Bacardi Negra','Cuba',20,'1000 мл',500],['Bacardi Spiced','Cuba',22,'1000 мл',550],['Captain Morgan Dark','Jamaica',20,'1000 мл',500],['Captain Morgan Spiced','Jamaica',22,'1000 мл',550],['Kraken','London',26,'1000 мл',650]
    ],
    'Джин':[['Bulldog','London',34,'700 мл',595],['Bombay','London',24,'1000 мл',600],["Hendrick's",'Scotland',38,'700 мл',665],['Monkey 47','Germany',32,'500 мл',400],['Beefeater','London',22,'500 мл',275]],
    'Текила':[['Espolon Blanco','Mexico',24,'750 мл',450],['Espolon Reposado','Mexico',24,'750 мл',450],['Patron Reposado','Mexico',60,'700 мл',1050],['Patron Silver','Mexico',60,'700 мл',1050],['Clase Azul Reposado','Mexico',null,'700 мл',3000]],
    'Водка':[['Grey Goose','France',38,'1000 мл',950],['Finlandia','Finland',20,'1000 мл',500],['Absolut','Sweden',20,'700 мл',350],['Vseslav Charodey','Belarus',18,'700 мл',315]],
    'Ликёры':[
      ['Campari','Italy',20,'1000 мл',500],['Cynar','Italy',24,'700 мл',420],['Frangelico','Italy',30,'700 мл',525],['Aperol','Italy',20,'1000 мл',500],['Sarti Rosa','Italy',22,'700 мл',385],['Bumbu Cream','Barbados',26,'700 мл',455],
      ['Jagermeister','Germany',22,'1000 мл',550],['Jagermeister Manifest','Germany',32,'1000 мл',800],['Jagermeister Orange','Germany',30,'1000 мл',750],['Becherovka','Czech Republic',20,'700 мл',350],['Fireball','Canada',20,'1000 мл',500],['Absent Pernod','France',30,'700 мл',525]
    ],
    'Вермуты':[['Martini Extra Dry','Italy',14,'1000 мл',350],['Martini Rosso','Italy',14,'1000 мл',350],['Martini Bianco','Italy',14,'1000 мл',350],['Martini Fiero','Italy',16,'1000 мл',400]],
    'Коньяк / бренди':[['Courvoisier VS','France',60,'700 мл',1050],['Courvoisier VSOP','France',64,'700 мл',1120],['Hennessy VS','France',44,'700 мл',770],['Hennessy VSOP','France',70,'700 мл',1225],['Hennessy XO','France',240,'700 мл',4200],['Torres 10','Spain',22,'700 мл',385]],
    'Пиво':[['Miller','Belarus','450 мл',15],['Maison Arne Blanche','Belarus','400 мл',15],['Krushovice Alco 0%','Belarus','330 мл',10],['Corona Extra','Mexico','335 мл',20]],
    'Белое вино':[['Casillero De Diablo Sauv. Blanc сухое','Chile',24,144],['Villa Wolf Gewurztraminer полусухое','Germany',36,216],['1D Chablis Premier Cru сухое','France',200,1200],['Gustave Lorenz Riesling reserv полусухое','France',38,228],['Domaine Marguerite Carillon сухое','France',30,180]],
    'Красное вино':[['Casillero De Diablo Carmenere сухое','Chile',24,144],['Planeta La Segreta Il Rosso сухое','Italy',36,216],["Ca'Bianca Barolo DOCG сухое",'Italy',150,900],['Cioccolate Tube Primitivo полусухое','Italy',40,240],['The Dogfather Zinfandel Reserve полусухое','USA',46,276]],
    'Шампанское / игристое вино':[
      ['Cin Zano Asti','Italy',28,168],['Prosecco Bea Vita','Italy',26,156],['Mazet Brut','France',26,156],['Luc Belaire розовое сухое','France',null,500],['Luc Belaire белое брют','France',null,500],
      ['Veuve Clicquot Brut белое брют','France',null,1500],['Moet & Chandon Brut белое брют','France',null,850],['Moet & Chandon Brut розовое брют','France',null,950],['Bottega Gold Prosecco белое брют','Italy',75,450],
      ['Bottega Rose Gold Pinot Nero розовое брют','Italy',90,540],['Mumm белое брют','France',null,750],['Dom Perignon Brut','France',null,6000],['Ruinart, Blanc de Blancs','France',null,3000]
    ],
    'Безалкогольное вино':[['Nozeco игристое','France',18,108],['Light house белое','Germany',18,108],['Light house розовое','Germany',18,108]],
    'Напитки':[['Рич апельсин/вишня/яблоко/томат','Belarus','200 мл',10],['Кока-кола/Швепс/Спрайт','Belarus','330 мл',10],['Кока-кола зеро','Belarus','330 мл',10],['Red Bull','Austria','250 мл',15],['Red Bull зеро','Austria','250 мл',15],['Боровая газ/негаз','Belarus','200 мл',10],['Tassay газ/негаз','Kazakhstan','750 мл',40]],
    'Кофе / чай':[['Американо','',10],['Эспрессо','',10],['Черный чай','',10],['Зеленый чай','',10]]
  };

  function defaultProducts() {
    const out=[];
    CATEGORY_ORDER.forEach(cat => {
      const rows=SOURCE_ROWS[cat]||[];
      rows.forEach((r,idx) => {
        const p={id:`${CATEGORY_CODE[cat]||'item'}-${String(idx+1).padStart(3,'0')}`,category:cat,name:r[0],country:r[1]||'',portionLabel:'',portionPrice:null,bottleVolume:'',bottlePrice:null,active:true,order:idx+1};
        if (['Виски','Ром','Джин','Текила','Водка','Ликёры','Вермуты','Коньяк / бренди'].includes(cat)) { p.portionLabel='40 мл';p.portionPrice=r[2];p.bottleVolume=r[3];p.bottlePrice=r[4]; }
        else if (['Белое вино','Красное вино','Шампанское / игристое вино','Безалкогольное вино'].includes(cat)) { p.portionLabel='125 мл';p.portionPrice=r[2];p.bottleVolume='Бутылка';p.bottlePrice=r[3]; }
        else if (['Пиво','Напитки'].includes(cat)) { p.portionLabel=r[2];p.portionPrice=r[3]; }
        else { p.portionPrice=r[2]; }
        out.push(p);
      });
    });
    return out;
  }

  const DEFAULT_CONFIG={
    format:'A3',orientation:'landscape',widthMm:420,heightMm:297,foldMm:[140,280],currency:'BYN',theme:'bali-volcanic',
    fontPt:8.4,headingPt:13,lineHeight:1.12,showCountry:true,showBottleVolume:true,showBottlePrice:true,showPortionPrice:true,
    autoFit:true,printFoldGuides:false,innerBackground:null,outerBackground:null,coverTitle:'BALI',coverSubtitle:'NIGHTCLUB',menuTitle:'BAR MENU'
  };

  window.barProducts=[];
  window.barMenuConfig={...DEFAULT_CONFIG};
  window.barMenuDirty=false;
  let barLoaded=false, selectedProduct=null, filterCategory='Все', productSearch='';
  const localBg={inner:null,outer:null};

  function safe(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function num(v){if(v===''||v==null)return null;const n=Number(v);return Number.isFinite(n)?n:null;}
  function money(v){return v==null||v===''?'':new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(Number(v));}
  function allCategories(){return [...new Set([...CATEGORY_ORDER,...window.barProducts.map(x=>x.category).filter(Boolean)])];}
  function productId(){return 'product-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);}
  function touch(){window.barMenuDirty=true;try{markDirty();}catch(_){}}

  async function optionalJson(path,fallback){
    try{const x=await api(`/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`);return JSON.parse(dec(x.content));}
    catch(e){if(String(e.message||e).includes('404')||String(e.message||e).includes('Not Found'))return fallback;throw e;}
  }

  function installStyles(){
    if(document.getElementById('barMenuStyles'))return;
    const s=document.createElement('style');s.id='barMenuStyles';s.textContent=`
      .product-grid{display:grid;grid-template-columns:390px 1fr;gap:16px}.product-toolbar{display:grid;grid-template-columns:1fr 170px;gap:8px}.product-row{display:grid;grid-template-columns:1fr auto;gap:10px;padding:10px;border-radius:12px;border:1px solid transparent;cursor:pointer}.product-row:hover,.product-row.active{background:var(--panel2);border-color:var(--line)}.product-row.off{opacity:.48}.product-row small{color:var(--muted)}
      .menu-workspace{display:grid;grid-template-columns:340px 1fr;gap:16px}.menu-controls .control-line{display:grid;grid-template-columns:1fr 86px;align-items:center;gap:10px}.menu-controls input[type=range]{padding:0}.menu-preview-frame{background:#09090b;border:1px solid var(--line);border-radius:18px;overflow:auto;padding:14px;min-height:650px}.menu-scale-box{width:100%;height:610px;display:flex;justify-content:center;align-items:flex-start;overflow:hidden}
      .a3-menu-sheet{width:420mm;height:297mm;display:grid;grid-template-columns:repeat(3,140mm);position:relative;overflow:hidden;background:#10100e;color:#eee;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box}.a3-menu-sheet *{box-sizing:border-box}.a3-menu-sheet.previewed{transform:scale(.49);transform-origin:top center}
      .a3-menu-sheet::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 13% 18%,rgba(68,98,34,.22),transparent 25%),radial-gradient(circle at 86% 74%,rgba(40,70,30,.18),transparent 28%),linear-gradient(115deg,transparent 0 42%,rgba(216,59,13,.09) 42.3%,transparent 43%),linear-gradient(65deg,transparent 0 70%,rgba(255,84,15,.07) 70.2%,transparent 70.7%);z-index:0}.a3-menu-sheet.custom-bg{background-size:cover;background-position:center}.menu-panel{position:relative;z-index:1;padding:11mm 7.2mm 9mm;overflow:hidden;border-right:.2mm solid rgba(255,255,255,.08)}.menu-panel:last-child{border-right:0}.menu-panel::after{content:'';position:absolute;inset:4mm;border:.2mm solid rgba(255,255,255,.055);pointer-events:none}.fold-guide{position:absolute;top:0;bottom:0;width:0;border-left:.2mm dashed rgba(255,255,255,.22);z-index:20;pointer-events:none}.fold-guide.g1{left:140mm}.fold-guide.g2{left:280mm}.a3-menu-sheet.hide-guides .fold-guide{display:none}
      .menu-topline{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:3mm;border-bottom:.3mm solid rgba(203,143,160,.55);padding-bottom:1.8mm}.menu-topline b{font-size:var(--menu-heading,13pt);letter-spacing:.7pt}.menu-topline span{font-size:6.7pt;color:#aaa;text-transform:uppercase;letter-spacing:1pt}.menu-category{margin-bottom:2.6mm;break-inside:avoid}.menu-category-title{display:grid;grid-template-columns:1fr auto;align-items:end;gap:2mm;color:#f3eff0;font-size:var(--menu-heading,13pt);font-weight:900;margin:0 0 1.1mm;text-transform:none}.menu-category-head{font-size:6.2pt;color:#b4aeb0;display:flex;gap:2.4mm;white-space:nowrap;font-weight:500}.menu-item{display:grid;align-items:baseline;gap:1.4mm;min-height:3.4mm;font-size:var(--menu-font,8.4pt);line-height:var(--menu-line,1.12);padding:.25mm 0}.menu-item.spirit{grid-template-columns:minmax(0,1fr) 11mm 15mm 13mm}.menu-item.wine{grid-template-columns:minmax(0,1fr) 12mm 13mm}.menu-item.simple{grid-template-columns:minmax(0,1fr) 17mm 10mm}.menu-item.oneprice{grid-template-columns:minmax(0,1fr) 12mm}.menu-item .nm{min-width:0}.menu-item .country{font-size:.68em;color:#8f898b;font-weight:400;margin-left:1.2mm}.menu-item .price,.menu-item .vol{text-align:right;white-space:nowrap}.menu-category-head.spirit{width:39mm;justify-content:space-between}.menu-category-head.wine{width:28mm;justify-content:space-between}.menu-overflow{position:absolute;bottom:4mm;left:6mm;right:6mm;background:#751e38;color:#fff;padding:1.5mm 2mm;border-radius:2mm;font-size:7pt;display:none;z-index:10}.menu-panel.overflowing .menu-overflow{display:block}
      .outer-panel{display:flex;flex-direction:column;justify-content:flex-end;min-height:100%}.outer-center{justify-content:center;text-align:center;align-items:center}.lava-mark{width:43mm;height:43mm;border-radius:50%;border:1.2mm solid #7e594b;display:grid;place-items:center;font-size:19mm;font-weight:900;box-shadow:0 0 12mm rgba(238,64,16,.24),inset 0 0 7mm rgba(255,90,20,.08);margin-bottom:8mm;background:radial-gradient(circle,#1a1715 35%,#080808 72%)}.cover-title{font-size:27pt;font-weight:900;letter-spacing:8pt}.cover-sub{font-size:8pt;letter-spacing:5pt;color:#c8b7a9;margin-top:3mm}.outer-copy{font-size:8pt;color:#c4bec0;line-height:1.5}.outer-kicker{font-size:7pt;letter-spacing:2pt;color:#d46643;text-transform:uppercase;margin-bottom:2mm}.menu-panel-label{position:absolute;top:3mm;right:4mm;font-size:5.5pt;color:rgba(255,255,255,.28);letter-spacing:.5pt}
      #barMenuPrintRoot{display:none}
      @media(max-width:1150px){.product-grid,.menu-workspace{grid-template-columns:1fr}.menu-preview-frame{min-height:500px}}
      @media print{body.printing-bar-menu{background:#fff!important;padding:0!important;margin:0!important}body.printing-bar-menu>*:not(#barMenuPrintRoot){display:none!important}body.printing-bar-menu #barMenuPrintRoot{display:block!important;margin:0!important;padding:0!important}body.printing-bar-menu .a3-menu-sheet{transform:none!important;margin:0!important;page-break-after:always;break-after:page}body.printing-bar-menu .a3-menu-sheet:last-child{page-break-after:auto;break-after:auto}.menu-panel-label{display:none!important}}
    `;document.head.appendChild(s);
  }

  function ensureViews(){
    installStyles();
    const nav=document.querySelector('.nav'),main=document.querySelector('#app main');if(!nav||!main)return;
    if(!document.getElementById('productsNav')){
      const b=document.createElement('button');b.id='productsNav';b.dataset.view='products';b.textContent='Продукция';b.onclick=()=>{showView('products');renderBarProducts();};nav.appendChild(b);
      const m=document.createElement('button');m.id='menuNav';m.dataset.view='barmenu';m.textContent='Меню A3';m.onclick=()=>{showView('barmenu');renderMenuWorkspace();};nav.appendChild(m);
    }
    if(!document.getElementById('products')){
      const s=document.createElement('section');s.id='products';s.className='view hidden';s.innerHTML=`
        <div class="top"><div><div class="title">Продукция</div><div class="muted">Алкогольная и безалкогольная продукция отдельно от техкарт коктейлей</div></div><div class="actions"><button id="addBarProduct" class="ghost">+ Добавить позицию</button><button class="primary publish">Опубликовать</button></div></div>
        <div class="product-grid"><div class="card list"><div class="product-toolbar"><input id="productSearch" class="search" placeholder="Поиск продукции"><select id="productFilter"></select></div><div id="productCount" class="muted" style="margin:2px 0 10px"></div><div id="productList"></div></div><div id="productEditor" class="card"><div class="empty">Выберите позицию слева</div></div></div>`;main.appendChild(s);
      document.getElementById('addBarProduct').onclick=addProduct;
      document.getElementById('productSearch').oninput=e=>{productSearch=e.target.value;renderBarProducts();};
      document.getElementById('productFilter').onchange=e=>{filterCategory=e.target.value;renderBarProducts();};
    }
    if(!document.getElementById('barmenu')){
      const s=document.createElement('section');s.id='barmenu';s.className='view hidden';s.innerHTML=`
        <div class="top"><div><div class="title">Меню A3</div><div class="muted">Трёхфальцевое меню 420 × 297 мм · внешняя и внутренняя стороны</div></div><div class="actions"><button id="printInner" class="ghost">PDF: внутренняя</button><button id="printOuter" class="ghost">PDF: внешняя</button><button id="printBoth" class="primary">PDF: обе стороны</button></div></div>
        <div class="menu-workspace"><div class="card menu-controls">
          <div class="section-title" style="margin-top:0">Настройки макета</div>
          <div class="control-line"><label>Основной шрифт</label><div><input id="menuFont" type="number" min="6" max="12" step="0.1"></div></div>
          <div class="control-line"><label>Заголовки</label><div><input id="menuHeading" type="number" min="9" max="19" step="0.5"></div></div>
          <div class="control-line"><label>Межстрочный интервал</label><div><input id="menuLine" type="number" min="0.9" max="1.5" step="0.02"></div></div>
          <label><input id="showCountry" type="checkbox" style="width:auto;margin-right:8px">Показывать страну</label>
          <label><input id="showBottleVolume" type="checkbox" style="width:auto;margin-right:8px">Показывать объём бутылки</label>
          <label><input id="printFoldGuides" type="checkbox" style="width:auto;margin-right:8px">Печатать линии сгиба</label>
          <div class="actions" style="margin-top:10px"><button id="autoFitMenu" class="ghost">Автоподбор шрифта</button><button class="primary publish">Опубликовать настройки</button></div>
          <div class="section-title">Визуал</div>
          <label>Фон внутренней стороны</label><input id="innerBg" type="file" accept="image/*"><div class="muted">Можно загрузить свой готовый дизайн. Без файла используется встроенный тёмный стиль BALI.</div>
          <label>Фон внешней стороны</label><input id="outerBg" type="file" accept="image/*"><div class="muted">На внешней стороне можно использовать ваш арт BALI как полноценный фон.</div>
          <label>Название на обложке</label><input id="coverTitle">
          <label>Подпись</label><input id="coverSubtitle">
          <div class="section-title">Предпросмотр</div>
          <div class="actions"><button id="previewInner" class="ghost">Внутренняя</button><button id="previewOuter" class="ghost">Внешняя</button></div>
          <div id="fitState" class="muted" style="margin-top:10px"></div>
        </div><div class="menu-preview-frame"><div class="menu-scale-box" id="menuPreviewBox"></div></div></div>`;main.appendChild(s);
      document.body.insertAdjacentHTML('beforeend','<div id="barMenuPrintRoot"></div>');
      bindMenuControls();
    }
  }

  function categorySelectHtml(current){return allCategories().map(c=>`<option ${c===current?'selected':''}>${safe(c)}</option>`).join('');}

  function renderBarProducts(){
    ensureViews();const filter=document.getElementById('productFilter');if(!filter)return;
    const cats=['Все',...allCategories()];const old=filterCategory;filter.innerHTML=cats.map(c=>`<option>${safe(c)}</option>`).join('');filter.value=cats.includes(old)?old:'Все';filterCategory=filter.value;
    const q=productSearch.trim().toLowerCase();const arr=window.barProducts.filter(p=>(filterCategory==='Все'||p.category===filterCategory)&&(!q||p.name.toLowerCase().includes(q)||String(p.country||'').toLowerCase().includes(q))).sort((a,b)=>allCategories().indexOf(a.category)-allCategories().indexOf(b.category)||Number(a.order||0)-Number(b.order||0)||a.name.localeCompare(b.name,'ru'));
    document.getElementById('productCount').textContent=`Показано ${arr.length} из ${window.barProducts.length} позиций`;
    document.getElementById('productList').innerHTML=arr.map(p=>`<div class="product-row ${selectedProduct===p.id?'active':''} ${p.active===false?'off':''}" data-id="${safe(p.id)}"><div><b>${safe(p.name)}</b><small>${safe(p.category)}${p.country?' · '+safe(p.country):''}</small></div><div style="text-align:right"><b>${money(p.portionPrice)}</b><small>${safe(p.portionLabel||'')}</small></div></div>`).join('')||'<div class="empty">Ничего не найдено</div>';
    document.querySelectorAll('#productList .product-row').forEach(el=>el.onclick=()=>{selectedProduct=el.dataset.id;renderBarProducts();renderProductEditor();});
  }
  window.renderBarProducts=renderBarProducts;

  function addProduct(){
    const cat=filterCategory!=='Все'?filterCategory:'Виски';const p={id:productId(),category:cat,name:'Новая позиция',country:'',portionLabel:categoryLayout(cat)==='spirit'?'40 мл':'',portionPrice:null,bottleVolume:'',bottlePrice:null,active:true,order:window.barProducts.filter(x=>x.category===cat).length+1};window.barProducts.push(p);selectedProduct=p.id;touch();renderBarProducts();renderProductEditor();
  }

  function renderProductEditor(){
    const p=window.barProducts.find(x=>x.id===selectedProduct);const root=document.getElementById('productEditor');if(!p||!root)return;
    root.innerHTML=`
      <div class="two"><div><label>Название</label><input id="pName" value="${safe(p.name)}"></div><div><label>Категория</label><select id="pCategory">${categorySelectHtml(p.category)}</select></div></div>
      <div class="two"><div><label>Страна / происхождение</label><input id="pCountry" value="${safe(p.country||'')}"></div><div><label>Порядок</label><input id="pOrder" type="number" value="${Number(p.order||0)}"></div></div>
      <div class="three"><div><label>Порция / объём</label><input id="pPortionLabel" value="${safe(p.portionLabel||'')}" placeholder="40 мл / 125 мл / 330 мл"></div><div><label>Цена порции</label><input id="pPortionPrice" type="number" step="0.01" value="${p.portionPrice??''}"></div><div><label>Активна</label><select id="pActive"><option value="true">Да</option><option value="false">Нет / архив</option></select></div></div>
      <div class="two"><div><label>Объём бутылки</label><input id="pBottleVolume" value="${safe(p.bottleVolume||'')}" placeholder="700 мл"></div><div><label>Цена бутылки</label><input id="pBottlePrice" type="number" step="0.01" value="${p.bottlePrice??''}"></div></div>
      <div class="actions" style="margin-top:18px"><button id="saveProduct" class="primary">Сохранить</button><button id="duplicateProduct" class="ghost">Дублировать</button><button id="archiveProduct" class="danger">В архив</button></div>`;
    document.getElementById('pActive').value=String(p.active!==false);
    document.getElementById('saveProduct').onclick=()=>{p.name=document.getElementById('pName').value.trim();p.category=document.getElementById('pCategory').value;p.country=document.getElementById('pCountry').value.trim();p.order=Number(document.getElementById('pOrder').value||0);p.portionLabel=document.getElementById('pPortionLabel').value.trim();p.portionPrice=num(document.getElementById('pPortionPrice').value);p.bottleVolume=document.getElementById('pBottleVolume').value.trim();p.bottlePrice=num(document.getElementById('pBottlePrice').value);p.active=document.getElementById('pActive').value==='true';touch();renderBarProducts();renderMenuWorkspace();toast('Позиция сохранена локально. Нажмите «Опубликовать».');};
    document.getElementById('duplicateProduct').onclick=()=>{const copy={...p,id:productId(),name:p.name+' — копия',order:Number(p.order||0)+1};window.barProducts.push(copy);selectedProduct=copy.id;touch();renderBarProducts();renderProductEditor();};
    document.getElementById('archiveProduct').onclick=()=>{p.active=false;touch();renderBarProducts();renderProductEditor();};
  }

  function categoryLayout(cat){
    if(['Виски','Ром','Джин','Текила','Водка','Ликёры','Вермуты','Коньяк / бренди'].includes(cat))return 'spirit';
    if(['Белое вино','Красное вино','Шампанское / игристое вино','Безалкогольное вино'].includes(cat))return 'wine';
    if(['Пиво','Напитки'].includes(cat))return 'simple';return 'oneprice';
  }

  function productLine(p){
    const layout=categoryLayout(p.category);const name=`<span class="nm">${safe(p.name)}${window.barMenuConfig.showCountry&&p.country?`<span class="country">${safe(p.country)}</span>`:''}</span>`;
    if(layout==='spirit')return `<div class="menu-item spirit">${name}<span class="price">${window.barMenuConfig.showPortionPrice?money(p.portionPrice):''}</span><span class="vol">${window.barMenuConfig.showBottleVolume?safe(p.bottleVolume):''}</span><span class="price">${window.barMenuConfig.showBottlePrice?money(p.bottlePrice):''}</span></div>`;
    if(layout==='wine')return `<div class="menu-item wine">${name}<span class="price">${window.barMenuConfig.showPortionPrice?money(p.portionPrice):''}</span><span class="price">${window.barMenuConfig.showBottlePrice?money(p.bottlePrice):''}</span></div>`;
    if(layout==='simple')return `<div class="menu-item simple">${name}<span class="vol">${safe(p.portionLabel||'')}</span><span class="price">${money(p.portionPrice)}</span></div>`;
    return `<div class="menu-item oneprice">${name}<span class="price">${money(p.portionPrice)}</span></div>`;
  }

  function categoryBlock(cat,items){
    const layout=categoryLayout(cat);let head='';
    if(layout==='spirit')head='<span class="menu-category-head spirit"><span>40 мл</span><span>Объём</span><span>Бутылка</span></span>';
    else if(layout==='wine')head='<span class="menu-category-head wine"><span>125 мл</span><span>Бутылка</span></span>';
    else if(layout==='simple')head='<span class="menu-category-head wine"><span>Объём</span><span>Цена</span></span>';
    else head='<span class="menu-category-head"><span>Цена</span></span>';
    return `<div class="menu-category"><div class="menu-category-title"><span>${safe(cat)}</span>${head}</div>${items.map(productLine).join('')}</div>`;
  }

  function splitPanels(){
    const active=window.barProducts.filter(p=>p.active!==false);const groups=allCategories().map(cat=>({cat,items:active.filter(p=>p.category===cat).sort((a,b)=>Number(a.order||0)-Number(b.order||0))})).filter(g=>g.items.length);
    const total=groups.reduce((s,g)=>s+g.items.length+2.6,0),target=total/3;const panels=[[],[],[]];let pi=0,weight=0;
    groups.forEach((g,index)=>{const w=g.items.length+2.6;if(pi<2&&weight>0&&weight+w>target*(pi+1)+2){pi++;}panels[pi].push(g);weight+=w;});return panels;
  }

  function bgStyle(side){const path=window.barMenuConfig[side+'Background'];const local=localBg[side];const url=local||(path?rawUrl(path):'');return url?`background-image:linear-gradient(rgba(5,5,6,.20),rgba(5,5,6,.20)),url('${safe(url)}')`:'';}

  function innerSheet(preview=true){
    const panels=splitPanels();const c=window.barMenuConfig;return `<div class="a3-menu-sheet inner ${preview?'previewed':''} ${c.printFoldGuides?'':'hide-guides'} ${c.innerBackground?'custom-bg':''}" style="--menu-font:${c.fontPt}pt;--menu-heading:${c.headingPt}pt;--menu-line:${c.lineHeight};${bgStyle('inner')}"><div class="fold-guide g1"></div><div class="fold-guide g2"></div>${panels.map((groups,i)=>`<div class="menu-panel"><span class="menu-panel-label">ПАНЕЛЬ ${i+1}</span><div class="menu-topline"><b>${safe(c.menuTitle||'BAR MENU')}</b><span>BALI NIGHTCLUB</span></div>${groups.map(g=>categoryBlock(g.cat,g.items)).join('')}<div class="menu-overflow">Содержимое не помещается — уменьшите шрифт или используйте автоподбор.</div></div>`).join('')}</div>`;
  }

  function outerSheet(preview=true){
    const c=window.barMenuConfig;return `<div class="a3-menu-sheet outer ${preview?'previewed':''} ${c.printFoldGuides?'':'hide-guides'} ${c.outerBackground?'custom-bg':''}" style="${bgStyle('outer')}"><div class="fold-guide g1"></div><div class="fold-guide g2"></div>
      <div class="menu-panel"><span class="menu-panel-label">ЗАДНЯЯ ПАНЕЛЬ</span><div class="outer-panel"><div class="outer-kicker">BALI NIGHTCLUB</div><div class="outer-copy">BAR MENU<br><br>Шаблон подготовлен для профессиональной печати на A3 и трёх сгибов. Этот блок можно заменить собственным визуалом.</div></div></div>
      <div class="menu-panel"><span class="menu-panel-label">КЛАПАН</span><div class="outer-panel outer-center"><div class="outer-copy">BALI<br>MINСК</div></div></div>
      <div class="menu-panel"><span class="menu-panel-label">ОБЛОЖКА</span><div class="outer-panel outer-center"><div class="lava-mark">B</div><div class="cover-title">${safe(c.coverTitle||'BALI')}</div><div class="cover-sub">${safe(c.coverSubtitle||'NIGHTCLUB')}</div></div></div>
    </div>`;
  }

  function bindMenuControls(){
    const ids=['menuFont','menuHeading','menuLine','showCountry','showBottleVolume','printFoldGuides','coverTitle','coverSubtitle'];
    ids.forEach(id=>document.getElementById(id)?.addEventListener('change',readMenuControls));
    document.getElementById('previewInner').onclick=()=>renderPreview('inner');document.getElementById('previewOuter').onclick=()=>renderPreview('outer');
    document.getElementById('autoFitMenu').onclick=autoFit;document.getElementById('printInner').onclick=()=>printMenu('inner');document.getElementById('printOuter').onclick=()=>printMenu('outer');document.getElementById('printBoth').onclick=()=>printMenu('both');
    document.getElementById('innerBg').onchange=e=>queueMenuBg('inner',e.target.files?.[0]);document.getElementById('outerBg').onchange=e=>queueMenuBg('outer',e.target.files?.[0]);
  }

  function populateMenuControls(){const c=window.barMenuConfig;const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v??''};set('menuFont',c.fontPt);set('menuHeading',c.headingPt);set('menuLine',c.lineHeight);set('coverTitle',c.coverTitle);set('coverSubtitle',c.coverSubtitle);['showCountry','showBottleVolume','printFoldGuides'].forEach(id=>{const el=document.getElementById(id);if(el)el.checked=Boolean(c[id]);});}
  function readMenuControls(){const c=window.barMenuConfig;c.fontPt=Number(document.getElementById('menuFont').value||8.4);c.headingPt=Number(document.getElementById('menuHeading').value||13);c.lineHeight=Number(document.getElementById('menuLine').value||1.12);c.showCountry=document.getElementById('showCountry').checked;c.showBottleVolume=document.getElementById('showBottleVolume').checked;c.printFoldGuides=document.getElementById('printFoldGuides').checked;c.coverTitle=document.getElementById('coverTitle').value;c.coverSubtitle=document.getElementById('coverSubtitle').value;touch();renderPreview('inner');}
  function queueMenuBg(side,file){if(!file)return;if(localBg[side])URL.revokeObjectURL(localBg[side]);localBg[side]=URL.createObjectURL(file);queueImage(file,`media/menu/${side}-${Date.now()}`,path=>{window.barMenuConfig[side+'Background']=path;touch();renderPreview(side);});}

  function renderMenuWorkspace(){ensureViews();populateMenuControls();renderPreview('inner');}
  window.renderMenuWorkspace=renderMenuWorkspace;
  function renderPreview(side){const box=document.getElementById('menuPreviewBox');if(!box)return;box.innerHTML=side==='outer'?outerSheet(true):innerSheet(true);setTimeout(checkFit,40);}
  function checkFit(){const panels=[...document.querySelectorAll('#menuPreviewBox .inner .menu-panel')];let bad=0;panels.forEach(p=>{const over=p.scrollHeight>p.clientHeight+2;p.classList.toggle('overflowing',over);if(over)bad++;});const state=document.getElementById('fitState');if(state)state.textContent=bad?`⚠️ Переполнение панелей: ${bad}. Уменьшите шрифт или нажмите «Автоподбор».`:'✓ Содержимое помещается в A3.';return bad;}
  function autoFit(){let size=Math.min(10,Number(window.barMenuConfig.fontPt||8.4));window.barMenuConfig.fontPt=size;populateMenuControls();const step=()=>{renderPreview('inner');setTimeout(()=>{if(checkFit()>0&&size>6.2){size=Math.round((size-.2)*10)/10;window.barMenuConfig.fontPt=size;populateMenuControls();step();}else{touch();toast(`Автоподбор: ${size.toFixed(1)} pt`);}},55)};step();}

  function printMenu(mode){
    readMenuControls();const root=document.getElementById('barMenuPrintRoot');root.innerHTML='';if(mode==='inner'||mode==='both')root.insertAdjacentHTML('beforeend',innerSheet(false));if(mode==='outer'||mode==='both')root.insertAdjacentHTML('beforeend',outerSheet(false));
    document.body.classList.add('printing-bar-menu');let page=document.getElementById('barMenuPageStyle');if(!page){page=document.createElement('style');page.id='barMenuPageStyle';page.media='print';document.head.appendChild(page);}page.textContent='@page{size:A3 landscape;margin:0}';
    const cleanup=()=>{document.body.classList.remove('printing-bar-menu');root.innerHTML='';window.removeEventListener('afterprint',cleanup);};window.addEventListener('afterprint',cleanup);setTimeout(()=>window.print(),250);
  }

  async function loadBarData(){
    if(barLoaded||!token)return;barLoaded=true;try{window.barProducts=await optionalJson('data/products.json',defaultProducts());const cfg=await optionalJson('data/menu-config.json',DEFAULT_CONFIG);window.barMenuConfig={...DEFAULT_CONFIG,...cfg};renderBarProducts();renderMenuWorkspace();if(!window.barProducts.length)window.barProducts=defaultProducts();}catch(e){barLoaded=false;toast('Не удалось загрузить продукцию: '+String(e.message||e),true);}
  }

  function waitForConnection(){ensureViews();if(token&&document.getElementById('app')&&!document.getElementById('app').classList.contains('hidden'))loadBarData();else setTimeout(waitForConnection,450);}
  ensureViews();waitForConnection();
})();
