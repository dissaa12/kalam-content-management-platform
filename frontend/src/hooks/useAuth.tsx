import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, UserProfile } from '../services/authService';
import { UserRole } from '../types/common';

const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  admin: {
    id: 1,
    first_name: 'Elena',
    last_name: 'Rostova',
    full_name: 'Elena Rostova',
    email: 'admin@enterprise.com',
    role: 'admin',
    is_active: true,
    permissions: ['*'],
  },
  marketing_manager: {
    id: 2,
    first_name: 'Sarah',
    last_name: 'Jenkins',
    full_name: 'Sarah Jenkins',
    email: 'manager@enterprise.com',
    role: 'marketing_manager',
    is_active: true,
    permissions: ['content:*', 'campaigns:*', 'analytics:*', 'media:*'],
  },
  content_editor: {
    id: 3,
    first_name: 'Alex',
    last_name: 'Rivera',
    full_name: 'Alex Rivera',
    email: 'editor@enterprise.com',
    role: 'content_editor',
    is_active: true,
    permissions: ['content:read', 'content:edit', 'content:review', 'calendar:*'],
  },
  content_author: {
    id: 4,
    first_name: 'Devon',
    last_name: 'Vance',
    full_name: 'Devon Vance',
    email: 'author@enterprise.com',
    role: 'content_author',
    is_active: true,
    permissions: ['content:read', 'content:create', 'content:edit_own', 'ai:*'],
  },
  reviewer: {
    id: 5,
    first_name: 'Marcus',
    last_name: 'Chen',
    full_name: 'Marcus Chen',
    email: 'reviewer@enterprise.com',
    role: 'reviewer',
    is_active: true,
    permissions: ['content:read', 'content:review'],
  },
};

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  switchDemoRole: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : DEMO_PROFILES.marketing_manager; // default to marketing manager for instant demo
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      authService
        .getMe()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
        })
        .catch((err) => {
          console.warn('API authentication session expired or offline:', err);
        });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    } catch (error: any) {
      // Offline / demo fallback credentials support
      const matchedKey = Object.keys(DEMO_PROFILES).find(
        (key) => DEMO_PROFILES[key as UserRole].email.toLowerCase() === email.toLowerCase()
      ) as UserRole | undefined;

      if (matchedKey) {
        const demoUser = DEMO_PROFILES[matchedKey];
        const mockToken = `mock-token-${matchedKey}`;
        setToken(mockToken);
        setUser(demoUser);
        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('auth_user', JSON.stringify(demoUser));
      } else {
        throw new Error(error.response?.data?.detail || 'Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const switchDemoRole = (role: UserRole) => {
    const newProfile = DEMO_PROFILES[role];
    setUser(newProfile);
    localStorage.setItem('auth_user', JSON.stringify(newProfile));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
