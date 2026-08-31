import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Lock, Key, AlertTriangle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

interface AdminAuthGateProps {
  onSuccess: () => void;
  onNavigate: (route: string) => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({ onSuccess, onNavigate }) => {
  const { login, verify2FA } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        onSuccess();
      } else if (res.requires2FA) {
        setStep('2fa');
      } else {
        setError(res.error || 'Authentication failed. Unauthorized.');
        if (res.retryAfterSeconds) {
          setLockoutTimer(res.retryAfterSeconds);
        }
      }
    } catch (err: any) {
      setError('A secure gateway error occurred. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password, twoFactorCode);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Invalid 2FA code. Please retry.');
      }
    } catch (err) {
      setError('Two-factor validation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-brand-pink selection:text-white">
      {/* Security Header Shield */}
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-brand-purple/20 border border-brand-purple/40 text-brand-pink flex items-center justify-center mx-auto shadow-pink-glow">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            RESTRICTED ADMIN PORTAL
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Authorized Foundation Personnel Only. All access attempts, IP addresses, and session activities are cryptographically signed and logged.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-600/50 text-rose-300 text-xs font-semibold flex items-start gap-3 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {step === 'credentials' ? (
            <form onSubmit={handleCredentialSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Staff Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="admin@asfjk.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Security Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Validating Credentials...' : 'Authenticate & Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handle2FASubmit} className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-brand-purple/10 border border-brand-purple/30 rounded-xl flex items-center gap-2.5 text-xs text-brand-pink font-semibold">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <span>Two-Factor Authentication Required</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  placeholder="000 000"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="w-full px-4 py-3 text-center tracking-[0.3em] font-mono text-base font-black rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-brand-pink"
                />
                <span className="text-[10px] text-slate-500 block text-center">
                  Enter the time-based OTP generated by your registered 2FA app
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="w-1/3 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-brand-pink hover:bg-brand-pink-dark text-white font-black text-xs uppercase tracking-wider shadow-pink-glow disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Session'}
                </button>
              </div>
            </form>
          )}

          <div className="border-t border-slate-800/80 pt-4 text-center">
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
