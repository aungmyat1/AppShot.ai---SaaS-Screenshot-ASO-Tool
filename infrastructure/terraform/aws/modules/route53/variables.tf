variable "zone_name" { type = string }
variable "record_name" {
  type        = string
  description = "Record name (e.g. app.example.com). Leave empty to create no record."
  default     = ""
}
variable "record_value" {
  type        = string
  description = "Target (e.g. ALB DNS name). Leave empty to create no record."
  default     = ""
}
variable "tags" { type = map(string) default = {} }

