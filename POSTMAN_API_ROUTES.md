# Finance API Documentation

## Base URL

- Local: `https://finance-dashboard-fullstack.onrender.com`
- API Prefix: `/api`

## Authentication

Protected routes require a JWT token:

- Header: `Authorization: Bearer <token>`

## Roles

- `viewer`
- `analyst`
- `admin`

---

## Health / Root

### GET `/`

No auth.

### GET `/health`

No auth.

---

## Auth (`/api/auth`)

### POST `/api/auth/register`

Body (JSON):
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

### POST `/api/auth/login`

Body (JSON):
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

### GET `/api/auth/me`

Auth required.

Allowed roles: `viewer`, `analyst`, `admin`

### POST `/api/auth/logout`

Auth required.

Body (JSON):
```json
{}
```

---

## Users (Admin only) (`/api/users`)

All routes in this section require role: `admin`

### GET `/api/users`

Query params (optional):
- `page` (int, >= 1)
- `limit` (int, 1..100)

### POST `/api/users`

Body (JSON):
```json
{
  "name": "New User",
  "email": "new.user@example.com",
  "password": "password123",
  "role": "viewer"
}
```

### GET `/api/users/:id`

Path params:
- `id` (UUID)

### PATCH `/api/users/:id`

Body (JSON) (send at least one field):
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

### PATCH `/api/users/:id/role`

Body (JSON):
```json
{
  "role": "analyst"
}
```

### PATCH `/api/users/:id/status`

Body (JSON):
```json
{}
```

---

## Categories (`/api/categories`)

### GET `/api/categories`

Auth required.

Allowed roles: `viewer`, `analyst`, `admin`

### POST `/api/categories`

Auth required.

Allowed roles: `admin`

Body (JSON):
```json
{
  "name": "Salary",
  "type": "income"
}
```

---

## Records (`/api/records`)

### GET `/api/records`

Auth required.

Allowed roles: `viewer`, `analyst`, `admin`

Query params (optional):
- `type`: `income` | `expense`
- `category_id`: UUID
- `from`: `YYYY-MM-DD`
- `to`: `YYYY-MM-DD`
- `page`: int (>= 1)
- `limit`: int (1..100)
- `sort`: `record_date:asc|desc` | `created_at:asc|desc` | `updated_at:asc|desc` | `amount:asc|desc`

### GET `/api/records/:id`

Auth required.

Allowed roles: `viewer`, `analyst`, `admin`

Path params:
- `id` (UUID)

### POST `/api/records`

Auth required.

Allowed roles: `analyst`, `admin`

Body (JSON):
```json
{
  "category_id": "00000000-0000-0000-0000-000000000000",
  "amount": 123.45,
  "type": "expense",
  "notes": "Optional notes",
  "record_date": "2026-04-03"
}
```

Optional (admin only):
```json
{
  "user_id": "00000000-0000-0000-0000-000000000000",
  "category_id": "00000000-0000-0000-0000-000000000000",
  "amount": 123.45,
  "type": "expense",
  "notes": "Optional notes",
  "record_date": "2026-04-03"
}
```

### PATCH `/api/records/:id`

Auth required.

Allowed roles: `analyst`, `admin`

Body (JSON) (include at least one field):
```json
{
  "category_id": "00000000-0000-0000-0000-000000000000",
  "amount": 200.00,
  "type": "expense",
  "notes": null,
  "record_date": "2026-04-03"
}
```

### DELETE `/api/records/:id`

Auth required.

Allowed roles: `analyst`, `admin`

---

## Dashboard (`/api/dashboard`)

### GET `/api/dashboard/summary`

Auth required.

Allowed roles: `viewer`, `analyst`, `admin`

Query params (optional):
- `from`: `YYYY-MM-DD`
- `to`: `YYYY-MM-DD`

### GET `/api/dashboard/by-category`

Auth required.

Allowed roles: `analyst`, `admin`

Query params (optional):
- `from`: `YYYY-MM-DD`
- `to`: `YYYY-MM-DD`

### GET `/api/dashboard/trends`

Auth required.

Allowed roles: `analyst`, `admin`

Query params (optional):
- `period`: `monthly` | `weekly`

### GET `/api/dashboard/recent`

Auth required.

Allowed roles: `viewer`, `analyst`, `admin`
