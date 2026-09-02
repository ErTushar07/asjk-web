import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { ReceiptService } from '../../services/receiptService';
import { Download, Search, Filter, FileText, ArrowLeft, Copy, Check } from 'lucide-react';

export const MyDonationsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { donations, receipts, settings } = useDatabase();
  const { t } = useLanguage();
  usePageMeta(t('donor.donation_history', 'My Donation History'), undefined, { noindex: true });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num).catch(() => {});
    setCopiedId(num);
    setTimeout(() => {
      setCopiedId((prev) => (prev === num ? null : prev));
    }, 2000);
  };

  const donorEmail = (user?.email || '').toLowerCase().trim();

  const filtered = donations.filter((d) => {
    const isOwner = d.donorEmail.toLowerCase().trim() === donorEmail;
    const matchesSearch =
      d.donationNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.targetName.toLowerCase().includes(search.toLowerCase()) ||
      d.donorName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return isOwner && matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-content-secondary hover:text-brand-purple mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> {t('donor.back_to_dashboard', 'Back to Dashboard')}
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            {t('donor.donation_history', 'My Donation History')}
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            {t('donor.history_sub', 'Complete record of all verified contributions, payment IDs, and tax exemption receipts.')}
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-content-border dark:border-slate-800 shadow-brand-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search donations"
            placeholder={t('donor.search_placeholder', 'Search by donation # or project...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-content-border dark:border-slate-700 bg-white dark:bg-slate-800 text-content-primary focus:border-brand-purple outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-content-muted uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter donations by status"
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-content-border dark:border-slate-700 bg-white dark:bg-slate-800 text-content-primary"
          >
            <option value="all">{t('donor.all_statuses', 'All Statuses')}</option>
            <option value="successful">{t('donor.status_successful', 'Successful')}</option>
            <option value="refunded">{t('donor.status_refunded', 'Refunded')}</option>
            <option value="pending">{t('donor.status_pending', 'Pending')}</option>
            <option value="failed">{t('donor.status_failed', 'Failed')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-content-border dark:border-slate-800 overflow-hidden shadow-brand-sm">
        {filtered.length === 0 ? (
          <div className="text-center py-16 p-6 space-y-2">
            <p className="text-content-muted text-sm font-medium">
              {t('donor.no_donations_found', 'No donations found matching your search.')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-soft dark:bg-slate-950 border-b border-content-border dark:border-slate-800 text-content-muted uppercase font-bold text-[10px]">
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Donation ID</th>
                  <th className="py-3.5 px-6">Allocated Program</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Frequency</th>
                  <th className="py-3.5 px-6">Payment Method</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-content-border dark:divide-slate-800">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-soft dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-content-secondary">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-6 font-mono font-bold text-brand-purple dark:text-purple-300">
                      <div className="inline-flex items-center gap-1.5">
                        <span>{d.donationNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(d.donationNumber)}
                          title="Copy Donation ID"
                          className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded transition-colors text-content-muted hover:text-brand-purple"
                        >
                          {copiedId === d.donationNumber ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-500 font-sans font-normal">
                              <Check className="w-3 h-3" /> Copied!
                            </span>
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-content-primary">
                      {d.targetName}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-content-primary">
                      {d.currency} {d.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 capitalize text-content-secondary">
                      {d.frequency.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-6 text-content-secondary">
                      {d.paymentMethod}
                    </td>
                    <td className="py-3.5 px-6">
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
                    <td className="py-3.5 px-6 text-right">
                      {d.receiptNumber && (
                        <button
                          onClick={() => {
                            const r = receipts.find((x) => x.receiptNumber === d.receiptNumber);
                            if (r) ReceiptService.downloadReceipt(r, settings);
                          }}
                          className="btn-outline !py-1.5 !px-3 text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
