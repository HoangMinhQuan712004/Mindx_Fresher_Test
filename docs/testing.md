# Testing Documentation

This document contains comprehensive test cases for the MindX Week 1 full-stack application.

## Test Environment

**Application URL**: `https://20.6.50.12.sslip.io`  
**API Base URL**: `https://20.6.50.12.sslip.io/api`  
**Authentication Provider**: `https://id-dev.mindx.edu.vn`

---

## 1. Infrastructure Tests

### Test Case 1.1: AKS Cluster Health Check
**Objective**: Verify AKS cluster is running and accessible

**Pre-conditions**: 
- `kubectl` configured with AKS credentials
- Azure CLI logged in

**Steps**:
```bash
# 1. Check cluster connectivity
kubectl cluster-info

# 2. Verify all pods are running
kubectl get pods --all-namespaces

# 3. Check ingress controller
kubectl get svc -n ingress-nginx
```

**Expected Results**:
- Cluster info displays successfully
- All pods show `Running` status
- Ingress controller has an external IP assigned

---

### Test Case 1.2: ACR Connection Verification
**Objective**: Verify AKS can pull images from ACR

**Steps**:
```bash
# Check ACR integration
az aks check-acr \
  --name mindx-aks-cluster \
  --resource-group mindx-intern-02-rg \
  --acr hoangminhquan01.azurecr.io
```

**Expected Results**:
- Connection test passes
- No authentication errors

---

## 2. Backend API Tests

### Test Case 2.1: Health Endpoint
**Objective**: Verify API health check endpoint

**Request**:
```bash
curl https://20.6.50.12.sslip.io/api/health
```

**Expected Response**:
```json
{
  "status": "UP",
  "timestamp": "2025-12-29T07:00:00.000Z"
}
```

**Status Code**: `200 OK`

---

### Test Case 2.2: OIDC Configuration Endpoint
**Objective**: Verify backend returns OIDC configuration

**Request**:
```bash
curl https://20.6.50.12.sslip.io/api/auth/config
```

**Expected Response**:
```json
{
  "metadata": {
    "authorization_endpoint": "https://id-dev.mindx.edu.vn/auth",
    "token_endpoint": "https://20.6.50.12.sslip.io/api/auth/token",
    "userinfo_endpoint": "https://20.6.50.12.sslip.io/api/auth/me",
    "jwks_uri": "https://id-dev.mindx.edu.vn/jwks",
    ...
  },
  "authority": "https://id-dev.mindx.edu.vn",
  "clientId": "mindx-onboarding"
}
```

**Verification Points**:
- `token_endpoint` and `userinfo_endpoint` point to backend proxy
- `clientId` is present but `client_secret` is NOT exposed
- Status code: `200 OK`

---

### Test Case 2.3: Protected Route Without Token
**Objective**: Verify protected routes reject unauthenticated requests

**Request**:
```bash
curl https://20.6.50.12.sslip.io/api/me
```

**Expected Response**:
```
No token provided
```

**Status Code**: `401 Unauthorized`

---

### Test Case 2.4: Protected Route With Valid Token
**Objective**: Verify protected routes accept authenticated requests

**Pre-conditions**: 
- User has logged in via frontend
- Valid JWT token obtained

**Request**:
```bash
curl -H "Authorization: Bearer <TOKEN>" \
  https://20.6.50.12.sslip.io/api/me
```

**Expected Response**:
```json
{
  "message": "Xác thực thành công!",
  "user": {
    "email": "user@example.com",
    "sub": "...",
    ...
  }
}
```

**Status Code**: `200 OK`

---

## 3. Frontend Tests

### Test Case 3.1: Homepage Load
**Objective**: Verify frontend application loads successfully

**Steps**:
1. Open browser
2. Navigate to `https://20.6.50.12.sslip.io`
3. Wait for page load

**Expected Results**:
- Page loads without errors
- HTTPS connection (padlock icon visible)
- SSL certificate is valid
- No console errors

---

### Test Case 3.2: Login Page Accessibility
**Objective**: Verify login page is accessible

**Steps**:
1. Navigate to `https://20.6.50.12.sslip.io/login`

**Expected Results**:
- Login page displays
- MindX logo visible
- "Login with MindX ID" button present
- No console errors

---

### Test Case 3.3: HTTPS Enforcement
**Objective**: Verify HTTP requests redirect to HTTPS

**Steps**:
1. Try accessing `http://20.6.50.12.sslip.io` (without 's')

**Expected Results**:
- Browser automatically redirects to `https://20.6.50.12.sslip.io`
- HTTPS connection established

---

## 4. Authentication Flow Tests

### Test Case 4.1: Login Flow (Happy Path)
**Objective**: Verify complete login flow works end-to-end

**Pre-conditions**:
- Valid MindX ID account credentials

**Steps**:
1. Navigate to `https://20.6.50.12.sslip.io/login`
2. Click "Login with MindX ID" button
3. Browser redirects to `https://id-dev.mindx.edu.vn`
4. Enter valid credentials
5. Click "Login"
6. Observe redirect back to application

**Expected Results**:
- Redirect to MindX ID successful
- After login, redirect to application callback URL
- User is redirected to Dashboard
- User email is displayed on Dashboard
- No console errors during flow

---

### Test Case 4.2: Token Exchange (BFF Pattern)
**Objective**: Verify backend securely exchanges authorization code for token

**Verification Points** (via Browser DevTools Network tab):
1. After MindX ID login, observe callback URL with `code` parameter
2. Frontend makes POST request to `/api/auth/token`
3. Request includes authorization code
4. **Client secret is NOT visible** in frontend request
5. Response contains access token
6. Token is stored securely

**Expected Results**:
- Token exchange happens on backend
- Client secret never exposed to frontend
- Valid access token returned

---

### Test Case 4.3: Dashboard Access After Login
**Objective**: Verify authenticated user can access protected dashboard

**Pre-conditions**:
- User successfully logged in (Test 4.1 passed)

**Steps**:
1. Observe Dashboard page after login

**Expected Results**:
- Dashboard displays user email
- "Logout" button visible
- `api/me` endpoint called successfully
- User data displayed correctly

---

### Test Case 4.4: Logout Flow
**Objective**: Verify logout functionality works correctly

**Pre-conditions**:
- User is logged in

**Steps**:
1. Click "Logout" button on Dashboard
2. Observe behavior

**Expected Results**:
- User redirected to login page
- Authentication state cleared
- Token removed from storage
- User cannot access Dashboard without re-login

---

### Test Case 4.5: Session Persistence
**Objective**: Verify authentication state persists across page refresh

**Pre-conditions**:
- User is logged in

**Steps**:
1. Refresh browser (F5 or Ctrl+R)
2. Observe behavior

**Expected Results**:
- User remains logged in
- Dashboard still accessible
- User email still displayed
- No need to re-login

---

### Test Case 4.6: Invalid Credentials
**Objective**: Verify system handles invalid login attempts

**Steps**:
1. Navigate to login page
2. Click "Login with MindX ID"
3. Enter invalid credentials at MindX ID
4. Submit

**Expected Results**:
- MindX ID shows error message
- User remains at MindX ID login page
- Application handles failure gracefully
- User can retry login

---

## 5. Security Tests

### Test Case 5.1: Client Secret Protection
**Objective**: Verify client secret is never exposed to frontend

**Steps**:
1. Open Browser DevTools → Network tab
2. Complete full login flow
3. Inspect all API requests to backend

**Expected Results**:
- No request contains `client_secret` in payload
- `client_secret` only used server-side
- Token exchange happens via backend proxy

---

### Test Case 5.2: JWT Token Validation
**Objective**: Verify backend validates JWT signature

**Steps**:
1. Obtain valid token via login
2. Modify token slightly (change one character)
3. Make request to `/api/me` with tampered token

**Expected Results**:
- Request rejected with `401 Unauthorized`
- Error message: "Invalid token"
- Backend logs show JWT verification failure

---

### Test Case 5.3: Token Expiration Handling
**Objective**: Verify expired tokens are rejected

**Steps**:
1. Log in and obtain token
2. Wait for token expiration (or manually use expired token)
3. Attempt to access protected route

**Expected Results**:
- Request rejected
- User prompted to re-login
- No sensitive data exposed

---

## 6. Integration Tests

### Test Case 6.1: Frontend-Backend Communication
**Objective**: Verify frontend can communicate with backend via ingress

**Pre-conditions**:
- User logged in

**Steps**:
1. Open Browser DevTools → Network tab
2. Observe Dashboard loading process

**Expected Results**:
- Frontend calls `/api/auth/config` successfully
- Frontend calls `/api/me` successfully
- All API calls use HTTPS
- CORS headers configured correctly

---

### Test Case 6.2: Path-Based Routing
**Objective**: Verify ingress routes traffic correctly

**Steps**:
```bash
# Test frontend routing
curl -I https://20.6.50.12.sslip.io/

# Test API routing
curl -I https://20.6.50.12.sslip.io/api/health
```

**Expected Results**:
- `/` routes to frontend service
- `/api/*` routes to backend service
- Both return `200 OK`
- HTTPS enforced on both

---

## 7. Performance Tests

### Test Case 7.1: API Response Time
**Objective**: Measure API response times

**Steps**:
```bash
# Test health endpoint
time curl https://20.6.50.12.sslip.io/api/health

# Test multiple requests
for i in {1..10}; do
  curl -w "%{time_total}\n" -o /dev/null -s \
    https://20.6.50.12.sslip.io/api/health
done
```

**Expected Results**:
- Average response time < 500ms
- Consistent performance across requests

---

### Test Case 7.2: Frontend Load Time
**Objective**: Measure frontend initial load time

**Steps**:
1. Open Browser DevTools → Network tab
2. Clear cache
3. Navigate to `https://20.6.50.12.sslip.io`
4. Observe load times

**Expected Results**:
- Total page load time < 3 seconds
- No failed resource loads
- JavaScript bundle loads successfully

---

## Test Execution Log Template

| Test Case ID | Date | Tester | Status | Notes |
|--------------|------|--------|--------|-------|
| 1.1 | | | ⬜ | |
| 1.2 | | | ⬜ | |
| 2.1 | | | ⬜ | |
| 2.2 | | | ⬜ | |
| 2.3 | | | ⬜ | |
| 2.4 | | | ⬜ | |
| 3.1 | | | ⬜ | |
| 3.2 | | | ⬜ | |
| 3.3 | | | ⬜ | |
| 4.1 | | | ⬜ | |
| 4.2 | | | ⬜ | |
| 4.3 | | | ⬜ | |
| 4.4 | | | ⬜ | |
| 4.5 | | | ⬜ | |
| 4.6 | | | ⬜ | |
| 5.1 | | | ⬜ | |
| 5.2 | | | ⬜ | |
| 5.3 | | | ⬜ | |
| 6.1 | | | ⬜ | |
| 6.2 | | | ⬜ | |
| 7.1 | | | ⬜ | |
| 7.2 | | | ⬜ | |

**Status Legend**:
- ⬜ Not Tested
- ✅ Passed
- ❌ Failed
- ⚠️ Partial/Need Review
