# Step-by-Step Setup Guide (From Scratch)

## Prerequisites
*   **Azure CLI** installed and logged in (`az login`).
*   **Docker Desktop** installed.
*   **Kubectl** installed.

## Step 1: Create Azure Resources

 Run the following commands to provision the infrastructure:

```bash
# 1. Define Variables
RESOURCE_GROUP="mindx-intern-02-rg"
LOCATION="southeastasia"
ACR_NAME="hoangminhquan01"    
AKS_NAME="mindx-aks-cluster"

# 2. Create Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

# 3. Create Azure Container Registry (ACR)
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

# 4. Create AKS Cluster (1 Node for cost saving)
az aks create \
    --resource-group $RESOURCE_GROUP \
    --name $AKS_NAME \
    --node-count 1 \
    --enable-addons monitoring \
    --generate-ssh-keys

# 5. Connect AKS to ACR (Allow pulling images)
az aks update -n $AKS_NAME -g $RESOURCE_GROUP --attach-acr $ACR_NAME

# 6. Get credentials for kubectl
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_NAME
```

## Step 2: Install Cluster Controllers

We need **Ingress Nginx** (to route traffic) and **Cert-Manager** (for SSL).

```bash
# 1. Install Nginx Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml

# 2. Configure Azure Health Probe (Required for AKS Load Balancer)
kubectl annotate service ingress-nginx-controller -n ingress-nginx \
  service.beta.kubernetes.io/azure-load-balancer-health-probe-request-path=/healthz

# 3. Install Cert-Manager (for HTTPS)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.4/cert-manager.yaml
```

---

# Build & Deployment

## Step 3: Build & Push Docker Images

**Backend (API):**
```bash
cd api
docker build -t hoangminhquan01.azurecr.io/mindx-api:v6 .
docker push hoangminhquan01.azurecr.io/mindx-api:v6
```

**Frontend:**
```bash
cd frontend
docker build -t hoangminhquan01.azurecr.io/mindx-frontend:v11 .
docker push hoangminhquan01.azurecr.io/mindx-frontend:v11
```

## Step 4: Apply Kubernetes Manifests

```bash
cd k8s

# 1. Deploy API and Frontend
kubectl apply -f api.yaml
kubectl apply -f frontend.yaml

# 2. Setup SSL (ClusterIssuer) and Routing (Ingress)
kubectl apply -f cluster-issuer.yaml
kubectl apply -f ingress.yaml
```

## Step 5: Verify Deployment

Find your External IP:
```bash
kubectl get ingress
```
*   **Result:** `mindx.<20.6.50.12>.nip.io`
*   Open this URL in your browser to verify HTTPS and Login.
