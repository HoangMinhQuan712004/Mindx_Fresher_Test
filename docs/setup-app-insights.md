# Setup Guide: Azure Application Insights

This guide explains how to set up and verify Application Insights for the MindX Onboarding backend.

## 1. Backend Integration (Node.js)

### Installation
```bash
cd api
npm install applicationinsights
```

### Configuration (api/src/index.ts)
The SDK must be initialized at the very top of the entry point to capture all telemetry:

```typescript
import * as appInsights from 'applicationinsights';
import * as dotenv from 'dotenv';
dotenv.config();

appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoCollectRequests(true)
    .setAutoCollectExceptions(true)
    .setSendLiveMetrics(true)
    .start();
```

### Hardening for 100% Reliability
In ESM/TypeScript environments, manual tracking is required in the error handler to ensure all failures are recorded:

```typescript
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (appInsights.defaultClient) {
        // Force track as Request Failure
        appInsights.defaultClient.trackRequest({
            name: `${req.method} ${req.url}`,
            resultCode: "500",
            success: false
        });
        // Track Exception details
        appInsights.defaultClient.trackException({ exception: err });
    }
    res.status(500).send("Internal Server Error");
});
```

## 2. Infrastructure Deployment
Ensure the `APPLICATIONINSIGHTS_CONNECTION_STRING` is provided to the Kubernetes pods via Secrets.

### Deployment Commands
```bash
cd api
docker build -t <your-registry>/mindx-api:v23 .
docker push <your-registry>/mindx-api:v23
kubectl apply -f k8s/api.yaml
```

## 3. Verification
- Open **Azure Portal** -> **Application Insights** -> **Live Metrics**.
- Trigger the `/api/test-error` endpoint.
- You should see "Red dots" appearing in real-time.
