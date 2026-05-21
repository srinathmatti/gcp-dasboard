# GKE Cost & Management Dashboard

A modern, full-stack dashboard designed to monitor and manage Google Kubernetes Engine (GKE) clusters, nodepools, and pod metrics, alongside GCP billing and cost estimation.

The stack comprises:
- **Backend**: FastAPI (Python 3.11) with GCP/GKE SDKs and Kubernetes API client.
- **Frontend**: React + Vite (Node.js 20) with live metric tracking.

---

## 🚀 Quick Start with Docker & Docker Compose

Running the entire environment in Docker is simple. The configuration mounts your local Google Cloud Application Default Credentials (ADC) directly into the backend container, allowing seamless authentication without baking keys into the image.

### 📋 Prerequisites
1. **Docker & Docker Compose** installed.
2. **Google Cloud SDK (`gcloud`)** installed on your host machine.
3. Authenticated Google Application Default Credentials:
   ```bash
   gcloud auth application-default login
   ```

---

### 🛠️ Configuration
Before starting, update the list of GCP projects you want the dashboard to monitor in [backend/config.yaml](file:///Users/smatti/work/gcp-dasboard/backend/config.yaml):

```yaml
projects:
  - your-gcp-project-id-1
  - your-gcp-project-id-2
```

---

### 🏃 Running the Application

1. **Build the containers**:
   ```bash
   docker compose build
   ```

2. **Spin up the services in background mode**:
   ```bash
   docker compose up -d
   ```

3. **Monitor logs**:
   ```bash
   docker compose logs -f
   ```

4. **Stop the services**:
   ```bash
   docker compose down
   ```

---

## 🔍 Verification & Usage

Once running, you can access the applications at:
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173) (includes live reloading upon saving frontend files).
- **Backend FastAPI documentation**: [http://localhost:8000/docs](http://localhost:8000/docs) (interactive Swagger UI to test endpoints).

---

## 🔑 Custom GCP Credentials Setup (Alternative)

If you do not want to mount `~/.config/gcloud` or are running on a CI/CD server, you can pass a Service Account JSON key:

1. Place your GCP Service Account JSON key inside the `backend` folder (e.g., `backend/service-account.json`).
2. Update the `backend` service definition in `docker-compose.yml`:
   ```yaml
   environment:
     - GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json
   volumes:
     - ./backend/service-account.json:/app/service-account.json:ro
   ```

---

## 🛠️ Troubleshooting

### 1. `CredentialsNotLocal` or `FileNotFoundError`
Make sure you ran `gcloud auth application-default login` on your host machine. This generates the `application_default_credentials.json` file in `~/.config/gcloud/`.

### 2. GKE API Permissions
Ensure your authenticated GCP identity or service account has the following IAM roles in the target projects:
- **Kubernetes Engine Viewer** (`roles/container.viewer`) or **Kubernetes Engine Admin**
- **Project Viewer** (`roles/viewer`)
- **Billing Account Viewer** (if pulling billing/cost metrics)