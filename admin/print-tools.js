(() => {
  const state = { selected: new Set(), search: '', category: 'Все', size: 150, showIngredientPhotos: true };

  function safe(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function getCocktails() {
    try { return Array.isArray(cocktails) ? cocktails : []; } catch (_) { return []; }
  }

  function getIngredients() {
    try { return Array.isArray(ingredients) ? ingredients : []; } catch (_) { return []; }
  }

  function imageUrl(path) {
    if (!path) return '';
    try { return rawUrl(path); } catch (_) { return `https://raw.githubusercontent.com/Nik13599/BALI-COCKTAIL-v1/main/${path}`; }
  }

  function ingredientRef(item) {
    const list = getIngredients();
    return list.find(x => x.id === item.ingredientId) || list.find(x => String(x.name).toLowerCase() === String(item.name).toLowerCase()) || null;
  }

  function installStyles() {
    if (document.getElementById('baliPrintStyles')) return;
    const style = document.createElement('style');
    style.id = 'baliPrintStyles';
    style.textContent = `
      .print-layout{display:grid;grid-template-columns:360px 1fr;gap:16px}
      .print-controls{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .print-check{display:flex;align-items:center;gap:10px;padding:9px 10px;border:1px solid transparent;border-radius:12px;cursor:pointer}
      .print-check:hover{background:var(--panel2);border-color:var(--line)}
      .print-check input{width:auto;margin:0}
      .print-check span{min-width:0}.print-check b{display:block}.print-check small{display:block;color:var(--muted)}
      .print-preview-shell{display:flex;justify-content:center;align-items:flex-start;min-height:620px;padding:18px;background:#101014;border-radius:18px;border:1px solid var(--line);overflow:auto}
      .tech-print-card{position:relative;background:#fff;color:#111;box-sizing:border-box;overflow:hidden;font-family:Arial,Helvetica,sans-serif;display:flex;flex-direction:column}
      .tech-print-card *{box-sizing:border-box}
      .tech-print-inner{padding:6mm;display:flex;flex-direction:column;height:100%;gap:2.4mm}
      .tech-print-head{display:flex;justify-content:space-between;gap:5mm;align-items:flex-start;border-bottom:.35mm solid #111;padding-bottom:2.3mm}
      .tech-print-brand{font-weight:900;font-size:8.5pt;letter-spacing:1.4pt}.tech-print-category{font-size:7pt;text-transform:uppercase;letter-spacing:.8pt;color:#6b1830;margin-top:1mm;font-weight:700}
      .tech-print-title{font-size:18pt;font-weight:900;line-height:1.02;max-width:70%;text-align:right}
      .tech-print-top{display:grid;grid-template-columns:38% 1fr;gap:4mm;min-height:34mm}
      .tech-print-photo{width:100%;height:34mm;object-fit:cover;border:.25mm solid #bbb;background:#eee}
      .tech-print-no-photo{height:34mm;border:.25mm solid #bbb;background:#f1f1f1;display:grid;place-items:center;text-align:center;font-size:7pt;color:#777;padding:3mm}
      .tech-print-specs{display:grid;grid-template-columns:1fr 1fr;gap:2mm}.tech-print-spec{border:.25mm solid #bbb;padding:2mm}.tech-print-spec span{display:block;font-size:6.5pt;text-transform:uppercase;color:#666;font-weight:700;letter-spacing:.5pt}.tech-print-spec b{display:block;font-size:8.5pt;margin-top:.8mm}
      .tech-print-taste{font-size:7.5pt;line-height:1.25;color:#333}
      .tech-print-section{font-size:8.2pt;font-weight:900;text-transform:uppercase;letter-spacing:.7pt;border-bottom:.25mm solid #bbb;padding-bottom:1mm;margin-top:.5mm}
      .tech-print-ings{display:grid;grid-template-columns:1fr 1fr;gap:1.2mm 4mm}
      .tech-print-ing{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:1.5mm;font-size:7.2pt;min-width:0}
      .tech-print-ing img{width:8mm;height:8mm;object-fit:contain;border:.2mm solid #ccc;border-radius:1mm;background:#fff}.tech-print-ing-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tech-print-ing-amount{font-weight:700;white-space:nowrap}
      .tech-print-steps{display:grid;grid-template-columns:1fr 1fr;gap:1.1mm 4mm;font-size:6.8pt;line-height:1.22}.tech-print-step{display:flex;gap:1.4mm}.tech-print-step-num{flex:0 0 5mm;height:5mm;border-radius:50%;background:#6b1830;color:#fff;display:grid;place-items:center;font-size:6.2pt;font-weight:800}
      .tech-print-footer{margin-top:auto;display:flex;justify-content:space-between;gap:3mm;border-top:.25mm solid #bbb;padding-top:1.4mm;color:#777;font-size:6.2pt}
      .tech-print-card.dense .tech-print-title{font-size:15pt}.tech-print-card.dense .tech-print-top{min-height:29mm}.tech-print-card.dense .tech-print-photo,.tech-print-card.dense .tech-print-no-photo{height:29mm}.tech-print-card.dense .tech-print-ing{font-size:6.6pt}.tech-print-card.dense .tech-print-steps{font-size:6.1pt}
      #printRoot{display:none}
      @media(max-width:1000px){.print-layout{grid-template-columns:1fr}.print-preview-shell{min-height:420px}}
      @media print{
        body{background:#fff!important}
        body>*:not(#printRoot){display:none!important}
        #printRoot{display:block!important;margin:0!important;padding:0!important}
        #printRoot .tech-print-card{page-break-after:always;break-after:page;margin:0!important;box-shadow:none!important}
        #printRoot .tech-print-card:last-child{page-break-after:auto;break-after:auto}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureView() {
    installStyles();
    const nav = document.querySelector('.nav');
    const main = document.querySelector('#app main');
    if (!nav || !main) return false;

    if (!document.getElementById('printNavButton')) {
      const btn = document.createElement('button');
      btn.id = 'printNavButton';
      btn.textContent = 'Печать техкарт';
      btn.onclick = () => openPrintView();
      nav.appendChild(btn);
    }

    if (!document.getElementById('printcards')) {
      const section = document.createElement('section');
      section.id = 'printcards';
      section.className = 'view hidden';
      section.innerHTML = `
        <div class="top">
          <div><div class="title">Печать техкарт</div><div class="muted">Квадратные карточки для печати или сохранения в PDF</div></div>
          <div class="actions"><button id="printSelectedCards" class="primary">Печать / PDF</button></div>
        </div>
        <div class="print-layout">
          <div class="card">
            <div class="print-controls">
              <div><label>Размер карточки</label><select id="printSize"><option value="120">120 × 120 мм</option><option value="150" selected>150 × 150 мм</option><option value="180">180 × 180 мм</option><option value="200">200 × 200 мм</option></select></div>
              <div><label>Категория</label><select id="printCategory"><option>Все</option><option>Авторские</option><option>Классика</option><option>Заготовки</option></select></div>
            </div>
            <label>Поиск</label><input id="printSearch" class="search" placeholder="Название коктейля">
            <label style="display:flex;align-items:center;gap:8px"><input id="printIngredientPhotos" type="checkbox" checked style="width:auto">Фото ингредиентов на печатной карточке</label>
            <div class="actions" style="margin:10px 0"><button id="printSelectVisible" class="ghost">Выбрать видимые</button><button id="printClear" class="ghost">Снять выбор</button></div>
            <div id="printCount" class="muted" style="margin-bottom:8px"></div>
            <div id="printCocktailList" style="max-height:470px;overflow:auto"></div>
          </div>
          <div class="card">
            <div class="section-title" style="margin-top:0">Предпросмотр</div>
            <div id="printPreview" class="print-preview-shell"><div class="empty">Выберите хотя бы одну техкарту</div></div>
            <div class="muted" style="margin-top:10px">Печать открывает стандартное окно Windows. Там можно выбрать принтер или «Сохранить как PDF». Каждая техкарта печатается отдельной квадратной страницей.</div>
          </div>
        </div>`;
      main.appendChild(section);
      document.body.insertAdjacentHTML('beforeend', '<div id="printRoot"></div>');
      bindControls();
    }
    return true;
  }

  function openPrintView() {
    if (!ensureView()) return;
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById('printcards').classList.remove('hidden');
    document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
    document.getElementById('printNavButton').classList.add('active');
    renderPrintList();
  }

  function visibleCocktails() {
    const q = state.search.trim().toLowerCase();
    return getCocktails().filter(c => (state.category === 'Все' || c.category === state.category) && (!q || String(c.name).toLowerCase().includes(q))).sort((a,b) => String(a.name).localeCompare(String(b.name),'ru'));
  }

  function bindControls() {
    const size = document.getElementById('printSize');
    const category = document.getElementById('printCategory');
    const search = document.getElementById('printSearch');
    const photos = document.getElementById('printIngredientPhotos');
    size.onchange = () => { state.size = Number(size.value); renderPreview(); };
    category.onchange = () => { state.category = category.value; renderPrintList(); };
    search.oninput = () => { state.search = search.value; renderPrintList(); };
    photos.onchange = () => { state.showIngredientPhotos = photos.checked; renderPreview(); };
    document.getElementById('printSelectVisible').onclick = () => { visibleCocktails().forEach(c => state.selected.add(c.id)); renderPrintList(); };
    document.getElementById('printClear').onclick = () => { state.selected.clear(); renderPrintList(); };
    document.getElementById('printSelectedCards').onclick = printSelected;
  }

  function renderPrintList() {
    if (!document.getElementById('printCocktailList')) return;
    const arr = visibleCocktails();
    const el = document.getElementById('printCocktailList');
    el.innerHTML = arr.map(c => `<label class="print-check"><input type="checkbox" data-id="${safe(c.id)}" ${state.selected.has(c.id)?'checked':''}><span><b>${safe(c.name)}</b><small>${safe(c.category)} · ${safe(c.method||'')}</small></span></label>`).join('') || '<div class="empty">Ничего не найдено</div>';
    el.querySelectorAll('input[type=checkbox]').forEach(input => input.onchange = () => {
      if (input.checked) state.selected.add(input.dataset.id); else state.selected.delete(input.dataset.id);
      renderCount(); renderPreview();
    });
    renderCount();
    renderPreview();
  }

  function renderCount() {
    const el = document.getElementById('printCount');
    if (el) el.textContent = `Выбрано: ${state.selected.size}`;
  }

  function ingredientMarkup(item) {
    const ref = ingredientRef(item);
    const image = state.showIngredientPhotos && ref?.officialImage ? `<img src="${safe(imageUrl(ref.officialImage))}" alt="">` : '';
    return `<div class="tech-print-ing">${image}<span class="tech-print-ing-name">${safe(item.name)}</span><span class="tech-print-ing-amount">${safe(item.amount)} ${safe(item.unit)}</span></div>`;
  }

  function cardMarkup(c, sizeMm) {
    const density = ((c.ingredients?.length || 0) + (c.steps?.length || 0)) > 12 ? ' dense' : '';
    const photo = c.officialImage ? `<img class="tech-print-photo" src="${safe(imageUrl(c.officialImage))}" alt="${safe(c.name)}">` : `<div class="tech-print-no-photo">Эталонное фото<br>не загружено</div>`;
    const ingredientsHtml = (c.ingredients || []).map(ingredientMarkup).join('');
    const stepsHtml = (c.steps || []).map((step, index) => `<div class="tech-print-step"><span class="tech-print-step-num">${index+1}</span><span>${safe(step)}</span></div>`).join('');
    return `<article class="tech-print-card${density}" style="width:${sizeMm}mm;height:${sizeMm}mm">
      <div class="tech-print-inner">
        <div class="tech-print-head"><div><div class="tech-print-brand">BALI COCKTAIL</div><div class="tech-print-category">${safe(c.category)}</div></div><div class="tech-print-title">${safe(c.name)}</div></div>
        <div class="tech-print-top">${photo}<div><div class="tech-print-specs"><div class="tech-print-spec"><span>Выход</span><b>${safe(c.yield)}</b></div><div class="tech-print-spec"><span>Метод</span><b>${safe(c.method)}</b></div><div class="tech-print-spec"><span>Бокал</span><b>${safe(c.glass)}</b></div><div class="tech-print-spec"><span>Лёд</span><b>${safe(c.ice)}</b></div></div><div class="tech-print-taste" style="margin-top:2mm">${safe(c.taste||'')}</div></div></div>
        <div class="tech-print-section">Ингредиенты</div><div class="tech-print-ings">${ingredientsHtml}</div>
        <div class="tech-print-section">Приготовление</div><div class="tech-print-steps">${stepsHtml}</div>
        <div class="tech-print-footer"><span>Технологическая карта BALI</span><span>Каталог v${safe((typeof manifest!=='undefined'&&manifest?.catalogVersion)||'')}</span></div>
      </div></article>`;
  }

  function renderPreview() {
    const preview = document.getElementById('printPreview');
    if (!preview) return;
    const first = getCocktails().find(c => state.selected.has(c.id));
    if (!first) { preview.innerHTML = '<div class="empty">Выберите хотя бы одну техкарту</div>'; return; }
    const scale = Math.min(1, 520 / (state.size * 3.7795275591));
    preview.innerHTML = `<div style="transform:scale(${scale});transform-origin:top center;height:${state.size*3.7795275591*scale}px">${cardMarkup(first,state.size)}</div>`;
  }

  function printSelected() {
    const selected = getCocktails().filter(c => state.selected.has(c.id));
    if (!selected.length) { try { toast('Выберите техкарты для печати', true); } catch (_) { alert('Выберите техкарты для печати'); } return; }
    const root = document.getElementById('printRoot');
    root.innerHTML = selected.map(c => cardMarkup(c,state.size)).join('');
    let pageStyle = document.getElementById('baliDynamicPageStyle');
    if (!pageStyle) { pageStyle = document.createElement('style'); pageStyle.id = 'baliDynamicPageStyle'; document.head.appendChild(pageStyle); }
    pageStyle.textContent = `@page{size:${state.size}mm ${state.size}mm;margin:0}`;
    setTimeout(() => window.print(), 120);
  }

  const timer = setInterval(() => {
    if (!ensureView()) return;
    const view = document.getElementById('printcards');
    if (view && !view.classList.contains('hidden')) renderPrintList();
  }, 1200);
  window.addEventListener('beforeunload', () => clearInterval(timer));
})();