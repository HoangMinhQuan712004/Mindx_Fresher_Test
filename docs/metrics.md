# Metrics & Monitoring Documentation

This document outlines the monitoring setup for the MindX Onboarding application as part of the Week 2 requirements.

## 1. Production Metrics (Azure Application Insights)

We have integrated **Azure Application Insights** to monitor the health, performance, and reliability of the backend API.

### Setup Details
- **SDK**: `applicationinsights` (Node.js)
- **Status**: Integrated & Initialized
- **Resource Name**: `mindx-app-insights`
- **Region**: Southeast Asia

### Monitored Indicators
- **Requests**: All incoming HTTP requests are tracked (Response time, Success rate).
- **Exceptions**: All server-side errors are automatically captured with full stack traces.
- **Dependencies**: Outgoing calls (e.g., to MindX ID OIDC) are monitored for latency.
- **Performance**: CPU, Memory, and Event Loop metrics are collected.
- **Console Logs**: `console.log` and `console.error` are mirrored to Azure.

### Verification Endpoint
I have added a dedicated test endpoint to trigger a deliberate error for monitoring verification:
- **URL**: `https://20.6.50.12.sslip.io/api/test-error` (or `http://localhost:3000/api/test-error`)
- **Behavior**: Returns a `500 Internal Server Error` and logs a custom exception to App Insights.

## 2. Accessing Metrics

### For Mentors
To view the metrics, please access the Azure Portal and navigate to the **Application Insights** resource provided in the project group.

- **Dashboard**: Use the "Application Map" to see service dependencies.
- **Logs**: Use "Transaction Search" to filter by errors or specific request IDs.
- **Live Metrics**: Use "Live Metrics" for real-time monitoring of traffic and server load.

## 3. Azure Alerts Configuration

To fulfill the requirement of "Alerts are setup and tested", follow these steps to create a **Metric Alert** on the Azure Portal.

### Step 1: Create an Action Group (Who to notify)
1. In the Azure Portal, search for **"Monitor"** -> **"Alerts"**.
2. Click **"Action groups"** -> **"+ Create"**.
3. **Basics**: Select your Subscription and Resource Group (`mindx-intern-02-rg`).
4. **Notifications**: Select **"Email/SMS message/Push/Voice"**, give it a name (e.g., "Notify-Admin"), and enter your email.
5. Click **"Review + create"**.

### Step 2: Create a Server Error Alert (High Failure Rate)
1. Go to your **Application Insights** (`mindx-app-insights`) -> **"Alerts"** -> **"+ Create"** -> **"Alert rule"**.
2. **Condition**: 
   - Signal: **"Failed requests"** (Search for it).
   - Threshold: **Static**.
   - Aggregation: **Count**.
   - Operator: **Greater than**.
   - Threshold value: **5**.
   - Unit: **Count**.
   - Granularity: **5 minutes**.
3. **Actions**: Select the Action Group you created in Step 1.
4. **Details**: Name it `Alert-High-Failure-Rate` and set Severity to **1 (Error)**.
5. Click **"Create"**.

### Step 3: Create a Performance Alert (Slow Response)
1. Create another Alert rule.
2. **Condition**: 
   - Signal: **"Server response time"**.
   - Operator: **Greater than**.
   - Threshold value: **2000** (meaning 2 seconds).
3. **Actions**: Select the same Action Group.
4. **Details**: Name it `Alert-Slow-Response-Time` and set Severity to **2 (Warning)**.

## 4. Product Metrics (Google Analytics 4)

We use **Google Analytics 4 (GA4)** to track user engagement and interactions within the frontend application.

### Setup Details
- **Library**: `react-ga4`
- **Status**: Integrated & Initialized
- **Measurement ID**: Configured via environment variable.

### Tracked Events
- **Page Views**: Automatically tracked on component mount (e.g., Dashboard).
- **Authentication Events**: Tracks when a user performs a logout action (Event Category: `Auth`, Action: `Logout`).

## 5. Verification & Testing

### Azure Alerts
1. Trigger the test endpoint: `curl https://20.6.50.12.sslip.io/api/test-error` (Run this 10 times in a row).
2. Wait 5-10 minutes.
3. Check your **Email** for a notification from Microsoft Azure containing the alert details.
4. Go to **"Alerts"** in the Azure Portal to see the "Fired" status of your rules.

### Google Analytics
1. Access the application and navigate through different pages.
2. Go to **Google Analytics Portal** -> **Reports** -> **Realtime**.
3. Verify that active users and event counts (like `Logout`) appear in the dashboard.
