# Finance API (Backend)

This project is a backend API for a finance dashboard assessment. It demonstrates how to design a clean backend with **user/role management**, **financial record CRUD**, **dashboard analytics**, and **role-based access control** — all backed by a **PostgreSQL** database via **Prisma ORM**.

If you are reviewing this as an HR/engineering assessment: this repo focuses on **structure, clarity, business rules, and consistency**, rather than production-grade scale.

---

## What This Backend Covers (Assessment Checklist)

### 1) User and Role Management

- Create and manage users (admin-only)
- Assign roles: `viewer`, `analyst`, `admin`
- Toggle user status `active/inactive` (inactive users are blocked at middleware level)
- Enforce role-based behavior centrally

### 2) Financial Records Management

- Create, list, view, update, and delete financial records
- Supports filtering (type/category/date range), pagination, and sorting
- Uses **soft delete** (`is_deleted`) for reliability and auditability
- Enforces analyst ownership rules for updates/deletes

### 3) Dashboard Summary APIs (Aggregations)

- Summary totals: income, expenses, net balance, record count
- Category-wise totals (SQL aggregation)
- Trends (weekly/monthly buckets)
- Recent activity

### 4) Access Control Logic

- JWT authentication middleware (`authenticate`)
- Role + active-status authorization middleware (`authorize`)
- “Analyst can only modify their own records” enforced in the records service

### 5) Validation and Error Handling

- Request validation via `express-validator` and a shared `validate()` middleware
- Consistent success/error response envelopes
- Prisma DB errors mapped to clean API errors (duplicate key, FK violations, not found)

### 6) Data Persistence

- PostgreSQL database
- Prisma schema + migrations stored under `prisma/`
- Also includes a SQL init script under `migrations/` (useful for DB inspection)

---

## Tech Stack

- Node.js + Express
- PostgreSQL
- Prisma ORM (`@prisma/client`)
- JWT authentication (`jsonwebtoken`)
- Password hashing (`bcrypt`)
- Validation (`express-validator`)

---

## Quick Start (Local)

### Prerequisites

- Node.js (18+ recommended)
- PostgreSQL database

### Setup

1) Install dependencies

```bash
npm install
```

2) Create environment file

```bash
copy .env.example .env
```

3) Apply Prisma migration (creates tables)

```bash
npm run prisma:migrate
```

4) Seed sample data

```bash
npm run seed
```

5) Run the API

```bash
npm run dev
```

### Health Check

```bash
curl http://localhost:3000/health
```

---

## Environment Variables

Example file: `.env.example`

- `PORT` (default `3000`)
- `DATABASE_URL` (PostgreSQL connection string used by Prisma)
- `JWT_SECRET` (required)
- `JWT_EXPIRES_IN` (default `8h`)
- `BCRYPT_SALT_ROUNDS` (default `10`)
- `PGSSL` (present in env template; SSL is typically configured through `DATABASE_URL` / hosting settings)

---

## Folder Structure (Backend)

The backend is intentionally organized into clear layers so a reviewer can quickly follow the flow.

```text
Finance_api/
  migrations/
    001_init.sql                # Reference SQL schema (optional, for inspection)
  prisma/
    schema.prisma               # Source of truth for DB models
    migrations/                 # Prisma-generated migration history
  seeds/
    seed.js                     # Seed users, categories, and demo records
  src/
    app.js                      # Express app bootstrap + route registration
    config/
      db.js                     # PrismaClient init
    middleware/
      authenticate.js           # JWT verification + token revoke check
      authorize.js              # Role check + active-status check
      validate.js               # express-validator result handler
    routes/
      auth.routes.js            # /api/auth
      users.routes.js           # /api/users
      records.routes.js         # /api/records
      categories.routes.js      # /api/categories
      dashboard.routes.js       # /api/dashboard
    services/
      auth.service.js           # login/register + token blacklist logic
      user.service.js           # user CRUD + role/status changes + audit
      record.service.js         # record CRUD + filtering + ownership rules + audit
      dashboard.service.js      # aggregation queries for dashboard
    utils/
      errors.js                 # AppError
      response.js               # standard API response envelopes
```

---

## Request Lifecycle (How It Works)

For protected routes, the typical flow is:

1) **authenticate**: validates `Authorization: Bearer <token>` and checks token revocation
2) **authorize**: loads current user from DB, blocks inactive users, enforces role
3) **validate**: validates request body/query/params and returns 422 with structured details
4) **route handler**: calls service functions
5) **service layer**: enforces business rules, talks to Prisma, returns normalized response objects

---

## Standard API Response Shape

### Success

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 0 }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "message": "Human readable message",
    "code": "ERROR_CODE",
    "details": [
      { "field": "email", "message": "Valid email is required" }
    ]
  }
}
```

Notes:
- Validation failures return **HTTP 422** with `code = VALIDATION_ERROR`
- Known Prisma errors are mapped (duplicate keys, FK violations, missing resource)

---

## Roles and Access Control

Roles used in this backend:

- **viewer**: read-only access to dashboard + records + categories
- **analyst**: read access + can create/update/delete records (ownership rules apply)
- **admin**: full management access (users + records + categories + analytics)

### Quick Access Matrix (At-a-Glance)

| Capability / Area | viewer | analyst | admin |
|---|---:|---:|---:|
| Auth: login/register/me/logout | ✅ | ✅ | ✅ |
| Dashboard: summary + recent | ✅ | ✅ | ✅ |
| Dashboard: by-category + trends | ❌ | ✅ | ✅ |
| Categories: list | ✅ | ✅ | ✅ |
| Categories: create | ❌ | ❌ | ✅ |
| Records: list + get | ✅ | ✅ | ✅ |
| Records: create | ❌ | ✅ | ✅ |
| Records: update/delete (own records) | ❌ | ✅ | ✅ |
| Users: list/create/update/role/status | ❌ | ❌ | ✅ |

Active status:

- Any inactive user (`is_active = false`) is blocked by `authorize` middleware with **HTTP 403**.

### Ownership Rules (Important)

For records:

- **Analyst** can only create/update/delete records where `user_id` is their own.
- **Admin** can create records for any user by passing `user_id` in the request body.

---

## Database Schema (Prisma)

Source of truth: `prisma/schema.prisma`

### Enums

- `UserRole`: `viewer | analyst | admin`
- `CategoryType`: `income | expense | both`
- `RecordType`: `income | expense`

### Models

#### User

- `id` (UUID)
- `name`, `email` (unique)
- `password_hash` (stored as bcrypt hash)
- `role` (`viewer|analyst|admin`)
- `is_active` (default true)
- `created_at`

Relationships:
- `User (1) -> (many) FinancialRecord`
- `User (1) -> (many) AuditLog`

#### Category

- `id` (UUID)
- `name` (unique)
- `type` (`income|expense|both`)
- `created_at`

Relationship:
- `Category (1) -> (many) FinancialRecord`

#### FinancialRecord

- `id` (UUID)
- `user_id` (FK -> users)
- `category_id` (FK -> categories)
- `amount` (decimal 12,2)
- `type` (`income|expense`)
- `notes` (optional)
- `record_date` (date)
- `is_deleted` (soft delete flag)
- `created_at`, `updated_at`

Business constraints:
- Records are listed/queried with `is_deleted = false`.
- Category type is validated:
  - If category is `income`, record must be `income`.
  - If category is `expense`, record must be `expense`.
  - If category is `both`, either record type is allowed.

#### AuditLog

- Captures key actions like user creation/updates, record CRUD, category creation, and registration.
- Fields: `user_id`, `action`, `resource`, `created_at`

---

## API Routes (Quick)

This section lists the available routes with a one-line description (no long examples).

| Method | Route | Access | What it does |
|---|---|---|---|
| GET | `/health` | Public | Simple health check (`{ status: "ok" }`). |
| POST | `/api/auth/register` | Public | Creates a new **viewer** account and returns a JWT. |
| POST | `/api/auth/login` | Public | Verifies credentials and returns a JWT (inactive users are blocked). |
| GET | `/api/auth/me` | viewer/analyst/admin | Returns the current authenticated user profile. |
| POST | `/api/auth/logout` | Authenticated | Revokes the current token using an in-memory blacklist. |
| GET | `/api/users` | admin | Lists users with pagination (`page`, `limit`). |
| POST | `/api/users` | admin | Creates a new user with an assigned role. |
| GET | `/api/users/:id` | admin | Fetches a user by id. |
| PATCH | `/api/users/:id` | admin | Updates user fields (`name` and/or `email`). |
| PATCH | `/api/users/:id/role` | admin | Changes a user’s role (`viewer|analyst|admin`). |
| PATCH | `/api/users/:id/status` | admin | Toggles user active/inactive status. |
| GET | `/api/categories` | viewer/analyst/admin | Lists categories (sorted by name). |
| POST | `/api/categories` | admin | Creates a category (`income|expense|both`) and writes an audit log. |
| GET | `/api/records` | viewer/analyst/admin | Lists records with filters (`type`, `category_id`, `from`, `to`) + pagination + sorting. |
| GET | `/api/records/:id` | viewer/analyst/admin | Fetches a single record (excluding soft-deleted records). |
| POST | `/api/records` | analyst/admin | Creates a record; analysts can only create their own, admins may set `user_id`. |
| PATCH | `/api/records/:id` | analyst/admin | Updates a record; analysts can only update their own records. |
| DELETE | `/api/records/:id` | analyst/admin | Soft-deletes a record (`is_deleted = true`) and writes an audit log. |
| GET | `/api/dashboard/summary` | viewer/analyst/admin | Returns totals (income, expenses, net, record_count) for optional date range. |
| GET | `/api/dashboard/by-category` | analyst/admin | Returns category-wise totals using a SQL aggregation query. |
| GET | `/api/dashboard/trends` | analyst/admin | Returns weekly/monthly trend buckets (income vs expenses). |
| GET | `/api/dashboard/recent` | viewer/analyst/admin | Returns the 10 most recent records for the dashboard feed. |

---

## Seed Data (For Demo)

Command:

```bash
npm run seed
```

Seeded credentials (same password for all):

- `admin@finance.local` / `Password123!`
- `analyst@finance.local` / `Password123!`
- `viewer@finance.local` / `Password123!`

Seed behavior:

- Clears tables: audit logs, records, categories, users
- Creates 3 users (admin/analyst/viewer)
- Creates a small set of categories (income, expense, both)
- Inserts sample records across different users/categories

---

## Notes / Tradeoffs (Intentional for Assessment)

- Logout token revocation is implemented with an **in-memory blacklist** (simple + clear for assessment). In production you would store revoked tokens in a shared cache/DB.
- Records are **soft deleted** (`is_deleted`) to keep history and make aggregation stable.
- Audit logging exists to show accountability and traceability of important actions.
