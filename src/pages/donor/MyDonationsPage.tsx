import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { ReceiptService } from '../../services/receiptService';
import { Download, Search, Filter, FileText, ArrowLeft } from 'lucide-react';

export const MyDonationsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { donations, receipts, settings } = useDatabase();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-content-secondary hover:text-brand-purple mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            My Donation History
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Complete record of all verified contributions, payment IDs, and tax exemption receipts.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-content-border shadow-brand-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by donation # or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-content-muted uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-content-border bg-white text-content-primary"
          >
            <option value="all">All Statuses</option>
            <option value="successful">Successful</option>
            <option value="refunded">Refunded</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-content-border overflow-hidden shadow-brand-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-soft border-b border-content-border text-content-muted uppercase font-bold text-[10px]">
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
            <tbody className="divide-y divide-content-border">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-surface-soft transition-colors">
                  <td className="py-3.5 px-6 font-mono text-content-secondary">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-6 font-mono font-bold text-brand-purple">
                    {d.donationNumber}
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
                          ? 'bg-emerald-100 text-emerald-700'
                          : d.status === 'refunded'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {d.status}
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
      </div>
    </div>
  );
};
