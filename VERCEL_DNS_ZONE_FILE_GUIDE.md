# Upload DNS Zone File to Vercel - Complete Guide

This guide explains how to create and upload a DNS zone file to Vercel for `getappshots.com`.

---

## What is a DNS Zone File?

A DNS zone file is a text file in BIND format that contains all DNS records for your domain. Uploading a zone file allows you to bulk-configure all DNS records at once instead of adding them one by one.

---

## ⚠️ Important: When to Use This Approach

**Use this zone file approach ONLY if:**
- You want to use **Vercel's nameservers** for DNS management
- You are **NOT** using Cloudflare for DNS/CDN/R2 storage

**If you're using Cloudflare for DNS** (especially for R2 storage):
- **DO NOT** upload this zone file to Vercel
- **Keep Cloudflare nameservers** and manage DNS in Cloudflare
- See `CLOUDFLARE_DNS_VERCEL_SETUP.md` for Cloudflare DNS configuration

---

## Prerequisites

1. **Domain added to Vercel**: Your domain `getappshots.com` must be added to your Vercel project
2. **Vercel IP Address**: Get the IP address from Vercel Dashboard → Settings → Domains → `getappshots.com`
3. **Clerk DNS Values**: Have your Clerk DNS records ready (if using Clerk)
4. **Decision made**: You've decided to use Vercel nameservers (not Cloudflare DNS)

---

## Step 1: Prepare the Zone File

A zone file template has been created: **`getappshots.com.zone`**

### Update Required Values

Before uploading, you need to replace placeholders in the zone file:

#### 1. Vercel IP Address

**Find Vercel IP**:
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Click on `getappshots.com`
3. Look for the **A record** IP address (usually displayed in the DNS configuration section)
4. Copy the IP address

**Replace in zone file**:
- Find: `@    IN A [Vercel IP]`
- Replace `[Vercel IP]` with the actual IP (e.g., `76.76.21.21`)

#### 2. Clerk DKIM Values (Optional - if different)

The zone file includes placeholder Clerk DKIM values. If your Clerk setup uses different values:

1. Go to **Clerk Dashboard** → Settings → **Email** → **Domain Keys**
2. Copy the actual DKIM CNAME targets
3. Update the zone file accordingly

#### 3. Serial Number

- Current: `2025012101` (format: YYYYMMDDnn)
- **Update this** whenever you modify the zone file:
  - Change the date portion (YYYYMMDD) to today's date
  - Increment the sequence number (nn) if you've already updated today

---

## Step 2: Upload via Vercel Dashboard

### Method 1: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**:
   - Navigate to your project
   - Go to **Settings** → **Domains**
   - Click on `getappshots.com`

2. **Open DNS Records**:
   - Click on **"DNS Records"** tab
   - Look for the **"Upload Zone File"** button (usually near "Add DNS Preset")

3. **Upload the File**:
   - Click **"Upload Zone File"**
   - Select `getappshots.com.zone` from your computer
   - Click **"Upload"** or **"Import"**

4. **Review Conflicts**:
   - Vercel will check for conflicts with existing records
   - If conflicts exist, you'll see a warning
   - Review and resolve conflicts before proceeding

5. **Confirm Upload**:
   - Review the records that will be imported
   - Click **"Confirm"** or **"Import Records"**

### Method 2: Using Vercel CLI

If you prefer using the command line:

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Import DNS zone file
vercel dns import getappshots.com getappshots.com.zone
```

---

## Step 3: Verify Upload

After uploading:

1. **Check DNS Records**:
   - Go back to Vercel Dashboard → Settings → Domains → DNS Records
   - Verify all records were imported correctly

2. **Verify Nameservers**:
   - Ensure your domain is using Vercel's nameservers:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`
   - If not, update them at your domain registrar

3. **Test DNS Resolution**:
   ```bash
   # Check A record
   dig getappshots.com +short
   
   # Check CNAME records
   dig www.getappshots.com +short
   dig accounts.getappshots.com +short
   dig clerk.getappshots.com +short
   ```

---

## Zone File Format Explained

### Required Sections

1. **`$ORIGIN`**: The base domain (e.g., `getappshots.com.`)
   - Note the trailing dot (`.`)

2. **`$TTL`**: Default Time To Live (in seconds)
   - `3600` = 1 hour

3. **SOA Record**: Start of Authority
   - Defines the authoritative nameserver
   - Includes serial number, refresh, retry, expire, and minimum TTL values

4. **NS Records**: Nameserver records
   - Specifies which nameservers handle the domain

5. **A/CNAME Records**: Your actual DNS records
   - A records point to IP addresses
   - CNAME records point to other domain names

### Format Rules

- **Fully Qualified Domain Names (FQDNs)** must end with a dot (`.`)
- **Root domain** can be represented as `@` or the domain name
- **TTL values** are optional per record (uses `$TTL` if omitted)
- **Comments** start with `;`

---

## Common Issues and Solutions

### Issue: "Conflict detected" during upload

**Symptoms**: Vercel prevents upload due to conflicting records

**Solutions**:
1. **Remove conflicting records** in Vercel first
2. **Update the zone file** to match existing records
3. **Upload records individually** instead of using zone file

### Issue: "Invalid zone file format"

**Symptoms**: Vercel rejects the file format

**Solutions**:
1. Ensure file uses BIND format (RFC 1035)
2. Check that all FQDNs end with a dot (`.`)
3. Verify SOA record is properly formatted
4. Ensure no syntax errors (missing semicolons, quotes, etc.)

### Issue: "Nameservers not configured"

**Symptoms**: Records upload but don't resolve

**Solutions**:
1. Update nameservers at your domain registrar to Vercel's nameservers
2. Wait for DNS propagation (5-60 minutes)
3. Verify nameservers using: `dig getappshots.com NS +short`

### Issue: "Clerk authentication not working after upload"

**Symptoms**: Clerk redirects fail

**Solutions**:
1. Verify Clerk CNAME records were imported correctly
2. Check Clerk Dashboard → Settings → Paths for allowed origins
3. Ensure domain is added to Clerk's allowed origins list
4. Wait for DNS propagation

---

## Zone File Structure for getappshots.com

The zone file includes:

✅ **Vercel Records**:
- Root domain A record → Vercel IP
- WWW CNAME → Vercel

✅ **Clerk Records**:
- `accounts` CNAME → `accounts.clerk.services`
- `clerk` CNAME → `frontend-api.clerk.services`
- `clk._domainkey` CNAME → Clerk DKIM
- `clk2._domainkey` CNAME → Clerk DKIM
- `clkmail` CNAME → Clerk mail

---

## Quick Checklist

- [ ] Vercel IP address obtained from Vercel Dashboard
- [ ] Zone file updated with actual Vercel IP address
- [ ] Clerk DKIM values verified (if different)
- [ ] Serial number updated to current date
- [ ] Zone file saved as `getappshots.com.zone`
- [ ] Domain added to Vercel project
- [ ] Zone file uploaded via Vercel Dashboard or CLI
- [ ] DNS records verified in Vercel Dashboard
- [ ] Nameservers updated to Vercel's nameservers (if needed)
- [ ] DNS propagation verified using `dig` or online tools
- [ ] Domain resolves correctly
- [ ] Clerk authentication works

---

## Alternative: Manual Record Addition

If zone file upload doesn't work or you prefer manual setup:

1. **Add records one by one** in Vercel Dashboard
2. **Follow the guide**: `CLOUDFLARE_DNS_VERCEL_SETUP.md` for Cloudflare setup
3. **Or**: Use the DNS records table in Vercel to add each record individually

---

## Reference: Zone File Template

See `getappshots.com.zone` for the complete template with:
- Proper BIND format
- All required records
- Comments explaining each section
- Placeholders for values you need to update

---

**Status**: Zone file template created  
**Next Action**: Update placeholders and upload to Vercel  
**Expected Result**: All DNS records imported and domain resolving correctly