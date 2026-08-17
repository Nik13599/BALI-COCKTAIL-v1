(() => {
  let running = false;

  async function refreshCatalog(reason = 'auto') {
    if (running || !navigator.onLine) return;
    running = true;
    const state = document.getElementById('syncState');
    try {
      if (state) state.textContent = 'Проверка обновлений…';
      const stamp = Date.now();
      const nextManifest = await fetchJson(REMOTE + 'data/manifest.json?ts=' + stamp);
      const [c, i] = await Promise.all([
        fetchJson(REMOTE + nextManifest.cocktails + '?v=' + nextManifest.catalogVersion + '&ts=' + stamp),
        fetchJson(REMOTE + nextManifest.ingredients + '?v=' + nextManifest.catalogVersion + '&ts=' + stamp)
      ]);

      // Перечитываем каталоги при каждом восстановлении сети, даже если номер версии совпал.
      // Так исправляется редкий случай, когда устройство однажды сохранило старый JSON из кэша.
      manifest = nextManifest;
      all = c;
      ingredients = i;
      localStorage.setItem('baliCocktails', JSON.stringify(c));
      localStorage.setItem('baliIngredients', JSON.stringify(i));
      localStorage.setItem('baliCatalogVersion', String(nextManifest.catalogVersion));

      renderChips();
      renderList();
      if (currentId && all.some(x => x.id === currentId)) openDetail(currentId, false);
      if (state) state.textContent = 'Каталог актуален · v' + nextManifest.catalogVersion;
    } catch (e) {
      if (state) state.textContent = all.length ? 'Офлайн · сохранённый каталог' : 'Не удалось загрузить каталог';
    } finally {
      running = false;
    }
  }

  window.baliRefreshCatalog = refreshCatalog;
  window.addEventListener('online', () => refreshCatalog('online'));
  window.addEventListener('pageshow', () => refreshCatalog('pageshow'));
  window.addEventListener('focus', () => refreshCatalog('focus'));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshCatalog('visible');
  });
  setTimeout(() => refreshCatalog('startup-repair'), 50);
})();
