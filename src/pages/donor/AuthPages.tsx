import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { TurnstileWidget } from '../../components/common/TurnstileWidget';
import { Lock, Mail, ArrowRight, User as UserIcon, CheckCircle2, Shield, Phone, Globe, FileText, AlertTriangle, Key } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'register' | 'forgot-password';
  onNavigate: (route: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onNavigate }) => {
  const { login, register, verifyRegistrationOTP } = useAuth();
  const { t } = useLanguage();

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

  const [turnstileToken, setTurnstileToken] = useState('');
  const [submittedReset, setSubmittedReset] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      const res = await login(email, password, twoFactorCode);
      if (res.success) {
        onNavigate('/dashboard');
      } else if (res.requires2FA) {
        setRequires2FA(true);
        setAuthError(res.error || 'Please enter your 2FA code.');
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
    if (!name || !email) return;

    if (!password || password.length < 8) {
      setAuthError('Password must be at least 8 characters with numbers and symbols.');
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
        if (res.error?.includes('Verification code sent')) {
          setAwaitingOTP(true);
        } else {
          onNavigate('/dashboard');
        }
      } else {
        setAuthError(res.error || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      setAuthError('Registration service error.');
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
        setAuthError(res.error || 'Invalid verification code. Please check your email.');
      }
    } catch (err: any) {
      setAuthError('Verification service error.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedReset(true);
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
            {mode === 'login' && 'Access your official 80G receipts, lifetime contributions, and subscriptions.'}
            {mode === 'register' && (awaitingOTP ? `Enter the 6-digit verification code sent to ${email}` : 'Join our verified donor family across Jammu & Kashmir.')}
            {mode === 'forgot-password' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {authError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* OTP Verification Mode for Registration */}
        {awaitingOTP ? (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary uppercase">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center font-mono text-2xl tracking-[0.5em] font-black py-3 rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
            </button>
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
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Forgot Password Form */
          <div className="space-y-4">
            {submittedReset ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Reset Instructions Dispatched
                </p>
                <p>If an account exists for {email}, a secure recovery link has been delivered to your inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-content-secondary uppercase">Registered Email</label>
                  <input
                    type="email"
                    required
                    placeholder="donor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <span>Send Recovery Email</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
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
                Sign up here
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
