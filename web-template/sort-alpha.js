(() => {
  const alpha = (a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), 'ru', { sensitivity: 'base', numeric: true });
  const categoryOrder = () => {
    const preferred = ['Авторские', 'Классика', 'Заготовки'];
    const existing = [...new Set(all.map(x => x.category).filter(Boolean))];
    return [
      ...preferred.filter(x => existing.includes(x)),
      ...existing.filter(x => !preferred.includes(x)).sort((a, b) => a.localeCompare(b, 'ru', { sensitivity: 'base' }))
    ];
  };

  window.renderList = function renderList() {
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

  setTimeout(() => window.renderList(), 0);
})();
