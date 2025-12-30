import { useAuth as useOidcAuth } from "react-oidc-context";
import { useAuth as useStandardAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const Login = () => {
    const oidcAuth = useOidcAuth();
    const standardAuth = useStandardAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (oidcAuth.isAuthenticated || standardAuth.user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleStandardLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const success = standardAuth.login(username, password);
        if (success) {
            navigate('/dashboard');
        } else {
            setError('Invalid username or password');
        }
    };

    const handleOidcLogin = () => {
        oidcAuth.signinRedirect();
    };

    return (
        <div className="auth-wrapper">
            <div className="glass-card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '0.5rem' }}>Account Login</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome to MindX Onboarding</p>
                </div>

                {/* Standard Login */}
                <form onSubmit={handleStandardLogin} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                    {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit">Login</button>
                    <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
                        <span onClick={() => navigate('/register')} style={{ color: 'var(--primary)', cursor: 'pointer' }}>Register</span>
                    </div>
                </form>

                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    OR CONTINUE WITH
                </div>

                {/* OIDC Login */}
                <div style={{ textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={handleOidcLogin}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            backgroundColor: 'white',
                            color: 'black'
                        }}
                    >
                        <img src="https://mindx.edu.vn/favicon.ico" alt="MindX" style={{ width: '20px' }} />
                        MindX ID
                    </button>
                </div>
            </div>
        </div>
    );
};
