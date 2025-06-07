'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  role: string;
}

interface LoginParams {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterParams {
  fullName: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (params: LoginParams) => Promise<any>;
  register: (params: RegisterParams) => Promise<any>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true to check initial auth status
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchCurrentUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user || data); // Adjust based on your API response structure for /api/auth/me
      } else {
        setUser(null); // Not authenticated or error
        if (response.status !== 401) { // Don't set error for typical unauthenticated responses
            const errorData = await response.json().catch(() => ({}))
            setError(errorData.message || 'Failed to fetch user status.');
        }
      }
    } catch (err: any) {
      console.error("Auth provider error:", err);
      setUser(null);
      // Don't set error for network issues to prevent bad UX
      // setError(err.message || 'An error occurred while fetching user status.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Add a try-catch to prevent unhandled errors during initialization
    try {
      fetchCurrentUser();
    } catch (err) {
      console.error("Error in auth initialization:", err);
      setIsLoading(false);
    }
  }, []);

  const login = async ({ email, password, rememberMe = false }: LoginParams) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Call your API to authenticate
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error || 'Authentication failed';
        
        // Provide specific error messages for different scenarios
        if (errorMessage.toLowerCase().includes('not found')) {
          throw new Error(`Email address not found. Please check your email or register a new account.`);
        }
        
        if (errorMessage.toLowerCase().includes('password') && errorMessage.toLowerCase().includes('invalid')) {
          throw new Error(`Invalid password. Please check your password and try again.`);
        }
        
        throw new Error(errorMessage);
      }
      
      // Set user state
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
      });
      
      // Set token in local storage/cookie
      if (rememberMe) {
        localStorage.setItem('authToken', data.token);
      } else {
        sessionStorage.setItem('authToken', data.token);
      }
      
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({ fullName, email, password }: RegisterParams) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Call your API to register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error || 'Registration failed';
        
        // Provide specific error messages for different scenarios
        if (errorMessage.toLowerCase().includes('email') && 
            (errorMessage.toLowerCase().includes('exists') || 
             errorMessage.toLowerCase().includes('taken') || 
             errorMessage.toLowerCase().includes('already in use'))) {
          throw new Error(`This email is already registered. Please try logging in instead.`);
        }
        
        if (errorMessage.toLowerCase().includes('password') && 
            (errorMessage.toLowerCase().includes('weak') || 
             errorMessage.toLowerCase().includes('requirements'))) {
          throw new Error(`Password does not meet security requirements. Please use a stronger password.`);
        }
        
        throw new Error(errorMessage);
      }

      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Logout failed');
      }
      setUser(null);
      // router.push('/login'); // Optional: redirect after logout
    } catch (err: any) {
      setError(err.message || 'An error occurred during logout.');
    }
    setIsLoading(false);
  };

  const clearError = () => setError(null);

  // Return early with just children if there's a critical error
  // to prevent the app from being unusable
  if (error && process.env.NODE_ENV === 'production') {
    console.error("Critical auth error:", error);
    return <>{children}</>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      error,
      login,
      register,
      logout,
      clearError
    }}>
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