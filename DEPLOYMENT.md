# TaskFlow - Single Container Deployment Guide

## Overview

This application now uses a **single Docker container** that includes both the React frontend and FastAPI backend. This simplifies deployment, especially for CRC (CodeReady Containers).

## Architecture

- **Single Container**: Frontend built and served by backend
- **Port**: 8080 (serves both API and UI)
- **Database**: SQLite (embedded, no external DB needed)
- **Resources**: ~256Mi RAM, ~100m CPU

## Local Development

### Option 1: Run with Script (Production-like)
```bash
./run.sh
```
Access at: http://localhost:8080

### Option 2: Development Mode (Hot Reload)
Terminal 1 - Backend:
```bash
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
Access at: http://localhost:3000

## Docker Build & Run

### Build the Image
```bash
docker build -t taskflow:latest .
```

### Run the Container
```bash
docker run -p 8080:8080 taskflow:latest
```

Access at: http://localhost:8080

## CRC Deployment

### Prerequisites
- CRC installed and running
- `oc` CLI configured

### Step 1: Login to CRC
```bash
crc start
eval $(crc oc-env)
oc login -u developer https://api.crc.testing:6443
```

### Step 2: Create Project
```bash
oc new-project taskflow
```

### Step 3: Build Image in CRC
```bash
# Create BuildConfig
oc new-build --name=taskflow --binary --strategy=docker

# Start build from local directory
oc start-build taskflow --from-dir=. --follow
```

### Step 4: Deploy Application
```bash
# Apply all manifests
oc apply -f openshift/deployment.yaml
oc apply -f openshift/service.yaml
oc apply -f openshift/route.yaml
```

### Step 5: Get Application URL
```bash
oc get route taskflow
```

Access your app at the provided URL!

## OpenShift Files

### deployment.yaml
- Single pod deployment
- Health checks configured
- Resource limits: 512Mi RAM, 500m CPU

### service.yaml
- ClusterIP service
- Exposes port 8080

### route.yaml
- External access
- TLS enabled (edge termination)

## Simplified Structure

```
.
├── Dockerfile              # Single multi-stage build
├── backend/
│   ├── main.py            # FastAPI app (serves frontend)
│   ├── database.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   └── package.json
└── openshift/
    ├── deployment.yaml    # Single deployment
    ├── service.yaml       # Single service
    └── route.yaml         # Single route
```

## Old Files (Can be Removed)

The following files are no longer needed:
- `backend/Dockerfile` (replaced by root Dockerfile)
- `frontend/Dockerfile` (replaced by root Dockerfile)
- `openshift/backend-deployment.yaml` (replaced by deployment.yaml)
- `openshift/frontend-deployment.yaml` (replaced by deployment.yaml)
- `openshift/backend-service.yaml` (replaced by service.yaml)
- `openshift/frontend-service.yaml` (replaced by service.yaml)

## Benefits of Single Container

✅ **Simpler deployment** - One pod instead of two
✅ **Lower resource usage** - ~50% less memory
✅ **No CORS issues** - Same origin for API and UI
✅ **Easier networking** - No inter-service communication
✅ **Perfect for CRC** - Minimal footprint
✅ **Faster startup** - Single container to pull and start

## API Endpoints

All endpoints available at `http://<your-route>/api/`:

- `GET /api/health` - Health check
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Mark complete
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/stats` - Get statistics
- `PUT /api/tasks/{id}/priority` - Update priority

## Troubleshooting

### Check Pod Status
```bash
oc get pods
oc logs -f <pod-name>
```

### Check Service
```bash
oc get svc
oc describe svc taskflow
```

### Check Route
```bash
oc get route
oc describe route taskflow
```

### Rebuild Image
```bash
oc start-build taskflow --from-dir=. --follow
```

### Delete and Redeploy
```bash
oc delete all -l app=taskflow
oc apply -f openshift/
```

## Resource Requirements

**Minimum (CRC):**
- CPU: 100m request, 500m limit
- Memory: 256Mi request, 512Mi limit

**CRC Default Resources:**
- 4 vCPUs
- 9GB RAM

Your app uses **less than 10%** of CRC capacity!

## Next Steps

1. Build the Docker image
2. Deploy to CRC
3. Access via the route URL
4. Monitor with `oc get pods -w`

Happy deploying! 🚀