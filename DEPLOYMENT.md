# Enterprise Production Deployment & SRE Architecture Manual

Welcome to the production deployment guide for the **AI Business Assistant**. This document covers environment architecture, containerization, CI/CD pipelines, observability, disaster recovery, security hardening, and performance engineering.

---

## 1. Environment Architecture

The platform supports a 3-tier staging and production environment strategy:

| Environment | Host Domain | Purpose | Deployment Trigger |
| :--- | :--- | :--- | :--- |
| **Development** | `http://localhost:3000` | Local engineering & iteration | Manual / Hot-reloading |
| **Staging** | `https://staging-ai.yourcompany.com` | QA, E2E testing, security audits | Automatic on push to `staging` branch |
| **Production** | `https://ai.yourcompany.com` | High-availability customer traffic | Automatic on merge to `main` branch |

### Secret Management Architecture
- **Server-Side API Keys**: Secret keys such as `GEMINI_API_KEY` and `JWT_SECRET` are strictly loaded into memory on server start (`process.env`) and **never exposed to the browser client**.
- **Key Rotation**: AES-256-GCM encrypted key storage allows dynamic rotation of stored API keys without server downtime.

---

## 2. Containerization & Docker Execution

The application uses a **2-stage multi-stage Docker build** (`Dockerfile`) to produce a minimal, security-hardened runtime image.

### Building & Running locally with Docker
```bash
# 1. Build the multi-stage production image
docker build -t ai-business-assistant:latest .

# 2. Run container on port 3000
docker run -d \
  --name ai-assistant \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY="your-gemini-key" \
  ai-business-assistant:latest
```

### Stack Orchestration with Docker Compose
```bash
# Spin up production stack in detached mode
docker-compose up -d --build

# Inspect running container logs
docker-compose logs -f app

# Perform container healthcheck
docker inspect --format='{{json .State.Health}}' ai-business-assistant
```

---

## 3. CI/CD Pipeline & Automated Rollbacks

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automates software delivery:

1. **Stage 1 (Lint & Typecheck)**: Runs `tsc --noEmit` and code analysis.
2. **Stage 2 (Automated Testing)**: Executes unit and integration build verifications.
3. **Stage 3 (Security Scan)**: Scans node modules for high/critical vulnerabilities.
4. **Stage 4 (Container Build)**: Constructs immutable Docker images tagged by git SHA.
5. **Stage 5 (Deployment & Health Check)**: Deploys to Cloud Run / Kubernetes and queries `/api/health/deep`.
6. **Automatic Rollback**: If `/api/health/deep` returns non-200 within 60 seconds post-deploy, traffic automatically reverts to the previous revision tag.

---

## 4. Monitoring & Observability Architecture

### Live Health Check Endpoints
- **Liveness Probe**: `GET /api/health`
  - Returns `{"status":"ok","timestamp":"..."}` for Kubernetes liveness probes.
- **Deep Readiness Probe**: `GET /api/health/deep`
  - Verifies database disk access, Gemini AI connectivity, memory heap usage, and file storage read/write capabilities.
- **Prometheus Metrics**: `GET /api/metrics`
  - Exposes system metrics (CPU usage, Heap memory usage, active requests, status code counts, AI response latency histograms).

---

## 5. Centralized Logging & Audit Trails

All incoming HTTP traffic and internal system events are logged via structured JSON formatting to stdout and disk files (`data/security-audit.log`).

- **Log Levels**: `debug`, `info`, `warn`, `error`, `security`
- **Audit Logs**: Authentication failures, API key creation, role modification, and database backup events are recorded with client IP, user ID, and exact timestamp.

---

## 6. Disaster Recovery & Backup Architecture

### Automated Backup Engine
- **Schedule**: Cron-based automated backups run daily at 02:00 AM (`BACKUP_SCHEDULE_CRON`).
- **Retention**: Retains the 14 most recent atomic snapshots in `data/backups/`.
- **Manual Backups**: Triggered instantly via `POST /api/admin/backups/create`.
- **Restore Workflow**: Restore any snapshot via `POST /api/admin/backups/restore` with full audit trail creation.

---

## 7. Performance & Optimization

- **Gzip/Brotli Compression**: `compression()` middleware compresses responses > 1KB automatically.
- **CDN Caching Headers**: Static assets (`/assets/*`) serve with `Cache-Control: public, max-age=31536000, immutable`.
- **In-Memory Caching**: Frequently accessed workspace configurations, vector knowledge base indexes, and system settings are cached in memory.

---

## 8. Scalability & Background Job Queue

- **Stateless Application Tier**: Express server instances are stateless, allowing horizontal pod auto-scaling (HPA) from 1 to 50+ containers based on CPU/RAM thresholds.
- **Background Worker Queue**: Heavy tasks (embedding indexing, PDF processing, bulk data exports) are offloaded to an asynchronous in-memory/Redis-backed job queue processor (`/api/admin/queues`).

---

## 9. Security & Hardening Configuration

1. **Security Headers**:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `X-XSS-Protection: 1; mode=block`
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
   - `Referrer-Policy: strict-origin-when-cross-origin`
2. **SSRF Mitigation**: All outgoing URL fetching validates hostnames against private IP space (`127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
3. **Rate Limiting**: IP-based rate limiting (100 requests per 15 minutes default, strict 10 requests/min for auth endpoints).
