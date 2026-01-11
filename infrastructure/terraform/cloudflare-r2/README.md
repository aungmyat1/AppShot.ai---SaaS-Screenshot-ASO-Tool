## Terraform • Cloudflare R2 (optional)

Use this stack if you want Terraform to create and manage your **Cloudflare R2 bucket** (S3-compatible storage).

### Requirements
- Cloudflare account
- API token with R2 permissions

### Usage

```bash
cd infrastructure/terraform/cloudflare-r2
terraform init
terraform apply -var="account_id=..." -var="bucket_name=getappshots"
```

Then configure the app with:
- `STORAGE_ENDPOINT_URL` (your R2 endpoint)
- `STORAGE_BUCKET`
- `STORAGE_ACCESS_KEY_ID`
- `STORAGE_SECRET_ACCESS_KEY`
- `STORAGE_PUBLIC_BASE_URL` (optional)

