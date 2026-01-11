data "aws_route53_zone" "this" {
  name         = var.zone_name
  private_zone = false
}

# Placeholder record; wire to your ingress LB hostname after deployment
resource "aws_route53_record" "app" {
  count   = var.record_name != "" && var.record_value != "" ? 1 : 0
  zone_id = data.aws_route53_zone.this.zone_id
  name    = var.record_name
  type    = "CNAME"
  ttl     = 60
  records = [var.record_value]
}

