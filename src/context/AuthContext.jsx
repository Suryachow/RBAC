import React, { createContext, useState, useContext, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('sql_rbac_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Login failed');

            setUser(data.user);
            localStorage.setItem('sql_rbac_user', JSON.stringify(data.user));
            return true;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('sql_rbac_user');
    };

    const registerUser = async (email, password, role, name) => {
        try {
            const res = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    role,
                    name,
                    createdBy: user ? user.id : 'system'
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            return data;
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    };

    const hasRole = (allowedRoles) => {
        return user && allowedRoles.includes(user.role);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, registerUser, loading, hasRole, API_URL }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
