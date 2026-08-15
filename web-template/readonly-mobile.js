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
})();
