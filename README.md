# ⚡ Switchbridge

> **Open-source omnichannel messaging and bridge engine with deep n8n integration.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![CI](https://github.com/switchbridge/switchbridge/actions/workflows/ci.yml/badge.svg)](https://github.com/switchbridge/switchbridge/actions/workflows/ci.yml)
[![Organization](https://img.shields.io/badge/org-Switchbridge-orange.svg)](https://github.com/switchbridge)

---

## 🚀 The Vision

Building omnichannel bots and cross-platform synchronization natively in **n8n** quickly devolves into a tangle of Switch/IF nodes, state synchronization headaches, and rate-limiting issues.

**Switchbridge** solves this by acting as the heavy-lifting engine underneath:
- **🔄 Cross-Platform Chat Sync:** Sync conversations seamlessly across Discord, Telegram, Slack, and WhatsApp with automatic echo-loop protection.
- **👤 Unified Contacts:** Merge a user's Telegram ID, Discord handle, and phone into a single contact profile with tags and custom attributes.
- **🧩 Deep n8n Community Node:** Native visual nodes to trigger workflows on any incoming message or broadcast messages across segmented user lists.
- **🛡️ Rate-Limit & Queue Management:** Built-in queueing to respect API limits of each messenger platform.

---

## 🏗️ Architecture

```
                 ┌────────────────────────────────┐
                 │       n8n Visual Canvas        │
                 └───────────────▲────────────────┘
                                 │ Custom Node
   ┌─────────────────────────────▼─────────────────────────────┐
   │                    Switchbridge Core                      │
   │  ┌───────────────────┐  ┌──────────────┐  ┌────────────┐  │
   │  │ Unified Messages  │  │ Bridge Engine│  │ Contact DB │  │
   │  └───────────────────┘  └──────────────┘  └────────────┘  │
   └───────▲─────────────────────▲─────────────────────▲───────┘
           │                     │                     │
   ┌───────▼──────┐      ┌───────▼──────┐      ┌───────▼──────┐
   │   Telegram   │      │   Discord    │      │    Slack     │
   └──────────────┘      └──────────────┘      └──────────────┘
```

---

## 📦 Monorepo Structure & Documentation

- [`packages/core`](./packages/core): Unified data model, event routing, and bridge engine.
- [`packages/server`](./packages/server): Fastify backend, SQLite/Drizzle database, OIDC & auth management.
- [`packages/dashboard`](./packages/dashboard): React + Vite web dashboard and Setup Wizard.
- [`docker/`](./docker): Docker-compose infrastructure (PostgreSQL, Redis, Keycloak, n8n).
- [`docs/api.md`](./docs/api.md): REST & WebSocket API specification.
- [`AGENTS.md`](./AGENTS.md): Guidelines and workflow rules for AI agents.

---

## 🛠️ Quickstart (Homelab & Local)

### 1. Install dependencies
```bash
npm install
```

### 2. Build packages
```bash
npm run build
```

### 3. Run tests
```bash
npm test
```

### 4. Start local services (Docker)
```bash
docker compose -f docker/docker-compose.yml up -d
```

---

## 🗺️ Roadmap (Month 1)

- [x] **Week 1 (Foundations):** Monorepo setup, Unified Message Specification, Bridge Engine logic.
- [ ] **Week 2 (Adapters):** Telegram and Discord adapters with bi-directional bridging.
- [ ] **Week 3 (n8n Integration):** Custom n8n trigger and action nodes (`n8n-nodes-switchbridge`).
- [ ] **Week 4 (Packaging & Release):** Docker packaging, npm publishing, and public announcement.

---

## 📄 License

MIT © [Switchbridge](https://github.com/switchbridge)
