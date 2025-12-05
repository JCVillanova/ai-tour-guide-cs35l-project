import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of our AuthContext
interface AuthContextType {
  userName: string | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in when the app starts
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('userName');
        if (storedEmail) {
          setUserName(storedEmail);
        }
      } catch (e) {
        console.error("Failed to load user token");
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  // Function to log in (updates state and storage)
  const login = async (email: string) => {
    setUserName(email);
    await AsyncStorage.setItem('userName', email);
  };

  // Function to log out
  const logout = async () => {
    setUserName(null);
    await AsyncStorage.removeItem('userName');
  };

  return (
    <AuthContext.Provider value={{ userName, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the context in your screens
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}