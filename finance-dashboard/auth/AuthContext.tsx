
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { login as apiLogin, signup as apiSignup } from '../services/mockApi';

interface AuthContextType {
  token: string | null;
  isLoggedIn: boolean;
  login: (credentials: any) => Promise<void>;
  signup: (credentials: any) => Promise<void>;
  logout: () => void;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [token]);

  const login = async (credentials: any) => {
    try {
      setAuthError(null);
      const data = await apiLogin(credentials);
      setToken(data.token);
    } catch (error: any) {
      setAuthError(error.message || 'Login failed.');
      throw error;
    }
  };

  const signup = async (credentials: any) => {
    try {
      setAuthError(null);
      const data = await apiSignup(credentials);
      setToken(data.token);
    } catch (error: any) {
      setAuthError(error.message || 'Signup failed.');
      throw error;
    }
  };

  const logout = useCallback(() => {
    setToken(null);
  }, []);
  
  const clearAuthError = () => setAuthError(null);

  const value = {
    token,
    isLoggedIn: !!token,
    login,
    signup,
    logout,
    authError,
    clearAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};