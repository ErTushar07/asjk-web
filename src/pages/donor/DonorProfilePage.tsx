import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { User, ShieldCheck, CheckCircle2, Lock, Bell, ArrowLeft, Settings } from 'lucide-react';

type ProfileTab = 'profile' | 'settings' | 'security';

export const DonorProfilePage: React.FC<{ onNavigate?: (route: string) => void }> = ({ onNavigate }) => {
  usePageMeta('Donor Profile & Security', undefined, { noindex: true });
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/settings') return 'settings';
      if (path === '/security') return 'security';
    }
    return 'profile';
  });

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [taxId, setTaxId] = useState('');
  const [country, setCountry] = useState('India');
  const [address, setAddress] = useState('');

  const [emailReceipts, setEmailReceipts] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [newsletter, setNewsletter] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);

  const [savedMsg, setSavedMsg] = useState(false);

  // Sync tab with URL without full navigation
  const handleTabClick = (tab: ProfileTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `/${tab}`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <button
          onClick={() => (onNavigate ? onNavigate('/dashboard') : (window.location.href = '/dashboard'))}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-content-secondary hover:text-brand-purple mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          Donor Account & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-1">
          Manage your personal tax credentials, communication channels, and security settings.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-content-border pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabClick('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-brand-purple text-white shadow-brand-sm'
              : 'text-content-secondary hover:text-content-primary hover:bg-surface-soft'
          }`}
        >
          <User className="w-4 h-4" />
          Personal & Tax ID
        </button>
        <button
          type="button"
          onClick={() => handleTabClick('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-brand-purple text-white shadow-brand-sm'
              : 'text-content-secondary hover:text-content-primary hover:bg-surface-soft'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notification Settings
        </button>
        <button
          type="button"
          onClick={() => handleTabClick('security')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-brand-purple text-white shadow-brand-sm'
              : 'text-content-secondary hover:text-content-primary hover:bg-surface-soft'
          }`}
        >
          <Lock className="w-4 h-4" />
          Security & 2FA
        </button>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Personal & Tax info */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-4 animate-fadeIn">
            <h3 className="text-base font-extrabold text-brand-purple flex items-center gap-2">
              <User className="w-4 h-4" /> Personal & Tax Identification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">PAN / Tax ID (for 80G / 501c3)</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1">Official Postal / Billing Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>
          </div>
        )}

        {/* Communication Preferences */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-4 animate-fadeIn">
            <h3 className="text-base font-extrabold text-brand-purple flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-pink" /> Communication & Notification Preferences
            </h3>

            <div className="space-y-3">
              {[
                { label: 'Instant PDF Tax Receipt via Email', desc: 'Receive a downloadable tax certificate immediately after each donation', val: emailReceipts, set: setEmailReceipts },
                { label: 'Project Field Progress & Milestone Updates', desc: 'Monthly photos and reports of the specific projects you support', val: projectUpdates, set: setProjectUpdates },
                { label: 'Foundation Newsletter & Annual Audited Report', desc: 'Quarterly transparency bulletins and year-end audited accounts', val: newsletter, set: setNewsletter },
              ].map((pref, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl bg-surface-soft hover:bg-surface-card transition-colors">
                  <input
                    type="checkbox"
                    checked={pref.val}
                    onChange={(e) => pref.set(e.target.checked)}
                    className="rounded text-brand-purple focus:ring-brand-purple w-4 h-4 mt-0.5"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-content-primary block">{pref.label}</span>
                    <span className="text-content-secondary text-[11px]">{pref.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-4 animate-fadeIn">
            <h3 className="text-base font-extrabold text-brand-purple flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-blue" /> Security & Two-Factor Authentication
            </h3>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-soft">
              <div className="text-xs">
                <span className="font-bold text-content-primary block">Two-Factor Authentication (2FA)</span>
                <span className="text-content-muted text-[11px]">Enforce extra verification code when signing in</span>
              </div>
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={(e) => setTwoFactor(e.target.checked)}
                className="rounded text-brand-purple focus:ring-brand-purple w-5 h-5"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary !py-3.5 !px-8 text-xs font-bold"
        >
          Save Preferences
        </button>
      </form>
    </div>
  );
};
