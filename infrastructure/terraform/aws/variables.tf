variable "project" {
  type        = string
  description = "Project name (used for naming)"
  default     = "getappshots"
}

variable "region" {
  type        = string
  description = "AWS region"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Environment name (dev/staging/prod)"
  default     = "staging"
}

variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR"
  default     = "10.20.0.0/16"
}

variable "k8s_version" {
  type        = string
  description = "EKS Kubernetes version"
  default     = "1.29"
}

variable "db_instance_class" {
  type        = string
  description = "RDS instance class"
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  type        = number
  description = "RDS storage (GB)"
  default     = 50
}

variable "db_name" {
  type        = string
  description = "Database name"
  default     = "getappshots"
}

variable "db_username" {
  type        = string
  description = "Database username"
  default     = "postgres"
}

variable "db_password" {
  type        = string
  description = "Database password (use TF_VAR_db_password or a secrets manager)"
  sensitive   = true
}

variable "redis_node_type" {
  type        = string
  description = "ElastiCache node type"
  default     = "cache.t4g.micro"
}

variable "domain_name" {
  type        = string
  description = "Route53 domain (optional). Example: getappshots.com"
  default     = ""
}

variable "create_s3_cdn" {
  type        = bool
  description = "Create S3 + CloudFront (optional)"
  default     = false
}

