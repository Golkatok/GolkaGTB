# Дерево кнопок GolkaGTB · 0.5.6

Открыть **BOT_BUTTON_TREE.json** можно в VS Code, VSCodium, Notepad++, обычном Блокноте или любом редакторе JSON. Этот Markdown удобно читать в VS Code или Obsidian.

Как предложить изменения: найдите кнопку по названию, измените `label` (текст), `action` (действие) или порядок элементов `buttons` и пришлите JSON обратно. Можно добавить текстовое поле `comment` с пояснением. Сохраняйте `id` и `source`, чтобы я нашёл реализацию. Скобки `{…}` — динамические параметры, не реальные ID. Это **снимок для согласования**, а не исполняемый конфиг: бот изменится после применения правок в коде. JSON содержит определения кнопок по функциям; варианты зависят от роли, тарифа, состояния и данных группы.

## Основные пути

```text
Главная (/start)
├── Группы → выбранная группа
│   ├── Модерация → ИИ-модерация / встроенные фильтры / правила / журнал
│   ├── Настройки → функции / рассылки / права команд / восстановление админки
│   ├── ИИ
│   │   ├── Чат и модели
│   │   │   ├── Модель → DeepSeek Flash / DeepSeek Pro / Каталог / Выключено
│   │   │   ├── Каталог → Чат / Изображения (срок открытия проверяет сервер)
│   │   │   ├── Свой промпт → ввод → сохранение
│   │   │   ├── Настройки поведения → переключатели / списки / подтверждение РП 18+
│   │   │   ├── Поиск в интернете → Вкл/Выкл
│   │   │   ├── Генерация изображений → Вкл/Выкл
│   │   │   ├── Модель для изображений → каталог изображений → выбор
│   │   │   ├── Очистить историю
│   │   │   ├── AIChating+ → покупка
│   │   │   └── Доп. лимиты за актив → получение бонуса
│   │   ├── Задачи → список / создать / открыть / включить / изменить / удалить
│   │   └── AIChating+ → покупка
│   ├── Экономика → кошелёк / переводы / обмен / работа / обучение / магазин
│   ├── Посёлок → карта / здания / строительство / улучшения
│   ├── Розыгрыши → создание / список / просмотр
│   ├── РП и команды → категории и отдельные команды
│   ├── База знаний → категории / поиск / предложения / политика
│   ├── Управляющие / доступ / язык / правила для участников
│   └── Мини-приложение → управление / скрипты / капча / баннер группы
├── Подключить / продлить чат → тариф → срок → способ оплаты → подтверждение
├── Скрытые чаты → список → вернуть в панель
├── Выигранные доступы → список → применение
├── Рекламный кабинет → объявления → просмотр / редактирование / пауза / архив / показы / баннер
├── Кошелёк → переводы / пополнение / история
├── Разделы справки → категории → команды
├── Язык / О боте / История версий
└── Только владелец бота
    ├── База знаний → управление и проверка
    ├── Настройки бота
    ├── Рассылки → создание / просмотр / отправка
    ├── Все покупки → просмотр / отмена
    └── Выдать доступ бесплатно → группа / тариф / срок / применение
```

«Назад» восстанавливает предыдущий экран, не повторяет покупку/удаление/отправку. «Главная» возвращает главное меню. Списки групп, товаров, объявлений и моделей формируются из базы. Ниже — определения кнопок из исходников, включая условные и динамические варианты. `source` в JSON указывает на реализацию; повторяющиеся подписи могут иметь разные действия.

## Определения кнопок из кода


### access_panel.show_free_feature

Источник: `modbot/access_panel.py:9`

- Посмотреть тарифы → `ec:access:{chat}`
- Назад / Главная → `group:{chat_id}`

### ads.ads_list

Источник: `modbot/ads.py:45`

- {'Отправить рекламу на проверку' if user != OWNER_ID else 'Создать свою рекламу'} → `ad:new`
- Объявления на проверке → `ad:review`
- #{ad['id']} · {STATES[ad['state']]} → `ad:view:{ad['id']}`
- ← → `ad:list:{page - 1}:{int(archived)}`
- → → `ad:list:{page + 1}:{int(archived)}`
- Главная → `home`

### ads.ads_view

Источник: `modbot/ads.py:61`

- Посмотреть объявление → `ad:preview:{identifier}`
- Купить отправки · 2 ⭐ / шт. → `ad:buy:{identifier}`
- Отправки за a$ → `ad:tokens:{identifier}`
- Редактировать объявление → `ad:edit:{identifier}`
- {'Возобновить рассылку' if ad['paused'] else 'Приостановить рассылку'} → `ad:pause:{identifier}`
- {'Вернуть в список' if ad['hidden'] else 'Убрать из списка'} → `ad:archive:{identifier}`
- Баннер в мини-приложении → `bn:open:ad:{identifier}`
- Посмотреть изменения → `ad:editpreview:{identifier}`
- Удалить объявление · вернуть остаток в a$ → `ad:deleteconfirm:{identifier}`
- Одобрить → `ad:approve:{identifier}:{ad['edit_revision']}`
- Отклонить с причиной → `ad:reject:{identifier}:{ad['edit_revision']}`
- Удалить объявление → `ad:deleteconfirm:{identifier}`
- Обновить статистику → `ad:view:{identifier}`
- Назад → `ad:list:0`

### ads.ads_callback

Источник: `modbot/ads.py:97`

- Назад → `ad:list:0`
- {'#' + str(a[0])} → `ad:view:{a[0]}`
- Назад → `ad:list:0`
- Назад → `ad:view:{identifier}`
- Назад → `ad:view:{identifier}`
- Назад → `ad:view:{identifier}`
- Без причины → `ad:rejectnow:{identifier}:{ad['edit_revision']}`
- Назад → `ad:view:{identifier}`
- Удалить → `ad:delete:{identifier}`
- Назад → `ad:view:{identifier}`
- Назад → `ad:list:0`

### broadcasts.broadcast_list

Источник: `modbot/broadcasts.py:40`

- Создать рассылку → `bc:new`
- {'#' + str(row['id']) + ' · ' + self.e(user, 'broadcast_state_' + row['state'])} → `bc:view:{row['id']}`

### broadcasts.broadcast_view

Источник: `modbot/broadcasts.py:48`

- {self.e(user, 'broadcast_audience_' + key)} → `bc:toggle:{identifier}:{key}`
- Предпросмотр → `bc:preview:{identifier}`
- Отправить сейчас → `bc:now:{identifier}`
- Запланировать → `bc:time:{identifier}`
- Отменить рассылку → `bc:cancel:{identifier}`
- Обновить статус → `bc:view:{identifier}`
- Назад → `bc:list`

### broadcasts.broadcast_confirm

Источник: `modbot/broadcasts.py:71`

- Подтвердить → `bc:confirm:{identifier}:{when}:{broadcast_digest(row)}`
- Назад → `bc:view:{identifier}`

### broadcasts.broadcast_callback

Источник: `modbot/broadcasts.py:83`

- Назад → `bc:list`
- Назад → `bc:view:{identifier}`
- Назад → `bc:list`

### broadcasts.broadcast_input

Источник: `modbot/broadcasts.py:131`

- Назад → `bc:list`

### chat_presence.hidden_chat_list

Источник: `modbot/chat_presence.py:118`

- {self.e(user, 'panel_restore') + ' · ' + group['title'][:35]} → `cp:restore:{group['id']}`
- ← → `cp:list:{page - 1}`
- → → `cp:list:{page + 1}`

### chat_presence.chat_presence_callback

Источник: `modbot/chat_presence.py:131`

- Подтвердить → `cp:hide:{chat}`
- Назад → `group:{chat}`
- Скрытые чаты → `cp:list:0`

### economy_panel.economy_back

Источник: `modbot/economy_panel.py:29`

- Главная → `home`

### economy_panel.economic_overview

Источник: `modbot/economy_panel.py:108`

- {self.e(user, key)} → `ec:{op}:{chat}`
- Функции группы → `ec:features:{chat}`
- Экономика и магазин → `ec:group:{chat}`
- Посмотреть тарифы → `ec:access:{chat}`
- Розыгрыши → `ec:givecreate:{chat}`
- Закрыть меню → `ec:close:{chat}`
- Управление группой → `https://t.me/{self.bot_username}?start=manage_{chat}`

### economy_panel.economic_wallet

Источник: `modbot/economy_panel.py:128`

- Уровень и развитие → `ec:profile:{chat}`
- Улучшения работы и обучения → `ec:dailyupgrades:{chat}`
- {label} → `ec:exchange:{chat}`
- Перевести → `ec:transfer:{chat}`
- Принимать ⚡ → `ec:receiving:0`
- Маркет ферм → `ec:market:{chat if context else 0}`
- Автофермы → `ec:farms:{chat}`
- {self.e(user, key)} → `ec:{key}:{chat}`
- Выпустить фермы → `ec:mint:0`
- Покупки и отмена → `pc:list:0:0`
- Вернуть Stars → `ec:refunds:0:0`
- Покупки и отмена → `https://t.me/{self.bot_username}?start=purchases`
- {group['title'][:40]} → `ec:wallet:{group['id']}`

### economy_panel._economy_callback

Источник: `modbot/economy_panel.py:212`

- Подтвердить → `ec:studypay:{chat}:{token}`
- Подтвердить → `ec:rebirthpay:{chat}:{token}`
- {label} · {display_money(price)} ⚡ → `ec:checkout:{chat}:{token}`
- Автофермы → `ec:farms:{chat}`
- C₲ → `ec:sellcoins:{chat}:{farm_id}`
- ⚡ → `ec:sellenergy:{chat}:{farm_id}`
- {row['title']} → `ec:farm:{row['id']}:{listing['id']}`
- Указать ID группы → `ec:farmchoose:0:{listing['id']}`
- Подтвердить → `ec:checkout:{chat}:{token}`
- {'#' + str(order['id']) + ' ↻'} → `ec:retryorder:{chat}:{order['id']}`

### economy_panel.economic_group

Источник: `modbot/economy_panel.py:524`

- {self.e(user, key)} → `ec:{op}:{chat}`
- Доступ к боту → `ec:access:{chat}`
- Управление магазином → `ec:shopmanage:{chat}`
- {self.e(user, 'transfer') + ' · ' + self.e(user, 'group_funds')} → `ec:treasurytransfer:{chat}`
- Принимать ⚡ → `ec:groupreceiving:{chat}`
- AIChating+ → `ec:aisub:{chat}:ai_month`
- AIChating Pro → `ec:aisub:{chat}:ai_pro_month`
- DeepSeek · 1000 проверок модерации → `ec:aisub:{chat}:ds_pack`
- Назад / Главная → `group:{chat_id}`

### economy_panel.show_group_features

Источник: `modbot/economy_panel.py:537`

- {self.e(user, label) + ' · ' + self.e(user, 'enabled' if enabled else 'off')} → `ec:featuretoggle:{chat}:{key}`
- Настроить отдельные команды → `ec:commands:{chat}:0`

### economy_panel.command_settings

Источник: `modbot/economy_panel.py:547`

- {title + (' · /' + code if '.' not in code else '')} → `ec:cmdtoggle:{chat}:{index}:{page}`
- {self.e(user, 'visible' if shown else 'hidden')} → `ec:cmdvisible:{chat}:{index}:{page}`
- ← → `ec:commands:{chat}:{page - 1}`
- → → `ec:commands:{chat}:{page + 1}`
- Функции группы → `ec:features:{chat}`
- Назад → `ec:group:{chat}`

### economy_panel.show_goods

Источник: `modbot/economy_panel.py:583`

- {label} → `ec:good:{chat}:{good['id']}`
- ← → `ec:goods:{chat}:{page - 1}`
- → → `ec:goods:{chat}:{page + 1}`

### economy_panel.show_shop_management

Источник: `modbot/economy_panel.py:607`

- Новый товар / звание → `ec:goodsadd:{chat}`
- Покупки участников → `ec:orders:{chat}`
- Открыть витрину → `ec:shop:{chat}`
- {good['name'][:35] + ' · ' + state} → `ec:goodtoggle:{chat}:{good['id']}`

### economy_panel.show_farms

Источник: `modbot/economy_panel.py:619`

- {self.e(user, 'claim') + f" #{farm['id']}"} → `ec:claim:{target}:{farm['id']}`
- Продать → `ec:sell:{chat}:{farm['id']}`
- {'#' + str(farm['id']) + ' · ' + self.e(user, 'farm_bind')} → `ec:farmbind:0:{farm['id']}`
- {self.e(user, 'sell') + f" #{farm['id']}"} → `ec:sell:{chat}:{farm['id']}`

### economy_panel.show_market

Источник: `modbot/economy_panel.py:646`

- {listing['name'] + ' · ' + display_money(price) + ' ' + ASSETS[listing['asset']]} → `ec:farm:{chat}:{listing['id']}`

### economy_panel.show_checkout

Источник: `modbot/economy_panel.py:667`

- Оплатить из моего кошелька → `ec:pay:{chat}:{token}:self`
- Оплатить из казны группы → `ec:pay:{chat}:{token}:group`

### economy_panel.show_transfer_checkout

Источник: `modbot/economy_panel.py:713`

- Подтвердить перевод → `ec:paytransfer:{chat}:{token}`

### economy_panel.pay_economic_quote

Источник: `modbot/economy_panel.py:726`

- Улучшения работы и обучения → `ec:dailyupgrades:{chat}`

### economy_panel.show_progression

Источник: `modbot/economy_panel.py:800`

- Забрать награду · уровень {level} → `ec:rewardclaim:{chat}:{reward['level']}`
- Улучшения работы и обучения → `ec:dailyupgrades:{chat}`
- Перерождение · 500 очков → `ec:rebirth:{chat}`

### economy_panel.show_daily_upgrades

Источник: `modbot/economy_panel.py:833`

- {kind}: −1ч · {price} C₲ → `ec:dailyupgrade:{chat}:{kind}`
- {name} · {price} очков → `ec:studyupgrade:{chat}:{kind}`

### energy_refunds.show_energy_refunds

Источник: `modbot/energy_refunds.py:12`

- {label} → `ec:refundview:0:{purchase['id']}:{page}`
- ← → `ec:refunds:0:{page - 1}`
- → → `ec:refunds:0:{page + 1}`

### energy_refunds.show_energy_refund

Источник: `modbot/energy_refunds.py:38`

- Проверить возврат → `ec:refundgo:0:{purchase_id}:{page}`
- Вернуть {stars} ⭐ → `ec:refundgo:0:{purchase_id}:{page}`
- Назад → `ec:refunds:0:{page}`
- Главная → `home`

### giveaways.giveaway_photo_form

Источник: `modbot/giveaways.py:157`

- Без картинки → `ec:givepreview:{chat}:{token}`

### giveaways.show_giveaway_preview

Источник: `modbot/giveaways.py:187`

- Опубликовать розыгрыш → `ec:giveconfirm:{chat}:{token}`
- Добавить / заменить картинку → `ec:givephoto:{chat}:{token}`

### giveaways.open_giveaway_form

Источник: `modbot/giveaways.py:230`

- Доступ к боту → `ec:giveaccess:{chat}`
- Монеты, молнии или свой приз → `ec:giveordinary:{chat}`

### giveaways.access_prizes_callback

Источник: `modbot/giveaways.py:237`

- {g['title']} → `gp:claim:{giveaway}:{g['id']}`
- ← → `gp:groups:{giveaway}:{page - 1}`
- → → `gp:groups:{giveaway}:{page + 1}`
- Назад → `gp:list`
- {f"#{p['giveaway_id']} · " + self.e(user, 'tier_' + p['tier']) + ' · ' + self.grant_term(user, p['plan'])} → `gp:groups:{p['giveaway_id']}`

### group_tools.rules_edit_command

Источник: `modbot/group_tools.py:174`

- {g['title'][:40]} → `memberedit:{g['id']}`

### guide_panel.show_guide

Источник: `modbot/guide_panel.py:12`

- {name} → `gd:{chat}:{slug}:0`
- ← → `gd:{chat}:{category}:{page - 1}`
- → → `gd:{chat}:{category}:{page + 1}`
- Все разделы → `gd:{chat}:index:0`

### help_panel.show_help

Источник: `modbot/help_panel.py:57`

- {self.e(user, 'help_category_' + category)} → `hp:{chat}:{category}:0`
- Подробное руководство → `gd:{chat}:index:0`
- Все команды → `hp:{chat}:all:0`
- ← → `hp:{chat}:{section}:{page - 1}`
- → → `hp:{chat}:{section}:{page + 1}`
- Разделы справки → `hp:{chat}:root:0`

### investments.show_investments

Источник: `modbot/investments.py:26`

- {g['title']} → `ec:investments:{g['id']}`
- {c['name'] + ' · ' + display_money(c['price']) + ' C₲'} → `ec:investcompany:{chat}:{c['id']}`
- ← → `ec:investments:{chat}:{page - 1}`
- → → `ec:investments:{chat}:{page + 1}`

### investments.show_investment_company

Источник: `modbot/investments.py:51`

- Инвестировать → `ec:investbuy:{chat}:{company}`
- Продать все доли → `ec:investsell:{chat}:{company}`

### investments.investment_checkout

Источник: `modbot/investments.py:66`

- Подтвердить → `ec:investpay:{chat}:{token}`

### investments.investment_callback

Источник: `modbot/investments.py:85`

- 📈 Инвестиции → `ec:investcompany:{chat}:{payload['company']}`

### knowledge.notify_deletion

Источник: `modbot/knowledge.py:144`

- {tr(language, 'kb_report_add')} → `kbfeedback:{message.chat.id}:{report_id}:manual`
- {tr(language, 'kb_dislike')} → `kbfeedback:{message.chat.id}:{report_id}:edit`
- {tr(language, 'kb_report_deepseek')} → `kbfeedback:{message.chat.id}:{report_id}:ai`

### knowledge.notify_proposal

Источник: `modbot/knowledge.py:180`

- {tr(language, 'kb_review_open')} → `kbreview:0:{proposal_id}`

### knowledge_panel.kb_menu

Источник: `modbot/knowledge_panel.py:25`

- Посмотреть → `kbpage:{scope}:0`
- Добавить → `kbadd:{0 if user_id == OWNER_ID else scope}`
- Удалить → `kbdelete:{scope}`
- Найти → `kbfind:{scope}`
- Что удалять: категории → `kbpolicies:{scope}:0`
- Разметить с DeepSeek → `kbauto:0`
- На одобрении → `kbreviews:0:0`
- Общая база → `kb:0`
- 🔒 {name} → `paidfeature:{scope}:knowledge`
- Назад / Главная → `group:{chat_id}`

### knowledge_panel.kb_callback

Источник: `modbot/knowledge_panel.py:44`

- #{row['id']} · {preview[:35]} → `kbentry:{scope}:{row['id']}`
- Найти → `kbfind:{scope}`
- Назад → `kb:{scope}`
- Удалить → `kbdeleteconfirm:{scope}:{entry['id']}:{entry['revision']}`
- Назад → `kbpage:{scope}:0`
- {self.t(user_id, 'category_remove' if blocked else 'category_allow') + ': ' + category_name(code, self.store.language(user_id))} → `kbpolicy:{scope}:{index}:{page}`
- ← → `kbpolicies:{scope}:{page - 1}`
- → → `kbpolicies:{scope}:{page + 1}`
- Назад → `kb:{scope}`
- Посмотреть → `kbpage:{scope}:0`
- Назад → `kb:{scope}`
- {f"#{r['id']} · " + json.loads(r['snapshot'])['text'][:35]} → `kbreview:0:{r['id']}`
- ← → `kbreviews:0:{page - 1}`
- → → `kbreviews:0:{page + 1}`
- Назад → `kb:0`
- Применить → `kbapprove:0:{proposal['id']}`
- Отклонить → `kbreject:0:{proposal['id']}`
- Изменить → `kbeditproposal:0:{proposal['id']}`
- Назад → `kbreviews:0:0`

### knowledge_panel.kb_selector

Источник: `modbot/knowledge_panel.py:264`

- {category_name(code, self.store.language(user_id))} → `kbcat:{scope}:{token}:{index}:{draft['revision']}:{page}`
- ← → `kbselect:{scope}:{token}:{page - 1}`
- → → `kbselect:{scope}:{token}:{page + 1}`
- Ввести категории текстом → `kbeditcats:{scope}:{token}`
- Применить → `kbconfirm:{scope}:{token}:{draft['revision']}`
- Назад → `kb:{scope}`

### knowledge_panel.kb_input

Источник: `modbot/knowledge_panel.py:284`

- Удалить → `kbdeleteconfirm:{scope}:{entry['id']}:{entry['revision']}`
- Назад → `kb:{scope}`

### navigation.navigation_buttons

Источник: `modbot/navigation.py:164`

- Назад → `nav:back:{token}:{revision}`
- Главная → `nav:home:{token}:{revision}`

### owner_grant_panel.owner_grant_groups

Источник: `modbot/owner_grant_panel.py:18`

- {row['title']} → `og:tier:{row['id']}`
- ← → `og:groups:{page - 1}`
- → → `og:groups:{page + 1}`
- {'Разыграть доступ · ' + g['title'][:28]} → `ec:giveaccess:{g['id']}`

### owner_grant_panel.owner_grant_callback

Источник: `modbot/owner_grant_panel.py:31`

- История бесплатной выдачи → `og:history:{quote['chat_id']}:0`
- Назад → `og:tier:{quote['chat_id']}`
- Подтвердить → `og:revoke:{identifier}`
- Назад → `og:history:{row['chat_id']}:0`
- {self.e(user, 'tier_' + tier)} → `og:term:{chat}:{tier}`
- История бесплатной выдачи → `og:history:{chat}:0`
- Назад → `og:groups:0`
- {self.grant_term(user, plan)} → `og:mode:{chat}:{tier}:{plan}`
- Назад → `og:tier:{chat}`
- {self.e(user, 'tier_start_' + mode)} → `og:confirm:{chat}:{tier}:{plan}:{mode}`
- Назад → `og:term:{chat}:{tier}`
- Подтвердить → `og:grant:{token}`
- Назад → `og:mode:{chat}:{tier}:{plan}`
- Назад → `og:groups:0`

### owner_grant_panel.owner_grant_history

Источник: `modbot/owner_grant_panel.py:93`

- {self.e(user, 'owner_grant_revoke') + ' #' + str(row['id'])} → `og:revokeask:{row['id']}`
- ← → `og:history:{chat}:{page - 1}`
- → → `og:history:{chat}:{page + 1}`
- Назад → `og:tier:{chat}`

### panel.miniapp_command

Источник: `modbot/panel.py:128`

- Открыть мини-приложение → `https://t.me/{username}?startapp`

### panel.register_commands

Источник: `modbot/panel.py:135`

- start → `home`
- version → `about`
- buy → `access`
- paysupport → `access`

### panel.back

Источник: `modbot/panel.py:251`

- Главная → `home`
- Главная → `home`

### panel._home

Источник: `modbot/panel.py:257`

- Скрытые чаты → `cp:list:0`
- Подключить / продлить чат → `connect_paid`
- Доступ и оплата → `access`
- Язык → `languages`
- О боте и изменения → `about`
- База знаний → `kb:0`
- Настройки бота → `settings`
- Рассылки → `bc:list`
- Все покупки · владелец → `pc:list:0:1`
- Выдать доступ бесплатно → `og:groups:0`
- Выигранные доступы → `gp:list`
- Рекламный кабинет → `ad:list:0`
- Предложить фразу → `kbpublic`
- Кошелёк → `ec:wallet:0`
- Подключить / продлить чат → `ec:connect:0`

### panel.panel

Источник: `modbot/panel.py:335`

- Скрытые чаты → `cp:list:0`
- {self.t(user_id, key)} → `{op}:{chat_id}`
- Баннер группы → `bn:open:group:{chat_id}`
- Посёлок → `ec:village:{chat_id}`
- Убрать чат из панели → `cp:ask:{chat_id}`
- Управляющие → `managers:{chat_id}`
- {Вкл/Выкл} → `toggle:{chat_id}`
- Посмотреть тарифы → `ec:access:{chat_id}`
- Для участников → `ec:overview:{chat_id}`
- Экономика и магазин → `ec:group:{chat_id}`

### panel.access_panel

Источник: `modbot/panel.py:363`

- Подключить / продлить чат → `ec:connect:0`
- Кошелёк → `ec:wallet:0`
- {group['title'][:40]} → `ec:access:{group['id']}`
- Подключить / продлить чат → `connect_paid`

### panel.send_settings

Источник: `modbot/panel.py:374`

- {Вкл/Выкл} → `sales_toggle`
- Рассылки → `bc:list`
- Проверка выдачи Premium → `ec:premiumorders:0`

### panel.successful_payment

Источник: `modbot/panel.py:404`

- {self.t(message.from_user.id, invoice['plan'] + '_name')} → `{target}:{invoice['target_chat']}`
- Подключить / продлить чат → `connect_paid`

### panel.payment_support

Источник: `modbot/panel.py:500`

- Выдан владельцем → `tg://user?id={OWNER_ID}`

### panel.begin_input

Источник: `modbot/panel.py:507`

- Назад / Главная → `group:{chat_id}`

### panel.begin_connection_key

Источник: `modbot/panel.py:513`

- Назад / Главная → `aiconnections`

### panel.choose_task_connection

Источник: `modbot/panel.py:520`

- {connection['name'][:28] + ' · ' + connection['model'][:25]} → `jobconnection:{chat_id}:{connection['id']}:{job_id or 0}`
- Подключения → `aiconnections:{chat_id}`
- Назад / Главная → `jobs`

### panel.connection_models

Источник: `modbot/panel.py:532`

- {model['name'][:55]} → `aimodel:{chat_id}:{connection_id}:{connection['version']}:{index}`
- Предыдущая страница → `aimodels:{chat_id}:{connection_id}:{page - 1}`
- Следующая страница → `aimodels:{chat_id}:{connection_id}:{page + 1}`
- Назад / Главная → `aiconnections`

### panel._callback

Источник: `modbot/panel.py:552`

- {self.t(user_id, row['plan'] + '_name') + f" #{row['id']}"} → `credit:{row['id']}`
- Назад → `about`

### panel.perform_callback

Источник: `modbot/panel.py:678`

- {switch('automatic_moderation', group['moderation_enabled'])} → `moderationtoggle:{chat_id}`
- {switch('ai_moderation_switch', group['ai_moderation_enabled'])} → `aimoderationtoggle:{chat_id}`
- ИИ-модерация → `aimoderation:{chat_id}`
- Встроенная модерация → `builtin:{chat_id}`
- {self.t(user_id, 'media_policy_' + group['unscannable_media'])} → `mediapolicy:{chat_id}`
- {self.flag_text(user_id, 'notices', group['delete_notifications'])} → `notices:{chat_id}`
- Проверить пример → `sample:{chat_id}`
- Сброс предупреждений → `reset:{chat_id}`
- Журнал → `log:{chat_id}`
- Назад / Главная → `group:{chat_id}`
- Правила для участников → `memberrules:{chat_id}`
- Права команд модерации → `commandrights:{chat_id}`
- Назад / Главная → `group:{chat_id}`
- Посмотреть тарифы → `ec:access:{chat_id}`
- Назад / Главная → `group:{chat_id}`
- {name} → `glang:{chat_id}:{code}`
- Назад / Главная → `group:{chat_id}`
- {row['name']} · {row['ttl']}s → `botset:{chat_id}:{row['id']}`
- Добавить → `botadd:{chat_id}`
- Назад / Главная → `group:{chat_id}`
- Изменить → `botedit:{chat_id}:{set_id}`
- {Вкл/Выкл} → `bottoggle:{chat_id}:{set_id}`
- Удаление команд: вкл / выкл → `botcommands:{chat_id}:{set_id}`
- Удалить → `botdelete:{chat_id}:{set_id}`
- Назад / Главная → `bots`
- Посмотреть → `rulespreview:{chat_id}`
- Изменить → `memberedit:{chat_id}`
- Кнопки → `rulesbuttons:{chat_id}`
- {self.t(user_id, 'caption_position_above' if group['rules_caption_above'] else 'caption_position_below')} → `captionposition:{chat_id}`
- Настройки правил под постами → `channel:{chat_id}`
- {self.flag_text(user_id, 'auto_rules', group['rules_auto'])} → `rulesauto:{chat_id}`
- Назад / Главная → `group:{chat_id}`
- Изменить → `rulesbuttonsedit:{chat_id}`
- Удалить → `rulesbuttonsclear:{chat_id}`
- Назад / Главная → `memberrules`
- {job['name']} → `job:{chat_id}:{job['id']}`
- Назад / Главная → `group:{chat_id}`
- {c['name'][:42]} → `aiconnection:{chat_id}:{c['id']}`
- Добавить → `aiproviders:{chat_id}`
- Назад / Главная → `jobs`
- {p['name']} → `aiprovider:{chat_id}:{code}`
- Назад / Главная → `aiconnections`
- Модель → `aimodels:{chat_id}:{connection_id}:0`
- Обновить список моделей → `airefresh:{chat_id}:{connection_id}`
- Заменить API-ключ → `aikey:{chat_id}:{connection_id}`
- Переименовать → `airename:{chat_id}:{connection_id}`
- {Вкл/Выкл} → `aitoggle:{chat_id}:{connection_id}`
- Удалить → `aidelete:{chat_id}:{connection_id}`
- Назад / Главная → `aiconnections`
- Изменить → `jobedit:{chat_id}:{job_id}`
- {Вкл/Выкл} → `jobtoggle:{chat_id}:{job_id}`
- Запустить сейчас → `jobrun:{chat_id}:{job_id}`
- Удалить → `jobdelete:{chat_id}:{job_id}`
- Назад / Главная → `jobs`
- Изменить → `edit:{chat_id}`
- Назад / Главная → `moderation`
- {self.t(user_id, key)} → `mode:{chat_id}:{code}`
- Назад / Главная → `moderation`
- Отозвать доступ у {user} → `revoke:{chat_id}:{uid}`
- Добавить управляющего → `grant:{chat_id}`
- Назад / Главная → `group:{chat_id}`
- Назад / Главная → `moderation`

### panel.private_input

Источник: `modbot/panel.py:956`

- Применить → `apply:{chat_id}:{nonce}`
- Назад / Главная → `moderation`
- Назад / Главная → `moderation`
- Назад / Главная → `group:{chat_id}`
- Назад / Главная → `group:{chat_id}`
- Назад / Главная → `group:{chat_id}`

### purchase_panel.purchase_contact

Источник: `modbot/purchase_panel.py:16`

- Написать владельцу → `tg://user?id={OWNER_ID}`

### purchase_panel.purchase_list

Источник: `modbot/purchase_panel.py:51`

- {title} → `pc:view:{row['id']}:{page}:{scope}`
- ← → `pc:list:{page - 1}:{scope}`
- → → `pc:list:{page + 1}:{scope}`
- {self.e(user, 'cancel_mine' if all_users else 'cancel_all')} → `pc:list:0:{0 if all_users else 1}`

### purchase_panel.purchase_view

Источник: `modbot/purchase_panel.py:74`

- Проверить возврат → `pc:go:{identifier}:{page}:{scope}`
- Отменить покупку → `pc:confirm:{identifier}:{page}:{scope}`
- Назад → `pc:list:{page}:{scope}`
- Главная → `home`

### purchase_panel.purchase_callback

Источник: `modbot/purchase_panel.py:99`

- Подтвердить → `pc:go:{identifier}:{page}:{scope}`
- Назад → `pc:view:{identifier}:{page}:{scope}`
- Назад → `pc:list:0:0`

### release_panel.show_history

Источник: `modbot/release_panel.py:28`

- {key} → `cl:{chat}:{key}:0`
- {all_changes} → `cl:{chat}:all:0`
- ← → `cl:{chat}:{version}:{page - 1}`
- → → `cl:{chat}:{version}:{page + 1}`
- {all_versions} → `cl:{chat}:index:0`

### service_panel.service_callback

Источник: `modbot/service_panel.py:37`

- Чат и модели → `aichat:{chat_id}`
- Задачи → `jobs:{chat_id}`
- AIChating+ → `ec:aisub:{chat_id}:ai_month`
- AIChating Pro → `ec:aisub:{chat_id}:ai_pro_month`
- Назад / Главная → `group:{chat_id}`
- Назад / Главная → `{'jobs' if mode == 'task' else 'chatsources'}`
- {m['name'] + (' · NEW' if m['new'] else '')} → `{'aitasknew' if mode == 'task' else 'imagesource' if mode == 'image' else 'chatsource'}:{chat_id}:{m['source']}`
- Назад / Главная → `{'jobs' if mode == 'task' else 'chatsources'}`
- DeepSeek Flash → `aitasknew:{chat_id}:flash`
- DeepSeek Pro → `aitasknew:{chat_id}:pro`
- Каталог → `modelcatalog:{chat_id}:task`
- Назад / Главная → `jobs`
- Выбрать ИИ → `chatsources:{chat_id}`
- Промпт ИИ → `chatprompt:{chat_id}`
- Настройки поведения ИИ → `aiprefs:{chat_id}`
- {self.flag_text(user_id, 'web_search', group['ai_chat_search'])} → `chatsearch:{chat_id}`
- {'Генерация изображений: ' + ('✅' if group['ai_images_enabled'] else '❌')} → `chatimages:{chat_id}`
- Модель для изображений → `modelcatalog:{chat_id}:image`
- Очистить контекст группы → `chathistory:{chat_id}`
- AIChating Pro → `ec:aisub:{chat_id}:ai_pro_month`
- {'AIChating+ • ' + self.e(user_id, 'shop')} → `ec:aisub:{chat_id}:ai_month`
- Доп. Лимиты за актив → `freeboost:{chat_id}:{benefit['boosts']}`
- Назад / Главная → `group:{chat_id}`
- {field[1] + ': ' + style_label(key, prefs[key])[:50]} → `aipref:{chat_id}:{key}`
- Назад / Главная → `aichat`
- Подтверждаю включение РП 18+ → `aipapprove:{chat_id}:roleplay:adult`
- Назад / Главная → `aiprefs`
- Назад / Главная → `aiprefs`
- {('✓ ' if v == value else '') + text} → `aipset:{chat_id}:{key}:{v}`
- Изменить список → `aiplist:{chat_id}:{key}`
- Очистить список → `aipclear:{chat_id}:{key}`
- Назад / Главная → `aiprefs`
- DeepSeek Flash → `chatsource:{chat_id}:flash`
- DeepSeek Pro → `chatsource:{chat_id}:pro`
- Каталог → `modelcatalog:{chat_id}:chat`
- Выключен → `chatsource:{chat_id}:off`
- Назад / Главная → `aichat`
- {display_money(amount) + ' ⚡'} → `ec:aisub:{chat_id}:ds_pack`
- Назад / Главная → `aimoderation`
- {self.e(user_id, 'ai_moderation_switch') + ': ' + self.e(user_id, 'enabled' if group['ai_moderation_enabled'] else 'off')} → `aimoderationtoggle:{chat_id}`
- Инструкции для модерации → `rules:{chat_id}`
- Изменить → `edit:{chat_id}`
- Режим ИИ Модерации → `modes:{chat_id}`
- NVIDIA NIM → `modprovider:{chat_id}:nim`
- DeepSeek → `modprovider:{chat_id}:ds`
- Действия по причинам → `reasonlist:{chat_id}:ai`
- Пакет DS-модерации → `dsshop:{chat_id}`
- Назад / Главная → `moderation`
- Режим ИИ Модерации → `modes:{chat_id}`
- {self.flag_text(user_id, 'spam', group['spam_enabled'])} → `spam:{chat_id}`
- {self.flag_text(user_id, 'flood', group['flood_enabled'])} → `flood:{chat_id}`
- {self.flag_text(user_id, 'delete_links', group['delete_links'])} → `linkfilter:{chat_id}`
- {self.flag_text(user_id, 'antimat', group['antimat'])} → `antimat:{chat_id}`
- Банворды → `banwords:{chat_id}`
- Действия по причинам → `reasonlist:{chat_id}:builtin`
- Назад / Главная → `moderation`
- {self.flag_text(user_id, 'receive_broadcasts', group['receive_broadcasts'])} → `mailingstoggle:{chat_id}`
- Назад / Главная → `group:{chat_id}`
- {self.flag_text(user_id, key, group[key])} → `rptoggle:{chat_id}:{key}`
- Назад / Главная → `group:{chat_id}`
- {self.flag_text(user_id, 'restore_admins', group['restore_admins'])} → `adminrestoretoggle:{chat_id}`
- Назад / Главная → `group:{chat_id}`
- Изменить → `banwordsedit:{chat_id}`
- Действия по причинам → `reasonview:{chat_id}:builtin:banword`
- Назад / Главная → `builtin`
- {self.flag_text(user_id, 'all_chat_admins', group['commands_admins'])} → `commandadmins:{chat_id}`
- Модераторы вручную → `commandusers:{chat_id}`
- Назад / Главная → `tools`
- {self.t(user_id, reason) + ' → ' + self.t(user_id, 'act_' + setting['action'])} → `reasonview:{chat_id}:builtin:{reason}`
- {(row['label'] or row['reason'])[:45] + ' → ' + self.t(user_id, 'act_' + row['action'])} → `reasonview:{chat_id}:ai:{row['rowid']}`
- Добавить → `reasonadd:{chat_id}`
- Назад / Главная → `{'aimoderation' if source == 'ai' else 'builtin'}`
- {category_name(choices[i], self.store.language(user_id))} → `reasonpick:{chat_id}:{i}`
- ← → `reasonadd:{chat_id}:{page - 1}`
- → → `reasonadd:{chat_id}:{page + 1}`
- Другая причина / остальные причины (*) → `reasoncustom:{chat_id}`
- Назад / Главная → `group:{chat_id}`
- {self.t(user_id, 'act_' + action)} → `reasonset:{chat_id}:{source}:{identifier}:{action}`
- Длительность наказания → `reasonseconds:{chat_id}:{source}:{identifier}`
- Сбросить действие → `reasondelete:{chat_id}:{source}:{identifier}`
- Назад → `reasonlist:{chat_id}:{source}`

### shop.show_shop

Источник: `modbot/shop.py:16`

- {self.e(user, 'shop_currency_' + asset)} → `ec:shopcurrency:{chat}:{asset}`

### shop.show_shop_currency

Источник: `modbot/shop.py:28`

- Купить ⚡ → `https://t.me/{self.bot_username}?start=topup_{chat}`
- Купить ⚡ → `ec:topup:0`
- Поддержать проект → `https://t.me/{self.bot_username}?start=donate_{chat}`
- Поддержать проект → `ec:donate:0`
- Доступ к боту → `ec:shopgroups:0:energy`
- Доступ к боту → `ec:access:{chat}`
- Telegram Premium · 3 месяца → `ec:premium:{chat}:energy`
- Автофермы → `ec:shopfarms:{chat}:energy:0`
- DeepSeek → `ec:aisub:{chat}:ai_month`
- GPT Luna → `ec:aisub:{chat}:gpt_month`
- DeepSeek · 1000 проверок модерации → `ec:aisub:{chat}:ds_pack`
- Telegram Premium · 3 месяца → `ec:premium:{chat}:coins`
- {group['title']} → `ec:shopcurrency:{group['id']}:coins`

### shop.show_access_tiers

Источник: `modbot/shop.py:77`

- {self.e(user, 'tier_' + tier)} → `ec:accessmode:{chat}:{tier}`
- Выдать доступ бесплатно → `og:tier:{chat}`

### shop.show_access_plans

Источник: `modbot/shop.py:86`

- {label + ' · ' + display_money(price) + ' ⚡'} → `ec:checkout:{chat}:{token}`

### shop.show_premium_checkout

Источник: `modbot/shop.py:102`

- Подтвердить → `ec:premiumpay:{chat}:{token}`

### shop.commerce_callback

Источник: `modbot/shop.py:136`

- {group['title']} → `ec:shopcurrency:{group['id']}:energy`
- Начать сразу → `ec:accessplans:{chat}:{tier}:now`
- После текущего доступа → `ec:accessplans:{chat}:{tier}:after`
- {'#' + row['token'][:8] + ' · ' + str(row['user_id'])} → `ec:premiumresolve:0:{row['token']}`
- Подтвердить: подарок выдан → `ec:premiumresolved:0:{token}:completed`
- Подтвердить: не выдан, вернуть резерв → `ec:premiumresolved:0:{token}:failed`

### social._social_command

Источник: `modbot/social.py:52`

- {et(language, 'accept')} → `duel:accept:{identifier}`
- {et(language, 'decline')} → `duel:decline:{identifier}`
- {et(language, 'cancel_invite')} → `duel:cancel:{identifier}`

### ux_wizard.wizard_show

Источник: `modbot/ux_wizard.py:26`

- {choice_label(self.store.language(user), label, code)} → `wf:{payload['choice_token']}:{i}`

### villages.show_village

Источник: `modbot/villages.py:38`

- Создать посёлок → `ec:vcreate:{chat}`
- Карта посёлка → `ec:vmap:{chat}`
- Перегенерировать карту → `ec:vregen:{chat}`
- Построить / улучшить → `ec:vbuild:{chat}`
- Создать посёлок → `ec:vcreate:{chat}`
- Кто может строить → `ec:vrights:{chat}`
- Постройки → `ec:vbuildings:{chat}:0`
- Подтвердить строительство → `ec:vapprove:{chat}:{job['id']}`
- Отменить строительство → `ec:vdecline:{chat}:{job['id']}`
- Восстановить задание deAPI → `ec:vrecover:{chat}`
- {self.e(user, 'village_bonuses').split(':', 1)[0]} → `ec:vbonuses:{chat}`
- ↻ → `ec:village:{chat}`

### villages.village_callback

Источник: `modbot/villages.py:94`

- Перегенерировать карту → `ec:vregengo:{chat}:{v['revision']}:{nonce}`
- Изменить описание → `ec:vregendesc:{chat}`
- Посёлок → `ec:village:{chat}`
- ← → `ec:vbuildings:{chat}:{page - 1}`
- → → `ec:vbuildings:{chat}:{page + 1}`
- {self.e(user, 'village_' + mode)} → `ec:vpolicy:{chat}:{mode}`

### villages.village_input

Источник: `modbot/villages.py:163`

- Посёлок → `ec:village:{chat}`
- Посёлок → `ec:village:{chat}`

