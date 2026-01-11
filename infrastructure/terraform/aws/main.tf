locals {
  name = "${var.project}-${var.environment}"
  tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

module "network" {
  source      = "./modules/network"
  name        = local.name
  cidr_block  = var.vpc_cidr
  region      = var.region
  tags        = local.tags
}

module "eks" {
  source              = "./modules/eks"
  name                = local.name
  region              = var.region
  kubernetes_version  = var.k8s_version
  vpc_id              = module.network.vpc_id
  private_subnet_ids  = module.network.private_subnet_ids
  public_subnet_ids   = module.network.public_subnet_ids
  tags                = local.tags
}

module "rds" {
  source             = "./modules/rds"
  name               = local.name
  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
  vpc_cidr           = var.vpc_cidr
  db_name            = var.db_name
  username           = var.db_username
  password           = var.db_password
  instance_class     = var.db_instance_class
  allocated_storage  = var.db_allocated_storage
  tags               = local.tags
}

module "redis" {
  source             = "./modules/redis"
  name               = local.name
  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
  vpc_cidr           = var.vpc_cidr
  node_type          = var.redis_node_type
  tags               = local.tags
}

module "s3_cdn" {
  source = "./modules/s3-cdn"
  count  = var.create_s3_cdn ? 1 : 0

  name = local.name
  tags = local.tags
}

module "dns" {
  source     = "./modules/route53"
  count      = var.domain_name != "" ? 1 : 0
  zone_name  = var.domain_name
  # This expects you to point the record at whatever ingress/LB you use (set later).
  tags       = local.tags
}

# WAF (attach to your ingress ALB/NLB via ARN)
module "waf" {
  source       = "./modules/waf"
  name         = local.name
  resource_arn = var.waf_resource_arn
  tags         = local.tags
}

module "secrets" {
  source       = "./modules/secrets"
  name         = local.name
  database_url = "" # store via CI/CD or set here for testing
  redis_url    = "" # store via CI/CD or set here for testing
  tags         = local.tags
}

# Kubernetes/Helm providers (wires Terraform to the new EKS cluster)
data "aws_eks_cluster" "this" {
  name = module.eks.cluster_name
}

data "aws_eks_cluster_auth" "this" {
  name = module.eks.cluster_name
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.this.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.this.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.this.token
}

provider "helm" {
  kubernetes {
    host                   = data.aws_eks_cluster.this.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.this.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.this.token
  }
}

# Monitoring (Prometheus stack) scaffold via Helm
resource "helm_release" "kube_prometheus_stack" {
  name       = "kube-prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = "monitoring"
  create_namespace = true

  # Keep values minimal; customize in production (alerts, retention, ingress).
  set {
    name  = "grafana.enabled"
    value = "true"
  }
}

