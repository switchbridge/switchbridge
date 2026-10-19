# Switchbridge REST & WebSocket API Reference

Данный документ содержит спецификацию всех API-эндпоинтов сервера Switchbridge (`packages/server`).

> **Важно для ИИ-агентов:** При добавлении, изменении или удалении любого эндпоинта или параметра этот файл должен обновляться немедленно и синхронно с кодом в `packages/server/src/index.ts`.

---

## 1. Общие сведения

- **Базовый URL:** `http://localhost:3000` (или хост сервера)
- **Формат данных:** `application/json`
- **Аутентификация:** Заголовок `Authorization: Bearer <token>` (если режим аутентификации отличен от `none`).
- **Стриминг в реальном времени:** WebSocket `ws://<host>:3000/ws/feed`

---

## 2. Системные и Setup-эндпоинты

### `GET /api/health`
Проверка состояния сервера, аптайма и статуса инициализации.

**Ответ (200 OK):**
```json
{
  "status": "ok",
  "service": "switchbridge-server",
  "version": "0.1.0",
  "uptime": 124.5,
  "initialized": true,
  "authMode": "oidc"
}
```

---

### `GET /api/setup/status`
Получение статуса первоначальной настройки системы (Setup Wizard).

**Ответ (200 OK):**
```json
{
  "initialized": false,
  "authMode": "builtin",
  "hasAdmin": true,
  "adminUsername": "admin",
  "oidc": null
}
```

---

### `POST /api/setup/oidc/test`
Проверка доступности OpenID Connect Discovery провайдера (Keycloak, Authentik и др.).

**Тело запроса:**
```json
{
  "issuerUrl": "http://localhost:8080/realms/master",
  "clientId": "switchbridge-client",
  "clientSecret": "optional_secret"
}
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "issuer": "http://localhost:8080/realms/master",
  "authorizationEndpoint": "http://localhost:8080/realms/master/protocol/openid-connect/auth",
  "tokenEndpoint": "http://localhost:8080/realms/master/protocol/openid-connect/token",
  "userinfoEndpoint": "http://localhost:8080/realms/master/protocol/openid-connect/userinfo",
  "jwksUri": "http://localhost:8080/realms/master/protocol/openid-connect/certs"
}
```

---

### `POST /api/setup/rbac`
Завершение настройки контроля доступа (RBAC/OIDC/None) через мастер настройки.

**Тело запроса (пример Builtin):**
```json
{
  "mode": "builtin",
  "admin": {
    "username": "admin",
    "password": "secure_password",
    "email": "admin@example.com"
  }
}
```

**Тело запроса (пример OIDC):**
```json
{
  "mode": "oidc",
  "oidc": {
    "issuerUrl": "http://localhost:8080/realms/master",
    "clientId": "switchbridge-client",
    "clientSecret": "secret",
    "roleMapping": {
      "enabled": true,
      "adminRoles": ["admin", "superadmin"],
      "operatorRoles": ["operator"],
      "defaultRole": "viewer",
      "claimsPath": "realm_access.roles"
    }
  }
}
```

---

### `POST /api/setup/reset`
Сброс флага инициализации системы (для тестирования или повторной настройки).

---

## 3. Аутентификация и пользователи

### `POST /api/auth/login`
Локальный вход пользователя по логину и паролю (для режима `builtin`).

**Тело запроса:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

### `GET /api/auth/oidc/url`
Генерация URL авторизации OIDC для перенаправления пользователя в IdP.

**Query-параметры:**
- `redirectUri` (обязательный) — URI возврата (фронтенд)

**Ответ (200 OK):**
```json
{
  "success": true,
  "url": "http://localhost:8080/realms/master/protocol/openid-connect/auth?client_id=...&response_type=code&...",
  "state": "uuid"
}
```

---

### `POST /api/auth/oidc/exchange`
Обмен полученного `code` авторизации OIDC на локальную сессию и JWT-токен Switchbridge.

**Тело запроса:**
```json
{
  "code": "spl_authorization_code",
  "redirectUri": "http://localhost:5173/auth/callback"
}
```

---

### `GET /api/auth/me`
Получение профиля текущего аутентифицированного пользователя по Bearer токену.

**Заголовок:** `Authorization: Bearer <jwt_token>`

**Ответ (200 OK):**
```json
{
  "authenticated": true,
  "authMode": "oidc",
  "user": {
    "id": "uuid",
    "username": "homelab_user",
    "email": "user@homelab.local",
    "role": "admin"
  }
}
```

---

### `POST /api/auth/logout`
Завершение сеанса пользователя.

---

## 4. Мониторинг, каналы и мосты

### `GET /api/bridges`
Список всех настроенных и активных мостов обмена сообщениями.

### `GET /api/channels`
Список подключенных каналов (Telegram, Discord, Slack, etc.).

### `GET /api/contacts`
Список объединенных профилей контактов.

### `GET /api/stats`
Сводные системные метрики.

**Ответ (200 OK):**
```json
{
  "bridgesCount": 2,
  "channelsCount": 4,
  "contactsCount": 150
}
```

---

## 5. WebSockets

### `WS /ws/feed`
Поток событий и сообщений в реальном времени.

**При подключении:**
```json
{
  "type": "connected",
  "time": "2026-10-19T16:30:00.000Z"
}
```
При возникновении событий в BridgeEngine через сокет транслируются входящие и исходящие пакеты сообщений.
