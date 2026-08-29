import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserRole } from '../../types';
import { Heart, Shield, Lock, Mail, ArrowRight, User as UserIcon, CheckCircle2 } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'register' | 'forgot-password';
  onNavigate: (route: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onNavigate }) => {
  const { login, register, switchRole } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('david.thompson@example.com');
  const [password, setPassword] = useState('password123');
  const [phone, setPhone] = useState('');
  const [selectedDemoRole, setSelectedDemoRole] = useState<UserRole>('donor');
  const [submittedReset, setSubmittedReset] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, selectedDemoRole);
    if (selectedDemoRole === 'donor') {
      onNavigate('/dashboard');
    } else {
      onNavigate('/admin');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    register(name, email, phone);
    onNavigate('/dashboard');
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

        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Demo Quick Role Selector */}
            <div className="bg-surface-highlight p-3 rounded-2xl border border-brand-blue/30 space-y-1.5">
              <span className="block text-[11px] font-bold text-brand-purple uppercase">
                Demo Role Preset
              </span>
              <select
                value={selectedDemoRole}
                onChange={(e) => {
                  const r = e.target.value as UserRole;
                  setSelectedDemoRole(r);
                  if (r === 'super_admin') setEmail('amin.ganai@asfjk.org');
                  else if (r === 'finance_admin') setEmail('michael.carter@asfjk.org');
                  else if (r === 'project_manager') setEmail('daniel.wilson@asfjk.org');
                  else if (r === 'content_manager') setEmail('emily.carter@asfjk.org');
                  else setEmail('david.thompson@example.com');
                }}
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-xl border border-content-border bg-white"
              >
                <option value="donor">Donor (David Thompson - Donor Portal)</option>
                <option value="super_admin">Executive Director (Mohd Amin Ganai - Admin)</option>
                <option value="finance_admin">Finance Director (Michael Carter - Admin)</option>
                <option value="project_manager">Project Manager (Daniel Wilson - Admin)</option>
                <option value="content_manager">Communications Director (Emily Carter - Admin)</option>
                <option value="auditor">Auditor (Independent Compliance - Admin)</option>
              </select>
            </div>

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
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. David Thompson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. david.thompson@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 415 555 0192"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Create Password *</label>
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
              className="btn-secondary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-pink-glow"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-xs text-content-secondary pt-2">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="font-bold text-brand-purple hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
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
