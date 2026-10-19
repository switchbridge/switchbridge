# @switchbridge/server

Бэкенд-сервис Switchbridge на Fastify, SQLite (Drizzle ORM) и WebSocket.

## Назначение
- **REST API:** Управление мостами, каналами, контактами, аутентификацией и системными настройками.
- **WebSocket:** Реалтайм-стрим событий (`/ws/feed`).
- **Аутентификация & RBAC:**
  - `none`: Открытый доступ (режим локальной сети/homelab).
  - `builtin`: Локальные пользователи (логин, хэши паролей bcrypt).
  - `oidc`: Интеграция с Keycloak, Authentik, Dex с маппингом ролей (admin, operator, viewer).
- **Мастер первоначальной настройки (Setup Wizard):** API для пошаговой инициализации системы при первом запуске.

## Спецификация API
Полная спецификация REST и WebSocket эндпоинтов описана в [`docs/api.md`](../../docs/api.md).

## Сборка и запуск
```bash
npm run build
npm run dev
```
