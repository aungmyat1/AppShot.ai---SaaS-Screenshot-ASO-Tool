resource "cloudflare_r2_bucket" "this" {
  account_id = var.account_id
  name       = var.bucket_name
}

output "bucket_name" {
  value = cloudflare_r2_bucket.this.name
}

