import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { ReceiptService } from '../../services/receiptService';
import { FileText, Download, ShieldCheck, Search, ArrowLeft, Printer } from 'lucide-react';

export const MyReceiptsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  usePageMeta('Tax Exemption Receipts (80G)', undefined, { noindex: true });
  const { user } = useAuth();
  const { receipts, settings } = useDatabase();
  const [search, setSearch] = useState('');

  const donorEmail = (user?.email || '').toLowerCase().trim();

  const filtered = receipts.filter(
    (r) =>
      r.donorEmail.toLowerCase().trim() === donorEmail &&
      (r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
       r.projectName.toLowerCase().includes(search.toLowerCase()) ||
       r.donorName.toLowerCase().includes(search.toLowerCase()))
  );

  const handlePrintReceipt = (r: typeof receipts[0]) => {
    const originalTitle = document.title;
    document.title = `ASFJK_Receipt_${r.receiptNumber}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      <div>
        <button
          onClick={() => onNavigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-content-secondary hover:text-brand-purple mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          Official Tax Exemption Receipts (80G)
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-1">
          Download legal PDF receipts for your income tax filings under Section 80G in India or international non-profit equivalents.
        </p>
      </div>

      {/* Exemption Notice Banner */}
      <div className="bg-surface-highlight dark:bg-purple-950/40 p-6 rounded-3xl border border-brand-blue/30 dark:border-purple-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-brand-purple dark:text-purple-400 flex-shrink-0" />
          <div className="text-xs text-content-primary">
            <p className="font-bold">Trust Reg No: {settings.registrationNumber} · 80G Reg: {settings.taxExemptionNumber80G}</p>
            <p className="text-content-secondary">All receipts generated contain digitally verified authorized signatures and unique serial numbers.</p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search receipts by receipt # or project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-xs rounded-2xl border border-content-border dark:border-slate-700 bg-white dark:bg-slate-900 text-content-primary focus:border-brand-purple outline-none shadow-brand-sm"
        />
      </div>

      {/* Receipts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-content-border dark:border-slate-800 p-6 shadow-brand-sm hover:shadow-brand-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold text-brand-purple dark:text-purple-300">
                  {r.receiptNumber}
                </span>
                <span className="text-[10px] text-content-muted font-mono">
                  {new Date(r.issuedAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-content-primary line-clamp-1">{r.projectName}</h4>
                <p className="text-xs text-content-muted mt-0.5">Donor: {r.donorName}</p>
              </div>

              <div className="bg-surface-soft dark:bg-slate-950 p-3 rounded-2xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-content-muted">Amount:</span>
                  <span className="font-bold text-brand-pink">{r.currency} {r.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-content-muted">Txn ID:</span>
                  <span className="font-mono text-content-secondary truncate max-w-[140px]">{r.transactionId}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => ReceiptService.downloadReceipt(r, settings)}
                className="btn-primary flex-1 !py-2 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                type="button"
                onClick={() => handlePrintReceipt(r)}
                title="Print Receipt"
                className="btn-outline !py-2 !px-3 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
