# Quick Setup Guide: Cloudflare DNS + Vercel + R2 Storage

**Your Situation**: You're using Cloudflare DNS for R2 Storage and want to host your app on Vercel.

**Solution**: Keep Cloudflare nameservers and update DNS records in Cloudflare to point to Vercel.

---

## ✅ What You Should Do

### DO:
- ✅ Keep Cloudflare nameservers (do NOT change them)
- ✅ Manage DNS records in Cloudflare Dashboard
- ✅ Update Cloudflare DNS records to point to Vercel
- ✅ Keep all Clerk DNS records in Cloudflare
- ✅ Set all Vercel records to "DNS only" (grey cloud icon)

### DON'T:
- ❌ Do NOT upload zone file to Vercel
- ❌ Do NOT change nameservers to Vercel
- ❌ Do NOT enable Cloudflare proxy (orange cloud) for Vercel records
- ❌ Do NOT delete Clerk DNS records

---

## Step-by-Step Instructions

### Step 1: Get Vercel's Configuration

1. **Go to Vercel Dashboard**:
   - Navigate to your project
   - Go to **Settings** → **Domains**
   - Click on `getappshots.com` (or add it if not already added)

2. **Find the DNS Configuration**:
   - Vercel will show you what DNS records you need
   - Look for:
     - **A record** IP address (for root domain `@`)
     - **CNAME** target (for `www` subdomain, usually `cname.vercel-dns.com`)

3. **Copy these values** - you'll need them in Step 2

**Example of what you might see**:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

### Step 2: Update DNS Records in Cloudflare

1. **Go to Cloudflare Dashboard**:
   - Navigate to your domain `getappshots.com`
   - Click on **DNS** → **Records**

2. **Update Root Domain A Record**:
   
   - **Find** the existing A record for root domain (name: `@` or `getappshots.com`)
   - Currently it might point to: `216.198.79.1` (old hosting)
   - **Click Edit** (pencil icon)
   - **Update**:
     - **IPv4 address**: Paste the Vercel IP from Step 1
     - **Proxy status**: Click the cloud icon to make it **grey** (DNS only)
     - **TTL**: Keep as "Auto" or set to "10 min"
   - **Click Save**

3. **Add/Update WWW CNAME Record**:
   
   - **Check** if `www` CNAME record exists
   - **If exists**: Click Edit
   - **If not exists**: Click "Add record"
   - **Configure**:
     - **Type**: `CNAME`
     - **Name**: `www`
     - **Target**: `cname.vercel-dns.com` (or what Vercel shows)
     - **Proxy status**: Click cloud icon to make it **grey** (DNS only) ✅ **Critical**
     - **TTL**: "Auto"
   - **Click Save**

4. **Keep All Clerk Records As-Is**:
   
   Your Clerk records should remain unchanged:
   - ✅ `accounts` CNAME → `accounts.clerk.services` (DNS only - grey cloud)
   - ✅ `clerk` CNAME → `frontend-api.clerk.services` (DNS only - grey cloud)
   - ✅ `clk._domainkey` CNAME → (your Clerk DKIM)
   - ✅ `clk2._domainkey` CNAME → (your Clerk DKIM)
   - ✅ `clkmail` CNAME → (your Clerk mail)
   
   **Verify** all Clerk records have grey cloud (DNS only) - click the cloud icon if needed

---

### Step 3: Verify Cloudflare Settings

1. **Check Proxy Status**:
   - All Vercel records: **Grey cloud** (DNS only)
   - All Clerk records: **Grey cloud** (DNS only)
   - No orange clouds for these records ✅

2. **Check SSL/TLS Settings** (Optional):
   - Cloudflare Dashboard → **SSL/TLS**
   - Encryption mode: **Full** or **Full (strict)**
   - (This mainly affects other services, since you're using DNS-only)

---

### Step 4: Verify in Vercel

1. **Go back to Vercel Dashboard**:
   - Settings → Domains → `getappshots.com`
   - Check the domain status
   - It should show "Valid Configuration" ✅

2. **If you see a warning**:
   - "Update nameservers" warning can be ignored (you're using Cloudflare DNS)
   - As long as DNS records are correct, it should work

---

### Step 5: Test DNS Resolution

Wait 5-15 minutes for DNS propagation, then test:

```bash
# Check root domain (should return Vercel IP)
dig getappshots.com +short

# Check www subdomain (should return Vercel CNAME)
dig www.getappshots.com +short

# Check Clerk records (should return Clerk services)
dig accounts.getappshots.com +short
dig clerk.getappshots.com +short
```

Or use online tools:
- https://dnschecker.org/
- Enter `getappshots.com` and check A record

---

## Visual Guide: Cloudflare DNS Records Table

After configuration, your Cloudflare DNS should look like this:

| Type | Name | Content | Proxy | TTL | Purpose |
|------|------|---------|-------|-----|---------|
| A | `@` | `[Vercel IP]` | 🔵 Grey | Auto | Root → Vercel |
| CNAME | `www` | `cname.vercel-dns.com` | 🔵 Grey | Auto | WWW → Vercel |
| CNAME | `accounts` | `accounts.clerk.services` | 🔵 Grey | Auto | Clerk accounts |
| CNAME | `clerk` | `frontend-api.clerk.services` | 🔵 Grey | Auto | Clerk API |
| CNAME | `clk._domainkey` | `dkim1.g6n0hy...` | 🔵 Grey | Auto | Clerk DKIM |
| CNAME | `clk2._domainkey` | `dkim2.g6n0hy...` | 🔵 Grey | Auto | Clerk DKIM |
| CNAME | `clkmail` | `mail.g6n0hy...` | 🔵 Grey | Auto | Clerk mail |

**Key**: 🔵 Grey cloud = DNS only (what you want)

---

## Common Questions

### Q: Why keep Cloudflare nameservers?

**A**: Because:
- Your R2 storage is tied to Cloudflare infrastructure
- Cloudflare provides CDN and DDoS protection
- You already have Clerk DNS records configured
- No need to reconfigure everything

### Q: Why "DNS only" (grey cloud) for Vercel?

**A**: Vercel handles its own:
- CDN and caching
- SSL certificates
- Routing and optimization

Cloudflare proxy (orange cloud) can interfere with Vercel's routing. DNS-only mode just routes traffic directly to Vercel.

### Q: Will this affect R2 storage?

**A**: No! R2 storage access is independent of DNS nameservers. Your R2 bucket will continue working as long as:
- Environment variables are set correctly (`R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, etc.)
- R2 credentials are valid

### Q: What about the "nameserver" warning in Vercel?

**A**: You can safely ignore it. Vercel shows this warning because your nameservers point to Cloudflare, not Vercel. As long as:
- DNS records in Cloudflare point to Vercel correctly
- Domain resolves correctly (test with `dig`)
- Vercel shows "Valid Configuration"

...everything will work fine.

---

## Troubleshooting

### Issue: Domain doesn't resolve to Vercel

**Check**:
1. Verify A record IP matches Vercel's IP exactly
2. Verify proxy status is grey (DNS only)
3. Wait 10-15 minutes for DNS propagation
4. Check DNS resolution: `dig getappshots.com +short`

### Issue: Clerk authentication not working

**Check**:
1. Verify Clerk DNS records still exist in Cloudflare
2. Verify all Clerk records have grey cloud (DNS only)
3. Check Clerk Dashboard → Settings → Paths:
   - Ensure `https://getappshots.com` is in allowed origins
   - Ensure `https://www.getappshots.com` is in allowed origins

### Issue: R2 storage not accessible

**Check**:
1. R2 credentials in environment variables
2. `R2_ACCOUNT_ID`, `R2_BUCKET_NAME` are correct
3. R2 bucket is accessible from your application
4. DNS nameservers have no effect on R2 access

---

## Quick Checklist

- [ ] Got Vercel IP address from Vercel Dashboard
- [ ] Updated Cloudflare A record for root domain to Vercel IP
- [ ] Set root domain A record to "DNS only" (grey cloud)
- [ ] Added/updated WWW CNAME record to `cname.vercel-dns.com`
- [ ] Set WWW CNAME to "DNS only" (grey cloud)
- [ ] Verified all Clerk DNS records exist and are "DNS only"
- [ ] Kept Cloudflare nameservers (didn't change them)
- [ ] Waited 5-15 minutes for DNS propagation
- [ ] Tested DNS resolution (`dig getappshots.com`)
- [ ] Verified domain loads correctly
- [ ] Tested Clerk authentication

---

## Summary

✅ **Keep**: Cloudflare nameservers  
✅ **Update**: DNS records in Cloudflare to point to Vercel  
✅ **Set**: All Vercel records to "DNS only" (grey cloud)  
✅ **Keep**: All Clerk DNS records as-is  

Your R2 storage will continue working normally because it's independent of DNS configuration.

---

**Status**: Setup guide created  
**Next Action**: Follow steps above to configure Cloudflare DNS for Vercel  
**Expected Result**: Domain resolves to Vercel while maintaining Cloudflare DNS and R2 access