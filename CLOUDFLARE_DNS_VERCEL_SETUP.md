# Cloudflare DNS Configuration for Vercel + R2 Storage

**Scenario**: You're using Cloudflare for DNS management (for R2 storage, CDN, and DDoS protection) but hosting your application on Vercel.

**Solution**: Keep Cloudflare nameservers and configure DNS records in Cloudflare to point to Vercel.

---

## Understanding the Setup

### Why Keep Cloudflare Nameservers?

1. **R2 Storage**: Your Cloudflare R2 bucket uses Cloudflare's infrastructure
2. **CDN Benefits**: Cloudflare provides global CDN and caching
3. **DDoS Protection**: Built-in security features
4. **DNS Management**: Already have Clerk DNS records configured

### Architecture

```
Domain (getappshots.com)
  ↓
Cloudflare DNS (Nameservers stay here)
  ↓
Vercel (Hosting your Next.js app)
  ↓
R2 Storage (Cloudflare R2 for assets)
```

---

## Step-by-Step Configuration

### Step 1: Get Vercel's IP Address or Use CNAME

**Option A: Using CNAME (Recommended for Vercel)**

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. **Add your domain** `getappshots.com` if not already added
3. **Vercel will show you the configuration**:
   - For root domain: You'll need to use A records (see Option B)
   - For `www.getappshots.com`: You can use CNAME to `cname.vercel-dns.com`

**Option B: Get Vercel's IP Addresses (For Root Domain)**

Vercel uses a dynamic IP system, but you can find the current IPs:
1. Check Vercel's documentation for current IP ranges
2. Or use Vercel's A record values (usually provided in domain settings)

**Common Vercel IP addresses** (may change, check Vercel docs):
- `76.76.21.21` (you might have seen this)
- Vercel provides specific IPs in their domain settings

### Step 2: Update DNS Records in Cloudflare

In your Cloudflare Dashboard → DNS → Records:

#### For Root Domain (`getappshots.com`)

1. **Find or Update the A Record**:
   - **Type**: `A`
   - **Name**: `@` or `getappshots.com` (root domain)
   - **IPv4 address**: Get from Vercel dashboard (Settings → Domains → your domain)
   - **Proxy status**: Toggle to **DNS only** (grey cloud) ✅ **Important for Vercel**
   - **TTL**: `Auto` or `10 min`

2. **If Vercel provides multiple IPs**, create multiple A records with the same name

#### For WWW Subdomain (`www.getappshots.com`)

1. **Create or Update CNAME Record**:
   - **Type**: `CNAME`
   - **Name**: `www`
   - **Target**: `cname.vercel-dns.com` (or the value Vercel provides)
   - **Proxy status**: **DNS only** (grey cloud) ✅ **Critical**
   - **TTL**: `Auto`

**⚠️ Critical**: Both A and CNAME records MUST have proxy status set to **DNS only** (grey cloud icon). This ensures traffic goes directly to Vercel, not through Cloudflare's proxy.

### Step 3: Keep Clerk DNS Records

Your existing Clerk DNS records should remain unchanged:

- ✅ `accounts` CNAME → `accounts.clerk.services` (DNS only)
- ✅ `clerk` CNAME → `frontend-api.clerk.services` (DNS only)
- ✅ `clk._domainkey` CNAME → (DKIM for email)
- ✅ `clk2._domainkey` CNAME → (DKIM for email)
- ✅ `clkmail` CNAME → (Clerk mail)

**All Clerk records should also be "DNS only" (grey cloud).**

### Step 4: Remove/Update Old Records

If you see the old A record pointing to `216.198.79.1`:
- This appears to be an old hosting provider
- Update it to point to Vercel's IP (from Step 1)
- Or remove it if Vercel configuration replaces it

---

## Verification Steps

### 1. Check DNS Propagation

```bash
# Check A record
dig getappshots.com +short

# Check CNAME for www
dig www.getappshots.com +short

# Should return Vercel's IP/CNAME
```

### 2. Verify in Vercel

1. **Vercel Dashboard** → Settings → Domains
2. **Check domain status**:
   - Should show "Valid Configuration" ✅
   - SSL certificate should be issued automatically

### 3. Verify in Cloudflare

1. **Cloudflare Dashboard** → DNS → Records
2. **Confirm all records**:
   - Root domain A record points to Vercel
   - WWW CNAME points to Vercel
   - All records have "DNS only" (grey cloud)

---

## Common Issues and Solutions

### Issue: Domain Not Resolving

**Symptoms**: Domain doesn't load or shows wrong content

**Solution**:
1. Verify A/CNAME records point to correct Vercel values
2. Ensure proxy status is "DNS only" (not proxied through Cloudflare)
3. Wait 5-15 minutes for DNS propagation
4. Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

### Issue: SSL Certificate Errors

**Symptoms**: HTTPS shows security warnings

**Solution**:
1. Vercel automatically provisions SSL certificates
2. Ensure domain is properly configured in Vercel
3. Check that DNS records are correct
4. Wait 24-48 hours for SSL propagation

### Issue: Clerk Authentication Not Working

**Symptoms**: Clerk redirects fail or show errors

**Solution**:
1. Verify Clerk DNS records are still in Cloudflare
2. Ensure all Clerk records are "DNS only"
3. Check Clerk Dashboard → Settings → Paths:
   - Allowed origins should include `https://getappshots.com` and `https://www.getappshots.com`

### Issue: R2 Storage Not Accessible

**Symptoms**: Assets don't load from R2

**Solution**:
1. R2 storage is independent of DNS nameservers
2. Verify R2 credentials in environment variables
3. Check R2 bucket configuration
4. Ensure `R2_PUBLIC_URL` is set correctly (if using public bucket)

---

## Important Notes

### Proxy Status (Cloudflare Orange Cloud)

- ❌ **DO NOT** enable proxy (orange cloud) for:
  - Root domain A record pointing to Vercel
  - WWW CNAME pointing to Vercel
  - Clerk DNS records

- ✅ **Why?** Vercel handles its own CDN, SSL, and caching. Cloudflare proxy can interfere with Vercel's routing.

### DNS-Only Mode (Grey Cloud)

- ✅ **Use DNS-only** for all records that point to:
  - Vercel (your application)
  - Clerk (authentication services)
  - Other external services

### SSL/TLS Settings in Cloudflare

1. **Cloudflare Dashboard** → SSL/TLS
2. **Encryption mode**: Set to **"Full"** or **"Full (strict)"**
   - This ensures encrypted connection between Cloudflare and Vercel
   - However, since you're using DNS-only, this mainly affects other services

---

## Quick Checklist

- [ ] Vercel domain configuration verified (Settings → Domains)
- [ ] Cloudflare A record for root domain points to Vercel IP
- [ ] Cloudflare CNAME for www points to Vercel
- [ ] All Vercel records have "DNS only" (grey cloud) enabled
- [ ] Clerk DNS records remain in Cloudflare (DNS only)
- [ ] Old A record (`216.198.79.1`) updated or removed
- [ ] DNS propagation verified (`dig` or online DNS checker)
- [ ] Domain resolves correctly in browser
- [ ] SSL certificate issued by Vercel
- [ ] Clerk authentication works
- [ ] R2 storage accessible

---

## Reference: Current DNS Records (Example)

Based on your Cloudflare screenshot, here's what your DNS should look like:

| Type | Name | Content | Proxy | Purpose |
|------|------|---------|-------|---------|
| A | `@` | `[Vercel IP]` | DNS only | Root domain → Vercel |
| CNAME | `www` | `cname.vercel-dns.com` | DNS only | WWW → Vercel |
| CNAME | `accounts` | `accounts.clerk.services` | DNS only | Clerk accounts |
| CNAME | `clerk` | `frontend-api.clerk.services` | DNS only | Clerk frontend API |
| CNAME | `clk._domainkey` | `dkim1.g6n0hy...` | DNS only | Clerk DKIM |
| CNAME | `clk2._domainkey` | `dkim2.g6n0hy...` | DNS only | Clerk DKIM |
| CNAME | `clkmail` | `mail.g6n0hy...` | DNS only | Clerk mail |

---

## Next Steps

1. **Get Vercel IP/CNAME** from Vercel Dashboard → Settings → Domains
2. **Update Cloudflare DNS** records as described above
3. **Wait for propagation** (5-15 minutes)
4. **Verify domain** resolves correctly
5. **Test application** and Clerk authentication
6. **Monitor** for any issues

---

**Status**: Configuration guide created  
**Environment**: Cloudflare DNS + Vercel Hosting + Cloudflare R2 Storage  
**Expected Result**: Domain resolves to Vercel while maintaining Cloudflare DNS control and R2 access