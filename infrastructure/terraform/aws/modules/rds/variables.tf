variable "name" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "db_name" { type = string }
variable "username" { type = string }
variable "password" {
  type      = string
  sensitive = true
}
variable "instance_class" { type = string }
variable "allocated_storage" { type = number }
variable "tags" { type = map(string) default = {} }

