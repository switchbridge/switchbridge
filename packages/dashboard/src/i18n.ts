export type Lang = 'ru' | 'en';

export const translations = {
  ru: {
    // Setup Wizard
    setupBadge: '⚡ МАСТЕР_НАЧАЛЬНОЙ_УСТАНОВКИ // ШАГ 01/03',
    setupTitle: '/// УПРАВЛЕНИЕ_ДОСТУПОМ_И_RBAC_',
    setupDescription: 'ВЫБЕРИТЕ МОДЕЛЬ АУТЕНТИФИКАЦИИ И ПРАВ ДОСТУПА ДЛЯ ЭТОГО УЗЛА SWITCHBRIDGE:',
    
    // Options
    optionBuiltinTitle: '01 // ВСТРОЕННЫЙ_RBAC',
    optionNoneTitle: '02 // БЕЗ_АВТОРИЗАЦИИ (ОТКРЫТЫЙ_ДОСТУП)',
    optionOidcTitle: '03 // КОРПОРАТИВНЫЙ_SSO (OIDC)',

    badgeRecommended: 'РЕКОМЕНДУЕТСЯ',
    badgeZeroConfig: 'БЕЗ_ПАРОЛЕЙ',
    badgeEnterprise: 'ENTERPRISE',

    // Subform
    subformAdminTitle: '[ СОЗДАНИЕ_УЧЕТНОЙ_ЗАПИСИ_ROOT_ADMIN ]',
    adminUsernameLabel: 'ИМЯ_АДМИНИСТРАТОРА',
    adminEmailLabel: 'EMAIL_АДМИНИСТРАТОРА',
    adminPasswordLabel: 'ПАРОЛЬ_АДМИНИСТРАТОРА (ОТ 6 СИМВОЛОВ)',
    confirmPasswordLabel: 'ПОДТВЕРЖДЕНИЕ_ПАРОЛЯ',
    passwordPlaceholder: '••••••••',

    subformOidcTitle: '[ НАСТРОЙКИ_ПРОВАЙДЕРА_OIDC ]',
    issuerUrlLabel: 'ISSUER_DISCOVERY_URL',
    clientIdLabel: 'CLIENT_ID',
    clientSecretLabel: 'CLIENT_SECRET (ОПЦИОНАЛЬНО)',

    submitSaving: 'СОХРАНЕНИЕ...',
    submitBtn: 'ПОДТВЕРДИТЬ ►',

    // Validation errors
    errEnterUsername: 'ПОЖАЛУЙСТА, УКАЖИТЕ ИМЯ АДМИНИСТРАТОРА',
    errEnterPassword: 'ПОЖАЛУЙСТА, ЗАДАЙТЕ ПАРОЛЬ АДМИНИСТРАТОРА',
    errPasswordLength: 'ПАРОЛЬ ДОЛЖЕН СОДЕРЖАТЬ МИНИМУМ 6 СИМВОЛОВ',
    errPasswordMismatch: 'ПАРОЛИ НЕ СОВПАДАЮТ',
    errOidcRequired: 'ПОЖАЛУЙСТА, УКАЖИТЕ ISSUER URL И CLIENT ID',
    errNetwork: 'ОШИБКА СЕТИ ИЛИ СЕРВЕРА',

    // Intel modal
    intelModalTitle: 'ИНФОРМАЦИОННАЯ_СПРАВКА //',
    intelCapabilities: '[ КЛЮЧЕВЫЕ_ВОЗМОЖНОСТИ ]',
    intelRecommendedCase: 'РЕКОМЕНДУЕМЫЙ СЦЕНАРИЙ:',
    intelCloseBtn: 'ПОНЯТНО [ЗАКРЫТЬ]',

    // Intel Data
    intel: {
      builtin: {
        title: '01 // ВСТРОЕННЫЙ ЛОКАЛЬНЫЙ RBAC',
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
        title: '02 // БЕЗ АВТОРИЗАЦИИ (ОТКРЫТЫЙ ДОСТУП)',
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
        title: '03 // КОРПОРАТИВНЫЙ SSO (OPENID CONNECT)',
        badge: 'ENTERPRISE IDENTITY',
        summary: 'Делегирование аутентификации во внешнюю корпоративную систему единого входа по протоколу OpenID Connect.',
        bullets: [
          'Поддерживает Keycloak, Authentik, Okta, Azure AD, Dex и Google Workspace.',
          'Пользователи логинятся через привычный корпоративный SSO-портал.',
          'Возможность централизованного назначения прав через группы и OIDC claims.',
        ],
        bestFor: 'Корпорации и компании с единой системой управления учетными записями.',
      },
    },

    // Main Dashboard
    navOverview: '01 // ОБЗОР',
    navBridges: '02 // МОСТЫ',
    navChannels: '03 // КАНАЛЫ',
    navContacts: '04 // КОНТАКТЫ',
    navRerunSetup: '⚙ // НАСТРОЙКА СИСТЕМЫ',

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
    setupBadge: '⚡ INITIAL_SETUP_WIZARD // STEP 01/03',
    setupTitle: '/// ACCESS_CONTROL_&_RBAC_',
    setupDescription: 'SELECT AUTHENTICATION & PERMISSION MODEL FOR THIS SWITCHBRIDGE NODE:',
    
    // Options
    optionBuiltinTitle: '01 // BUILTIN_LOCAL_RBAC',
    optionNoneTitle: '02 // NO_AUTHENTICATION (OPEN_LAN)',
    optionOidcTitle: '03 // ENTERPRISE_SSO (OIDC)',

    badgeRecommended: 'RECOMMENDED',
    badgeZeroConfig: 'ZERO_CONFIG',
    badgeEnterprise: 'ENTERPRISE',

    // Subform
    subformAdminTitle: '[ CONFIGURE_ROOT_ADMIN_ACCOUNT ]',
    adminUsernameLabel: 'ADMIN_USERNAME',
    adminEmailLabel: 'ADMIN_EMAIL',
    adminPasswordLabel: 'ADMIN_PASSWORD (MIN 6 CHARS)',
    confirmPasswordLabel: 'CONFIRM_PASSWORD',
    passwordPlaceholder: '••••••••',

    subformOidcTitle: '[ OIDC_PROVIDER_SETTINGS ]',
    issuerUrlLabel: 'ISSUER_DISCOVERY_URL',
    clientIdLabel: 'CLIENT_ID',
    clientSecretLabel: 'CLIENT_SECRET (OPTIONAL)',

    submitSaving: 'SAVING...',
    submitBtn: 'CONFIRM ►',

    // Validation errors
    errEnterUsername: 'PLEASE ENTER ADMIN USERNAME',
    errEnterPassword: 'PLEASE ENTER ADMIN PASSWORD',
    errPasswordLength: 'PASSWORD MUST BE AT LEAST 6 CHARACTERS',
    errPasswordMismatch: 'PASSWORDS DO NOT MATCH',
    errOidcRequired: 'PLEASE ENTER OIDC ISSUER URL AND CLIENT ID',
    errNetwork: 'NETWORK OR SERVER ERROR OCCURRED',

    // Intel modal
    intelModalTitle: 'INTEL_BRIEFING //',
    intelCapabilities: '[ KEY_CAPABILITIES ]',
    intelRecommendedCase: 'RECOMMENDED USE CASE:',
    intelCloseBtn: 'GOT_IT [CLOSE]',

    // Intel Data
    intel: {
      builtin: {
        title: '01 // BUILTIN LOCAL RBAC',
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
        title: '02 // NO AUTHENTICATION (OPEN ACCESS)',
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
        title: '03 // ENTERPRISE SSO (OPENID CONNECT)',
        badge: 'ENTERPRISE IDENTITY',
        summary: 'Delegates authentication to an external enterprise identity provider via OpenID Connect protocol.',
        bullets: [
          'Supports Keycloak, Authentik, Okta, Azure AD, Dex, and Google Workspace.',
          'Users log in through their corporate Single Sign-On portal.',
          'Centralized role mapping via OIDC claims and groups.',
        ],
        bestFor: 'Enterprises and organizations with centralized identity management.',
      },
    },

    // Main Dashboard
    navOverview: '01 // OVERVIEW',
    navBridges: '02 // BRIDGES',
    navChannels: '03 // CHANNELS',
    navContacts: '04 // CONTACTS',
    navRerunSetup: '⚙ // RE-RUN SETUP',

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
