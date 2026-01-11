output "bucket_name" {
  value = aws_s3_bucket.assets.bucket
}

output "cdn_domain" {
  value = aws_cloudfront_distribution.cdn.domain_name
}

