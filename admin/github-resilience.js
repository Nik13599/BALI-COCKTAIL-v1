(() => {
  if (window.__BALI_GITHUB_RESILIENCE__) return;
  window.__BALI_GITHUB_RESILIENCE__ = true;

  const nativeFetch = window.fetch.bind(window);
  const transient = new Set([408, 425, 429, 500, 502, 503, 504]);
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  function isGithubApi(input) {
    try {
      const url = typeof input === 'string' ? input : input?.url;
      return typeof url === 'string' && url.startsWith('https://api.github.com/');
    } catch { return false; }
  }

  function retryDelay(response, attempt) {
    const retryAfter = Number(response?.headers?.get?.('retry-after') || 0);
    if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, 10000);
    return Math.min(700 * Math.pow(1.7, attempt - 1), 6000);
  }

  // GitHub occasionally answers with 5xx/429 even though the connection itself is fine.
  // Retry only GitHub API requests; all other network traffic is untouched.
  window.fetch = async function baliResilientFetch(input, init) {
    if (!isGithubApi(input)) return nativeFetch(input, init);

    let lastError;
    for (let attempt = 1; attempt <= 6; attempt++) {
      try {
        const response = await nativeFetch(input, init);
        if (!transient.has(response.status) || attempt === 6) return response;
        await sleep(retryDelay(response, attempt));
      } catch (error) {
        lastError = error;
        if (attempt === 6) throw error;
        await sleep(Math.min(700 * Math.pow(1.7, attempt - 1), 6000));
      }
    }
    throw lastError || new Error('GitHub временно недоступен');
  };

  // reload-verify.js expects failed publications to leave the catalog dirty.
  // A photo-only publication previously returned false while dirty stayed false,
  // which produced the misleading message "server version 12, expected 13".
  const originalPublish = window.publishFixed;
  if (typeof originalPublish === 'function') {
    window.publishFixed = async function baliResilientPublish(...args) {
      const hadPending = Boolean(dirty) || Boolean(window.barMenuDirty) || Number(pendingFiles?.size || 0) > 0;
      const ok = await originalPublish(...args);
      if (!ok && hadPending && !dirty) {
        dirty = true;
        try {
          document.getElementById('dirtyDot')?.classList.remove('ok');
          const txt = document.getElementById('dirtyText');
          if (txt) txt.textContent = 'Есть неопубликованные изменения';
        } catch {}
      }
      return ok;
    };
  }

  window.BALI_GITHUB_RESILIENCE_VERSION = 1;
})();
