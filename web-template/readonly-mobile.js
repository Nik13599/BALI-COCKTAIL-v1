(() => {
  const style = document.createElement('style');
  style.textContent = '.photo-actions,.photo-delete,.privacy{display:none!important}';
  document.head.appendChild(style);

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
