(() => {
  const style=document.createElement('style');
  style.textContent=`.ingredient-zoom{position:fixed;inset:0;z-index:200;background:#000;display:none;align-items:center;justify-content:center;overflow:hidden}.ingredient-zoom.show{display:flex}.ingredient-zoom img{max-width:100vw;max-height:100vh;object-fit:contain;transform-origin:center;touch-action:none;transition:transform .08s linear}.ingredient-zoom .zbar{position:absolute;left:0;right:0;top:0;padding:calc(12px + env(safe-area-inset-top)) 14px 12px;background:linear-gradient(#000d,#0000);display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.ingredient-zoom .ztitle{font-weight:800;font-size:16px}.ingredient-zoom .zhint{font-size:11px;color:#ffffffa0;margin-top:3px}.ingredient-zoom .zclose{border:0;background:#ffffff20;color:#fff;width:42px;height:42px;border-radius:50%;font-size:22px}`;
  document.head.appendChild(style);
  const overlay=document.createElement('div');overlay.className='ingredient-zoom';overlay.innerHTML='<img alt=""><div class="zbar"><div><div class="ztitle"></div><div class="zhint">Разведите пальцы или нажмите дважды для увеличения</div></div><button class="zclose">×</button></div>';document.body.appendChild(overlay);
  const img=overlay.querySelector('img'), title=overlay.querySelector('.ztitle');let scale=1,startDistance=0,startScale=1;
  function setScale(v){scale=Math.max(1,Math.min(5,v));img.style.transform=`scale(${scale})`}
  function close(){overlay.classList.remove('show');setScale(1)}
  overlay.querySelector('.zclose').onclick=close;
  overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
  img.addEventListener('dblclick',()=>setScale(scale>1?1:2.5));
  img.addEventListener('touchstart',e=>{if(e.touches.length===2){startDistance=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);startScale=scale}}, {passive:true});
  img.addEventListener('touchmove',e=>{if(e.touches.length===2&&startDistance){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);setScale(startScale*d/startDistance)}}, {passive:true});
  document.addEventListener('click',e=>{const target=e.target;if(!(target instanceof HTMLImageElement))return;if(!target.closest('#ingredientSheet'))return;img.src=target.src;title.textContent=target.alt||target.closest('.sheet')?.querySelector('h2')?.textContent||'Ингредиент';overlay.classList.add('show')});
})();