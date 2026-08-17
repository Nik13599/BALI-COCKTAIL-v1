(() => {
  const refreshPrint=()=>{try{window.renderPrintViews?.()}catch(e){console.warn('bartender refresh',e)}};

  // Фото коктейля должно попадать в техкарту бармена сразу после выбора файла,
  // ещё до публикации. publish-fix.js нормализует фото до 500×500 и вызывает done(path).
  try {
    const baseQueue=queueImage;
    queueImage=function(file,base,done){
      return baseQueue(file,base,path=>{
        done?.(path);
        refreshPrint();
        setTimeout(refreshPrint,50);
      });
    };
  } catch(e) { console.warn('queueImage wrap',e); }

  // После сохранения полей коктейля обновляем предпросмотр техкарты без переходов между вкладками.
  try {
    const baseSave=saveCocktail;
    saveCocktail=function(c){
      const out=baseSave(c);
      refreshPrint();
      return out;
    };
  } catch(e) { console.warn('saveCocktail wrap',e); }

  // После серверной перезагрузки/публикации печатные карточки должны брать актуальный officialImage.
  window.addEventListener('focus',()=>setTimeout(refreshPrint,100));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(refreshPrint,100)});
  setTimeout(refreshPrint,300);
})();