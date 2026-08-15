(() => {
  const state = { publishing: false };

  function pathUrl(path) {
    return path.split('/').map(encodeURIComponent).join('/');
  }

  async function getContentMeta(path) {
    const r = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${pathUrl(path)}?ref=${encodeURIComponent(BRANCH)}`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer ' + token,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error((await r.text()) || String(r.status));
    return r.json();
  }

  async function putContent(path, contentBase64, message) {
    const meta = await getContentMeta(path);
    const body = {
      message,
      content: contentBase64,
      branch: BRANCH
    };
    if (meta?.sha) body.sha = meta.sha;
    const r = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${pathUrl(path)}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer ' + token,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error((await r.text()) || String(r.status));
    return r.json();
  }

  function jsonB64(value) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(value, null, 2))));
  }

  function setPublishing(on) {
    state.publishing = on;
    document.querySelectorAll('.publish').forEach(b => {
      b.disabled = on;
      b.textContent = on ? 'Публикация…' : 'Опубликовать';
    });
  }

  async function publishFixed() {
    const extraDirty = Boolean(window.barMenuDirty);
    if (state.publishing) return;
    if (!dirty && pendingFiles.size === 0 && !extraDirty) return toast('Нет изменений для публикации');

    setPublishing(true);
    const oldVersion = Number(manifest?.catalogVersion || 0);
    const nextManifest = {
      ...(manifest || {}),
      catalogVersion: oldVersion + 1,
      updatedAt: new Date().toISOString()
    };

    try {
      // 1. Сначала загружаем изображения. Используем Contents API, который поддерживает
      // fine-grained PAT с Repository permissions -> Contents: Read and write.
      for (const [path, b64] of pendingFiles) {
        await putContent(path, b64, `BALI ADMIN: upload ${path}`);
      }

      // 2. Затем данные. Запросы намеренно последовательные: GitHub Contents API
      // не рекомендует параллельные обновления файлов одного репозитория.
      await putContent('data/cocktails.json', jsonB64(cocktails), `BALI ADMIN: cocktails v${nextManifest.catalogVersion}`);
      await putContent('data/ingredients.json', jsonB64(ingredients), `BALI ADMIN: ingredients v${nextManifest.catalogVersion}`);

      if (Array.isArray(window.barProducts)) {
        await putContent('data/products.json', jsonB64(window.barProducts), 'BALI ADMIN: bar products');
      }
      if (window.barMenuConfig && typeof window.barMenuConfig === 'object') {
        await putContent('data/menu-config.json', jsonB64(window.barMenuConfig), 'BALI ADMIN: A3 menu settings');
      }

      // 3. manifest публикуется последним. Мобильное приложение увидит новую версию
      // только после того, как все связанные данные и фотографии уже доступны.
      await putContent('data/manifest.json', jsonB64(nextManifest), `BALI ADMIN: publish catalog v${nextManifest.catalogVersion}`);

      manifest = nextManifest;
      pendingFiles.clear();
      window.barMenuDirty = false;
      markClean();
      renderAll();
      if (document.getElementById('versionText')) document.getElementById('versionText').textContent = `Каталог v${manifest.catalogVersion}`;
      if (typeof window.renderBarProducts === 'function') window.renderBarProducts();
      toast(`Опубликовано. Версия ${manifest.catalogVersion}. Телефоны получат обновление при синхронизации.`);
    } catch (e) {
      const msg = String(e?.message || e);
      if (msg.includes('Resource not accessible by personal access token') || msg.includes('403')) {
        toast('Ошибка доступа GitHub. Для token включите Repository permissions → Contents → Read and write. Новый модуль публикации больше не использует Git Blobs API.', true);
      } else {
        toast('Ошибка публикации: ' + msg, true);
      }
    } finally {
      setPublishing(false);
      bind();
    }
  }

  function bind() {
    document.querySelectorAll('.publish').forEach(b => {
      b.onclick = publishFixed;
      b.dataset.publishFixed = '1';
    });
  }

  window.publishFixed = publishFixed;
  window.BALI_putContent = putContent;
  bind();
  new MutationObserver(bind).observe(document.body, { childList: true, subtree: true });
})();
