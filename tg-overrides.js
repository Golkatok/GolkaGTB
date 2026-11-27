/* === banner UI override === */
/* Telegram OLED Dark studio redesign for Banner Catalog & Banner Editor. Preserves 100% of banners.js features and handlers. */
function makeDemoBanner(kind='group', target=-1001){
  return {
    kind,
    target,
    revision: 1,
    state: 'draft',
    enabled: true,
    reason: '',
    remaining_impressions: kind==='ad' ? 2400 : null,
    license: {active: true, free: kind==='group', until: Date.now()/1000 + 25*86400},
    draft: {
      background: 'linear-gradient(135deg,#0d5bd9,#6b3df2)',
      elements: [
        {id:'e_demo_title', kind:'text', text:'**Сообщество GolkaGTB**\nПравила, новости и события', x:7, y:22, w:68, h:56, rotation:0, fontSize:42, font:'sans', color:'#ffffff', align:'left'}
      ]
    }
  };
}

const _origBannerCatalog = bannerCatalog;
const _origOpenBanner = openBanner;
const _origBannerAction = bannerAction;

bannerCatalog = async function(){
  if(state.demo){
    sheet('Баннеры',`<p class="caption">Формат 21:9. Фото, видео, GIF и текст на своих местах. Размещение — доплата 2 ⭐ на месяц без автосписания. Рекламные показы оплачиваются отдельно; один показ баннера списывает один показ из общего остатка.</p><div class="tg-section-title">Баннеры в приложении</div>${state.group&&manager()&&state.data.group.paid?`<div class="banner-list-card"><strong>Собственный баннер группы</strong><p class="caption">Только ${esc(state.data.group.title)}: панель и капча. Рекламные показы не списываются.</p><button class="btn primary wide" data-banner-action="open" data-kind="group" data-target="${esc(state.group)}">Открыть редактор группы</button></div>`:''}<div class="banner-list-card"><strong>Объявление #1</strong><p class="caption">Баннер показывается в бесплатных группах без ожидания рассылки. Один показ расходует один купленный рекламный показ; 2 ⭐/месяц — доплата.</p><button class="btn secondary wide" data-banner-action="open" data-kind="ad" data-target="1">Настроить баннер</button></div><button class="btn secondary wide" data-action="bot" data-arg="ads">Объявления и рассылки</button>`);
    return;
  }
  sheet('Баннеры','<div class="loading"><div class="loader"></div></div>');
  try{
    const data=await request('/banners');
    sheet('Баннеры',`<p class="caption">Формат 21:9. Фото, видео, GIF и текст на своих местах. Размещение — доплата 2 ⭐ на месяц без автосписания. Рекламные показы оплачиваются отдельно; один показ баннера списывает один показ из общего остатка.${data.owner?' Для владельца бота — бесплатно.':''}</p>${state.group&&manager()&&state.data.group.paid?`<div class="banner-list-card"><strong>Собственный баннер группы</strong><p class="caption">Только ${esc(state.data.group.title)}: панель и капча. Рекламные показы не списываются.</p><button class="btn primary wide" data-banner-action="open" data-kind="group" data-target="${esc(state.group)}">Открыть редактор группы</button></div>`:''}${data.ads.map(a=>`<div class="banner-list-card"><strong>Объявление #${a.id}</strong><p class="caption">Баннер показывается в бесплатных группах без ожидания рассылки. Один показ расходует один купленный рекламный показ; 2 ⭐/месяц — доплата.</p><button class="btn secondary wide" data-banner-action="open" data-kind="ad" data-target="${a.id}">Настроить баннер</button></div>`).join('')}${!data.ads.length?'<p class="caption">Для рекламного баннера сначала создайте объявление в рекламном кабинете.</p>':''}${data.review.length?`<div class="tg-section-title">Ждут проверки</div><div class="card tg-group">${data.review.map(r=>`<button class="row" data-banner-action="open" data-kind="${r.kind}" data-target="${r.target}"><span class="row-body"><strong>Баннер рекламы #${r.target}</strong></span>${chev()}</button>`).join('')}</div>`:''}<button class="btn secondary wide" data-action="bot" data-arg="ads">Объявления и рассылки</button>`);
  }catch(e){sheet('Баннеры',empty(e.message))}
};

openBanner = async function(kind,target){
  if(state.demo){
    const d=makeDemoBanner(kind,target);
    bannerState.editor=d;
    bannerState.selected=d.draft.elements[0]?.id||null;
    bannerState.undo=[];bannerState.redo=[];bannerState.dirty=false;
    bannerEditor();
    return;
  }
  return _origOpenBanner(kind,target);
};

bannerAction = async function(action,button){
  if(state.demo&&['save','publish','toggle','pay','cleanup','send-editor','approve','reject'].includes(action)){
    const d=bannerState.editor;
    if(!d)return;
    if(action==='save'){bannerState.dirty=false;toast('Демо: черновик сохранён');bannerEditor();return}
    if(action==='publish'){bannerState.dirty=false;d.state=d.kind==='ad'?'pending':'approved';toast(d.state==='pending'?'Демо: отправлено на одобрение':'Демо: баннер опубликован');bannerEditor();return}
    if(action==='toggle'){d.enabled=!d.enabled;toast(d.enabled?'Показ включён':'Показ выключен');bannerEditor();return}
    toast('Демо: действие доступно после открытия через Telegram.');
    return;
  }
  return _origBannerAction(action,button);
};

finishBannerBoot = async function(){
  try{
    if(auth){
      const paths=['/me/avatar',...(state.group?['/groups/'+state.group+'/avatar']:[])];
      await Promise.allSettled(paths.map(imageAsset));
      await Promise.allSettled([...document.querySelectorAll('[data-avatar]')].map(paintAvatar));
    }
  }finally{
    const boot=document.getElementById('app-boot');
    if(boot){
      if(isReducedMotion()){boot.remove()}
      else{boot.classList.add('is-hiding');setTimeout(()=>boot.remove(),260)}
    }
  }
};

bannerBackgroundControls = function(value){
  const b=bannerBackgroundParts(value),gradient=b.type==='gradient';
  return `<div class="banner-bg-controls" id="banner-bg-controls"><div class="banner-bg-heading"><strong>Фон баннера</strong><select id="banner-bg-type" aria-label="Тип фона"><option value="solid" ${gradient?'':'selected'}>Один цвет</option><option value="gradient" ${gradient?'selected':''}>Градиент</option></select></div><div class="banner-bg-colors"><label><span>${gradient?'Первый цвет':'Цвет фона'}</span><input type="color" id="banner-bg-first" value="${esc(b.first)}" aria-label="Первый цвет фона"></label><label ${gradient?'':'hidden'}><span>Второй цвет</span><input type="color" id="banner-bg-second" value="${esc(b.second)}" aria-label="Второй цвет фона"></label><button type="button" data-banner-action="bg-swap" ${gradient?'':'hidden'} aria-label="Поменять цвета местами" title="Поменять цвета">⇄</button></div><div class="banner-bg-angle" ${gradient?'':'hidden'}><label for="banner-bg-angle">Направление градиента</label><div><input type="range" id="banner-bg-range" min="0" max="360" step="1" value="${b.angle}" aria-label="Угол градиента"><input type="number" id="banner-bg-angle" min="0" max="360" step="1" value="${b.angle}" aria-label="Угол в градусах"><span>°</span></div><small>0° — вверх · 90° — вправо · 180° — вниз · 270° — влево</small></div></div>`;
};

bannerEditor = function(){
  const d=bannerState.editor;
  if(!d)return;
  if(!d.license.active){
    sheet('Баннер в мини-приложении',`<div class="banner-license"><div class="banner-license-badge">2 ⭐ / мес</div><h3>Месяц размещения</h3><p class="caption">Фото, видео или GIF, текст с форматированием и свободное расположение элементов. Формат 21:9.</p><p class="caption">${d.kind==='ad'?'2 ⭐ — доплата за месяц размещения. Каждый показ баннера расходует один показ из общего рекламного остатка.':'Собственный баннер на страницах этой группы и под её капчей.'} Без автосписания.</p><button class="btn primary wide" data-banner-action="pay">Оплатить 2 ⭐</button></div>`);
    return;
  }
  const labels={draft:'Черновик',pending:'На проверке',approved:'Одобрен',rejected:'Отклонён'};
  const st=d.state||'draft';
  sheet('Баннер 21:9',`
    <div class="banner-editor-top">
      <button class="btn secondary" data-banner-action="text">+ Текст</button>
      <button class="btn secondary" data-banner-action="media">+ Медиа</button>
      <input id="banner-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4" hidden>
      <div class="banner-history-btns">
        <button class="btn secondary" aria-label="Отменить изменение" data-banner-action="undo" ${bannerState.undo.length?'':'disabled'}>↶</button>
        <button class="btn secondary" aria-label="Вернуть изменение" data-banner-action="redo" ${bannerState.redo.length?'':'disabled'}>↷</button>
      </div>
      <span class="banner-edit-status is-${esc(st)}">${labels[st]||'Черновик'}</span>
    </div>
    <div class="banner-stage-wrap">
      <div id="banner-work" class="banner-work">
        <div class="banner-scene" style="background:${esc(d.draft.background)}">${bannerNodes(d.draft,true)}</div>
        ${d.draft.elements.length?'':'<div class="banner-empty-canvas">Добавьте текст или медиа.<br>Перемещайте элементы пальцем.</div>'}
        <div id="banner-selection" class="banner-selection" hidden>
          <button class="banner-handle" data-banner-handle="resize" aria-label="Изменить размер"></button>
          <button class="banner-handle rotate" data-banner-handle="rotate" aria-label="Повернуть"></button>
        </div>
      </div>
    </div>
    <div class="banner-layers-head">
      <span class="tg-section-title">Слои</span>
      <span class="banner-layers-count">${d.draft.elements.length} / 12</span>
    </div>
    <div id="banner-layers" class="banner-layers"></div>
    <div class="banner-tools">
      <button type="button" data-banner-action="duplicate">Копия</button>
      <button type="button" data-banner-action="front">Вперёд</button>
      <button type="button" data-banner-action="back">Назад</button>
      <button type="button" class="danger" data-banner-action="delete">Удалить</button>
    </div>
    <div id="banner-properties"></div>
    ${bannerBackgroundControls(d.draft.background)}
    ${d.reason?`<p class="banner-error">${esc(d.reason)}</p>`:''}
    ${d.remaining_impressions!=null?`<p class="banner-hint">Осталось рекламных показов: <b>${money(d.remaining_impressions)}</b>. Один показ баннера = один рекламный показ.${d.remaining_impressions===0?' Купите показы в /adpanel; месячная доплата их не добавляет.':''}</p>`:''}
    <p class="banner-hint">Перетащите элемент на превью. Нижняя точка меняет размер, верхняя — поворот. JPG, PNG, WebP, GIF и MP4 — до 6 МБ.</p>
    <p class="banner-preview-caption">${d.license.free?'Размещение бесплатно':`Оплачено до ${fmtDate(d.license.until)}`} · ${d.enabled?'Показ включён':'Показ выключен'}</p>
    <p id="banner-error" class="banner-error" role="alert"></p>
    ${state.user?.id===6496113132&&d.state==='pending'?`<div class="card banner-review-card"><label class="field-label" for="banner-reject-reason" style="margin-top:0">Причина отказа</label><textarea id="banner-reject-reason" maxlength="1000" placeholder="Опишите, что нужно поправить"></textarea><div class="dialog-actions"><button class="btn primary" data-banner-action="approve">Одобрить баннер</button><button class="btn danger" data-banner-action="reject">Отклонить</button></div></div>`:''}
    <div class="tg-section-title">Управление показом</div>
    <div class="card tg-group has-icons">
      <button type="button" class="row" data-banner-action="toggle">${leadIcon('settings',true)}<span class="row-body"><strong>${d.enabled?'Выключить показ':'Включить показ'}</strong><small>${d.enabled?'Сейчас баннер отображается пользователям':'Сейчас показ приостановлен'}</small></span><span class="row-value-blue">${d.enabled?'Вкл':'Выкл'}</span></button>
      ${d.license.free?'':`<button type="button" class="row" data-banner-action="pay">${leadIcon('sparkle',true)}<span class="row-body"><strong>Продлить · 2 ⭐</strong><small>Ещё на 30 дней без автосписания</small></span>${chev()}</button>`}
      <button type="button" class="row" data-banner-action="send-editor">${leadIcon('transfer',true)}<span class="row-body"><strong>Ссылка в боте</strong><small>Отправить кнопку редактора в ЛС</small></span>${chev()}</button>
      <button type="button" class="row" data-banner-action="cleanup">${leadIcon('trash',false)}<span class="row-body"><strong>Очистить лишние файлы</strong><small>Удалить неиспользуемые медиа</small></span>${chev()}</button>
    </div>
    <div class="banner-editor-bottom">
      <button class="btn secondary" data-banner-action="save">Сохранить</button>
      <button class="btn primary" data-banner-action="publish">${d.kind==='ad'&&state.user?.id!==6496113132?'На одобрение':'Опубликовать'}</button>
    </div>
  `);
  document.getElementById('dialog').classList.add('banner-editor-dialog');
  const work=document.getElementById('banner-work');
  bannerScale(work);
  bannerResize.observe(work);
  bannerHydrateMedia(work,bannerPath());
  bannerProperties();
  bannerSelection();
};

bannerProperties = function(){
  const d=bannerState.editor,e=bannerSelected();
  const layers=document.getElementById('banner-layers');
  if(layers){
    layers.innerHTML=d.draft.elements.length
      ?d.draft.elements.map((v,i)=>`<button type="button" class="banner-layer" data-banner-action="select" data-id="${esc(v.id)}" aria-pressed="${v.id===bannerState.selected}">${i+1}. ${esc(v.kind==='text'?(v.text.replace(/\s+/g,' ').slice(0,18)||'Текст'):{image:'Фото',video:'Видео',gif:'GIF'}[v.kind])}</button>`).join('')
      :'<span class="caption" style="padding:4px 2px">Пока нет слоёв — добавьте текст или медиа сверху</span>';
  }
  const box=document.getElementById('banner-properties');
  if(!box)return;
  if(!e){
    box.innerHTML='<div class="banner-empty-prop">Выберите слой выше или нажмите на элемент на баннере, чтобы изменить его параметры.</div>';
    return;
  }
  const typeLabel=e.kind==='text'?'Свойства текста':{image:'Свойства фото',video:'Свойства видео',gif:'Свойства GIF'}[e.kind]||'Свойства слоя';
  const numField=([key,title,min,max])=>`<label>${title}<input type="number" data-banner-prop="${key}" value="${Number(e[key]).toFixed(1)}" min="${min}" max="${max}" step="1"></label>`;
  const transformHtml=[['x','X, %',-100,100],['y','Y, %',-100,100],['rotation','Поворот, °',-180,180],['w','Ширина, %',2,200],['h','Высота, %',2,200]].map(numField).join('');
  box.innerHTML=`
    <div class="banner-properties">
      <div class="banner-prop-head"><strong>${typeLabel}</strong></div>
      ${e.kind==='text'?`
        <label class="field-label" for="banner-text" style="margin-top:6px">Текст</label>
        <textarea id="banner-text" maxlength="2000">${esc(e.text)}</textarea>
        <p class="banner-md-hints"><code>**жирный**</code> <code>*курсив*</code> <code>__подчёрк.__</code> <code>~~зачёрк.~~</code> <code>\`код\`</code> <code>[ссылка](https://…)</code></p>
        <div class="banner-property-grid">
          <label>Шрифт<select data-banner-prop="font">${Object.entries(BANNER_FONTS).map(([key,f])=>`<option value="${key}" ${key===(e.font||'system')?'selected':''}>${f.label}</option>`).join('')}</select></label>
          ${numField(['fontSize','Размер текста',12,140])}
          ${e.font==='uploaded'?`<div class="banner-font-upload"><span>${esc(e.fontName||'Свой шрифт')}</span><button type="button" class="btn secondary" data-banner-action="font-upload">${e.fontMedia?'Заменить файл':'Загрузить шрифт'}</button><input type="file" id="banner-font-file" accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2" hidden><small>TTF, OTF, WOFF или WOFF2 — до 2 МБ.</small></div>`:''}
          ${e.font==='custom'?`<label class="banner-font-url">Ссылка на шрифт<input type="url" data-banner-prop="fontUrl" value="${esc(e.fontUrl||'')}" placeholder="https://…/font.woff2" maxlength="2048"><small>Прямой файл WOFF2, WOFF, TTF или OTF, до 2 МБ. Сайт должен разрешать загрузку шрифта.</small></label>`:''}
          <label>Цвет<input type="color" data-banner-prop="color" value="${esc(e.color)}"></label>
          <label>Выравнивание<select data-banner-prop="align">${[['left','Слева'],['center','По центру'],['right','Справа']].map(([v,t])=>`<option value="${v}" ${e.align===v?'selected':''}>${t}</option>`).join('')}</select></label>
        </div>
      `:`
        <div class="banner-property-grid" style="grid-template-columns:1fr">
          <label>Масштабирование<select data-banner-prop="fit"><option value="contain" ${e.fit==='contain'?'selected':''}>Вместить</option><option value="cover" ${e.fit==='cover'?'selected':''}>Заполнить</option></select></label>
        </div>
      `}
      <div class="banner-sub-label">Позиция и размер</div>
      <div class="banner-property-grid banner-transform-grid">${transformHtml}</div>
    </div>
  `;
};

/* === demo catalog override === */
/* Rich interactive sample catalog when previewing with ?demo=1 */
const TG_DEMO_CATALOG = {
  owner: false,
  locked: false,
  server_now: Date.now()/1000,
  recommended_picks: ['flash', 'catalog:102'],
  auto_source: 'catalog:100',
  recommended_models: [
    {source:'catalog:100', name:'Auto', company:'openrouter', is_auto:true},
    {source:'flash', name:'DeepSeek Flash', company:'deepseek', requires_pro:false},
    {source:'catalog:102', name:'Claude 3.7 Sonnet', company:'anthropic', requires_pro:true}
  ],
  models: [
    {id:100, source:'catalog:100', model_id:'openrouter/auto', name:'Auto', company:'openrouter', is_auto:true, recommended:true, image_generation:false, input_modalities:['text'], output_modalities:['text'], version:1},
    {id:101, source:'catalog:101', model_id:'deepseek/deepseek-chat-v3', name:'DeepSeek V3', company:'deepseek', tier:'standard', recommended:false, new:false, image_generation:false, cost:1, quality:4, speed:5, latency:0.42, throughput:92, input_modalities:['text'], output_modalities:['text'], version:1},
    {id:102, source:'catalog:102', model_id:'anthropic/claude-3.7-sonnet', name:'Claude 3.7 Sonnet', company:'anthropic', tier:'pro', requires_pro:true, recommended:true, new:true, image_generation:false, cost:4, quality:5, speed:4, latency:0.85, throughput:64, input_modalities:['text','image','audio','video','file'], output_modalities:['text'], version:1},
    {id:103, source:'catalog:103', model_id:'openai/gpt-4o', name:'GPT-4o', company:'openai', tier:'pro', requires_pro:true, recommended:false, new:false, image_generation:false, cost:4, quality:5, speed:4, latency:0.74, throughput:78, input_modalities:['text','image'], output_modalities:['text'], version:1},
    {id:104, source:'catalog:104', model_id:'black-forest-labs/flux-3-image-klein', name:'FLUX 3 Image Klein', company:'black-forest-labs', tier:'pro', requires_pro:true, recommended:true, new:true, image_generation:true, cost:2, quality:5, speed:5, input_modalities:['text','image'], output_modalities:['image'], version:1},
    {id:105, source:'catalog:105', model_id:'openai/gpt-image-1', name:'GPT Image', company:'openai', tier:'max', requires_max:true, recommended:false, new:false, image_generation:true, cost:5, quality:5, speed:3, input_modalities:['text'], output_modalities:['image'], version:1}
  ]
};
const _origOpenCatalog = openCatalog;
openCatalog = async function(mode='chat', taskId=null){
  if(aiHidden())return;
  if(!state.demo)return _origOpenCatalog(mode, taskId);
  catalogMode=mode;catalogTaskId=taskId;
  if(mode==='image')catalogFilters.section='image';
  if(mode==='task')catalogFilters.section='chat';
  const session=++catalogSession;clearInterval(catalogTimer);
  sheet('Каталог моделей','<div class="loading"><div class="loader"></div></div>');
  const cat={...TG_DEMO_CATALOG, server_now:Date.now()/1000};
  state.data.ai.catalog=cat;
  paintCatalog(cat, mode, taskId, session);
};
