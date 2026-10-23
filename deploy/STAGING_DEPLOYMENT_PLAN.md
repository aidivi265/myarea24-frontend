# MyArea24 — Staging Deployment Plan & Preflight Verification Report

**Target Environment:** Staging (`staging.myarea24.in`)  
**Audit Date:** October 24, 2026  
**Auditor Role:** Senior Full-Stack, QA Automation, DevOps & Application Security Specialist  
**Current Decision:** **READY FOR STAGING (Preflight Validated; Deployment Blocked Pending Host Prerequisites)**

---

## 1. Executive Summary & Architecture Overview

MyArea24 is a hyperlocal intelligence and commerce platform with an architecture comprising:
1. **Frontend:** React 18 + TypeScript + Vite Single-Page Application (SPA) with Tailwind CSS, Lucide icons, and Leaflet/MapLibre mapping.
2. **Backend:** FastAPI (Python 3.11/3.14) with Uvicorn, SQLAlchemy ORM, and WebSocket real-time event broadcasting (`/api/v1/ws`).
3. **Database Layer:** Dual-dialect architecture:
   - **Local Development:** SQLite 3.40+ with Write-Ahead Logging (`WAL`), `PRAGMA foreign_keys = ON`, `busy_timeout = 10000ms`, and 64MB cache.
   - **Staging & Production:** PostgreSQL 16 + PostGIS extension with SQLAlchemy `QueuePool` connection pooling (`pool_size=15`, `max_overflow=25`, `pool_recycle=1800s`, `pool_pre_ping=True`).
4. **Staging Gateway:** Nginx reverse proxy serving pre-rendered Vite production bundles (`dist/`), enforcing TLS 1.2/1.3, HSTS, CSP, and proxying REST requests (`/api/`) and WebSockets (`/api/v1/ws`) with upstream keepalive and upgrade headers.

---

## 2. Independent Test & Verification Execution Results

All verification suites were run against the live codebase:

| Test Suite / Build Step | Exact Command | Exit Code | Verified Evidence / Output |
| :--- | :--- | :---: | :--- |
| **Backend Unit & Regression Suite** | `python -m pytest backend/tests` | **0** | **39 passed, 0 failed, 1 warning** in 12.52s (`test_auth_security`, `test_database_migration`, `test_health_and_system`, `test_merchant_auth`, `test_orders_and_payments`, `test_security_regression`). |
| **Database Migration & Backup Suite** | `python -m pytest backend/tests/test_database_migration.py` | **0** | **4 passed, 0 failed** in 6.58s (verifies backup tool, SHA-256 integrity check, collision guard, `--clean` rerun-safety, and `--rollback`). |
| **Frontend TypeScript Type Check** | `.\node_modules\.bin\tsc --noEmit` | **0** | **0 compilation errors**; clean type checking across entire client tree. |
| **Production Bundle Compilation** | `npm run build` | **0** | **1,673 modules bundled** in 37.82s into `dist/` with optimized chunk splitting and GZip compression (`dist/index.html` 4.42 kB, `merchant-portal` 462 kB, `vendor-react` 180 kB). |
| **Automated Headless Browser E2E** | `node e2e_browser_test.js` | **0** | **7 of 7 journeys passed** (Homepage Discovery, Signup/OTP Authentication, Order Placement, Service Booking, Payment Underpayment Guard, Order Dashboard & Cancellation, Unauthorized Access & Guest Shield). |
| **Docker Compose Config Validation** | `docker compose -f deploy/docker-compose.staging.yml config` | **0** | **Syntax Validated** across all 4 services (`postgres_staging`, `backend_staging`, `nginx_staging`, `certbot_staging`). |

---

## 3. Database Migration & Point-in-Time Backup Tooling

To guarantee zero data loss and enable safe staging initialization without endangering local or production data, two dedicated utilities were authored and tested:

### 3.1 Point-in-Time Backup Utility (`scripts/backup_database.py`)
- Uses the **SQLite Online Backup API** (`source_conn.backup(backup_conn)`) to perform a consistent WAL snapshot without interrupting active readers or writers.
- Automatically executes `PRAGMA integrity_check` on the resulting snapshot.
- Calculates and verifies cryptographic **SHA-256 checksums**.
- Exports a complete table-by-table row count manifest in JSON (`backups/manifest_YYYYMMDD_HHMMSS.json`).
- **Verified Run Result:**
  ```text
  [*] Connecting to source database: myarea24.db
  [*] Running source integrity check...
      -> Source database integrity: OK
      -> Source contains 26 tables, 22,636 live records.
  [*] Creating atomic snapshot: backups\myarea24_backup_20261023_155900.db...
  [*] Verifying backup database integrity...
      -> Backup integrity check: OK
      -> Backup SHA-256: a25b8f68b9c7e203bf1f9eb6d446a01b52bb66efdf652464ab22fee9925c5c89
      -> Backup File Size: 15.16 MB
  [+] Audit manifest written: backups\manifest_20261023_155900.json
  [+] Backup complete: backups\myarea24_backup_20261023_155900.db (22,636 rows preserved)
  ```

### 3.2 Safe SQLite to PostgreSQL Migration Engine (`scripts/migrate_sqlite_to_postgres.py`)
- **Non-destructive:** Opens source SQLite in URI read-only mode (`?mode=ro`).
- **Pre-flight Collision Guard:** If target tables contain existing data and `--clean` is omitted, aborts with a clear message to prevent primary key collisions.
- **Rerun-Safe & Idempotent (`--clean`):** Safely truncates target tables in reverse foreign-key dependency order before reloading data.
- **Rollback Mode (`--rollback`):** Resets all target tables in reverse dependency order, leaving an empty, initialized schema.
- **Dependency-ordered Data Load:** Transfers tables in strict topological order (`users` -> `data_sources` -> `businesses` -> `products` -> `orders` -> `order_items` -> `service_bookings` -> `otp_tokens`).
- **Data Type Normalization:** Maps SQLite 0/1 integers to Postgres Booleans, converts empty strings to NULL for typed columns, parses ISO/SQL timestamps, and serializes JSON dictionaries.
- **Sequence Alignment:** Resets PostgreSQL serial sequences (`pg_get_serial_sequence`) to match `COALESCE(MAX(id), 1)`.
- **Parity Assertion:** Audits target database record counts against source record counts; raises hard exceptions on any discrepancy.

---

## 4. Staging Infrastructure & Deployment Manifests

The staging infrastructure is packaged in `deploy/`:

```
deploy/
├── docker-compose.staging.yml   # Multi-container orchestration (PostGIS, FastAPI, Nginx, Certbot)
└── nginx/
    ├── staging.conf             # Hardened reverse-proxy & SSL termination config
    └── staging_http.conf        # Alternative HTTP-only / Edge SSL (Cloudflare / AWS ALB) config
```

### 4.1 Staging Compose Architecture (`deploy/docker-compose.staging.yml`)
- **`postgres_staging`:** `postgis/postgis:16-3.4-alpine` container with internal healthcheck (`pg_isready`), isolated on `staging_net` bridge network, storing data in volume `staging_postgres_data`.
  - Bound to `127.0.0.1:5432:5432` (host loopback only, never exposed to public internet).
- **`backend_staging`:** Builds `backend/Dockerfile` (Python 3.11-slim with pre-warmed dependencies), depends on `postgres_staging` healthy condition, and monitors health via `curl -f http://localhost:8000/health`.
  - Supports optional external `DATABASE_URL` override if connected to managed cloud database.
- **`nginx_staging`:** Lightweight Alpine container mounting `dist/` and `deploy/nginx/staging.conf`, exposing 80 and 443 with automated Let's Encrypt certificates.
- **`certbot_staging`:** Automated certificate renewal service sharing `staging_certbot_www` and `staging_certbot_certs` volumes.

### 4.2 Nginx Gateway Hardening (`deploy/nginx/staging.conf`)
- **HTTP -> HTTPS Redirection:** Port 80 permanently redirects to 443 (`301 https://$host$request_uri`).
- **Modern SSL/TLS:** Restricted to TLSv1.2 and TLSv1.3 with Mozilla Modern cipher suites.
- **Security Headers:**
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HSTS)
  - `X-Frame-Options: DENY` (Clickjacking prevention)
  - `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
  - `Content-Security-Policy`: Restricts scripts to trusted CDNs (Razorpay, Google Maps).
- **Rate Limiting:**
  - General API: `limit_req_zone $binary_remote_addr zone=staging_api:10m rate=30r/s; burst=50 nodelay;`
  - Auth OTP: `limit_req_zone $binary_remote_addr zone=staging_auth:10m rate=5r/s; burst=10 nodelay;`
- **WebSocket Gateway:** Dedicated `/api/v1/ws` location block with `proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade";` and 3600s keep-alive timeout.
- **Upstream Keepalive:** REST proxy blocks include `proxy_http_version 1.1; proxy_set_header Connection "";` for optimal connection pooling.

---

## 5. Security & Configuration Matrix

### 5.1 Environment Variables Template (`.env.staging.example`)
Configured with zero exposed secrets:
- `APP_ENV=staging`
- `DEBUG=false`
- `JWT_SECRET_KEY`: Validated at startup; application raises a fatal `RuntimeError` if the development default key (`myarea24_local_development_secret_key_2026`) is detected in staging or production mode.
- `ALLOWED_ORIGINS=["https://staging.myarea24.in","https://preview.myarea24.in"]`
- `OTP_DEV_MODE=false`: In `staging`, `dev_otp` is permanently suppressed in API responses to prevent auth bypasses.

### 5.2 External Provider Conditional Handling
| Provider | Local Dev Behavior | Staging / Prod Behavior | Status |
| :--- | :--- | :--- | :--- |
| **SMS OTP** (Fast2SMS / Twilio) | If unset, logs OTP to dev console and returns `dev_otp`. | If unset, logs warning that SMS credentials are missing; `dev_otp` is **NEVER** returned. If configured, dispatches real SMS via Fast2SMS BulkV2 or Twilio REST API. | **HARDENED** |
| **Razorpay Gateway** | If secret unset, logs warning; allows testing. | Requires `RAZORPAY_KEY_SECRET`. Rejects missing secrets with hard HTTP 500 error. Cryptographically validates HMAC-SHA256 signatures on both checkout callbacks and webhooks. | **HARDENED** |
| **AI (Gemini / Sarvam)** | Falls back gracefully to heuristic responses if keys are unset. | Uses configured keys; handles rate limits with structured fallbacks. | **VERIFIED** |

---

## 6. Staging Deployment Runbook

### Step 1: Pre-Flight Database Snapshot (Local Host)
```powershell
python scripts/backup_database.py --source myarea24.db --backup-dir backups
```
*Verify that `backups/manifest_*.json` reports 26 tables and 22,636 rows with status `VERIFIED_OK`.*

### Step 2: Bootstrap Staging TLS Certificates
*To prevent Nginx from failing on missing SSL certificates before Certbot runs:*
```powershell
python scripts/bootstrap_staging_tls.py --domain staging.myarea24.in
```
*(Alternatively, if deployed behind Cloudflare or AWS ALB terminating SSL at the edge, copy `deploy/nginx/staging_http.conf` to `deploy/nginx/staging.conf`).*

### Step 3: Configure Staging Environment File
```bash
cp .env.staging.example .env.staging
# Generate a cryptographically secure 64-character JWT secret
openssl rand -hex 32
# Edit .env.staging with the generated JWT key, staging DB password, and test API credentials
chmod 600 .env.staging
```

### Step 4: Launch Staging Database & Apply Schema
```bash
cd deploy
docker compose -f docker-compose.staging.yml up -d postgres_staging
# Wait for healthy container state
docker compose -f docker-compose.staging.yml ps
```

### Step 5: Execute Safe Data Migration to Staging Database
```bash
# First perform a dry-run inspection
python scripts/migrate_sqlite_to_postgres.py --source-db ../myarea24.db --target-url "postgresql+psycopg2://myarea24_staging:<PASSWORD>@localhost:5432/myarea24_staging" --dry-run

# Run transactional migration (use --clean if re-running against existing staging data)
python scripts/migrate_sqlite_to_postgres.py --source-db ../myarea24.db --target-url "postgresql+psycopg2://myarea24_staging:<PASSWORD>@localhost:5432/myarea24_staging" --clean --batch-size 500
```

### Step 6: Build Frontend & Start Staging Services
```bash
# Build production bundle
npm run build

# Start FastAPI, Nginx, and Certbot
cd deploy
docker compose -f docker-compose.staging.yml up -d --build backend_staging nginx_staging certbot_staging
```

### Step 7: Verify Live Staging Health
```bash
curl -I https://staging.myarea24.in/health
curl -s https://staging.myarea24.in/api/v1/health | jq .
curl -s https://staging.myarea24.in/api/v1/ready | jq .
```

---

## 7. Rollback & Contingency Procedures

In the event of an unexpected failure or regression on the staging host:

1. **Service Teardown:**
   ```bash
   cd deploy
   docker compose -f docker-compose.staging.yml down
   ```
2. **Database Reversion / Cleanup:**
   - Run rollback command to empty staging database:
     ```bash
     python scripts/migrate_sqlite_to_postgres.py --target-url "postgresql+psycopg2://myarea24_staging:<PASSWORD>@localhost:5432/myarea24_staging" --rollback
     ```
   - Or wipe the PostgreSQL staging volume completely:
     ```bash
     docker volume rm deploy_staging_postgres_data
     ```
3. **Local Development Unaffected:**
   - Source database `myarea24.db` and backup snapshots in `backups/` remain completely untouched. Local development continues in SQLite WAL mode.

---

## 8. Preflight Prerequisite & Blocker Audit

| Prerequisite Category | Requirement | Current Host Status | Blocker / Resolution Needed |
| :--- | :--- | :---: | :--- |
| **Docker Engine** | Docker daemon running on target host | **STOPPED / NOT RUNNING** | `docker ps` returned code 1 (`open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`). Host requires Docker Desktop / daemon started. |
| **DNS Configuration** | `staging.myarea24.in` resolves to staging server IP | **PENDING** | Requires user / DNS registrar configuration. |
| **Staging Credentials** | Populated `.env.staging` with unique secrets | **PENDING** | Template `.env.staging.example` prepared. Awaiting user generation of JWT secret and API keys. |
| **SMS Gateway** | Fast2SMS or Twilio API credentials | **PENDING** | Awaiting user-supplied credentials. Diagnostic fallback logging active. |
| **Payment Gateway** | Razorpay Test Mode keys (`rzp_test_...`) | **PENDING** | Awaiting user-supplied test keys. Signature verification tested & active. |
| **Live Execution Approval** | Explicit user authorization to deploy containers | **BLOCKED** | Deployment intentionally halted pending explicit user authorization. |
