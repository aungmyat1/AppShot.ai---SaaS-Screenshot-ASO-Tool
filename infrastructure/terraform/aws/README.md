## Terraform • AWS (EKS + RDS + ElastiCache + S3/CloudFront + Route53)

This is a **starter, production-shaped** IaC layout. It is intentionally parameterized and uses safe defaults.

### What it provisions

- VPC (public/private subnets, NAT, routing)
- EKS cluster + managed node group
- RDS Postgres (private subnets)
- ElastiCache Redis (private subnets)
- S3 bucket + CloudFront distribution (optional)
- Route53 record(s) (optional)
- IRSA roles (scaffold) for pods to access AWS services (optional)

### Optional: Cloudflare R2

R2 is **S3-compatible storage**. In this repo, the app can talk to either AWS S3 or Cloudflare R2 via env vars.
If you want Terraform to create the R2 bucket too, use the `cloudflare-r2` stack under `../cloudflare-r2`.

### Quick start (example)

```bash
cd infrastructure/terraform/aws
terraform init
terraform plan -var="project=getappshots" -var="region=us-east-1"
terraform apply
```

### Notes
- You must configure AWS credentials for Terraform (OIDC/assume-role recommended).
- Kubernetes manifests live at `infrastructure/k8s` and are designed for EKS + NGINX ingress.

