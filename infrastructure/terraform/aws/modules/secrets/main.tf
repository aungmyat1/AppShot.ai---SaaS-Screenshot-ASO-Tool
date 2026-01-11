resource "aws_secretsmanager_secret" "app" {
  name                    = "${var.name}/app-secrets"
  recovery_window_in_days = 7
  tags                    = var.tags
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id
  secret_string = jsonencode({
    # Placeholder keys; wire to ExternalSecrets/CSI driver in production.
    DATABASE_URL = var.database_url
    REDIS_URL    = var.redis_url
  })
}

