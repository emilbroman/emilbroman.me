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

resource "google_artifact_registry_repository" "this" {
  location      = "europe-north1"
  repository_id = "website"
  description   = "Website at https://emilbroman.me"
  format        = "DOCKER"
}

resource "google_service_account" "this" {
  account_id   = "website"
  display_name = "Website at https://emilbroman.me"
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

resource "google_artifact_registry_repository_iam_member" "member" {
  repository = google_artifact_registry_repository.this.id
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.this.email}"
}
