import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthData {
  user: any;
  userType: 'student' | 'faculty' | null;
  token: string | null;
}

interface AuthContextType extends AuthData {
  login: (data: AuthData) => void;
  logout: () => void;
  refreshToken: (newToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authData, setAuthData] = useState<AuthData>(() => {
    const stored = localStorage.getItem('auth_data');
    return stored ? JSON.parse(stored) : { user: null, userType: null, token: null };
  });

  const login = (data: AuthData) => {
    setAuthData(data);
    localStorage.setItem('auth_data', JSON.stringify(data));
  };

  const logout = () => {
    setAuthData({ user: null, userType: null, token: null });
    localStorage.removeItem('auth_data');
  };

  const refreshToken = (newToken: string) => {
    const updated = { ...authData, token: newToken };
    setAuthData(updated);
    localStorage.setItem('auth_data', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ ...authData, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
