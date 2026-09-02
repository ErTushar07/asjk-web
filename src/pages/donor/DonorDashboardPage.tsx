import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useCountUp } from '../../hooks/useCountUp';
import { ReceiptService } from '../../services/receiptService';
import { 
  Heart, DollarSign, RefreshCw, FileText, Download, 
  ArrowRight, ShieldCheck, User, Calendar, CheckCircle2 
} from 'lucide-react';

interface DonorDashboardProps {
  onNavigate: (route: string) => void;
  onOpenDonateModal: () => void;
}

const StatCard: React.FC<{
  label: string;
  value: number;
  isCurrency?: boolean;
  prefix?: string;
  icon: React.ReactNode;
  footerText: React.ReactNode;
  colorClass?: string;
}> = ({ label, value, isCurrency, prefix = '', icon, footerText, colorClass = 'text-content-primary' }) => {
  const { count, ref } = useCountUp(value, 1500);

  return (
    <div ref={ref} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-content-border dark:border-slate-800 shadow-brand-sm space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold uppercase text-content-muted">{label}</span>
        {icon}
      </div>
      <span className={`text-2xl sm:text-3xl font-black block font-mono ${colorClass}`}>
        {prefix}{count.toLocaleString()}
      </span>
      {footerText}
    </div>
  );
};

export const DonorDashboardPage: React.FC<DonorDashboardProps> = ({ onNavigate, onOpenDonateModal }) => {
  const { user } = useAuth();
  const { donations, recurringDonations, receipts, settings } = useDatabase();
  const { formatUSD } = useCurrency();
  const { t } = useLanguage();

  usePageMeta(t('donor.dashboard', 'Donor Dashboard'), undefined, { noindex: true });

  const donorEmail = (user?.email || '').toLowerCase().trim();
  const userDonations = donations.filter((d) => d.donorEmail.toLowerCase().trim() === donorEmail);
  const userRecurring = recurringDonations.filter((r) => r.donorEmail.toLowerCase().trim() === donorEmail);
  const userReceipts = receipts.filter((rc) => rc.donorEmail.toLowerCase().trim() === donorEmail);

  const myDonations = userDonations.slice(0, 5);
  const myRecurring = userRecurring.slice(0, 3);
  const totalDonatedUSD = userDonations
    .filter((d) => d.status === 'successful')
    .reduce((s, d) => s + d.amountUSD, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      {/* Donor Banner */}
      <div className="bg-brand-purple text-white p-8 sm:p-10 rounded-3xl shadow-brand-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-bold text-brand-pink uppercase tracking-widest block">
            {t('donor.portal_badge', 'Donor Impact Portal')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('donor.welcome', 'Welcome Back')}, {user?.name || 'Valued Donor'}
          </h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-xl leading-relaxed">
            {t('donor.welcome_sub', 'Thank you for standing with families and students across Jammu & Kashmir. Track your lifelong contributions, subscriptions, and instant tax exemption certificates.')}
          </p>
        </div>

        <button
          onClick={onOpenDonateModal}
          className="btn-secondary !py-3 !px-6 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-pink-glow relative z-10 flex-shrink-0"
        >
          <Heart className="w-4 h-4 fill-white" />
          <span>{t('donor.new_gift', 'Make a New Gift')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label={t('donor.total_donated', 'Total Donated')}
          value={totalDonatedUSD}
          prefix="$"
          colorClass="text-brand-purple dark:text-purple-300"
          icon={<DollarSign className="w-5 h-5 text-brand-purple dark:text-purple-400" />}
          footerText={
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t('impact.field_verified', '100% Allocated & Audited')}
            </span>
          }
        />

        <StatCard
          label={t('donor.my_contributions', 'Total Donations')}
          value={userDonations.length}
          colorClass="text-content-primary"
          icon={<Heart className="w-5 h-5 text-brand-pink fill-brand-pink" />}
          footerText={<span className="text-[11px] text-content-muted">Direct allocations completed</span>}
        />

        <StatCard
          label={t('donor.active_plans', 'Active Subscriptions')}
          value={userRecurring.filter((r) => r.status === 'active').length}
          colorClass="text-brand-blue dark:text-sky-300"
          icon={<RefreshCw className="w-5 h-5 text-brand-blue dark:text-sky-400" />}
          footerText={<span className="text-[11px] text-content-muted">Monthly & Annual plans</span>}
        />

        <StatCard
          label={t('donor.tax_receipts', 'Tax Receipts (80G)')}
          value={userReceipts.length}
          colorClass="text-content-primary"
          icon={<FileText className="w-5 h-5 text-amber-500" />}
          footerText={<span className="text-[11px] text-brand-purple dark:text-purple-400 font-semibold">Section 80G / 501(c)(3) Certified</span>}
        />
      </div>

      {/* Main Donor Content: Subscriptions & Recent Donations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Donations Table */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-content-border dark:border-slate-800 shadow-brand-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-content-primary">
              {t('donor.recent_contributions', 'Recent Contributions')}
            </h3>
            <button
              onClick={() => onNavigate('/donations')}
              className="text-xs font-bold text-brand-purple dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>{t('donor.view_all_donations', 'View Full History')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-content-border dark:border-slate-800 text-content-muted uppercase font-bold text-[10px]">
                  <th className="pb-3">Donation #</th>
                  <th className="pb-3">Program / Project</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-content-border dark:divide-slate-800">
                {myDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-soft dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 font-mono font-semibold text-brand-purple dark:text-purple-300">
                      {d.donationNumber}
                    </td>
                    <td className="py-3.5 font-medium text-content-primary max-w-[200px] truncate">
                      {d.targetName}
                    </td>
                    <td className="py-3.5 font-bold text-content-primary">
                      {d.currency} {d.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          d.status === 'successful'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : d.status === 'refunded'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {d.status === 'successful' ? t('donor.status_successful', 'Successful') : d.status === 'refunded' ? t('donor.status_refunded', 'Refunded') : d.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {d.receiptNumber && (
                        <button
                          onClick={() => {
                            const r = receipts.find((x) => x.receiptNumber === d.receiptNumber);
                            if (r) ReceiptService.downloadReceipt(r, settings);
                          }}
                          className="btn-outline !py-1 !px-2 text-[10px] font-bold inline-flex items-center gap-1"
                          title="Download PDF"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Active Recurring Plans Card */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-content-border dark:border-slate-800 shadow-brand-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-content-primary">
              {t('donor.active_recurring', 'Active Recurring Plans')}
            </h3>
            <button
              onClick={() => onNavigate('/recurring-donations')}
              className="text-xs font-bold text-brand-purple dark:text-purple-400 hover:underline"
            >
              {t('donor.view_recurring_plans', 'Manage All')}
            </button>
          </div>

          <div className="space-y-3">
            {myRecurring.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-2xl bg-surface-soft dark:bg-slate-950 border border-content-border dark:border-slate-800 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-content-primary truncate max-w-[150px]">
                    {sub.projectName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      sub.status === 'active'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : sub.status === 'paused'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>

                <div className="text-xs font-bold text-brand-purple dark:text-purple-300">
                  {sub.currency} {sub.amount.toLocaleString()} / {sub.frequency}
                </div>

                <div className="flex justify-between text-[11px] text-content-muted pt-1">
                  <span>Next: {new Date(sub.nextPaymentDate).toLocaleDateString()}</span>
                  <span>Total: ${sub.totalCollectedUSD}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('/receipts')}
            className="btn-outline w-full !py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('donor.tax_receipts', 'View All Tax Exemption Receipts')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
