import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDonor: boolean;
  role: UserRole | 'guest';
  login: (email: string, role?: UserRole) => boolean;
  register: (name: string, email: string, phone?: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('asfjk_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_USERS[0]; // Super Admin default for demo
      }
    }
    return INITIAL_USERS[0];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('asfjk_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('asfjk_auth_user');
    }
  }, [user]);

  const login = (email: string, requestedRole?: UserRole): boolean => {
    const existing = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setUser(existing);
      return true;
    }
    // Demo dynamic login
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: requestedRole || 'donor',
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    return true;
  };

  const register = (name: string, email: string, phone?: string): boolean => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      phone,
      role: 'donor',
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const matched = INITIAL_USERS.find((u) => u.role === newRole);
    if (matched) {
      setUser(matched);
    } else if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;

    switch (permission) {
      case 'refunds:manage':
        return user.role === 'finance_admin';
      case 'finances:view':
        return ['finance_admin', 'auditor', 'reporting_user'].includes(user.role);
      case 'projects:manage':
        return user.role === 'project_manager';
      case 'content:manage':
        return user.role === 'content_manager';
      case 'donors:support':
        return ['donor_support', 'finance_admin'].includes(user.role);
      default:
        return false;
    }
  };

  const role: UserRole | 'guest' = user ? user.role : 'guest';
  const isAdmin = user ? user.role !== 'donor' : false;
  const isDonor = user ? user.role === 'donor' : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        isDonor,
        role,
        login,
        register,
        logout,
        switchRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
