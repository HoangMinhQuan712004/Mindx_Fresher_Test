import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
    username: string;
    name: string;
    role: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => boolean;
    register: (userData: Omit<User, 'role'>, password: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = (username: string, _password: string): boolean => {
        // Mock login logic - find in local storage or use default
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const foundUser = registeredUsers.find((u: any) => u.username === username);

        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('user', JSON.stringify(foundUser));
            return true;
        }

        // Default mock user for testing if no users registered
        if (username === 'admin') {
            const mockUser = { username: 'admin', name: 'System Admin', role: 'Fresher', email: 'admin@mindx.edu.vn' };
            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));
            return true;
        }

        return false;
    };

    const register = (userData: Omit<User, 'role'>, _password: string) => {
        const newUser = { ...userData, role: 'Fresher' };
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        registeredUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
