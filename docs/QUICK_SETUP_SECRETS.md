# Quick Setup: Automated Secrets Management

## 🎯 Goal
Reduce manual setup by 85%+ while maximizing security.

## ✅ Recommended Solution: Hybrid Approach

### What Gets Automated

| Service | Method | Automation Level |
|---------|--------|-----------------|
| **Clerk** | Vercel Integration | 100% (2 vars auto-synced) |
| **Stripe** | Vercel Integration | 100% (2 vars auto-synced) |
| **Database** | Vercel Postgres | 100% (1 var auto-synced) |
| **Redis** | Vercel KV | 100% (2 vars auto-synced) |
| **Storage (R2/S3)** | Doppler Integration | 100% (9 vars auto-synced) |
| **Custom Secrets** | Vercel Sensitive Env Vars | Manual (but secure) |

**Total**: ~16 variables auto-synced, ~5 manual (simple configs)

---

## 🚀 Quick Setup (40 minutes)

### Step 1: Vercel Integrations (15 min)

#### Clerk Integration
```bash
# In Vercel Dashboard:
1. Project → Settings → Integrations
2. Search "Clerk" → Add Integration
3. Select your Clerk app
✅ DONE - 2 variables auto-synced
```

#### Stripe Integration
```bash
# In Vercel Dashboard:
1. Project → Settings → Integrations
2. Search "Stripe" → Add Integration
3. Select your Stripe account
✅ DONE - 2 variables auto-synced
```

#### Vercel Postgres
```bash
# In Vercel Dashboard:
1. Project → Storage → Create Database → Postgres
2. Select region
✅ DONE - POSTGRES_URL auto-created

# Map to DATABASE_URL:
3. Settings → Environment Variables
4. Add: DATABASE_URL = $POSTGRES_URL
✅ DONE - Database ready
```

#### Vercel KV (Optional - for Redis)
```bash
# In Vercel Dashboard:
1. Project → Storage → Create Database → KV
✅ DONE - KV_REST_API_URL, KV_REST_API_TOKEN auto-created
```

---

### Step 2: Doppler for Storage (20 min)

#### Why Doppler?
- ✅ Free tier (unlimited secrets)
- ✅ Native Vercel integration
- ✅ Environment-specific configs
- ✅ Automatic sync

#### Setup

1. **Create Account**
   ```bash
   # Go to doppler.com and sign up (free)
   ```

2. **Install CLI** (optional, for easier setup)
   ```bash
   npm i -g doppler
   doppler login
   ```

3. **Create Project & Configs**
   ```bash
   doppler setup --project getappshots
   doppler configs create dev --environment development
   doppler configs create staging --environment staging
   doppler configs create prod --environment production
   
   # Or use the automated setup script:
   npm run doppler:setup
   ```

4. **Add Storage Secrets**
   ```bash
   # Development
   doppler secrets set --config dev \
     R2_ACCOUNT_ID="your-dev-account-id" \
     R2_BUCKET_NAME="getappshots-dev" \
     R2_ACCESS_KEY_ID="dev-access-key" \
     R2_SECRET_ACCESS_KEY="dev-secret-key" \
     STORAGE_ENDPOINT_URL="https://account-id.r2.cloudflarestorage.com" \
     STORAGE_BUCKET="getappshots-dev" \
     STORAGE_REGION="auto" \
     STORAGE_ACCESS_KEY_ID="dev-access-key" \
     STORAGE_SECRET_ACCESS_KEY="dev-secret-key"
   
   # Repeat for staging and prod with different values
   ```

5. **Install Vercel Integration**
   ```bash
   # In Vercel Dashboard:
   1. Project → Settings → Integrations
   2. Search "Doppler" → Add Integration
   3. Authorize Vercel
   4. Select project: getappshots
   5. Map environments:
      - Development → dev config
      - Preview → staging config
      - Production → prod config
   ✅ DONE - 9 storage variables auto-synced
   ```

---

### Step 3: Remaining Variables (5 min)

In Vercel Dashboard → Settings → Environment Variables:

**For Each Environment (Dev/Preview/Prod):**

```bash
# Simple configs (not sensitive)
SCRAPE_QUEUE_MODE=sync
PLAY_SCRAPE_MODE=html
PLAY_SCRAPE_FALLBACK_PLAYWRIGHT=false

# Clerk URLs (not sensitive)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Admin emails (sensitive - mark as sensitive)
ADMIN_EMAILS=admin@example.com

# Stripe webhook & prices (sensitive - mark as sensitive)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...

# JWT secret (sensitive - mark as sensitive)
JWT_SECRET_KEY=your-secure-random-string
```

**Important**: Mark sensitive variables as "Sensitive" in Vercel (they'll be encrypted and non-readable).

---

## 📊 Before vs After

### Before (Manual)
```
❌ 20+ environment variables to manage
❌ Manual copy-paste for each environment
❌ Risk of secrets in code/commits
❌ No automatic rotation
❌ No audit trail
❌ 2-4 hours setup time
```

### After (Automated)
```
✅ 16 variables auto-synced
✅ Environment-specific values automatic
✅ Zero secrets in code
✅ Automatic rotation (where supported)
✅ Complete audit trails
✅ 40 minutes setup time
✅ 85% reduction in manual work
```

---

## 🔒 Security Benefits

1. **Encrypted Storage**: All secrets encrypted at rest
2. **Automatic Rotation**: Clerk, Stripe rotate automatically
3. **Audit Trails**: All access logged
4. **Environment Isolation**: Separate secrets per environment
5. **No Secrets in Code**: Zero risk of committing secrets

---

## 🎯 Alternative: All Vercel (Simpler, Less Automation)

If you want to avoid Doppler:

### Use Vercel Sensitive Environment Variables

**Pros:**
- ✅ Simpler (no external service)
- ✅ Still secure (encrypted)
- ✅ Environment-specific values

**Cons:**
- ❌ Manual setup for storage (9 variables)
- ❌ No automatic rotation
- ❌ More manual work

**Setup:**
1. Use Vercel integrations (Clerk, Stripe, Postgres, KV)
2. Manually add storage secrets as Sensitive Environment Variables
3. Set different values for Dev/Preview/Prod

**Result**: ~7 variables auto-synced, ~12 manual (but secure)

---

## 🏆 Final Recommendation

**Use Hybrid Approach** (Vercel + Doppler):
- ✅ Maximum automation (85%+)
- ✅ Best security
- ✅ Minimal manual work
- ✅ Future-proof

**Time Investment**: 40 minutes one-time setup
**Ongoing Maintenance**: ~5 minutes/month

---

## 📋 Checklist

- [ ] Set up Vercel Clerk integration
- [ ] Set up Vercel Stripe integration
- [ ] Create Vercel Postgres database
- [ ] Create Doppler account
- [ ] Add storage secrets to Doppler
- [ ] Install Doppler Vercel integration
- [ ] Configure environment mappings
- [ ] Add remaining variables in Vercel
- [ ] Mark sensitive variables
- [ ] Test deployment
- [ ] Remove old manual env vars

---

## 🆘 Troubleshooting

### Integration Not Syncing
- Check integration status in Vercel Dashboard
- Re-authorize if needed
- Verify service account permissions

### Variables Not Loading
- Ensure variable is set for correct environment
- Redeploy after adding variables
- Check variable name matches code exactly

### Doppler Sync Issues
- Verify config mapping in Vercel
- Check Doppler project access
- Ensure secrets exist in Doppler

---

## 📚 Resources

- [Vercel Integrations](https://vercel.com/integrations)
- [Doppler Documentation](https://docs.doppler.com)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- Full guide: `docs/RECOMMENDED_SECRETS_STRATEGY.md`
