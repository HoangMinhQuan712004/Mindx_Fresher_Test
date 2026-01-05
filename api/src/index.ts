import crypto from 'crypto';
if (!(global as any).crypto) {
    (global as any).crypto = crypto;
}
import * as dotenv from 'dotenv';
dotenv.config();

import * as appInsights from 'applicationinsights';
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import cors from 'cors';

// Initialize Application Insights before other imports
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true, true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true, true)
        .setSendLiveMetrics(true)
        .start();
    console.log("✅ Application Insights initialized");
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = jwksRsa({
    jwksUri: process.env.OIDC_JWKS_URI || ''
});

// Proxy route to bypass CORS for OIDC discovery
app.get('/auth/config', async (req: Request, res: Response) => {
    try {
        const configUrl = process.env.OIDC_CONFIG_URL || '';
        const response = await fetch(configUrl);
        const metadata = await response.json();

        // Inject our backend as endpoints to bypass CORS and securely add Client Secret
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['host'];
        metadata.token_endpoint = `${protocol}://${host}/api/auth/token`;
        metadata.userinfo_endpoint = `${protocol}://${host}/api/auth/me`;

        res.json({
            metadata,
            authority: process.env.OIDC_AUTHORITY,
            clientId: process.env.OIDC_CLIENT_ID
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch OIDC config' });
    }
});

// Proxy route for token exchange (BFF pattern)
app.post('/auth/token', async (req: Request, res: Response) => {
    try {
        const params = new URLSearchParams(req.body as any);

        // Add client_id and client_secret (BFF handles secrets)
        params.set('client_id', process.env.OIDC_CLIENT_ID || '');
        params.set('client_secret', process.env.OIDC_CLIENT_SECRET || '');

        console.log('Proxying token request to MindX ID...');
        const tokenResponse = await fetch(`${process.env.OIDC_AUTHORITY}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });

        const data = await tokenResponse.json();
        res.status(tokenResponse.status).json(data);
    } catch (error) {
        console.error('Token Proxy Error:', error);
        res.status(500).json({ error: 'Internal Server Error during token proxy' });
    }
});

// Proxy route for UserInfo (BFF pattern)
app.get('/auth/me', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });

        console.log('Proxying UserInfo request to MindX ID...');
        const response = await fetch(`${process.env.OIDC_AUTHORITY}/me`, {
            headers: {
                'Authorization': authHeader
            }
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('UserInfo Proxy Error:', error);
        res.status(500).json({ error: 'Internal Server Error during UserInfo proxy' });
    }
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
    client.getSigningKey(header.kid, (err, key) => {
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
    });
}

const validateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send('No token provided');

    const token = authHeader.split(' ')[1];

    try {
        // 1. Offline verification (Signature & Expiry)
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, getKey, {
                audience: process.env.OIDC_CLIENT_ID,
                issuer: process.env.OIDC_AUTHORITY,
                algorithms: ['RS256']
            }, (err, dec) => err ? reject(err) : resolve(dec));
        });

        // 2. Online verification using CLIENT_SECRET 
        const userInfoResponse = await fetch(`${process.env.OIDC_AUTHORITY}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Client-Id': process.env.OIDC_CLIENT_ID || '',
                'X-Client-Secret': process.env.OIDC_CLIENT_SECRET || ''
            }
        });

        if (!userInfoResponse.ok) {
            return res.status(401).send('Token invalid or revoked by MindX');
        }

        const fullProfile = await userInfoResponse.json();
        (req as any).user = { ...decoded as object, ...fullProfile };
        next();
    } catch (err) {
        console.error('Auth Error:', err);
        return res.status(401).send('Invalid token');
    }
};

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to MindX Onboarding API!');
});

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.get('/me', validateToken, (req: Request, res: Response) => {
    res.json({
        message: 'Xác thực thành công!',
        user: (req as any).user
    });
});

// Test endpoint for App Insights - used for verifying Alerts
app.get('/test-error', (req: Request, res: Response) => {
    const errorMsg = "This is a deliberate test error for monitoring verification.";
    console.error(`🔴 App Insights Test: ${errorMsg}`);

    // Explicitly track the request as a failure
    appInsights.defaultClient?.trackRequest({
        name: "GET /api/test-error",
        url: req.url,
        duration: 10,
        resultCode: "500",
        success: false
    });

    // Also track the exception for deeper logs
    const error = new Error(errorMsg);
    appInsights.defaultClient?.trackException({ exception: error });

    res.status(500).json({
        error: 'Test Error Triggered',
        message: errorMsg
    });
});

// Global Error Handler to ensure all 500s are tracked
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('💥 Global Error Handler:', err);

    if (appInsights.defaultClient) {
        // Track as Request Failure (Status: False)
        appInsights.defaultClient.trackRequest({
            name: `${req.method} ${req.url}`,
            url: req.url,
            duration: 10, // dummy duration
            resultCode: "500",
            success: false
        });

        // Track as Exception
        appInsights.defaultClient.trackException({
            exception: err instanceof Error ? err : new Error(String(err))
        });
    }

    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Something went wrong'
    });
});

app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
});
