variable "cloudflare_api_token" {
  type        = string
  sensitive   = true
  description = "Cloudflare API token"
}

variable "account_id" {
  type        = string
  description = "Cloudflare account id"
}

variable "bucket_name" {
  type        = string
  description = "R2 bucket name"
}

