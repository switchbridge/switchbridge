# Docker Environment for Switchbridge

Инфраструктурные манифесты для локального запуска и homelab-развёртывания.

## Состав окружения
- **PostgreSQL:** Основное хранилище (для постоянных данных и очередей).
- **Redis:** Брокер очередей сообщений и кэширование сессий.
- **n8n:** Платформа автоматизации рабочих процессов с кастомной интеграцией Switchbridge.
- **Keycloak (`docker/keycloak`):** Сервер идентификации (OIDC Identity Provider) для аутентификации и RBAC.

## Запуск

### Стандартный запуск сервисов:
```bash
docker compose -f docker/docker-compose.yml up -d
```

### Dev-окружение (с Keycloak):
```bash
docker compose -f docker/docker-compose.dev.yml up -d
```
