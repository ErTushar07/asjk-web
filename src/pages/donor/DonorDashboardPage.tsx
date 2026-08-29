import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { ReceiptService } from '../../services/receiptService';
import { 
  Heart, DollarSign, RefreshCw, FileText, Download, 
  ArrowRight, ShieldCheck, User, Calendar, CheckCircle2 
} from 'lucide-react';

interface DonorDashboardProps {
  onNavigate: (route: string) => void;
  onOpenDonateModal: () => void;
}

export const DonorDashboardPage: React.FC<DonorDashboardProps> = ({ onNavigate, onOpenDonateModal }) => {
  const { user } = useAuth();
  const { donations, recurringDonations, receipts, settings } = useDatabase();
  const { formatUSD } = useCurrency();

  const myDonations = donations.slice(0, 5);
  const myRecurring = recurringDonations.slice(0, 3);
  const totalDonatedUSD = donations
    .filter((d) => d.status === 'successful')
    .reduce((s, d) => s + d.amountUSD, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Donor Banner */}
      <div className="bg-brand-purple text-white p-8 sm:p-10 rounded-3xl shadow-brand-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-bold text-brand-pink uppercase tracking-widest block">
            Donor Impact Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome Back, {user?.name || 'David Thompson'}
          </h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-xl leading-relaxed">
            Thank you for standing with families and students across Jammu & Kashmir. Track your lifelong contributions, subscriptions, and instant tax exemption certificates.
          </p>
        </div>

        <button
          onClick={onOpenDonateModal}
          className="btn-secondary !py-3 !px-6 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-pink-glow relative z-10 flex-shrink-0"
        >
          <Heart className="w-4 h-4 fill-white" />
          <span>Make a New Gift</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-content-border shadow-brand-sm space-y-2">
          <div className="flex justify-between items-center text-brand-purple">
            <span className="text-xs font-bold uppercase text-content-muted">Total Contributed</span>
            <DollarSign className="w-5 h-5 text-brand-purple" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-brand-purple block">
            {formatUSD(totalDonatedUSD)}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Allocated & Audited
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-content-border shadow-brand-sm space-y-2">
          <div className="flex justify-between items-center text-brand-pink">
            <span className="text-xs font-bold uppercase text-content-muted">Total Donations</span>
            <Heart className="w-5 h-5 text-brand-pink fill-brand-pink" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-content-primary block">
            {donations.length}
          </span>
          <span className="text-[11px] text-content-muted">Direct allocations completed</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-content-border shadow-brand-sm space-y-2">
          <div className="flex justify-between items-center text-brand-blue">
            <span className="text-xs font-bold uppercase text-content-muted">Active Subscriptions</span>
            <RefreshCw className="w-5 h-5 text-brand-blue" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-brand-blue block">
            {recurringDonations.filter((r) => r.status === 'active').length}
          </span>
          <span className="text-[11px] text-content-muted">Monthly & Annual plans</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-content-border shadow-brand-sm space-y-2">
          <div className="flex justify-between items-center text-amber-500">
            <span className="text-xs font-bold uppercase text-content-muted">Tax Receipts</span>
            <FileText className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-content-primary block">
            {receipts.length}
          </span>
          <span className="text-[11px] text-brand-purple font-semibold">Section 80G / 501(c)(3) Certified</span>
        </div>
      </div>

      {/* Main Donor Content: Subscriptions & Recent Donations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Donations Table */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-content-primary">
              Recent Contribution History
            </h3>
            <button
              onClick={() => onNavigate('/donations')}
              className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1"
            >
              <span>View Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-content-border text-content-muted uppercase font-bold text-[10px]">
                  <th className="pb-3">Donation #</th>
                  <th className="pb-3">Program / Project</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-content-border">
                {myDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-soft transition-colors">
                    <td className="py-3.5 font-mono font-semibold text-brand-purple">
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
                            ? 'bg-emerald-100 text-emerald-700'
                            : d.status === 'refunded'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {d.status}
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
        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-content-primary">
              Active Recurring Plans
            </h3>
            <button
              onClick={() => onNavigate('/recurring-donations')}
              className="text-xs font-bold text-brand-purple hover:underline"
            >
              Manage All
            </button>
          </div>

          <div className="space-y-3">
            {myRecurring.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-2xl bg-surface-soft border border-content-border space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-content-primary truncate max-w-[150px]">
                    {sub.projectName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      sub.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : sub.status === 'paused'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>

                <div className="text-xs font-bold text-brand-purple">
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
            <span>View All Tax Exemption Receipts</span>
          </button>
        </div>
      </div>
    </div>
  );
};
