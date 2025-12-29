import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth as useOidcAuth } from "react-oidc-context";
import { useAuth as useStandardAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import './index.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const oidcAuth = useOidcAuth();
    const standardAuth = useStandardAuth();

    if (oidcAuth.isLoading) {
        return <div className="loading-screen">Dang tải...</div>;
    }

    if (!oidcAuth.isAuthenticated && !standardAuth.user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

function App() {
    const oidcAuth = useOidcAuth();

    if (oidcAuth.isLoading) {
        return <div className="loading-screen">Hệ thống đang kiểm tra đăng nhập...</div>;
    }

    if (oidcAuth.error) {
        return <div>Rất tiếc, đã xảy ra lỗi: {oidcAuth.error.message}</div>;
    }

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="/callback" element={<Navigate to="/dashboard" replace />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
