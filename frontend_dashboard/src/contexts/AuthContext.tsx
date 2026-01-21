import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserResponse } from '@/services/auth.service';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (tokenData: any) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = authService.getStoredUser();
    if (storedUser && authService.isAuthenticated()) {
      setUser(storedUser);
      // Optionally verify token with backend
      authService.getMe()
        .then(userData => setUser(userData))
        .catch(() => {
          // Token invalid, clear storage
          authService.logout();
          setUser(null);
        });
    }
    setLoading(false);
  }, []);

  const login = async (tokenData: any) => {
    try {
      const response = await authService.login(tokenData);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.user_type === 'admin',
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
