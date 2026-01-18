# Test Credentials & Preview Setup

## ✅ Preview Environment Ready

**Date:** January 18, 2026  
**Status:** All systems operational

---

## Services Running

| Service | URL | Port | Status |
|---------|-----|------|--------|
| **Main Web App** | http://localhost:3002 | 3002 | ✓ Running |
| **Admin Panel** | http://localhost:3001 | 3001 | ✓ Running |
| **PostgreSQL** | localhost | 5432 | ✓ Running |
| **Redis** | localhost | 6379 | ✓ Running |

---

## Test User Accounts

The following test accounts have been created in the database:

### Regular User (Pro Tier)
```
Email:    test@getappshots.local
Password: (Use Clerk auth in UI)
Tier:     Pro
Role:     user
Verified: ✓ Yes
```

### Admin User (Premium Tier)
```
Email:    admin@getappshots.local
Password: (Use Clerk auth in UI)
Tier:     Premium
Role:     admin
Verified: ✓ Yes
```

---

## Current Setup

### ✓ Completed
- [x] Node.js dependencies installed
- [x] Python API dependencies installed
- [x] PostgreSQL and Redis containers running
- [x] Database tables created
- [x] Test users created in database
- [x] Web app (Next.js) running on port 3002
- [x] Admin app (Next.js) running on port 3001
- [x] Environment variables configured

### ⚙️ Configuration

**Web App (.env.local)**
- Clerk authentication enabled (dev keys)
- PostgreSQL connection working
- Database synced with Prisma

**API App (.env.local)**
- FastAPI ready
- Async database connection configured
- Redis configured

---

## Testing the Preview

### 1. Access the Main App
```bash
# Open in browser
http://localhost:3002
```

### 2. Access Admin Panel
```bash
# Open in browser
http://localhost:3001
```

### 3. API Health Check
```bash
curl http://localhost:8000/health
```

---

## Database Info

- **Host:** localhost
- **Port:** 5432
- **Database:** getappshots
- **User:** postgres
- **Password:** postgres

### Connected Tables
- `users` - Test accounts (2 records)
- `api_keys` - API key management
- `subscriptions` - User subscriptions
- `usage_logs` - Usage tracking
- And more...

---

## Next Steps for Testing

1. **Sign In:** Use Clerk authentication at `/sign-in` (test keys configured)
2. **Navigate Dashboard:** Visit `/dashboard` to see user features
3. **Admin Access:** Admin features at `/admin` (admin@getappshots.local role)
4. **API Testing:** Use the health endpoint or API docs at `/api/health`

---

## Development Notes

- **Hot Reload:** Both web apps have hot reload enabled
- **API Framework:** FastAPI running on uvicorn
- **Database:** PostgreSQL with SQLAlchemy ORM
- **Build Tool:** Turbo for monorepo management
- **Package Manager:** npm (configured)

---

**Build Status:** ✓ Successful  
**Ready for:** Frontend testing, API integration testing, full E2E testing
