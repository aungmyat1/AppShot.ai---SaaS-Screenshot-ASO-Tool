## Monitoring & logging (scaffold)

Terraform installs `kube-prometheus-stack` (Grafana + Prometheus) by default in the AWS stack.

If you want production logging:
- **CloudWatch Container Insights** (AWS-native), or
- **ELK/EFK** (Elasticsearch/OpenSearch + Fluent Bit + Kibana), or
- **Loki** (Grafana Loki + Promtail)

This repo keeps manifests light and relies on Terraform Helm releases for cluster add-ons.

