# Architecture

*   **Frontend**: React (Vite) + TypeScript. Hosted on a lightweight Node.js container (`sirv-cli`).
*   **Backend**: Node.js + Express + TypeScript. Implements the **BFF (Backend for Frontend)** pattern to safely handle OIDC tokens.
*   **Infrastructure**: Azure AKS, ACR, Nginx Ingress, Cert-Manager.
*   **Auth**: OpenID Connect (OIDC) via MindX Identity Server.

## Project Structure

```
week1/
├── api/                # Backend Source Code (Express + TypeScript)
├── frontend/           # Frontend Source Code (React + Vite)
└── k8s/                # Kubernetes Manifests
    ├── api.yaml        # Defines Backend Deployment & Service
    ├── frontend.yaml   # Defines Frontend Deployment & Service
    ├── ingress.yaml    # Configures Nginx Routing & HTTPS
    └── cluster-issuer.yaml # Configures Let's Encrypt SSL
```
