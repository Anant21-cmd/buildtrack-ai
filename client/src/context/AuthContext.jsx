import React, { createContext, useContext, useState, useEffect } from 'react';

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  SITE_ENGINEER: 'SITE_ENGINEER',
  STORE_MANAGER: 'STORE_MANAGER',
  CONTRACTOR: 'CONTRACTOR',
  CLIENT: 'CLIENT'
};

export const DEMO_USERS = [
  { label: 'Super Admin', email: 'anand@buildtrack.ai', password: 'lathianand' },
  { label: 'Company Admin', email: 'admin@apexbuilders.com', password: 'lathianand' },
  { label: 'Site Engineer', email: 'engineer@apex.com', password: 'password123' },
  { label: 'Store Manager', email: 'store@apex.com', password: 'password123' },
  { label: 'Contractor', email: 'contractor@apex.com', password: 'password123' },
  { label: 'Client', email: 'client@apex.com', password: 'password123' }
];

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('buildtrack_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('buildtrack_token') || null;
  });

  // Keep localStorage synchronized
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('buildtrack_user', JSON.stringify(currentUser));
      if (token) localStorage.setItem('buildtrack_token', token);
    } else {
      localStorage.removeItem('buildtrack_user');
      localStorage.removeItem('buildtrack_token');
    }
  }, [currentUser, token]);

  // Login handler connected to Express Backend
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.requiresVerification) {
        return data;
      }

      setToken(data.token);
      setCurrentUser(data.user);
      
      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const verifyOtp = async (email, code) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP Verification failed');
      }

      setToken(data.token);
      setCurrentUser(data.user);
      
      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google Login failed');
      }

      setToken(data.token);
      setCurrentUser(data.user);
      
      return data;
    } catch (error) {
      console.error("Google Auth Error:", error);
      throw error;
    }
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('buildtrack_user');
    localStorage.removeItem('buildtrack_token');
  };

  // Role Switcher shortcut (used in navbar for testing)
  const switchRole = (newRole) => {
    // No-op for now since demo users are deleted
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!currentUser,
        login,
        loginWithGoogle,
        verifyOtp,
        logout,
        switchRole,
        ROLES,
        DEMO_USERS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
