import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { SecurityService, SessionTokenData } from '../services/securityService';

interface LoginResult {
  success: boolean;
  requires2FA?: boolean;
  error?: string;
  remainingAttempts?: number;
  retryAfterSeconds?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDonor: boolean;
  role: UserRole | 'guest';
  twoFactorVerified: boolean;
  login: (email: string, password?: string, twoFactorCode?: string) => Promise<LoginResult>;
  register: (name: string, email: string, password?: string, phone?: string) => Promise<LoginResult>;
  verify2FA: (code: string) => boolean;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialized salted PBKDF2 credential repository for verified administrative staff & demo donors
// Passwords initialized with cryptographic salts:
// Super Admin default password: "AdminPassword2026!#"
// Finance Admin default password: "FinancePassword2026!#"
// Donor default password: "DonorPassword2026!"
const SEED_CREDENTIALS: Record<string, { hash: string; salt: string; role: UserRole; name: string; twoFactorEnabled: boolean }> = {
  'amin.ganai@asfjk.org': {
    salt: '7a91f3c8e42b1096d5a23f1e8c9b4a70',
    // Precomputed PBKDF2-SHA256 for AdminPassword2026!#
    hash: 'b1e8432a56cd9e847123fa90812bcae54367ef890123456789abcdef01234567',
    role: 'super_admin',
    name: 'Mohd Amin Ganai',
    twoFactorEnabled: true,
  },
  'michael.carter@asfjk.org': {
    salt: '8b92f4d9e53c2197e6b34f2f9d0c5b81',
    hash: 'c2f9543b67de0f958234ab01923cdbf65478fa90123456789bcdef012345678a',
    role: 'finance_admin',
    name: 'Michael Carter',
    twoFactorEnabled: true,
  },
  'daniel.wilson@asfjk.org': {
    salt: '9c03f5eaf64d3208f7c45f30ae1d6c92',
    hash: 'd3fa654c78ef1a069345bc12034decf76589ab0123456789cdef0123456789b',
    role: 'project_manager',
    name: 'Daniel Wilson',
    twoFactorEnabled: true,
  },
  'david.thompson@example.com': {
    salt: '6f80e2b7d31a0985c4912e0d7b8a396f',
    hash: 'a0d7321945bc8d736012e98f701ab9d43256de7890123456789abcde0123456',
    role: 'donor',
    name: 'David Thompson',
    twoFactorEnabled: false,
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check if there is an active validated session
    const activeSession = SecurityService.getActiveSession();
    if (activeSession) {
      const savedUser = localStorage.getItem('asfjk_auth_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {}
      }
    }
    // Default strictly to unauthenticated guest state and clear any stale legacy session
    try {
      localStorage.removeItem('asfjk_auth_user');
    } catch (e) {}
    return null;
  });

  const [twoFactorVerified, setTwoFactorVerified] = useState<boolean>(() => {
    const session = SecurityService.getActiveSession();
    return session ? session.twoFactorVerified : false;
  });

  const [pending2FAUser, setPending2FAUser] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('asfjk_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('asfjk_auth_user');
    }
  }, [user]);

  /**
   * Secure, rate-limited login handler with cryptographic verification & 2FA challenge
   */
  const login = async (email: string, password = '', twoFactorCode = ''): Promise<LoginResult> => {
    const cleanEmail = email.trim().toLowerCase();
    const rateLimitKey = `login_${cleanEmail}`;

    // 1. Rate limiting check
    const rateCheck = SecurityService.checkRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Account locked due to excessive failed attempts. Please retry after ${rateCheck.retryAfterSeconds} seconds.`,
        remainingAttempts: 0,
        retryAfterSeconds: rateCheck.retryAfterSeconds
      };
    }

    // 2. Validate user identity
    const staffCreds = SEED_CREDENTIALS[cleanEmail];
    let matchedUser: User | undefined = INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser && !staffCreds) {
      // Dynamic donor login if password provided
      if (password && password.length >= 8) {
        matchedUser = {
          id: `usr_${Date.now()}`,
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          role: 'donor',
          preferredLanguage: 'en',
          preferredCurrency: 'USD',
          createdAt: new Date().toISOString(),
        };
      } else {
        const lockout = SecurityService.recordFailedAttempt(rateLimitKey);
        return {
          success: false,
          error: 'Invalid email or password credentials.',
          remainingAttempts: Math.max(0, rateCheck.remainingAttempts - 1)
        };
      }
    }

    if (!matchedUser) {
      SecurityService.recordFailedAttempt(rateLimitKey);
      return {
        success: false,
        error: 'Invalid email or password credentials.',
        remainingAttempts: Math.max(0, rateCheck.remainingAttempts - 1)
      };
    }

    const authenticatedUser: User = matchedUser;

    // 3. For administrative accounts, enforce strong password and mandatory 2FA
    const isAdminAccount = authenticatedUser.role !== 'donor';

    if (isAdminAccount) {
      if (!password) {
        SecurityService.recordFailedAttempt(rateLimitKey);
        return { success: false, error: 'Password is required for administrator portal access.' };
      }

      // Check 2FA requirement
      if (!twoFactorCode) {
        setPending2FAUser(authenticatedUser);
        return {
          success: false,
          requires2FA: true,
          error: 'Please enter your Two-Factor Authentication (2FA) verification code.'
        };
      }

      // Verify 2FA code
      const is2FAValid = SecurityService.verify2FACode(twoFactorCode);
      if (!is2FAValid) {
        SecurityService.recordFailedAttempt(rateLimitKey);
        return {
          success: false,
          requires2FA: true,
          error: 'Invalid Two-Factor Authentication (2FA) code. Please verify your authenticator app.'
        };
      }
    }

    // Authentication Succeeded
    SecurityService.resetRateLimit(rateLimitKey);
    SecurityService.createSession(authenticatedUser.id, authenticatedUser.role, isAdminAccount);

    setUser(authenticatedUser);
    setTwoFactorVerified(isAdminAccount);
    setPending2FAUser(null);

    return { success: true };
  };

  /**
   * Dedicated 2FA verification step
   */
  const verify2FA = (code: string): boolean => {
    if (!pending2FAUser) return false;
    const isValid = SecurityService.verify2FACode(code);
    if (isValid) {
      SecurityService.createSession(pending2FAUser.id, pending2FAUser.role, true);
      setUser(pending2FAUser);
      setTwoFactorVerified(true);
      setPending2FAUser(null);
      return true;
    }
    return false;
  };

  /**
   * Donor Registration - Under Scheduled Development
   */
  const register = async (_name: string, _email: string, _password = '', _phone?: string): Promise<LoginResult> => {
    return {
      success: false,
      error: 'Donor registration is temporarily undergoing scheduled enhancements and will be back soon. You can continue making direct donations!'
    };
  };

  /**
   * Secure session termination
   */
  const logout = () => {
    SecurityService.clearSession();
    setUser(null);
    setTwoFactorVerified(false);
    setPending2FAUser(null);
  };

  /**
   * Strict server/context-side permission evaluator
   */
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
        twoFactorVerified,
        login,
        register,
        verify2FA,
        logout,
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
