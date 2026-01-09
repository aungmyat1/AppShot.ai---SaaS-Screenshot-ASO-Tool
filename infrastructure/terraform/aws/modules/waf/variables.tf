variable "name" { type = string }
variable "tags" { type = map(string) default = {} }

variable "scope" {
  type        = string
  description = "REGIONAL for ALB/API Gateway; CLOUDFRONT for CloudFront"
  default     = "REGIONAL"
}

variable "resource_arn" {
  type        = string
  description = "Optional ARN to associate (e.g., ALB ARN). Leave empty to skip association."
  default     = ""
}

