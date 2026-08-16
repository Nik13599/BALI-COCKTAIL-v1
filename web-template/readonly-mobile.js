(() => {
  const style = document.createElement('style');
  style.textContent = `
    .photo-actions,.photo-delete,.privacy{display:none!important}
    #floatingAllCocktails{
      position:fixed;
      left:12px;
      top:calc(env(safe-area-inset-top) + 10px);
      z-index:120;
      display:none;
      border:1px solid rgba(255,255,255,.14);
      background:rgba(20,20,24,.92);
      color:#fff;
      padding:10px 13px;
      border-radius:14px;
      font-weight:800;
      font-size:13px;
      line-height:1;
      box-shadow:0 8px 26px rgba(0,0,0,.32);
      backdrop-filter:blur(16px);
      -webkit-backdrop-filter:blur(16px);
    }
    .cocktail-category-title{
      grid-column:1/-1;
      padding:12px 2px 2px;
      color:var(--accent2);
      font-size:12px;
      font-weight:900;
      letter-spacing:1.25px;
      text-transform:uppercase;
    }
  `;
  document.head.appendChild(style);

  const floatingBack = document.createElement('button');
  floatingBack.id = 'floatingAllCocktails';
  floatingBack.type = 'button';
  floatingBack.textContent = '‹ Все коктейли';
  floatingBack.onclick = () => goHome(true);
  document.body.appendChild(floatingBack);

  const syncFloatingBack = () => {
    floatingBack.style.display = detail?.classList.contains('show') ? 'block' : 'none';
  };
  const detailObserver = new MutationObserver(syncFloatingBack);
  if (detail) detailObserver.observe(detail, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('popstate', () => setTimeout(syncFloatingBack, 0));
  syncFloatingBack();

  const alpha = (a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), 'ru', { sensitivity: 'base', numeric: true });
  const categoryOrder = () => {
    const preferred = ['Авторские', 'Классика', 'Заготовки'];
    const existing = [...new Set(all.map(x => x.category).filter(Boolean))];
    return [
      ...preferred.filter(x => existing.includes(x)),
      ...existing.filter(x => !preferred.includes(x)).sort((a, b) => a.localeCompare(b, 'ru', { sensitivity: 'base' }))
    ];
  };

  window.renderList = function() {
    const q = search.value;
    const filtered = all.filter(c => (cat === 'Все' || c.category === cat) && matches(c, q));
    const groups = cat === 'Все' ? categoryOrder() : [cat];
    const html = [];
    for (const group of groups) {
      const items = filtered.filter(c => c.category === group).sort(alpha);
      if (!items.length) continue;
      html.push(`<div class="cocktail-category-title">${esc(group)}</div>`);
      html.push(...items.map(c => `<article class="card" data-id="${esc(c.id)}"><div class="ctitle"><span>${esc(c.name)}</span><span class="arrow">›</span></div><div class="cat">${esc(c.category.toUpperCase())}</div><div class="taste">${esc(c.taste)}</div><div class="meta">${esc(c.method)} · ${esc(c.yield)}</div></article>`));
    }
    list.innerHTML = html.length ? html.join('') : '<div class="empty">Ничего не найдено</div>';
    list.querySelectorAll('.card').forEach(x => x.onclick = () => openDetail(x.dataset.id));
  };

  window.refreshPhoto = async function() {
    const c = all.find(x => x.id === currentId);
    const img = document.getElementById('userPhoto');
    const empty = document.getElementById('photoEmpty');
    const label = document.getElementById('photoLabel');
    if (!img || !c) return;

    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }

    if (c.officialImage) {
      img.src = raw(c.officialImage);
      img.style.display = 'block';
      empty.style.display = 'none';
      label.style.display = 'block';
      label.textContent = 'ЭТАЛОН BALI';
    } else {
      img.removeAttribute('src');
      img.style.display = 'none';
      empty.style.display = 'block';
      empty.innerHTML = '<div class="cam">🍸</div><b>Эталонное фото не загружено</b>Фото коктейля добавляется только администратором через BALI COCKTAIL ADMIN.';
      label.style.display = 'none';
    }
  };

  window.wirePhotoButtons = function() {
    detail.querySelectorAll('.ing[data-ing]').forEach(row => row.onclick = () => showIngredient(row.dataset.ing));
  };

  const removeInputs = () => {
    document.getElementById('cameraInput')?.remove();
    document.getElementById('galleryInput')?.remove();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', removeInputs);
  else removeInputs();

  if (typeof window.renderList === 'function') setTimeout(() => window.renderList(), 0);
})();
