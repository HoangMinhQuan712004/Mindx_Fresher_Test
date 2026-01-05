import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from "react-oidc-context";
import { AuthProvider as StandardAuthProvider } from './context/AuthContext';
import App from './App.tsx'

// Initialization handled via index.html script tag

const initAuth = async () => {
    try {
        // Fetch metadata via backend proxy to avoid CORS issues
        console.log("Fetching OIDC config from /api/auth/config...");
        const response = await fetch('/api/auth/config');

        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${await response.text()}`);
        }

        const config = await response.json();
        console.log("OIDC Config received:", config);

        const oidcConfig = {
            authority: config.authority,
            client_id: config.clientId,
            scope: "openid profile email",
            loadUserInfo: false,
            redirect_uri: window.location.origin + "/callback",
            metadata: config.metadata, // Dynamically loaded
            onSigninCallback: () => {
                window.history.replaceState({}, document.title, window.location.pathname);
            },
        };

        ReactDOM.createRoot(document.getElementById('root')!).render(
            <StrictMode>
                <StandardAuthProvider>
                    <AuthProvider {...oidcConfig}>
                        <App />
                    </AuthProvider>
                </StandardAuthProvider>
            </StrictMode>
        );
    } catch (error) {
        console.error("OIDC Initialization Error:", error);
        ReactDOM.createRoot(document.getElementById('root')!).render(
            <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
                <h2>Hệ thống đang bảo trì</h2>
                <p>Không thể kết nối với dịch vụ xác thực. Vui lòng thử lại sau.</p>
            </div>
        );
    }
};

initAuth();
