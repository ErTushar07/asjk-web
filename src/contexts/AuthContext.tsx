import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { SecurityService } from '../services/securityService';
import { TOTPService } from '../services/totpService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface LoginResult {
  success: boolean;
  requires2FA?: boolean;
  error?: string;
  remainingAttempts?: number;
  retryAfterSeconds?: number;
  user?: User;
}

interface RegisterParams {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  country?: string;
  panTaxId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDonor: boolean;
  role: UserRole | 'guest';
  twoFactorVerified: boolean;
  login: (email: string, password?: string, twoFactorCode?: string) => Promise<LoginResult>;
  register: (params: RegisterParams) => Promise<LoginResult>;
  verifyRegistrationOTP: (email: string, token: string) => Promise<LoginResult>;
  verify2FA: (code: string) => boolean;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Salted PBKDF2 fallback credentials for offline/local environment testing
const SEED_CREDENTIALS: Record<string, { hash: string; salt: string; role: UserRole; name: string; totpSecret: string }> = {
  'amin.ganai@asfjk.org': {
    salt: '7a91f3c8e42b1096d5a23f1e8c9b4a70',
    hash: 'b09c39a8804e58e2892f52430d135fad6882fb530c149a6fa0ff84577eb63194',
    role: 'super_admin',
    name: 'Mohd Amin Ganai',
    totpSecret: 'JBSWY3DPEHPK3PXP',
  },
  'michael.carter@asfjk.org': {
    salt: '8b92f4d9e53c2197e6b34f2f9d0c5b81',
    hash: '10bbbefa3eb332fc5483cb0631be578ddb3a8346844baef78f4d126f7b183808',
    role: 'finance_admin',
    name: 'Michael Carter',
    totpSecret: 'JBSWY3DPEHPK3PXP',
  },
  'daniel.wilson@asfjk.org': {
    salt: '9c03f5eaf64d3208f7c45f30ae1d6c92',
    hash: 'b7518d77537910e5c6a98216319078bd3c92387eab763c602b5eecad1ef85cbe',
    role: 'project_manager',
    name: 'Daniel Wilson',
    totpSecret: 'JBSWY3DPEHPK3PXP',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const activeSession = SecurityService.getActiveSession();
    if (activeSession) {
      const savedUser = sessionStorage.getItem('asfjk_auth_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {}
      }
    }
    return null;
  });

  const [twoFactorVerified, setTwoFactorVerified] = useState<boolean>(() => {
    const session = SecurityService.getActiveSession();
    return session ? session.twoFactorVerified : false;
  });

  const [pending2FAUser, setPending2FAUser] = useState<User | null>(null);
  const [activeTOTPSecret, setActiveTOTPSecret] = useState<string>('JBSWY3DPEHPK3PXP');

  // Supabase Auth State Listener
  useEffect(() => {
    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const mappedUser: User = {
            id: session.user.id,
            name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Donor',
            email: session.user.email || '',
            role: (profile?.role as UserRole) || 'donor',
            phone: profile?.phone || session.user.user_metadata?.phone,
            preferredLanguage: profile?.preferred_language || 'en',
            preferredCurrency: profile?.preferred_currency || 'USD',
            twoFactorEnabled: profile?.two_factor_enabled || false,
            createdAt: profile?.created_at || new Date().toISOString(),
          };

          const isAdminAccount = mappedUser.role !== 'donor';
          if (!isAdminAccount) {
            setUser(mappedUser);
            setTwoFactorVerified(false);
            SecurityService.createSession(mappedUser.id, mappedUser.role, false);
            sessionStorage.setItem('asfjk_auth_user', JSON.stringify(mappedUser));
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setTwoFactorVerified(false);
          SecurityService.clearSession();
          sessionStorage.removeItem('asfjk_auth_user');
        }
      });

      return () => {
        authListener?.subscription.unsubscribe();
      };
    }
  }, []);

  /**
   * Secure, rate-limited login handler with cryptographic verification & 2FA challenge
   */
  const login = async (email: string, password = '', twoFactorCode = ''): Promise<LoginResult> => {
    const cleanEmail = email.trim().toLowerCase();
    const rateLimitKey = `login_${cleanEmail}`;

    // 1. Rate limiting check (5 attempts -> 15 min progressive lockout)
    const rateCheck = SecurityService.checkRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Account locked due to excessive failed attempts. Please retry after ${rateCheck.retryAfterSeconds} seconds.`,
        remainingAttempts: 0,
        retryAfterSeconds: rateCheck.retryAfterSeconds,
      };
    }

    // 2. Production Flow with Supabase Auth
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          SecurityService.recordFailedAttempt(rateLimitKey);
          return {
            success: false,
            error: error.message || 'Invalid email or password.',
            remainingAttempts: Math.max(0, rateCheck.remainingAttempts - 1),
          };
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          const authenticatedUser: User = {
            id: data.user.id,
            name: profile?.full_name || data.user.user_metadata?.full_name || 'Donor',
            email: data.user.email || cleanEmail,
            role: (profile?.role as UserRole) || 'donor',
            phone: profile?.phone,
            preferredLanguage: profile?.preferred_language || 'en',
            preferredCurrency: profile?.preferred_currency || 'USD',
            twoFactorEnabled: profile?.two_factor_enabled || false,
            createdAt: profile?.created_at || new Date().toISOString(),
          };

          const isAdminAccount = authenticatedUser.role !== 'donor';

          if (isAdminAccount) {
            const totpSecret = profile?.totp_secret_encrypted || 'JBSWY3DPEHPK3PXP';
            setActiveTOTPSecret(totpSecret);

            if (!twoFactorCode) {
              setPending2FAUser(authenticatedUser);
              return {
                success: false,
                requires2FA: true,
                error: 'Please enter your 6-digit Authenticator TOTP code.',
              };
            }

            const is2FAValid = TOTPService.verifyTOTP(twoFactorCode, totpSecret);
            if (!is2FAValid) {
              SecurityService.recordFailedAttempt(rateLimitKey);
              return {
                success: false,
                requires2FA: true,
                error: 'Invalid 6-digit Two-Factor Authentication code. Please verify your authenticator app.',
              };
            }
          }

          SecurityService.resetRateLimit(rateLimitKey);
          SecurityService.createSession(authenticatedUser.id, authenticatedUser.role, isAdminAccount);
          setUser(authenticatedUser);
          setTwoFactorVerified(isAdminAccount);
          setPending2FAUser(null);
          sessionStorage.setItem('asfjk_auth_user', JSON.stringify(authenticatedUser));

          return { success: true, user: authenticatedUser };
        }
      } catch (err: any) {
        console.warn('Supabase auth notice, using local fallback:', err.message);
      }
    }

    // 3. Fallback / Seed Credentials for Administrative Testing
    const staffCreds = SEED_CREDENTIALS[cleanEmail];
    let matchedUser: User | undefined = INITIAL_USERS.find((u) => u.email.toLowerCase() === cleanEmail);

    if (staffCreds) {
      if (!password) {
        SecurityService.recordFailedAttempt(rateLimitKey);
        return {
          success: false,
          error: 'Password is required.',
          remainingAttempts: Math.max(0, rateCheck.remainingAttempts - 1),
        };
      }

      const isPasswordValid = await SecurityService.verifyPassword(password, staffCreds.hash, staffCreds.salt);
      if (!isPasswordValid) {
        SecurityService.recordFailedAttempt(rateLimitKey);
        return {
          success: false,
          error: 'Invalid email or password credentials.',
          remainingAttempts: Math.max(0, rateCheck.remainingAttempts - 1),
        };
      }

      matchedUser = {
        id: `usr_${cleanEmail.split('@')[0]}`,
        name: staffCreds.name,
        email: cleanEmail,
        role: staffCreds.role,
        preferredLanguage: 'en',
        preferredCurrency: 'USD',
        twoFactorEnabled: true,
        createdAt: '2024-01-01T00:00:00Z',
      };
    } else {
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
        SecurityService.recordFailedAttempt(rateLimitKey);
        return {
          success: false,
          error: 'Invalid credentials. Password must be at least 8 characters.',
          remainingAttempts: Math.max(0, rateCheck.remainingAttempts - 1),
        };
      }
    }

    const authenticatedUser: User = matchedUser;
    const isAdminAccount = authenticatedUser.role !== 'donor';

    if (isAdminAccount) {
      const totpSecret = staffCreds?.totpSecret || 'JBSWY3DPEHPK3PXP';
      setActiveTOTPSecret(totpSecret);

      if (!twoFactorCode) {
        setPending2FAUser(authenticatedUser);
        return {
          success: false,
          requires2FA: true,
          error: 'Please enter your 6-digit Authenticator TOTP code.',
        };
      }

      const is2FAValid = TOTPService.verifyTOTP(twoFactorCode, totpSecret);
      if (!is2FAValid) {
        SecurityService.recordFailedAttempt(rateLimitKey);
        return {
          success: false,
          requires2FA: true,
          error: 'Invalid 6-digit Two-Factor Authentication code.',
        };
      }
    }

    SecurityService.resetRateLimit(rateLimitKey);
    SecurityService.createSession(authenticatedUser.id, authenticatedUser.role, isAdminAccount);
    setUser(authenticatedUser);
    setTwoFactorVerified(isAdminAccount);
    setPending2FAUser(null);
    sessionStorage.setItem('asfjk_auth_user', JSON.stringify(authenticatedUser));

    return { success: true, user: authenticatedUser };
  };

  /**
   * Real Donor Registration Flow with Supabase Auth & Email Verification
   */
  const register = async (params: RegisterParams): Promise<LoginResult> => {
    const cleanEmail = params.email.trim().toLowerCase();

    if (!cleanEmail || !params.name || !params.password) {
      return { success: false, error: 'Name, email, and password are required.' };
    }

    if (params.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters with letters and numbers.' };
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: params.password,
          options: {
            data: {
              full_name: params.name.trim(),
              phone: params.phone,
              country: params.country || 'India',
              pan_tax_id: params.panTaxId,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return {
          success: true,
          error: 'Verification code sent to your email. Please verify to activate your donor account.',
        };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    // Local / Demo Registration Simulation
    const newDonor: User = {
      id: `usr_${Date.now()}`,
      name: params.name.trim(),
      email: cleanEmail,
      role: 'donor',
      phone: params.phone,
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
      createdAt: new Date().toISOString(),
    };

    setUser(newDonor);
    SecurityService.createSession(newDonor.id, 'donor', false);
    sessionStorage.setItem('asfjk_auth_user', JSON.stringify(newDonor));

    return { success: true, user: newDonor };
  };

  /**
   * Verify Donor Registration OTP
   */
  const verifyRegistrationOTP = async (email: string, token: string): Promise<LoginResult> => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: token.trim(),
          type: 'signup',
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const newUser: User = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || 'Donor',
            email: data.user.email || email,
            role: 'donor',
            phone: data.user.user_metadata?.phone,
            preferredLanguage: 'en',
            preferredCurrency: 'USD',
            createdAt: new Date().toISOString(),
          };

          setUser(newUser);
          SecurityService.createSession(newUser.id, 'donor', false);
          sessionStorage.setItem('asfjk_auth_user', JSON.stringify(newUser));

          return { success: true, user: newUser };
        }
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    return { success: true };
  };

  /**
   * Dedicated 2FA verification step during login challenge
   */
  const verify2FA = (code: string): boolean => {
    if (!pending2FAUser) return false;
    const isValid = TOTPService.verifyTOTP(code, activeTOTPSecret);
    if (isValid) {
      SecurityService.createSession(pending2FAUser.id, pending2FAUser.role, true);
      setUser(pending2FAUser);
      setTwoFactorVerified(true);
      setPending2FAUser(null);
      sessionStorage.setItem('asfjk_auth_user', JSON.stringify(pending2FAUser));
      return true;
    }
    return false;
  };

  /**
   * Update authenticated profile
   */
  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    sessionStorage.setItem('asfjk_auth_user', JSON.stringify(updatedUser));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: updates.name,
            phone: updates.phone,
            preferred_language: updates.preferredLanguage,
            preferred_currency: updates.preferredCurrency,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      } catch (e) {}
    }

    return true;
  };

  /**
   * Secure session termination
   */
  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    SecurityService.clearSession();
    setUser(null);
    setTwoFactorVerified(false);
    setPending2FAUser(null);
    sessionStorage.removeItem('asfjk_auth_user');
  };

  /**
   * Granular permission evaluator
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
      case 'volunteers:manage':
        return ['volunteer_manager', 'super_admin'].includes(user.role);
      case 'memberships:manage':
        return ['membership_manager', 'super_admin', 'finance_admin'].includes(user.role);
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
        verifyRegistrationOTP,
        verify2FA,
        logout,
        hasPermission,
        updateProfile,
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
