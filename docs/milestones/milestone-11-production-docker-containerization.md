# Milestone 11: Production Setup & Docker Containerization

Date: 2026-07-28

## 1. Development Summary

### What Was Built

This milestone introduced production setup infrastructure, multi-stage Dockerfiles for backend and frontend services, custom Nginx web server configuration, and a root `docker-compose.yml` orchestrating the entire full-stack application (PostgreSQL, Express API, Vite/Nginx frontend).

Implemented capabilities:

- **Backend Containerization (`backend/Dockerfile` & `backend/.dockerignore`)**:
  - Multi-stage Alpine build compiling TypeScript assets and generating the Prisma client.
  - Production runner stage stripping dev dependencies to produce lightweight container images (`NODE_ENV=production`).
- **Frontend Containerization (`frontend/Dockerfile`, `frontend/nginx.conf`, & `frontend/.dockerignore`)**:
  - Multi-stage build building production Vite bundles (`npm run build`).
  - Served via Nginx Alpine web server with SPA client-side fallback routing (`try_files $uri $uri/ /index.html`).
  - Configured Nginx reverse proxying for `/api/v1/` backend endpoints.
- **Root Docker Compose Orchestration (`docker-compose.yml`)**:
  - `postgres`: PostgreSQL 16 Alpine container with database health checks (`pg_isready`) and volume persistence (`postgres_data`).
  - `backend`: Express API service linked to PostgreSQL health checks (`condition: service_healthy`) and executing Prisma schema pushes automatically.
  - `frontend`: Nginx web server service listening on port 5173 (mapped to Nginx port 80).

### Why It Was Built

To ensure CampusConnect can be deployed consistently across cloud environments (AWS, GCP, DigitalOcean, Render, or Railway) without environment drift. Containerizing PostgreSQL, Express, and Vite allows developers and devops engineers to spin up the entire application stack with a single `docker compose up --build` command.

### What Problems It Solves

- Eliminates "works on my machine" issues across OS platforms (macOS, Linux, Windows).
- Automates database schema initialization and migrations upon container boot.
- Provides production-grade Nginx web serving with client-side SPA routing support.

### Technologies Used

- Docker & Docker Compose
- Multi-stage Node.js Alpine builds
- Nginx Alpine web server & Reverse Proxy
- PostgreSQL 16 Alpine

---

## 2. LeetCode Community Post

### Milestone 11: Production Docker Containerization for CampusConnect

Today I completed the eleventh milestone of CampusConnect by containerizing our Node.js/Express backend, React/Vite frontend, and PostgreSQL database into multi-stage Docker builds orchestrated via Docker Compose!

### What I Built Today

I added:

- `backend/Dockerfile`: Multi-stage build compiling TypeScript and preparing Prisma.
- `frontend/Dockerfile` & `nginx.conf`: Production Vite build served via Nginx with SPA routing and API reverse proxying.
- `docker-compose.yml`: Root orchestration for PostgreSQL 16, Express API, and Nginx Frontend.
- `.dockerignore` files for build context optimization.

### Technical Concepts Learned

- Structuring multi-stage Dockerfiles for minimal production image sizes.
- Configuring Nginx for Single Page Application (SPA) client-side routing (`try_files`).
- Setting up health-check dependencies in Docker Compose (`service_healthy`).

---

## 3. GitHub README Update

The README has been updated with:

- Milestone 11 status.
- Docker execution instructions (`docker compose up --build`).
- Updated progress checklist.
- Link to this milestone journal.

---

## 4. Git Commit Suggestions

Suggested Conventional Commit messages:

```text
feat: add multi-stage Dockerfile for Node.js Express backend
feat: add multi-stage Dockerfile and Nginx configuration for Vite frontend
feat: add docker-compose.yml orchestrating PostgreSQL, Express API, and Nginx
docs: document milestone 11 production docker containerization
docs: update README with Docker launch instructions and progress checklist
```

---

## 5. Resume Notes

ATS-friendly resume bullet points:

- Dockerized a full-stack web application using multi-stage Node.js and Nginx Alpine builds, authoring a Docker Compose orchestration topology for PostgreSQL, Express REST APIs, and React web apps.

---

## 6. Interview Preparation

### Why Use Multi-Stage Docker Builds?

Multi-stage builds separate the build environment (containing TypeScript compilers, devDependencies, build tools) from the final execution runtime. This drastically reduces image sizes (e.g. from 1GB+ down to <150MB) and improves container security by removing unnecessary dev tools from production images.
