(() => {
  const alpha = (a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), 'ru', {sensitivity:'base', numeric:true});
  window.renderList = function renderList(){
    const q=search.value;
    const arr=all.filter(c=>(cat==='Все'||c.category===cat)&&matches(c,q)).slice().sort(alpha);
    list.innerHTML=arr.length?arr.map(c=>`<article class="card" data-id="${esc(c.id)}"><div class="ctitle"><span>${esc(c.name)}</span><span class="arrow">›</span></div><div class="cat">${esc(c.category.toUpperCase())}</div><div class="taste">${esc(c.taste)}</div><div class="meta">${esc(c.method)} · ${esc(c.yield)}</div></article>`).join(''):'<div class="empty">Ничего не найдено</div>';
    list.querySelectorAll('.card').forEach(x=>x.onclick=()=>openDetail(x.dataset.id));
  };
})();
