import { useState, useEffect } from "react";
import { useAuth as useOidcAuth } from "react-oidc-context";
import { useAuth as useStandardAuth } from "../context/AuthContext";

export const Dashboard = () => {
    const oidcAuth = useOidcAuth();
    const standardAuth = useStandardAuth();

    // State for API-fetched user profile (to get missing email)
    const [apiUser, setApiUser] = useState<any>(null);

    // Fetch full profile from backend when OIDC is used
    useEffect(() => {
        if (oidcAuth.isAuthenticated && oidcAuth.user?.access_token) {
            fetch('/api/me', {
                headers: {
                    'Authorization': `Bearer ${oidcAuth.user.access_token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        console.log("Full Profile fetched from Backend:", data.user);
                        setApiUser(data.user);
                    }
                })
                .catch(err => console.error("Failed to fetch full profile:", err));
        }
    }, [oidcAuth.isAuthenticated, oidcAuth.user?.access_token]);

    // Normalization logic: Prefer API-fetched data, then ID Token, then Standard User
    const user = oidcAuth.user?.profile ? {
        name: apiUser?.name || oidcAuth.user.profile.name || oidcAuth.user.profile.preferred_username || 'Member',
        email: apiUser?.email || oidcAuth.user.profile.email || (oidcAuth.user.profile as any).upn || 'N/A',
        authMethod: 'OIDC (MINDX)'
    } : standardAuth.user ? {
        name: standardAuth.user.name || standardAuth.user.username,
        email: standardAuth.user.email || 'N/A',
        authMethod: 'LOCAL ACCOUNT'
    } : null;

    // Week 2 Task State
    const [week2Tasks, setWeek2Tasks] = useState([
        { id: 1, text: "Setup Azure App Insights", completed: false },
        { id: 2, text: "Verify Logs/Performance in App Insights", completed: false },
        { id: 3, text: "Setup Azure Alerts", completed: false },
        { id: 4, text: "Integrate Google Analytics", completed: false },
        { id: 5, text: "Track Page Views/Sessions in GA", completed: false },
        { id: 6, text: "Document Metrics Access", completed: false },
        { id: 7, text: "Push configuration to repo", completed: false },
    ]);

    // Calculate percentage
    const completedCount = week2Tasks.filter(t => t.completed).length;
    const week2Percentage = Math.round((completedCount / week2Tasks.length) * 100);

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const toggleTask = (id: number) => {
        setWeek2Tasks(week2Tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        if (oidcAuth.isAuthenticated) {
            // Local-Only Logout: Clear app session without hitting MindX ID server
            // This bypasses the registration/redirect issues entirely
            oidcAuth.removeUser();
            window.location.href = '/login';
        } else {
            standardAuth.logout();
            window.location.reload();
        }
    };

    if (oidcAuth.isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="loader">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <h2>Chưa đăng nhập</h2>
                <button onClick={() => window.location.href = '/login'}>Đăng nhập ngay</button>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 style={{ marginBottom: '1rem' }}>Confirm Logout</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Are you sure you want to log out of your account?
                        </p>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowLogoutModal(false)}>
                                Cancel
                            </button>
                            <button
                                style={{ background: 'var(--error)' }}
                                onClick={confirmLogout}
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="profile-header">
                <div>
                    <h1 style={{ textAlign: 'left', marginBottom: '0.25rem' }}>
                        Hello, {user.name}!
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Great to see you again.</p>
                </div>
                <button
                    onClick={handleLogoutClick}
                    style={{ width: 'auto', padding: '0.625rem 1.25rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                >
                    Logout
                </button>
            </div>

            <div className="profile-info">
                <h3 style={{ textAlign: 'left', marginBottom: '2rem' }}>Personal Profile</h3>

                <div className="info-item">
                    <div className="label">Email</div>
                    <div className="value">{user.email}</div>
                </div>

                <div className="info-item">
                    <div className="label">Authentication</div>
                    <div className="value">
                        <span style={{
                            background: user.authMethod.includes('OIDC') ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: user.authMethod.includes('OIDC') ? 'var(--primary)' : '#10b981',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                        }}>
                            {user.authMethod}
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Week 1 Card - Static */}
                <div className="glass-card" style={{ padding: '1.5rem', marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ marginBottom: '0.5rem' }}>Week 1 Progress</h4>
                        <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 'bold' }}>COMPLETED</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Infrastructure and Containerization</p>
                    <div style={{ marginTop: '1rem', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '100%', height: '100%', background: 'var(--success)' }}></div>
                    </div>
                    <p style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: '0.75rem' }}>100% Complete</p>
                </div>

                {/* Week 2 Card - Interactive */}
                <div className="glass-card" style={{ padding: '1.5rem', marginBottom: 0 }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Week 2 Planner</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Metrics and Monitoring Setup</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
                        {week2Tasks.map(task => (
                            <label key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer', color: task.completed ? 'var(--text-muted)' : 'inherit' }}>
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleTask(task.id)}
                                    style={{ accentColor: 'var(--primary)' }}
                                />
                                <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.text}</span>
                            </label>
                        ))}
                    </div>

                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${week2Percentage}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
                    </div>
                    <p style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: '0.75rem' }}>{week2Percentage}% Complete</p>
                </div>
            </div>
        </div>
    );
};
