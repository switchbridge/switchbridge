# @switchbridge/core

Ядро Switchbridge: маршрутизация, мостовой движок, единая модель сообщений и абстракции адаптеров.

## Назначение
- **Unified Message Model:** Единый формат сообщений для всех поддерживаемых платформ (Telegram, Discord, Slack, WhatsApp).
- **Bridge Engine (`BridgeEngine`):** Механизм кросс-платформенной синхронизации диалогов с защитой от циклов (echo loops).
- **Contact Types & Schemas:** Типизация объединенных профилей контактов и каналов.
- **Base Adapter (`BaseAdapter`):** Базовый абстрактный класс для разработки адаптеров мессенджеров.

## Сборка и тестирование
```bash
npm run build
npm test
```
