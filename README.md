# TransitOpsbyAimers
Odoo hackathon project.

## Authentication API

Authentication uses bcrypt password hashes and signed JWT bearer tokens. Register a company with a single consistent payload:

```json
{
  "company": {
    "name": "Aimers Transport",
    "legalName": "Aimers Transport Private Limited",
    "registrationNumber": "REG-001",
    "email": "ops@aimers.example",
    "phone": "+91-9999999999",
    "address": "Mumbai"
  },
  "admin": {
    "name": "Admin User",
    "email": "admin@aimers.example",
    "password": "use-a-unique-password-of-at-least-12-characters",
    "phone": "+91-9999999999"
  }
}
```

Use `POST /auth/login` with `{ "email": "...", "password": "..." }`. Passwords must be 12 to 128 characters and are stored only as bcrypt hashes. Send the returned JWT in every protected request as `Authorization: Bearer <token>`. Configure `JWT_KEY` with at least 32 random characters; optionally configure `JWT_ISSUER`, `JWT_AUDIENCE`, and `JWT_EXPIRES_IN` (defaults to one hour).

## Access Control

`POST /auth/register-company` is the only public onboarding endpoint. It always creates a `COMPANY_ADMIN` account and cannot create a driver, manager, or any other role. All management routes require a valid bearer token and are scoped to the authenticated user's company.

| Role | Allowed access |
| --- | --- |
| `COMPANY_ADMIN` | Company profile, user management, and all fleet, trip, expense, dashboard, and report operations. |
| `FLEET_MANAGER` | Drivers, vehicles, maintenance, fuel logs, trips, expenses, dashboards, and reports. |
| `EXPENSE_MANAGER` | Expense operations only. |
| `SAFETY_OFFICER` | Read-only trip access. |
| `FINANCIAL_ANALYST` | Read-only trips, dashboards, and reports. |
| `DRIVER` | Authentication only; no management route access. A driver record can only be created by an admin or fleet manager for a user already assigned the `DRIVER` role. |
