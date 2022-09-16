terraform {
  backend "gcs" {
    bucket = "emilbroman-terraform-state"
    prefix = "website"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">=4.36.0"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">=2.13.1"
    }

    github = {
      source  = "integrations/github"
      version = ">=5.0.0"
    }
  }
}

provider "github" {
  owner = "emilbroman"
}

provider "google" {
  project = "emilbroman"
  region  = "europe-north1"
  zone    = "europe-north1-a"
}

data "google_client_config" "current" {}

locals {
  project = data.google_client_config.current.project
  region  = data.google_client_config.current.region
}

data "terraform_remote_state" "cloud" {
  backend = "gcs"

  config = {
    bucket = "emilbroman-terraform-state"
    prefix = "cloud-infrastructure"
  }
}

data "terraform_remote_state" "mesh" {
  backend = "gcs"

  config = {
    bucket = "emilbroman-terraform-state"
    prefix = "mesh"
  }
}

provider "kubernetes" {
  host                   = data.terraform_remote_state.cloud.outputs.cluster_url
  cluster_ca_certificate = base64decode(data.terraform_remote_state.cloud.outputs.cluster_ca_certificate)
  token                  = data.google_client_config.current.access_token
}

resource "google_artifact_registry_repository" "this" {
  location      = local.region
  repository_id = "website"
  description   = "Website at https://emilbroman.me"
  format        = "DOCKER"
}

resource "google_service_account" "this" {
  account_id   = "website"
  display_name = "Website"
  description  = "Website at https://emilbroman.me"
}

resource "google_service_account_key" "this" {
  service_account_id = google_service_account.this.name
}

data "github_repository" "this" {
  full_name = "emilbroman/emilbroman.me"
}

resource "github_actions_secret" "this" {
  repository      = data.github_repository.this.name
  secret_name     = "GOOGLE_APPLICATION_CREDENTIALS"
  plaintext_value = google_service_account_key.this.private_key
}

resource "google_artifact_registry_repository_iam_member" "writer" {
  repository = google_artifact_registry_repository.this.id
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.this.email}"
}

resource "google_artifact_registry_repository_iam_member" "reader" {
  repository = google_artifact_registry_repository.this.id
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${data.terraform_remote_state.cloud.outputs.cluster_service_account}"
}

resource "google_project_iam_member" "deployer" {
  project = local.project
  role    = "roles/container.clusterViewer"
  member  = "serviceAccount:${google_service_account.this.email}"
}

resource "kubernetes_role_v1" "deployer" {
  metadata {
    name = "website-deployer"
  }

  rule {
    api_groups = ["apps"]
    resources  = ["deployments"]
    verbs      = ["get", "patch"]
  }
}

resource "kubernetes_role_binding_v1" "deployer" {
  metadata {
    name = "website-deployer"
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role_v1.deployer.metadata[0].name
  }
  subject {
    api_group = "rbac.authorization.k8s.io"
    kind      = "User"
    name      = google_service_account.this.email
  }
}

locals {
  labels = {
    "emilbroman.me/app" = "website"
  }
}

resource "kubernetes_deployment_v1" "this" {
  metadata {
    name   = "website"
    labels = local.labels
  }

  spec {
    replicas = 1

    selector {
      match_labels = local.labels
    }

    template {
      metadata {
        name   = "website"
        labels = local.labels
      }

      spec {
        container {
          name  = "website"
          image = "${local.region}-docker.pkg.dev/${local.project}/${google_artifact_registry_repository.this.repository_id}/website:latest"

          port {
            container_port = 80
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "this" {
  metadata {
    name   = "website"
    labels = local.labels
  }

  spec {
    selector = local.labels

    port {
      port        = 80
      target_port = 80
    }
  }
}

resource "kubernetes_ingress_v1" "this" {
  metadata {
    name = "website"
  }

  spec {
    ingress_class_name = data.terraform_remote_state.mesh.outputs.ingress_class

    rule {
      host = "emilbroman.me"

      http {
        path {
          backend {
            service {
              name = kubernetes_service_v1.this.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }
}
