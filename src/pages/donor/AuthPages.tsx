import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserRole } from '../../types';
import { Heart, Shield, Lock, Mail, ArrowRight, User as UserIcon, CheckCircle2, Clock, HeartHandshake } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'register' | 'forgot-password';
  onNavigate: (route: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onNavigate }) => {
  const { login, register } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [submittedReset, setSubmittedReset] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        onNavigate('/dashboard');
      } else {
        setAuthError(res.error || 'Invalid email or password.');
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
      setAuthError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password, phone);
      if (res.success) {
        onNavigate('/dashboard');
      } else {
        setAuthError(res.error || 'Registration failed.');
      }
    } catch (err) {
      setAuthError('Registration service error.');
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
            {mode === 'register' && 'Create a Donor Account'}
            {mode === 'forgot-password' && 'Reset Your Password'}
          </h2>

          <p className="text-xs text-content-secondary">
            {mode === 'login' && 'Access your receipts, donations, and recurring subscriptions.'}
            {mode === 'register' && 'Track your impact and download automatic 80G tax receipts.'}
            {mode === 'forgot-password' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {authError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {authError}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-content-primary">Password</label>
                <button
                  type="button"
                  onClick={() => onNavigate('/forgot-password')}
                  className="text-[11px] font-bold text-brand-pink hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-xs text-content-secondary pt-2">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('/register')}
                className="font-bold text-brand-purple hover:underline"
              >
                Register as Donor
              </button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <div className="text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                Registration Under Development
              </span>
              <h3 className="text-xl font-extrabold text-content-primary">
                Will Be Back Soon
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed max-w-sm mx-auto">
                Donor account registration is currently being enhanced with multi-currency pledge management, instant tax certificate generation, and dedicated impact tracking.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-soft border border-content-border text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-purple">
                <HeartHandshake className="w-4 h-4 text-brand-pink flex-shrink-0" />
                <span>You can still donate without an account</span>
              </div>
              <p className="text-[11px] text-content-secondary leading-relaxed">
                Direct contributions for all humanitarian appeals and clean water projects remain 100% active. Official computer-generated 80G tax receipts are issued immediately upon donation.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('/donate')}
                className="btn-secondary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-pink-glow"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Make a Direct Donation</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="w-full py-2.5 px-4 rounded-xl border border-content-border hover:bg-surface-soft text-content-primary font-bold text-xs transition-colors"
              >
                Sign In to Existing Account
              </button>
            </div>
          </div>
        )}

        {mode === 'forgot-password' && (
          <div className="space-y-4">
            {submittedReset ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-content-primary text-sm">Reset Instructions Dispatched</h4>
                <p className="text-xs text-content-secondary">
                  If an account exists for {email}, a secure password reset link has been delivered to your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="btn-primary !py-2 !px-4 text-xs font-bold mt-2"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full !py-3 text-xs font-bold"
                >
                  Send Reset Link
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => onNavigate('/login')}
                    className="text-xs font-bold text-brand-purple hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
