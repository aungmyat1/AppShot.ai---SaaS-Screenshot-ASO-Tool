variable "name" { type = string }
variable "tags" { type = map(string) default = {} }

variable "database_url" {
  type        = string
  description = "Database URL to store (placeholder)"
  default     = ""
}

variable "redis_url" {
  type        = string
  description = "Redis URL to store (placeholder)"
  default     = ""
}

