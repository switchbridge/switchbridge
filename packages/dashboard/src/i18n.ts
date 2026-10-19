export type Lang = 'ru' | 'en';

export const translations = {
  ru: {
    // Setup Wizard
    setupBadge: '⚡ МАСТЕР_НАЧАЛЬНОЙ_УСТАНОВКИ',
    setupTitle: 'УПРАВЛЕНИЕ_ДОСТУПОМ',
    setupDescription: 'ВЫБЕРИТЕ МОДЕЛЬ АУТЕНТИФИКАЦИИ И ПРАВ ДОСТУПА',

    // Options
    optionBuiltinTitle: 'ВСТРОЕННЫЙ_RBAC',
    optionNoneTitle: 'БЕЗ_АВТОРИЗАЦИИ (ОТКРЫТЫЙ_ДОСТУП)',
    optionOidcTitle: 'КОРПОРАТИВНЫЙ_SSO (OIDC)',

    badgeRecommended: 'РЕКОМЕНДУЕТСЯ',
    badgeZeroConfig: 'БЕЗ_ПАРОЛЕЙ',
    badgeEnterprise: 'ENTERPRISE',

    // Subform
    subformAdminTitle: '[ СОЗДАНИЕ_УЧЕТНОЙ_ЗАПИСИ_ROOT_ADMIN ]',
    adminUsernameLabel: 'ИМЯ_АДМИНИСТРАТОРА',
    adminUsernamePlaceholder: 'admin',
    adminEmailLabel: 'EMAIL_АДМИНИСТРАТОРА',
    adminEmailPlaceholder: 'admin@switchbridge.local',
    adminPasswordLabel: 'ПАРОЛЬ (ОТ 6 СИМВ.)',
    confirmPasswordLabel: 'ПОДТВЕРЖДЕНИЕ ПАРОЛЯ',
    passwordPlaceholder: '••••••••',

    subformOidcTitle: '[ НАСТРОЙКИ_ПРОВАЙДЕРА_OIDC ]',
    issuerUrlLabel: 'ISSUER_DISCOVERY_URL',
    clientIdLabel: 'CLIENT_ID',
    clientSecretLabel: 'CLIENT_SECRET (ОПЦИОНАЛЬНО)',
    oidcTestBtn: 'ПРОВЕРИТЬ СОЕДИНЕНИЕ',
    oidcTestingBtn: 'ПРОВЕРКА СЕТИ...',
    oidcTestSuccess: 'СОЕДИНЕНИЕ УСПЕШНО: Discovery получен, эндпоинты авторизации и токенов найдены',
    oidcTestFailed: 'ОШИБКА ПОДКЛЮЧЕНИЯ:',
    oidcPrefillDevBtn: '⚡ ЗАПОЛНИТЬ ДАННЫЕ DEV KEYCLOAK',
    oidcRedirectUriHint: 'REDIRECT URI (НАСТРОЕНО В КЛИЕНТЕ):',
    oidcCopyBtn: 'КОПИРОВАТЬ',
    oidcCopied: 'СКОПИРОВАНО!',

    // OIDC Role Mapping Canvas
    roleMappingTitle: '[ СОПОСТАВЛЕНИЕ_РОЛЕЙ_И_ПРАВ_OIDC ]',
    roleMappingDescription: 'Наглядное сопоставление групп из корпоративного Identity Provider с ролями и правами Switchbridge. Без скрытой автоматики — применяется строго то, что настроено в таблице.',
    roleMappingConfigureOption: '⚡ НАСТРОИТЬ СОПОСТАВЛЕНИЕ СЕЙЧАС',
    roleMappingSkipOption: 'ОТЛОЖИТЬ НАСТРОЙКУ (СДЕЛАТЬ ПОЗЖЕ В НАСТРОЙКАХ)',
    roleMappingSkippedInfo: '✓ ОТЛОЖЕНО: Вы сможете настроить сопоставление в любое удобное время в панели администратора. До этого момента действует выбранная политика по умолчанию.',
    discoveredRolesLabel: '⚡ НАЙДЕННЫЕ В OIDC РОЛИ И ГРУППЫ:',
    discoveredRolesHint: 'Нажмите на роль, чтобы быстро добавить правило сопоставления',
    roleMappingLeftHeader: 'ВНЕШНЯЯ РОЛЬ / ГРУППА OIDC (SSO)',
    roleMappingRightHeader: 'РОЛЬ И ПРАВА В SWITCHBRIDGE',
    roleMappingAddRuleBtn: '+ ДОБАВИТЬ ПРАВИЛО СОПОСТАВЛЕНИЯ',
    roleMappingOidcPlaceholder: 'Имя группы (напр. devops, admins, support)',
    roleAdminDesc: '👑 Полный доступ ко всей системе',
    roleOperatorDesc: '🛠️ Мосты, каналы, контакты',
    roleViewerDesc: '👁️ Только просмотр и мониторинг',
    roleMappingFallbackLabel: 'ДЕЙСТВИЕ ДЛЯ НЕОПОЗНАННЫХ ПОЛЬЗОВАТЕЛЕЙ (FALLBACK POLICY)',
    roleMappingFallbackDeny: '⛔ ЗАПРЕТИТЬ ВХОД (DENY ACCESS) — БЕЗОПАСНЫЙ РЕЖИМ',
    roleMappingFallbackViewer: '👁️ ГОСТЕВОЙ РЕЖИМ (VIEWER — ТОЛЬКО ЧТЕНИЕ)',
    roleMappingSyncNote: 'Синхронизация прав активна: при каждом входе через SSO роли пользователя сверяются с этой таблицей.',
    roleMappingNoRules: 'Таблица правил пуста. Добавьте первое сопоставление или выберите политику по умолчанию.',
    navSettings: 'НАСТРОЙКИ',
    settingsTitle: '[ НАСТРОЙКИ_ДОСТУПА_И_OIDC ]',
    settingsSaveBtn: 'СОХРАНИТЬ ПРАВИЛА СОПОСТАВЛЕНИЯ ►',
    settingsSaved: 'ПРАВИЛА УСПЕШНО СОХРАНЕНЫ!',

    submitSaving: 'СОХРАНЕНИЕ...',
    submitBtn: 'ПОДТВЕРДИТЬ ►',

    // Validation errors
    errEnterUsername: 'ПОЖАЛУЙСТА, УКАЖИТЕ ИМЯ АДМИНИСТРАТОРА',
    errEnterPassword: 'ПОЖАЛУЙСТА, ЗАДАЙТЕ ПАРОЛЬ АДМИНИСТРАТОРА',
    errPasswordLength: 'ПАРОЛЬ ДОЛЖЕН СОДЕРЖАТЬ МИНИМУМ 6 СИМВОЛОВ',
    errPasswordMismatch: 'ПАРОЛИ НЕ СОВПАДАЮТ',
    errOidcRequired: 'ПОЖАЛУЙСТА, УКАЖИТЕ ISSUER URL И CLIENT ID',
    errNetwork: 'ОШИБКА СЕТИ ИЛИ СЕРВЕРА',

    // Login Screen
    loginBadge: '⚡ АВТОРИЗАЦИЯ',
    loginTitle: 'ВХОД В СИСТЕМУ',
    loginDescription: 'Введите учетные данные для доступа к панели управления Switchbridge.',
    loginUsernameLabel: 'ИМЯ_ПОЛЬЗОВАТЕЛЯ',
    loginUsernamePlaceholder: 'admin',
    loginPasswordLabel: 'ПАРОЛЬ',
    loginPasswordPlaceholder: '••••••••',
    loginSubmitBtn: 'ВОЙТИ В СИСТЕМУ ►',
    loginSubmitting: 'ПРОВЕРКА...',
    loginErrRequired: 'ВВЕДИТЕ ЛОГИН И ПАРОЛЬ',
    loginErrFailed: 'НЕВЕРНЫЙ ЛОГИН ИЛИ ПАРОЛЬ',
    logoutBtn: 'ВЫХОД',

    // Login Screen OIDC SSO
    loginSsoBtn: '⚡ ВОЙТИ ЧЕРЕЗ SSO (KEYCLOAK / OIDC) ⚡',
    loginSsoRedirecting: 'ПЕРЕНАПРАВЛЕНИЕ В SSO...',
    loginSsoCallbackProcessing: 'АУТЕНТИФИКАЦИЯ ЧЕРЕЗ SSO...',
    loginLocalFallbackToggle: 'Резервный вход по локальному паролю',
    loginLocalFallbackHide: 'Скрыть локальный вход',

    // Intel modal
    intelModalTitle: '',
    intelCapabilities: '[ КЛЮЧЕВЫЕ_ВОЗМОЖНОСТИ ]',
    intelRecommendedCase: 'РЕКОМЕНДУЕМЫЙ СЦЕНАРИЙ:',
    intelCloseBtn: '[ЗАКРЫТЬ]',

    // Intel Data
    intel: {
      builtin: {
        title: 'ВСТРОЕННЫЙ ЛОКАЛЬНЫЙ RBAC',
        badge: 'РЕКОМЕНДУЕТСЯ (STANDALONE)',
        summary: 'Автономная система учетных записей и ролей, встроенная прямо в локальную базу данных (SQLite) без сторонних сервисов.',
        bullets: [
          'ADMIN: Полный доступ — создание и удаление мостов, каналов, API-токенов и пользователей.',
          'OPERATOR: Операторский доступ — мониторинг очередей, логов, привязка контактов и перезапуск зависших мостов.',
          'VIEWER: Аудит и наблюдение — только чтение дашборда, метрик и журналов сообщений.',
          'Надежное хеширование паролей алгоритмом scrypt (с солью) и поддержка сервисных API-ключей.',
        ],
        bestFor: 'Команды, продакшн-инсталляции и любые сценарии, где нужна надежная защита и разграничение прав.',
      },
      none: {
        title: 'БЕЗ АВТОРИЗАЦИИ (ОТКРЫТЫЙ ДОСТУП)',
        badge: 'ZERO_CONFIG',
        summary: 'Полное отключение проверки авторизации. Любой пользователь в сети сразу получает права администратора.',
        bullets: [
          'Система не запрашивает и не хранит логины и пароли.',
          'Максимально быстрый запуск за 0 секунд.',
          'Безопасно только если Switchbridge запущен на localhost, в закрытой VPN (Tailscale) или за внешним шлюзом (Cloudflare Access, Authelia, Traefik ForwardAuth).',
        ],
        bestFor: 'Локальная разработка, личные хоумлабы или когда авторизация уже вынесена на внешний Reverse Proxy.',
      },
      oidc: {
        title: 'КОРПОРАТИВНЫЙ SSO (OPENID CONNECT)',
        badge: 'ENTERPRISE IDENTITY',
        summary: 'Делегирование аутентификации во внешнюю корпоративную систему единого входа по протоколу OpenID Connect.',
        bullets: [
          'Поддерживает Keycloak, Authentik, Okta, Azure AD, Dex и Google Workspace.',
          'Пользователи логинятся через привычный корпоративный SSO-портал.',
          'Возможность централизованного назначения прав через группы и OIDC claims.',
        ],
        bestFor: 'Корпорации и компании с единой системой управления учетными записями.',
      },
      roleMapping: {
        title: 'СОПОСТАВЛЕНИЕ РОЛЕЙ И ПРАВ OIDC',
        badge: 'ZERO_HEURISTICS RBAC',
        summary: 'Наглядное сопоставление корпоративных групп и ролей Identity Provider с ролями и правами Switchbridge. Без скрытых эвристик — система строго применяет только заданные вами правила.',
        bullets: [
          'ADMIN: Полное управление системой — конфигурация мостов, каналов, ролей и токенов.',
          'OPERATOR: Операторский доступ — управление мостами, каналами, маршрутизацией и контактами.',
          'VIEWER: Аудит и наблюдение — режим только для чтения (дашборд, логи, метрики).',
          'Политика Fallback: выбор действия для ненайденных в таблице групп (запрет входа DENY или гостевой доступ VIEWER).',
          'Синхронизация при входе: права обновляются в реальном времени при каждом SSO-входе пользователя.',
        ],
        bestFor: 'Точный контроль доступа сотрудников компании в соответствии с их реальными группами в Keycloak, Authentik, Okta или Active Directory.',
      },
    },

    // Main Dashboard
    navOverview: 'ОБЗОР',
    navBridges: 'МОСТЫ',
    navChannels: 'КАНАЛЫ',
    navContacts: 'КОНТАКТЫ',
    navRerunSetup: 'НАСТРОЙКА СИСТЕМЫ',

    menuBtn: 'МЕНЮ',
    themeLabel: 'ТЕМА:',
    themeNight: '🌙 НОЧЬ',
    themeDay: '☀️ ДЕНЬ',
    langLabel: 'ЯЗЫК:',

    statBridges: 'АКТИВНЫЕ_МОСТЫ',
    statChannels: 'КАНАЛЫ',
    statContacts: 'КОНТАКТЫ',

    feedTitle: '[ ЖУРНАЛ_СОБЫТИЙ_СИСТЕМЫ ]',
    bridgesTitle: '[ НАСТРОЕННЫЕ_МОСТЫ_СВЯЗИ ]',

    colBridgeId: 'ID_МОСТА',
    colPlatforms: 'ПЛАТФОРМЫ',
    colEndpoints: 'ЭНДПОИНТЫ',
    colStatus: 'СТАТУС',
    statusOnline: 'ОНЛАЙН',
  },
  en: {
    // Setup Wizard
    setupBadge: '⚡ INITIAL_SETUP_WIZARD',
    setupTitle: 'ACCESS_CONTROL',
    setupDescription: 'SELECT AUTHENTICATION & PERMISSION MODEL',

    // Options
    optionBuiltinTitle: 'BUILTIN_LOCAL_RBAC',
    optionNoneTitle: 'NO_AUTHENTICATION (OPEN_LAN)',
    optionOidcTitle: 'ENTERPRISE_SSO (OIDC)',

    badgeRecommended: 'RECOMMENDED',
    badgeZeroConfig: 'ZERO_CONFIG',
    badgeEnterprise: 'ENTERPRISE',

    // Subform
    subformAdminTitle: '[ CONFIGURE_ROOT_ADMIN_ACCOUNT ]',
    adminUsernameLabel: 'ADMIN_USERNAME',
    adminUsernamePlaceholder: 'admin',
    adminEmailLabel: 'ADMIN_EMAIL',
    adminEmailPlaceholder: 'admin@switchbridge.local',
    adminPasswordLabel: 'PASSWORD (MIN 6 CHARS)',
    confirmPasswordLabel: 'CONFIRM PASSWORD',
    passwordPlaceholder: '••••••••',

    subformOidcTitle: '[ OIDC_PROVIDER_SETTINGS ]',
    issuerUrlLabel: 'ISSUER_DISCOVERY_URL',
    clientIdLabel: 'CLIENT_ID',
    clientSecretLabel: 'CLIENT_SECRET (OPTIONAL)',
    oidcTestBtn: 'TEST CONNECTION',
    oidcTestingBtn: 'CHECKING NETWORK...',
    oidcTestSuccess: 'CONNECTION OK: Discovery loaded, auth and token endpoints confirmed',
    oidcTestFailed: 'CONNECTION FAILED:',
    oidcPrefillDevBtn: '⚡ PREFILL DEV KEYCLOAK',
    oidcRedirectUriHint: 'REDIRECT URI (CONFIGURED IN CLIENT):',
    oidcCopyBtn: 'COPY',
    oidcCopied: 'COPIED!',

    // OIDC Role Mapping Canvas
    roleMappingTitle: '[ OIDC_ROLE_AND_RIGHTS_MAPPING ]',
    roleMappingDescription: 'Direct visual mapping of corporate Identity Provider groups to Switchbridge roles and rights. Zero hidden heuristics — strictly enforces what you configure.',
    roleMappingConfigureOption: '⚡ CONFIGURE MAPPING NOW',
    roleMappingSkipOption: 'CONFIGURE LATER IN SETTINGS',
    roleMappingSkippedInfo: '✓ DEFERRED: You can configure role mapping anytime from the administration dashboard. Until then, the selected default policy applies.',
    discoveredRolesLabel: '⚡ DISCOVERED ROLES IN YOUR OIDC:',
    discoveredRolesHint: 'Click a role to quickly add a mapping rule',
    roleMappingLeftHeader: 'EXTERNAL OIDC ROLE / GROUP',
    roleMappingRightHeader: 'SWITCHBRIDGE ROLE & RIGHTS',
    roleMappingAddRuleBtn: '+ ADD MAPPING RULE',
    roleMappingOidcPlaceholder: 'Group name (e.g. devops, admins, support)',
    roleAdminDesc: '👑 Full administrative control',
    roleOperatorDesc: '🛠️ Bridges, channels, contacts',
    roleViewerDesc: '👁️ Read-only monitoring',
    roleMappingFallbackLabel: 'UNMAPPED USERS POLICY (FALLBACK)',
    roleMappingFallbackDeny: '⛔ DENY ACCESS (RECOMMENDED)',
    roleMappingFallbackViewer: '👁️ GUEST (VIEWER — READ-ONLY)',
    roleMappingSyncNote: 'Active role sync: on every login, user privileges are strictly evaluated against this table.',
    roleMappingNoRules: 'No mapping rules defined yet. Add your first rule or select a default fallback policy.',
    navSettings: 'SETTINGS',
    settingsTitle: '[ ACCESS_CONTROL_AND_OIDC_SETTINGS ]',
    settingsSaveBtn: 'SAVE MAPPING RULES ►',
    settingsSaved: 'MAPPING RULES SAVED SUCCESSFULLY!',

    submitSaving: 'SAVING...',
    submitBtn: 'CONFIRM ►',

    // Validation errors
    errEnterUsername: 'PLEASE ENTER ADMIN USERNAME',
    errEnterPassword: 'PLEASE ENTER ADMIN PASSWORD',
    errPasswordLength: 'PASSWORD MUST BE AT LEAST 6 CHARACTERS',
    errPasswordMismatch: 'PASSWORDS DO NOT MATCH',
    errOidcRequired: 'PLEASE ENTER OIDC ISSUER URL AND CLIENT ID',
    errNetwork: 'NETWORK OR SERVER ERROR OCCURRED',

    // Login Screen
    loginBadge: '⚡ AUTHENTICATION',
    loginTitle: 'SYSTEM LOGIN',
    loginDescription: 'Enter your credentials to access the Switchbridge dashboard.',
    loginUsernameLabel: 'USERNAME',
    loginUsernamePlaceholder: 'admin',
    loginPasswordLabel: 'PASSWORD',
    loginPasswordPlaceholder: '••••••••',
    loginSubmitBtn: 'AUTHENTICATE ►',
    loginSubmitting: 'VERIFYING...',
    loginErrRequired: 'ENTER USERNAME AND PASSWORD',
    loginErrFailed: 'INVALID USERNAME OR PASSWORD',
    logoutBtn: 'LOGOUT',

    // Login Screen OIDC SSO
    loginSsoBtn: '⚡ LOGIN WITH SSO (KEYCLOAK / OIDC) ⚡',
    loginSsoRedirecting: 'REDIRECTING TO SSO...',
    loginSsoCallbackProcessing: 'AUTHENTICATING VIA SSO...',
    loginLocalFallbackToggle: 'Fallback login with local credentials',
    loginLocalFallbackHide: 'Hide local login',

    // Intel modal
    intelModalTitle: '',
    intelCapabilities: '[ KEY_CAPABILITIES ]',
    intelRecommendedCase: 'RECOMMENDED USE CASE:',
    intelCloseBtn: '[CLOSE]',

    // Intel Data
    intel: {
      builtin: {
        title: 'BUILTIN LOCAL RBAC',
        badge: 'RECOMMENDED (STANDALONE)',
        summary: 'Standalone user and permission management stored directly in local database (SQLite) without external services.',
        bullets: [
          'ADMIN: Full control — create and delete bridges, channels, API tokens, and users.',
          'OPERATOR: Operational access — inspect queues, logs, link contacts, and restart bridges.',
          'VIEWER: Audit and monitoring — read-only access to dashboard, metrics, and message logs.',
          'Secure scrypt password hashing (salted) + automated API keys support.',
        ],
        bestFor: 'Teams, production deployments, and setups requiring granular role separation.',
      },
      none: {
        title: 'NO AUTHENTICATION (OPEN ACCESS)',
        badge: 'ZERO_CONFIG',
        summary: 'Completely disables authorization checks. Anyone on the network gets immediate admin access.',
        bullets: [
          'The system does not request or store logins and passwords.',
          'Zero-second instant bootstrap.',
          'Only safe if Switchbridge runs on localhost, private VPN (Tailscale), or behind an edge gateway (Cloudflare Access, Authelia).',
        ],
        bestFor: 'Local development, homelabs, or when auth is handled by an external Reverse Proxy.',
      },
      oidc: {
        title: 'ENTERPRISE SSO (OPENID CONNECT)',
        badge: 'ENTERPRISE IDENTITY',
        summary: 'Delegates authentication to an external enterprise identity provider via OpenID Connect protocol.',
        bullets: [
          'Supports Keycloak, Authentik, Okta, Azure AD, Dex, and Google Workspace.',
          'Users log in through their corporate Single Sign-On portal.',
          'Centralized role mapping via OIDC claims and groups.',
        ],
        bestFor: 'Enterprises and organizations with centralized identity management.',
      },
      roleMapping: {
        title: 'OIDC ROLE & RIGHTS MAPPING',
        badge: 'ZERO_HEURISTICS RBAC',
        summary: 'Direct visual mapping of corporate Identity Provider groups to Switchbridge roles and rights. Zero hidden heuristics — strictly enforces what you configure.',
        bullets: [
          'ADMIN: Full system control — manage bridges, channels, roles, and tokens.',
          'OPERATOR: Operational access — manage bridges, channels, routing, and contacts.',
          'VIEWER: Audit and monitoring — read-only dashboard, event feed, and metrics.',
          'Fallback Policy: configurable behavior for unmapped groups (DENY access or VIEWER guest).',
          'Active Login Sync: user privileges are strictly re-evaluated against this table on every SSO login.',
        ],
        bestFor: 'Strict access control aligned with corporate groups in Keycloak, Authentik, Okta, or Active Directory.',
      },
    },

    // Main Dashboard
    navOverview: 'OVERVIEW',
    navBridges: 'BRIDGES',
    navChannels: 'CHANNELS',
    navContacts: 'CONTACTS',
    navRerunSetup: 'RE-RUN SETUP',

    menuBtn: 'MENU',
    themeLabel: 'THEME:',
    themeNight: '🌙 NIGHT',
    themeDay: '☀️ DAY',
    langLabel: 'LANG:',

    statBridges: 'ACTIVE_BRIDGES',
    statChannels: 'CHANNELS',
    statContacts: 'CONTACTS',

    feedTitle: '[ EVENT_FEED_STREAM ]',
    bridgesTitle: '[ CONFIGURED_BRIDGE_LINKS ]',

    colBridgeId: 'BRIDGE_ID',
    colPlatforms: 'PLATFORMS',
    colEndpoints: 'ENDPOINTS',
    colStatus: 'STATUS',
    statusOnline: 'ONLINE',
  },
};
