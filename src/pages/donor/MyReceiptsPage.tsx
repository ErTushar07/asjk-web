import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { ReceiptService } from '../../services/receiptService';
import { FileText, Download, ShieldCheck, Search, ArrowLeft } from 'lucide-react';

export const MyReceiptsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { receipts, settings } = useDatabase();
  const [search, setSearch] = useState('');

  const filtered = receipts.filter(
    (r) =>
      r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.projectName.toLowerCase().includes(search.toLowerCase()) ||
      r.donorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
      <div className="bg-surface-highlight p-6 rounded-3xl border border-brand-blue/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-brand-purple flex-shrink-0" />
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
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none bg-white shadow-brand-sm"
        />
      </div>

      {/* Receipts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-3xl border border-content-border p-6 shadow-brand-sm hover:shadow-brand-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold text-brand-purple">
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

              <div className="bg-surface-soft p-3 rounded-2xl space-y-1 text-xs">
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

            <button
              onClick={() => ReceiptService.downloadReceipt(r, settings)}
              className="btn-primary w-full !py-2.5 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Receipt</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
