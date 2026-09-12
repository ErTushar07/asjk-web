import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { SecurityService } from '../services/securityService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface LoginResult {
  success: boolean;
  requires2FA?: boolean;
  requiresOTP?: boolean;
  error?: string;
  remainingAttempts?: number;
  retryAfterSeconds?: number;
  user?: User;
  message?: string;
}

interface RegisterParams {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  country?: string;
  panTaxId?: string;
}

interface PendingRegistration {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  country?: string;
  panTaxId?: string;
  otpCode: string;
  expiresAt: number;
}

interface VerifiedDonorRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  phone?: string;
  country?: string;
  panTaxId?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isDonor: boolean;
  role: UserRole | 'guest';
  twoFactorVerified: boolean;
  login: (email: string, password?: string, twoFactorCode?: string) => Promise<LoginResult>;
  register: (params: RegisterParams) => Promise<LoginResult>;
  verifyRegistrationOTP: (email: string, token: string) => Promise<LoginResult>;
  resendRegistrationOTP: (email: string) => Promise<LoginResult>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  verify2FA: (code: string) => boolean;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateSecureOTP(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return (100000 + (arr[0] % 900000)).toString();
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const activeSession = SecurityService.getActiveSession();
    if (activeSession) {
      const savedUser = sessionStorage.getItem('asfjk_auth_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {
          console.debug('[ASFJK] Suppressed non-critical error:', e);
        }
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [twoFactorVerified, setTwoFactorVerified] = useState<boolean>(() => {
    const session = SecurityService.getActiveSession();
    return session ? session.twoFactorVerified : false;
  });

  const [pending2FAUser, setPending2FAUser] = useState<User | null>(null);
  const [activeTOTPSecret, setActiveTOTPSecret] = useState<string>('');

  // Ephemeral in-memory store for pending registrations awaiting email OTP verification
  const [pendingRegistrations, setPendingRegistrations] = useState<Map<string, PendingRegistration>>(new Map());

  // Session-scoped Verified Donors registry (only for offline/demo mode)
  const [verifiedDonors, setVerifiedDonors] = useState<Record<string, VerifiedDonorRecord>>(() => {
    try {
      const saved = sessionStorage.getItem('asfjk_verified_donors');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.debug('[ASFJK] Suppressed non-critical error:', e);
    }
    return {};
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('asfjk_verified_donors', JSON.stringify(verifiedDonors));
    } catch (e) {
      console.debug('[ASFJK] Suppressed non-critical error:', e);
    }
  }, [verifiedDonors]);

  // Ephemeral/session-scoped store for pending password resets
  const [pendingPasswordResets, setPendingPasswordResets] = useState<Record<string, { email: string; resetCode: string; expiresAt: number }>>(() => {
    try {
      const saved = sessionStorage.getItem('asfjk_pending_pwd_resets');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.debug('[ASFJK] Suppressed non-critical error:', e);
    }
    return {};
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('asfjk_pending_pwd_resets', JSON.stringify(pendingPasswordResets));
    } catch (e) {
      console.debug('[ASFJK] Suppressed non-critical error:', e);
    }
  }, [pendingPasswordResets]);

  // Supabase Auth State Listener
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data }) => {
        if (!data?.session && !SecurityService.getActiveSession()) {
          setUser(null);
        }
      }).finally(() => {
        setIsLoading(false);
      });

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
    } else {
      setIsLoading(false);
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

    if (!password) {
      SecurityService.recordFailedAttempt(rateLimitKey);
      return {
        success: false,
        error: 'Password is required.',
        remainingAttempts: Math.max(0, rateCheck.remainingAttempts - 1),
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
            const totpSecret = profile?.totp_secret_encrypted || '';
            if (totpSecret) {
              setActiveTOTPSecret(totpSecret);
            }

            if (!twoFactorCode) {
              setPending2FAUser(authenticatedUser);
              return {
                success: false,
                requires2FA: true,
                error: 'Please enter your 6-digit Authenticator TOTP code.',
              };
            }

            if (totpSecret) {
              const is2FAValid = SecurityService.verify2FACode(twoFactorCode, totpSecret);
              if (!is2FAValid) {
                SecurityService.recordFailedAttempt(rateLimitKey);
                return {
                  success: false,
                  requires2FA: true,
                  error: 'Invalid 6-digit Two-Factor Authentication code. Please verify your authenticator app.',
                };
              }
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

    // 3. Administrative Staff Authentication via Server-Side Edge Function
    if (cleanEmail.endsWith('@asfjk.org')) {
      if (!isSupabaseConfigured) {
        SecurityService.recordFailedAttempt(rateLimitKey);
        return {
          success: false,
          error: 'Admin login requires server configuration. Please contact your system administrator.',
        };
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-admin-login', {
          body: {
            email: cleanEmail,
            password,
            twoFactorCode,
          },
        });

        if (error || !data?.success) {
          SecurityService.recordFailedAttempt(rateLimitKey);
          if (data?.requires2FA) {
            if (data.user) {
              setPending2FAUser(data.user);
            }
            if (data.totpSecret) {
              setActiveTOTPSecret(data.totpSecret);
            }
            return {
              success: false,
              requires2FA: true,
              error: data.error || 'Please enter your 6-digit Authenticator TOTP code.',
            };
          }
          return {
            success: false,
            error: data?.error || error?.message || 'Invalid administrative credentials.',
            remainingAttempts: Math.max(0, rateCheck.remainingAttempts - 1),
          };
        }

        const authenticatedUser: User = data.user;
        SecurityService.resetRateLimit(rateLimitKey);
        SecurityService.createSession(authenticatedUser.id, authenticatedUser.role, true);
        setUser(authenticatedUser);
        setTwoFactorVerified(true);
        setPending2FAUser(null);
        sessionStorage.setItem('asfjk_auth_user', JSON.stringify(authenticatedUser));

        return { success: true, user: authenticatedUser };
      } catch (err: any) {
        SecurityService.recordFailedAttempt(rateLimitKey);
        return {
          success: false,
          error: err.message || 'Admin authentication failed. Please try again.',
          remainingAttempts: Math.max(0, rateCheck.remainingAttempts - 1),
        };
      }
    }

    // 4. Verified Donor Authentication (Local PBKDF2)
    const verifiedDonor = verifiedDonors[cleanEmail];
    if (verifiedDonor) {
      const isPasswordValid = await SecurityService.verifyPassword(password, verifiedDonor.passwordHash, verifiedDonor.salt);
      if (!isPasswordValid) {
        SecurityService.recordFailedAttempt(rateLimitKey);
        return {
          success: false,
          error: 'Invalid email or password credentials.',
          remainingAttempts: Math.max(0, rateCheck.remainingAttempts - 1),
        };
      }

      const authenticatedUser: User = {
        id: verifiedDonor.id,
        name: verifiedDonor.name,
        email: verifiedDonor.email,
        role: 'donor',
        phone: verifiedDonor.phone,
        preferredLanguage: 'en',
        preferredCurrency: 'USD',
        createdAt: verifiedDonor.createdAt,
      };

      SecurityService.resetRateLimit(rateLimitKey);
      SecurityService.createSession(authenticatedUser.id, authenticatedUser.role, false);
      setUser(authenticatedUser);
      setTwoFactorVerified(false);
      setPending2FAUser(null);
      sessionStorage.setItem('asfjk_auth_user', JSON.stringify(authenticatedUser));

      return { success: true, user: authenticatedUser };
    }

    // User is neither staff nor verified donor! STRICT REJECTION (NO UNVERIFIED ACCOUNTS)
    SecurityService.recordFailedAttempt(rateLimitKey);
    return {
      success: false,
      error: 'No verified donor account exists for this email address. Please register and complete email verification first.',
      remainingAttempts: Math.max(0, rateCheck.remainingAttempts - 1),
    };
  };

  /**
   * Real Donor Registration Flow: Generates single-use 6-digit OTP and mandates verification
   */
  const register = async (params: RegisterParams): Promise<LoginResult> => {
    const cleanEmail = params.email.trim().toLowerCase();

    if (!cleanEmail || !params.name || !params.password) {
      return { success: false, error: 'Full legal name, email, and password are required.' };
    }

    if (params.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters with numbers and symbols.' };
    }

    // Check if account already registered and verified
    if (verifiedDonors[cleanEmail] || cleanEmail.endsWith('@asfjk.org')) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in directly.',
      };
    }

    // Generate single-use 6-digit OTP code (e.g. 849201)
    const otpCode = generateSecureOTP();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiration

    // Store in pending registration map
    const pendingData: PendingRegistration = {
      name: params.name.trim(),
      email: cleanEmail,
      password: params.password,
      phone: params.phone,
      country: params.country || 'India',
      panTaxId: params.panTaxId,
      otpCode,
      expiresAt,
    };

    setPendingRegistrations((prev) => {
      const next = new Map(prev);
      next.set(cleanEmail, pendingData);
      return next;
    });

    // If Supabase is connected, call Supabase signUp to send real email confirmation
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signUp({
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
      } catch (err: any) {
        console.warn('Supabase signUp error:', err.message);
      }
    }

    // Dispatch real email via EmailService
    try {
      const { EmailService } = await import('../services/emailService');
      await EmailService.sendEmail({
        to: cleanEmail,
        subject: 'Verify Your Donor Account — Al Shujaiat Foundation',
        template: 'otp_verification',
        data: { name: params.name, otpCode },
      });
    } catch (e) {
      console.debug('[ASFJK] Suppressed non-critical error:', e);
    }

    // NOTICE: We DO NOT set user session here! Account is NOT generated until verification succeeds.
    return {
      success: true,
      requiresOTP: true,
      message: `A single-use 6-digit verification code has been dispatched to ${cleanEmail}. Please check your inbox (and spam folder) to activate your donor account.`,
    };
  };

  /**
   * Resend Registration OTP
   */
  const resendRegistrationOTP = async (email: string): Promise<LoginResult> => {
    const cleanEmail = email.trim().toLowerCase();
    const pending = pendingRegistrations.get(cleanEmail);

    if (!pending) {
      return { success: false, error: 'No pending registration found for this email. Please sign up again.' };
    }

    const newOtp = generateSecureOTP();
    pending.otpCode = newOtp;
    pending.expiresAt = Date.now() + 15 * 60 * 1000;

    setPendingRegistrations((prev) => {
      const next = new Map(prev);
      next.set(cleanEmail, pending);
      return next;
    });

    // Dispatch fresh email
    try {
      const { EmailService } = await import('../services/emailService');
      await EmailService.sendEmail({
        to: cleanEmail,
        subject: 'New Verification Code — Al Shujaiat Foundation',
        template: 'otp_verification',
        data: { name: pending.name, otpCode: newOtp },
      });
    } catch (e) {
      console.debug('[ASFJK] Suppressed non-critical error:', e);
    }

    return {
      success: true,
      message: `A fresh verification code has been dispatched to ${cleanEmail}.`,
    };
  };

  /**
   * Verify Donor Registration OTP & Officially Create the Activated Donor Account
   */
  const verifyRegistrationOTP = async (email: string, token: string): Promise<LoginResult> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim().replace(/\s|-/g, '');

    if (!cleanToken || cleanToken.length !== 6) {
      return { success: false, error: 'Please enter a valid 6-digit verification code.' };
    }

    // 1. Supabase Auth Verification Flow
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'signup',
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const newUser: User = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || 'Donor',
            email: data.user.email || cleanEmail,
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

    // 2. Local / Standard Verification Flow
    const pending = pendingRegistrations.get(cleanEmail);

    if (!pending) {
      return {
        success: false,
        error: 'No pending registration found or verification session has expired. Please register again.',
      };
    }

    if (Date.now() > pending.expiresAt) {
      setPendingRegistrations((prev) => {
        const next = new Map(prev);
        next.delete(cleanEmail);
        return next;
      });
      return { success: false, error: 'Verification code has expired. Please request a new code.' };
    }

    if (pending.otpCode !== cleanToken) {
      return { success: false, error: 'Invalid 6-digit verification code. Please check your email and retry.' };
    }

    // OTP IS VALID! Compute PBKDF2 hash & create officially verified donor account
    const hashRes = await SecurityService.hashPassword(pending.password || 'DonorPass2026!');
    const newDonorRecord: VerifiedDonorRecord = {
      id: `usr_donor_${Date.now()}`,
      name: pending.name,
      email: cleanEmail,
      passwordHash: hashRes.hash,
      salt: hashRes.salt,
      phone: pending.phone,
      country: pending.country,
      panTaxId: pending.panTaxId,
      createdAt: new Date().toISOString(),
    };

    // Save to verified donor registry
    setVerifiedDonors((prev) => ({
      ...prev,
      [cleanEmail]: newDonorRecord,
    }));

    // Clear pending registration
    setPendingRegistrations((prev) => {
      const next = new Map(prev);
      next.delete(cleanEmail);
      return next;
    });

    const verifiedUser: User = {
      id: newDonorRecord.id,
      name: newDonorRecord.name,
      email: newDonorRecord.email,
      role: 'donor',
      phone: newDonorRecord.phone,
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
      createdAt: newDonorRecord.createdAt,
    };

    // Activate session & log in
    SecurityService.createSession(verifiedUser.id, 'donor', false);
    setUser(verifiedUser);
    sessionStorage.setItem('asfjk_auth_user', JSON.stringify(verifiedUser));

    return { success: true, user: verifiedUser };
  };

  /**
   * Dedicated 2FA verification step during login challenge
   */
  const verify2FA = (code: string): boolean => {
    if (!pending2FAUser) return false;
    const isValid = SecurityService.verify2FACode(code, activeTOTPSecret);
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
      } catch (e) {
        console.debug('[ASFJK] Suppressed non-critical error:', e);
      }
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
      } catch (e) {
        console.debug('[ASFJK] Suppressed non-critical error:', e);
      }
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

  /**
   * Request password reset code via Supabase Auth and transactional email
   */
  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Generate single-use 6-digit recovery code
    const resetCode = generateSecureOTP();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    setPendingPasswordResets((prev) => ({
      ...prev,
      [cleanEmail]: { email: cleanEmail, resetCode, expiresAt },
    }));

    // Dispatch Supabase Auth recovery if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/forgot-password?mode=reset&email=${encodeURIComponent(cleanEmail)}`,
        });
      } catch (sbErr: any) {
        console.warn('Supabase resetPasswordForEmail notice:', sbErr);
      }
    }

    // Dispatch transactional email via EmailService with 6-digit recovery code
    try {
      const { EmailService } = await import('../services/emailService');
      await EmailService.sendEmail({
        to: cleanEmail,
        subject: `[ASFJK] Password Reset Code: ${resetCode}`,
        template: 'password_reset',
        data: {
          name: verifiedDonors[cleanEmail]?.name || 'Valued Supporter',
          resetCode,
          otpCode: resetCode,
        },
      });
    } catch (mailErr) {
      console.warn('EmailService password reset dispatch notice:', mailErr);
    }

    return {
      success: true,
      message: `A secure 6-digit recovery code has been dispatched to ${cleanEmail}. Please check your inbox (and spam folder) to reset your password.`,
    };
  };

  /**
   * Verify recovery code and update password securely
   */
  const resetPassword = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim().replace(/\s|-/g, '');

    if (!cleanEmail || !cleanCode || cleanCode.length !== 6) {
      return { success: false, error: 'Please enter a valid 6-digit recovery code.' };
    }

    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters long.' };
    }

    const pending = pendingPasswordResets[cleanEmail];
    if (!pending) {
      return { success: false, error: 'No active password reset request found. Please request a new code.' };
    }

    if (Date.now() > pending.expiresAt) {
      setPendingPasswordResets((prev) => {
        const next = { ...prev };
        delete next[cleanEmail];
        return next;
      });
      return { success: false, error: 'The recovery code has expired. Please request a new one.' };
    }

    if (pending.resetCode !== cleanCode) {
      return { success: false, error: 'Invalid recovery code. Please check your email and retry.' };
    }

    // Update password in Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch (sbErr: any) {
        console.warn('Supabase updateUser password notice:', sbErr);
      }
    }

    // Update PBKDF2 hash in verified donor records
    const hashRes = await SecurityService.hashPassword(newPassword);
    const existingDonor = verifiedDonors[cleanEmail];

    const updatedDonorRecord: VerifiedDonorRecord = existingDonor
      ? {
          ...existingDonor,
          passwordHash: hashRes.hash,
          salt: hashRes.salt,
        }
      : {
          id: `usr_donor_${Date.now()}`,
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          passwordHash: hashRes.hash,
          salt: hashRes.salt,
          createdAt: new Date().toISOString(),
        };

    setVerifiedDonors((prev) => ({
      ...prev,
      [cleanEmail]: updatedDonorRecord,
    }));

    // Clear pending reset
    setPendingPasswordResets((prev) => {
      const next = { ...prev };
      delete next[cleanEmail];
      return next;
    });

    // Auto-login to donor portal
    const verifiedUser: User = {
      id: updatedDonorRecord.id,
      name: updatedDonorRecord.name,
      email: updatedDonorRecord.email,
      role: 'donor',
      phone: updatedDonorRecord.phone,
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
      createdAt: updatedDonorRecord.createdAt,
    };

    SecurityService.createSession(verifiedUser.id, 'donor', false);
    setUser(verifiedUser);
    sessionStorage.setItem('asfjk_auth_user', JSON.stringify(verifiedUser));

    return {
      success: true,
      message: 'Your password has been successfully updated! You are now logged in.',
    };
  };

  const role: UserRole | 'guest' = user ? user.role : 'guest';
  const isAdmin = user ? user.role !== 'donor' : false;
  const isDonor = user ? user.role === 'donor' : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        isDonor,
        role,
        twoFactorVerified,
        login,
        register,
        verifyRegistrationOTP,
        resendRegistrationOTP,
        forgotPassword,
        resetPassword,
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
