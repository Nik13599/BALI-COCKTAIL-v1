(() => {
  window.barProducts = window.barProducts || [];
  window.ingredientSprite = window.ingredientSprite || null;
  window.barMenuDirty = window.barMenuDirty || false;

  function inferCategory(name) {
    const n=String(name||'').toLowerCase();
    if(/водка|джин|виски|ром|текил|ликер|ликёр|вермут|игрист|ангостур|биттер/.test(n)) return 'Алкоголь';
    if(/сироп|сахар/.test(n)) return 'Сиропы / сахар';
    if(/сок|морс|вода|алоэ|супер джус/.test(n)) return 'Безалкогольные напитки';
    if(/пюре|концентрат|кордиал|настойка|наршараб|соус/.test(n)) return 'Заготовки / компоненты';
    if(/сливк|молоч/.test(n)) return 'Молочные';
    if(/грейпфрут|малина|клюква|апельсин|базилик|мята|чили|цедра|кокосовая/.test(n)) return 'Фрукты / зелень / гарнир';
    if(/корица|кардамон|гвоздика|перец|бадьян/.test(n)) return 'Специи';
    if(/кофе/.test(n)) return 'Кофе';
    return 'Не указано';
  }
  function fnvId(name){let h=2166136261;for(const ch of String(name||'')){h^=ch.codePointAt(0);h=Math.imul(h,16777619)}return 'ing-'+(h>>>0).toString(16)}
  function synthesizeMissingIngredients(){
    let added=0;
    const byName=new Map((ingredients||[]).map(x=>[String(x.name).toLowerCase(),x]));
    for(const c of (cocktails||[])) for(const ing of (c.ingredients||[])) {
      const key=String(ing.name||'').trim().toLowerCase(); if(!key||byName.has(key)) continue;
      const rec={id:fnvId(ing.name),name:ing.name,category:inferCategory(ing.name),description:'',officialImage:null,active:true};
      ingredients.push(rec);byName.set(key,rec);added++;
    }
    if(added){window.ingredientsSynthesized=(window.ingredientsSynthesized||0)+added;markDirty();toast(`Добавлено в справочник недостающих ингредиентов: ${added}. Проверьте и опубликуйте.`)}
    return added;
  }
  window.synthesizeMissingIngredients=synthesizeMissingIngredients;

  async function optionalJson(path,fallback){
    try{const x=await api(`/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`);return JSON.parse(dec(x.content))}
    catch(e){const m=String(e?.message||e);if(m.includes('404')||m.includes('Not Found'))return fallback;throw e}
  }
  window.optionalJson=optionalJson;
  function registerNavButton(id,label){
    const nav=document.querySelector('.nav');if(!nav)return;
    let b=document.querySelector(`.nav button[data-view="${id}"]`);
    if(!b){b=document.createElement('button');b.dataset.view=id;b.textContent=label;nav.appendChild(b)}
    b.onclick=()=>{document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));document.getElementById(id)?.classList.remove('hidden');document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x===b));if(id==='products')window.renderProducts?.();if(id==='printBartender'||id==='printDocs')window.renderPrintViews?.()};
  }
  window.registerNavButton=registerNavButton;
  function spriteInfo(name,size=46){
    const s=window.ingredientSprite;if(!s?.image||!s?.items)return null;
    const idx=s.items[name];if(idx===undefined)return null;
    const col=idx%s.cols,row=Math.floor(idx/s.cols);
    return {idx,style:`background-image:url(${s.image});background-size:${s.cols*size}px ${s.rows*size}px;background-position:-${col*size}px -${row*size}px;background-repeat:no-repeat`};
  }
  window.spriteInfo=spriteInfo;
  window.currentMediaUrl=function(path){if(!path)return'';const b64=pendingFiles.get(path);if(b64){const ext=(path.split('.').pop()||'jpg').toLowerCase();const mime=ext==='png'?'image/png':ext==='webp'?'image/webp':'image/jpeg';return `data:${mime};base64,${b64}`}return rawUrl(path)};

  const oldLoadAll=window.loadAll;
  window.loadAll=async function(){
    await oldLoadAll();
    const [sprite,products]=await Promise.all([
      optionalJson('data/ingredient-sprite.json',null),
      optionalJson('data/products.json',[])
    ]);
    window.ingredientSprite=sprite;
    window.barProducts=Array.isArray(products)?products:[];
    synthesizeMissingIngredients();
    renderAll();
    window.ensureProducts?.();window.ensurePrintViews?.();
  };

  const style=document.createElement('style');style.id='v13CoreStyles';style.textContent=`
    .ingredient-thumb{width:48px;height:48px;flex:0 0 48px;border-radius:10px;background-color:#101014;border:1px solid var(--line);background-repeat:no-repeat;overflow:hidden}.ingredient-list-row{display:flex;gap:10px;align-items:center}.ingredient-list-row>div:last-child{min-width:0;flex:1}.ingredient-start-preview{width:170px;height:170px;border-radius:16px;border:1px solid var(--line);background-color:#101014;background-repeat:no-repeat}.ingredient-official-preview{width:170px;height:170px;object-fit:contain;border-radius:16px;border:1px solid var(--line);background:#101014}`;document.head.appendChild(style);

  window.renderIngredientList=function(){
    const q=($('ingredientSearch')?.value||'').toLowerCase(),el=$('ingredientList');if(!el)return;
    el.innerHTML=ingredients.filter(i=>i.name.toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name,'ru')).map(i=>{
      const sp=spriteInfo(i.name,48);
      const visual=i.officialImage?`<img class="ingredient-official-preview" src="${esc(currentMediaUrl(i.officialImage))}" style="width:48px;height:48px">`:sp?`<span class="ingredient-thumb" style="${sp.style}"></span>`:`<span class="ingredient-thumb"></span>`;
      return `<div class="item ${selectedIngredient===i.id?'active':''}" data-id="${esc(i.id)}"><div class="ingredient-list-row">${visual}<div><b>${esc(i.name)}</b><small>${esc(i.category||'Не указано')}${i.officialImage?' · фото ADMIN':' · стартовое фото'}</small></div></div></div>`
    }).join('');
    el.querySelectorAll('.item').forEach(x=>x.onclick=()=>{selectedIngredient=x.dataset.id;renderIngredientList();renderIngredientEditor()})
  };
  window.renderIngredientEditor=function(){
    const i=ingredients.find(x=>x.id===selectedIngredient);if(!i)return;
    const sp=spriteInfo(i.name,170);
    const visual=i.officialImage?`<img id="iPreview" class="ingredient-official-preview" src="${esc(currentMediaUrl(i.officialImage))}">`:sp?`<div id="iPreview" class="ingredient-start-preview" style="${sp.style}"></div>`:`<div id="iPreview" class="ingredient-start-preview"></div>`;
    $('ingredientEditor').innerHTML=`<label>Название</label><input id="iName" value="${esc(i.name)}"><div class="two"><div><label>Категория</label><input id="iCat" value="${esc(i.category||'')}"></div><div><label>Активен</label><select id="iActive"><option value="true">Да</option><option value="false">Нет</option></select></div></div><label>Описание / как выглядит / где находится</label><textarea id="iDesc">${esc(i.description||'')}</textarea><div class="section-title">Фото ингредиента</div><div class="photo">${visual}<div><input id="iPhoto" type="file" accept="image/*"><div class="muted" style="margin-top:6px">${i.officialImage?'Официальное фото администратора имеет приоритет.':'Это стартовое изображение. Администратор может заменить его своим фото.'}</div>${i.officialImage?'<button id="iClearOfficial" class="ghost" style="margin-top:8px">Вернуться к стартовому изображению</button>':''}</div></div><div class="actions" style="margin-top:18px"><button id="saveIngredient" class="primary">Сохранить</button><button id="deleteIngredient" class="danger">Архивировать</button></div>`;
    $('iActive').value=String(i.active!==false);
    $('saveIngredient').onclick=()=>{i.name=$('iName').value.trim();i.category=$('iCat').value.trim();i.description=$('iDesc').value.trim();i.active=$('iActive').value==='true';markDirty();renderAll();renderIngredientEditor();toast('Ингредиент сохранён локально')};
    $('deleteIngredient').onclick=()=>{i.active=false;markDirty();renderAll();renderIngredientEditor();toast('Ингредиент перенесён в архив')};
    $('iClearOfficial')&&($('iClearOfficial').onclick=()=>{i.officialImage=null;markDirty();renderIngredientEditor();renderIngredientList()});
    $('iPhoto').onchange=e=>queueImage(e.target.files[0],`media/ingredients/${i.id}-${Date.now()}`,path=>{i.officialImage=path;markDirty();renderIngredientEditor();renderIngredientList();toast('Фото подготовлено. Нажмите «Опубликовать».')})
  };
})();
