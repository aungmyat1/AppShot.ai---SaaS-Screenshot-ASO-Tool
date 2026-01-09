resource "aws_security_group" "redis" {
  name        = "${var.name}-redis-sg"
  description = "ElastiCache Redis security group"
  vpc_id      = var.vpc_id
  tags        = merge(var.tags, { Name = "${var.name}-redis-sg" })
}

resource "aws_elasticache_subnet_group" "this" {
  name       = "${var.name}-redis-subnets"
  subnet_ids = var.private_subnet_ids
  tags       = var.tags
}

resource "aws_elasticache_parameter_group" "this" {
  name   = "${var.name}-redis-params"
  family = "redis7"
  tags   = var.tags
}

resource "aws_elasticache_replication_group" "this" {
  replication_group_id       = "${var.name}-redis"
  description                = "Redis for ${var.name}"
  engine                     = "redis"
  engine_version             = "7.1"
  node_type                  = var.node_type
  port                       = 6379
  parameter_group_name       = aws_elasticache_parameter_group.this.name
  subnet_group_name          = aws_elasticache_subnet_group.this.name
  security_group_ids         = [aws_security_group.redis.id]
  automatic_failover_enabled = false
  num_cache_clusters         = 1
  at_rest_encryption_enabled = true
  transit_encryption_enabled = false

  tags = var.tags
}

