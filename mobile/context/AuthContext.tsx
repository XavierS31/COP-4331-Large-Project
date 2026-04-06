import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authData, setAuthData] = useState<AuthData>({
    user: null,
    userType: null,
    token: null,
  });

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('auth_data');
        if (storedData) {
          setAuthData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Failed to load auth data from storage', error);
      }
    };
    loadAuthData();
  }, []);

  const login = (data: AuthData) => {
    setAuthData(data);
    AsyncStorage.setItem('auth_data', JSON.stringify(data)).catch((error) => {
      console.error('Failed to save auth data to storage', error);
    });
  };

  const logout = () => {
    setAuthData({ user: null, userType: null, token: null });
    AsyncStorage.removeItem('auth_data').catch((error) => {
      console.error('Failed to remove auth data from storage', error);
    });
  };

  const refreshToken = (newToken: string) => {
    setAuthData((prev) => {
      const updatedData = { ...prev, token: newToken };
      AsyncStorage.setItem('auth_data', JSON.stringify(updatedData)).catch((error) => {
        console.error('Failed to update auth data in storage', error);
      });
      return updatedData;
    });
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
