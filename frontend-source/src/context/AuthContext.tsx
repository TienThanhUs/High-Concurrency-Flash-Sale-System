import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { JWTPayload, UserSession } from '../types/auth';

const TOKEN_KEY = 'flashmart_jwt';

export interface AuthContextValue {
  session: UserSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginWithToken: (jwt: string) => void;
  logout: (message?: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function parseToken(token: string): UserSession | null {
  try {
    const payload = jwtDecode<JWTPayload>(token);
    const expiresAt = payload.exp * 1000;
    if (Date.now() >= expiresAt) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return {
      userId: payload.userId,
      email: payload.sub,
      role: payload.role,
      token,
      expiresAt,
    };
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    return stored ? parseToken(stored) : null;
  });
  const [isLoading] = useState(false);

  const logout = useCallback((_message?: string) => {
    localStorage.removeItem(TOKEN_KEY);
    setSession(null);
  }, []);

  const loginWithToken = useCallback((jwt: string) => {
    localStorage.setItem(TOKEN_KEY, jwt);
    const newSession = parseToken(jwt);
    setSession(newSession);
  }, []);

  // Auto logout timer when token expires
  useEffect(() => {
    if (!session) return;

    const remainingTime = session.expiresAt - Date.now();
    if (remainingTime <= 0) {
      logout('Phiên đăng nhập đã hết hạn.');
      return;
    }

    const timer = setTimeout(() => {
      logout('Phiên đăng nhập đã hết hạn.');
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [session, logout]);

  // Listen for unauthorized 401 events dispatched by axiosClient
  useEffect(() => {
    const handleUnauthorized = () => {
      logout('Phiên đăng nhập đã hết hạn.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  const value: AuthContextValue = {
    session,
    isAuthenticated: !!session,
    isAdmin: session?.role === 'ADMIN',
    loginWithToken,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
