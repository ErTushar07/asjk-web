import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { TurnstileWidget } from '../../components/common/TurnstileWidget';
import { Lock, Mail, ArrowRight, User as UserIcon, CheckCircle2, Shield, AlertTriangle, Key, RefreshCw, ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'register' | 'forgot-password';
  onNavigate: (route: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onNavigate }) => {
  const { 
    login, 
    register, 
    verifyRegistrationOTP, 
    resendRegistrationOTP, 
    forgotPassword,
    resetPassword
  } = useAuth();
  const { t } = useLanguage();

  const pageTitles = {
    login: 'Sign In to Donor Portal',
    register: 'Create Donor Account',
    'forgot-password': 'Reset Password',
  };
  usePageMeta(pageTitles[mode] || 'Donor Portal', undefined, { noindex: true });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('India');
  const [panTaxId, setPanTaxId] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);

  // OTP Verification state for registration
  const [awaitingOTP, setAwaitingOTP] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // 2-Step Password Reset State
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [turnstileToken, setTurnstileToken] = useState('');
  const [submittedReset, setSubmittedReset] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Prefill registration details from URL parameters or last guest donation
  React.useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const qEmail = searchParams.get('email');
      const qName = searchParams.get('name');
      if (qEmail) setEmail(qEmail);
      if (qName) setName(qName);

      if (!qEmail) {
        const lastGuest = localStorage.getItem('asfjk_last_guest_donation');
        if (lastGuest) {
          const parsed = JSON.parse(lastGuest);
          if (parsed.donorEmail && !email) setEmail(parsed.donorEmail);
          if (parsed.donorName && !name) setName(parsed.donorName);
        }
      }
    } catch {
      // ignore storage access errors
    }
  }, [mode]);

  // Password strength calculation
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score, label: 'Good', color: 'bg-brand-blue' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = calculatePasswordStrength(password);
  const newPasswordStrength = calculatePasswordStrength(newPassword);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);
    setLoading(true);

    try {
      const res = await login(email, password, twoFactorCode);
      if (res.success) {
        onNavigate('/dashboard');
      } else if (res.requires2FA) {
        setRequires2FA(true);
        setAuthError(res.error || 'Please enter your 6-digit Authenticator TOTP code.');
      } else {
        setAuthError(res.error || 'Invalid email or password credentials.');
      }
    } catch (err: any) {
      setAuthError('Authentication service unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);

    if (!name || !email) {
      setAuthError('Full name and email address are required.');
      return;
    }

    if (!password || password.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name,
        email,
        password,
        phone,
        country,
        panTaxId,
      });

      if (res.success) {
        setAwaitingOTP(true);
        setAuthSuccessMsg(res.message || `A 6-digit verification code has been dispatched to ${email}.`);
      } else {
        setAuthError(res.error || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setAuthError('Registration service error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      const res = await verifyRegistrationOTP(email, otpCode);
      if (res.success) {
        onNavigate('/dashboard');
      } else {
        setAuthError(res.error || 'Invalid or expired verification code. Please check and retry.');
      }
    } catch (err: any) {
      setAuthError('Verification service error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setAuthError(null);
    setResending(true);
    try {
      const res = await resendRegistrationOTP(email);
      if (res.success) {
        setAuthSuccessMsg(res.message || `A fresh 6-digit code has been dispatched to ${email}.`);
      } else {
        setAuthError(res.error || 'Failed to resend code.');
      }
    } catch (e) {
      setAuthError('Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  // Dispatch 6-digit recovery code to email
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim().toLowerCase());
      if (res.success) {
        setResetStep('verify');
        setAuthSuccessMsg(res.message || `A 6-digit recovery code has been sent to ${email}.`);
      } else {
        setAuthError(res.error || 'Unable to send recovery email. Please check the address and retry.');
      }
    } catch (err: any) {
      setAuthError('Password recovery service error: ' + (err.message || 'Please try again later.'));
    } finally {
      setLoading(false);
    }
  };

  // Verify 6-digit recovery code and set new password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);

    if (!resetCode || resetCode.trim().length !== 6) {
      setAuthError('Please enter the 6-digit recovery code sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setAuthError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setAuthError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email.trim().toLowerCase(), resetCode.trim(), newPassword);
      if (res.success) {
        setAuthSuccessMsg('Your password has been successfully reset! Logging you in...');
        setTimeout(() => {
          onNavigate('/dashboard');
        }, 1200);
      } else {
        setAuthError(res.error || 'Invalid or expired recovery code. Please check your email and retry.');
      }
    } catch (err: any) {
      setAuthError('Password reset error: ' + (err.message || 'Please retry.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-content-border shadow-brand-md max-w-md w-full p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center mx-auto">
            {mode === 'login' ? (
              <Lock className="w-6 h-6 text-brand-pink" />
            ) : mode === 'register' ? (
              <UserIcon className="w-6 h-6 text-brand-purple" />
            ) : (
              <Mail className="w-6 h-6 text-brand-blue" />
            )}
          </div>

          <h2 className="text-2xl font-extrabold text-content-primary">
            {mode === 'login' && 'Sign In to Donor Portal'}
            {mode === 'register' && (awaitingOTP ? 'Verify Email Address' : 'Create Donor Account')}
            {mode === 'forgot-password' && 'Reset Your Password'}
          </h2>

          <p className="text-xs text-content-secondary">
            {mode === 'login' && 'Access your official 80G tax receipts, lifetime contributions, and subscriptions.'}
            {mode === 'register' &&
              (awaitingOTP
                ? `Enter the single-use 6-digit code sent to ${email}`
                : 'Join our verified donor family across Jammu & Kashmir.')}
            {mode === 'forgot-password' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Success Alert */}
        {authSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p>{authSuccessMsg}</p>
          </div>
        )}

        {/* Error Alert */}
        {authError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Mandatory OTP Verification Step for Registration */}
        {awaitingOTP ? (
          <form onSubmit={handleOTPSubmit} className="space-y-4 animate-fadeIn">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary uppercase flex items-center justify-between">
                <span>Enter 6-Digit OTP</span>
                <span className="text-[10px] text-content-muted font-normal">Single-use · 15 min expiry</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center font-mono text-2xl tracking-[0.5em] font-black py-3 rounded-xl border border-content-border focus:border-brand-purple outline-none bg-surface-soft"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-brand-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : 'Verify & Activate Account'}</span>
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => {
                  setAwaitingOTP(false);
                  setOtpCode('');
                }}
                className="text-content-muted hover:text-content-primary flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Edit
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resending}
                className="text-brand-purple hover:underline flex items-center gap-1 font-bold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>{resending ? 'Sending...' : 'Resend Code'}</span>
              </button>
            </div>
          </form>
        ) : mode === 'login' ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary uppercase">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="donor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-content-secondary uppercase">Password</label>
                <button
                  type="button"
                  onClick={() => onNavigate('/forgot-password')}
                  className="text-xs text-brand-purple hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
            </div>

            {requires2FA && (
              <div className="space-y-1.5 p-3 rounded-2xl bg-surface-soft border border-brand-purple/30">
                <label className="text-xs font-bold text-brand-purple uppercase flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" /> 6-Digit Authenticator Code (2FA)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center font-mono text-xl tracking-[0.4em] font-black py-2 rounded-xl border border-content-border focus:border-brand-purple outline-none bg-white"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-brand-sm"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : mode === 'register' ? (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-content-secondary uppercase">Full Legal Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ahmad Shah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-content-secondary uppercase">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="ahmad@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-content-secondary uppercase">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 94193 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-content-secondary uppercase">Country</label>
                <input
                  type="text"
                  placeholder="India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-content-secondary uppercase">PAN / Tax ID (Optional for 80G)</label>
              <input
                type="text"
                placeholder="ABCDE1234F"
                value={panTaxId}
                onChange={(e) => setPanTaxId(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-content-secondary uppercase">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>

              {password && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-content-muted">{passwordStrength.label}</span>
                </div>
              )}
            </div>

            <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-brand-sm"
            >
              <span>{loading ? 'Sending Verification Code...' : 'Send Verification OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Forgot Password / Reset Flow */
          <div className="space-y-4">
            {resetStep === 'request' ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-content-secondary uppercase">Registered Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="donor@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-content-muted">
                    We'll email you a secure 6-digit recovery code to reset your account password.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-brand-sm disabled:opacity-50"
                >
                  <span>{loading ? 'Dispatching Recovery Code...' : 'Send Recovery Code'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4 animate-fadeIn">
                <div className="p-3 bg-brand-purple/5 border border-brand-purple/20 rounded-2xl text-xs text-brand-purple flex items-center justify-between">
                  <span className="truncate">Code sent to: <strong>{email}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep('request');
                      setAuthError(null);
                      setAuthSuccessMsg(null);
                    }}
                    className="text-[11px] font-bold text-brand-purple underline hover:text-brand-pink ml-2 flex-shrink-0"
                  >
                    Change
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-content-secondary uppercase flex items-center justify-between">
                    <span>6-Digit Recovery Code</span>
                    <span className="text-[10px] text-content-muted font-normal">15 min expiry</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    placeholder="123456"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center font-mono text-2xl tracking-[0.5em] font-black py-2.5 rounded-xl border border-content-border focus:border-brand-purple outline-none bg-surface-soft"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-content-secondary uppercase">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                    />
                  </div>
                  {newPassword && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${newPasswordStrength.color} transition-all`}
                          style={{ width: `${(newPasswordStrength.score / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-content-muted">{newPasswordStrength.label}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-content-secondary uppercase">Confirm New Password</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || resetCode.length !== 6 || !newPassword || newPassword.length < 8}
                  className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-brand-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Updating Password...' : 'Update Password & Sign In'}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep('request');
                      setResetCode('');
                    }}
                    className="text-content-muted hover:text-content-primary flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setAuthError(null);
                      setResending(true);
                      try {
                        const res = await forgotPassword(email.trim().toLowerCase());
                        if (res.success) {
                          setAuthSuccessMsg(`A fresh recovery code was sent to ${email}.`);
                        } else {
                          setAuthError(res.error || 'Failed to resend code.');
                        }
                      } finally {
                        setResending(false);
                      }
                    }}
                    disabled={resending}
                    className="text-brand-purple hover:underline font-bold flex items-center gap-1 text-[11px] disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                    <span>{resending ? 'Resending...' : 'Resend Code'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-content-border text-center text-xs text-content-secondary space-y-2">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                onClick={() => onNavigate('/register')}
                className="font-bold text-brand-purple hover:underline"
              >
                Sign up & verify
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => onNavigate('/login')}
                className="font-bold text-brand-purple hover:underline"
              >
                Log in here
              </button>
            </p>
          )}

          <div className="flex items-center justify-center gap-1 text-[11px] text-content-muted">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Encrypted & Section 80G Certified Non-Profit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
