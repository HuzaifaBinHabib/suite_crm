
---

# SuiteCRM Bridge Stack

A modern, full-stack orchestration for **SuiteCRM** integration. This repository provides a seamless bridge between a legacy CRM environment and a modern web stack using **FastAPI** for data processing and **Next.js** for a reactive frontend.

## 🚀 Overview

This stack containerizes five core components to work in harmony:

* **SuiteCRM 8:** The core CRM engine (PHP/Apache).
* **FastAPI:** A high-performance Python bridge that syncs data between MariaDB and Postgres.
* **Next.js:** A modern React frontend for custom dashboards or client portals.
* **MariaDB:** Primary storage for SuiteCRM.
* **Postgres:** Optimized storage for analytics and FastAPI-driven tasks.

---

## 📂 Project Structure

```text
.
├── back_fastapi/           # Python backend (Business logic & Data Sync)
├── front_nextjs/my-app/    # Next.js frontend (UI/UX)
├── suit_crmdb/             # SuiteCRM custom Dockerfile/build context
├── oauth2-keys/            # OAuth2 private/public keys for API Auth
├── docker-compose.yml      # Master orchestration file
├── php-suitecrm.ini        # Custom PHP configurations
└── suitecrm.conf           # Apache VirtualHost configuration

```

---

## 🛠️ Getting Started

### 1. Prerequisites

* Docker & Docker Compose v2+
* OpenSSL (to generate API keys)

### 2. Security Setup (Required)

SuiteCRM requires OAuth2 keys for its API to function. Generate them in the `oauth2-keys/` directory:

```bash
openssl genrsa -out oauth2-keys/private.key 2048
openssl rsa -in oauth2-keys/private.key -pubout -out oauth2-keys/public.key
chmod 600 oauth2-keys/private.key

```

### 3. Configuration

**FastAPI Environment:** Create a `.env` file in `back_fastapi/` to override default database connections:

| Variable | Description | Default (Docker) |
| --- | --- | --- |
| `DB_HOST` | MariaDB Host | `mariadb` |
| `PG_HOST` | Postgres Host | `postgres` |
| `CRM_CLIENT_ID` | SuiteCRM API Client ID | `your-id` |

### 4. Deployment

Fire up the entire stack with a single command:

```bash
docker compose up --build -d

```

---

## 🔗 Service Endpoints

| Service | URL | Port |
| --- | --- | --- |
| **SuiteCRM UI** | `http://localhost:8080` | 8080 |
| **FastAPI Swagger** | `http://localhost:8000/docs` | 8000 |
| **Next.js App** | `http://localhost:3000` | 3000 |

---

## 💡 Architecture Notes

* **The Bridge Logic:** The FastAPI service acts as a middleware. It reads from the SuiteCRM MariaDB instance and can push/pull analytics data from Postgres, allowing for complex reporting without slowing down the CRM's primary DB.
* **Persistence:** All database data is stored in Docker volumes (defined in `docker-compose.yml`) to ensure data persists across container restarts.
* **Custom PHP Config:** The `php-suitecrm.ini` file is automatically mounted to handle file upload limits and memory settings required by SuiteCRM.

---

## 🤝 Contributing

1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes.
4. Push to the Branch.
5. Open a Pull Request.

---
