import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ReceiptService } from '../../services/receiptService';
import { ReportService } from '../../services/reportService';
import { 
  Shield, DollarSign, Users, FolderKanban, Flame, RefreshCw, 
  CreditCard, FileText, RotateCcw, BarChart3, UserCheck, ShieldAlert, 
  FileEdit, Newspaper, HeartHandshake, HelpCircle, Bell, Globe, 
  Languages, Image, Settings, History, Download, Plus, Search, 
  CheckCircle2, XCircle, AlertTriangle, ArrowRight, Eye, Edit3, Trash2
} from 'lucide-react';

interface AdminPortalProps {
  initialTab?: string;
  onNavigate: (route: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ initialTab = 'dashboard', onNavigate }) => {
  const { user, role, hasPermission } = useAuth();
  const { 
    projects, campaigns, donations, payments, recurringDonations, 
    receipts, refunds, stories, news, volunteers, partnerships, 
    supportTickets, auditLogs, settings, createProject, updateProject, 
    deleteProject, processRefund, updateRecurringStatus, simulateRetryRecurringPayment,
    updateSettings, updateSupportTicketStatus 
  } = useDatabase();
  const { formatUSD } = useCurrency();
  const { supportedLanguages } = useLanguage();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');

  // Refund Modal State
  const [refundModalDonation, setRefundModalDonation] = useState<any | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState<string>('');

  // New Project Form State
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjCategory, setNewProjCategory] = useState<any>('Clean Water');
  const [newProjGoal, setNewProjGoal] = useState(50000);
  const [newProjCity, setNewProjCity] = useState('Baramulla');
  const [newProjDesc, setNewProjDesc] = useState('');

  // Calculate Financial Aggregates (Source of Truth)
  const successfulDonations = donations.filter((d) => d.status === 'successful');
  const totalDonationsUSD = successfulDonations.reduce((s, d) => s + d.amountUSD, 0);
  const totalRefundedUSD = refunds.reduce((s, r) => s + r.amountUSD, 0);
  const totalSubscribers = recurringDonations.length;
  const activeSubscribers = recurringDonations.filter((r) => r.status === 'active').length;

  const adminMenu = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'donations', label: 'Donations Ledger', icon: DollarSign },
    { id: 'donors', label: 'Donors Directory', icon: Users },
    { id: 'projects', label: 'Projects Management', icon: FolderKanban },
    { id: 'campaigns', label: 'Campaigns & Appeals', icon: Flame },
    { id: 'recurring', label: 'Recurring Subscriptions', icon: RefreshCw },
    { id: 'payments', label: 'Payment Gateways', icon: CreditCard },
    { id: 'receipts', label: 'Tax Receipts (80G)', icon: FileText },
    { id: 'refunds', label: 'Refunds & Reversals', icon: RotateCcw },
    { id: 'reports', label: 'Financial Reports & Exports', icon: Download },
    { id: 'volunteers', label: 'Volunteer Applications', icon: HeartHandshake },
    { id: 'partners', label: 'Partnership Requests', icon: Shield },
    { id: 'support', label: 'Support Tickets', icon: HelpCircle },
    { id: 'languages', label: 'Languages & Translations', icon: Languages },
    { id: 'audit-logs', label: 'Audit Trail & Security', icon: History },
    { id: 'settings', label: 'Foundation Settings', icon: Settings },
  ];

  const handleProcessRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalDonation || refundAmount <= 0) return;

    processRefund(refundModalDonation.id, refundAmount, refundReason || 'Authorized refund by administrator', {
      id: user?.id || 'usr_admin',
      name: user?.name || 'Mohd Amin Ganai',
      role: role || 'super_admin',
    });

    setRefundModalDonation(null);
    setRefundAmount(0);
    setRefundReason('');
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    createProject({
      name: newProjName,
      slug: newProjName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: newProjCategory,
      country: 'India',
      region: 'Jammu & Kashmir',
      city: newProjCity,
      locationDetails: `${newProjCity}, Jammu & Kashmir`,
      shortDescription: newProjDesc || `Humanitarian welfare initiative in ${newProjCity}.`,
      longDescription: newProjDesc || `Dedicated program delivering vital relief and infrastructure.`,
      problemStatement: `Communities in ${newProjCity} lack sufficient resources.`,
      objectives: ['Deploy sustainable facilities', 'Directly benefit 5,000+ local residents'],
      activities: ['Procurement and field installation', 'Community training'],
      expectedOutcomes: ['Improved quality of life'],
      beneficiariesCount: 5000,
      beneficiariesDescription: 'Local community families',
      startDate: new Date().toISOString().split('T')[0],
      expectedCompletionDate: '2027-12-31',
      fundingGoalUSD: newProjGoal,
      fundingCurrency: 'USD',
      status: 'active',
      heroImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f3?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [],
      milestones: [],
      updates: [],
      impactMetrics: [{ label: 'Target Beneficiaries', value: '5,000' }],
    });

    setShowNewProjectModal(false);
    setNewProjName('');
    setNewProjDesc('');
  };

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-brand-purple-dark text-white flex-shrink-0 p-4 lg:p-6 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex-shrink-0">
            <img src="/images/logo.png" alt="ASFJK Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm block leading-tight">FOUNDATION ADMIN</span>
            </div>
            <span className="text-[10px] text-brand-pink font-semibold uppercase">Al Shujaiat · J&K</span>
          </div>
        </div>

        <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs">
          <p className="text-white/60 text-[10px] uppercase font-bold">Active Staff User</p>
          <p className="font-bold text-white truncate">{user?.name || 'Mohd Amin Ganai'}</p>
          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold bg-brand-pink text-white uppercase">
            {role.replace('_', ' ')}
          </span>
        </div>

        <nav className="space-y-1">
          {adminMenu.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-purple text-white font-bold shadow-brand-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-brand-blue" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/10">
          <button
            onClick={() => onNavigate('/')}
            className="w-full py-2 text-center text-xs font-bold text-white/80 hover:text-white bg-white/10 rounded-xl transition-colors"
          >
            ← Exit to Public Site
          </button>
        </div>
      </aside>

      {/* Main Admin Body */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl overflow-y-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-content-border shadow-brand-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-content-primary tracking-tight capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
            <p className="text-xs text-content-secondary mt-0.5">
              Live executive management platform for Al Shujaiat Foundation Jammu & Kashmir (ASFJK).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-brand-purple bg-surface-highlight px-3 py-1.5 rounded-xl border border-brand-blue/30">
              FY 2025–2026 Live Ledger
            </span>
          </div>
        </div>

        {/* 1. DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-content-border shadow-brand-sm space-y-2">
                <span className="text-xs font-bold uppercase text-content-muted">Total Funds Raised</span>
                <span className="text-3xl font-black text-brand-purple block">
                  {formatUSD(totalDonationsUSD)}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> From {successfulDonations.length} verified donations
                </span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-content-border shadow-brand-sm space-y-2">
                <span className="text-xs font-bold uppercase text-content-muted">Active Projects</span>
                <span className="text-3xl font-black text-brand-pink block">
                  {projects.filter((p) => p.status === 'active').length}
                </span>
                <span className="text-[11px] text-content-muted">
                  Total Budget: {formatUSD(projects.reduce((s, p) => s + p.fundingGoalUSD, 0))}
                </span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-content-border shadow-brand-sm space-y-2">
                <span className="text-xs font-bold uppercase text-content-muted">Recurring Subscriptions</span>
                <span className="text-3xl font-black text-brand-blue block">
                  {activeSubscribers} / {totalSubscribers}
                </span>
                <span className="text-[11px] text-content-muted">Active monthly & annual plans</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-content-border shadow-brand-sm space-y-2">
                <span className="text-xs font-bold uppercase text-content-muted">Total Refunds</span>
                <span className="text-3xl font-black text-rose-600 block">
                  {formatUSD(totalRefundedUSD)}
                </span>
                <span className="text-[11px] text-content-muted">{refunds.length} refund records logged</span>
              </div>
            </div>

            {/* Project Progress Overview in Admin */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-extrabold text-content-primary">
                  Project Funding Progress (Source of Truth)
                </h3>
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add New Project
                </button>
              </div>

              <div className="space-y-4">
                {projects.map((p) => {
                  const pct = Math.min(100, Math.round((p.amountRaisedUSD / p.fundingGoalUSD) * 100));
                  return (
                    <div key={p.id} className="p-4 rounded-2xl bg-surface-soft border border-content-border/60 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-content-primary">{p.name} ({p.category})</span>
                        <span className="font-bold text-brand-purple">
                          {formatUSD(p.amountRaisedUSD)} / {formatUSD(p.fundingGoalUSD)} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-content-border/60 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-gradient-pink rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. DONATIONS LEDGER TAB */}
        {activeTab === 'donations' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Donation ID, Donor, or Program..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>

              <button
                onClick={() => ReportService.exportToCSV(donations, 'ASFJK_Donations_Ledger')}
                className="btn-outline !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-soft border-b border-content-border text-content-muted uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Donation #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Donor Name</th>
                    <th className="py-3 px-4">Project / Fund</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-content-border">
                  {donations
                    .filter((d) => d.donationNumber.toLowerCase().includes(searchTerm.toLowerCase()) || d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) || d.targetName.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((d) => (
                      <tr key={d.id} className="hover:bg-surface-soft transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-brand-purple">{d.donationNumber}</td>
                        <td className="py-3 px-4 font-mono text-content-muted">{new Date(d.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-semibold text-content-primary">{d.donorName}</td>
                        <td className="py-3 px-4 max-w-[180px] truncate">{d.targetName}</td>
                        <td className="py-3 px-4 font-bold text-content-primary">{d.currency} {d.amount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-content-secondary truncate max-w-[150px]">{d.paymentMethod}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${d.status === 'successful' ? 'bg-emerald-100 text-emerald-700' : d.status === 'refunded' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                          {d.receiptNumber && (
                            <button
                              onClick={() => {
                                const r = receipts.find((x) => x.receiptNumber === d.receiptNumber);
                                if (r) ReceiptService.downloadReceipt(r, settings);
                              }}
                              className="text-brand-purple hover:underline font-bold text-[11px]"
                            >
                              PDF Receipt
                            </button>
                          )}
                          {d.status === 'successful' && (
                            <button
                              onClick={() => {
                                setRefundModalDonation(d);
                                setRefundAmount(d.amountUSD);
                              }}
                              className="text-rose-600 hover:underline text-[11px] font-semibold"
                            >
                              Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. RECURRING SUBSCRIPTIONS TAB */}
        {activeTab === 'recurring' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <h3 className="text-lg font-extrabold text-content-primary">
              Active Recurring Subscription Plans
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-soft border-b border-content-border text-content-muted uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Sub #</th>
                    <th className="py-3 px-4">Donor Name</th>
                    <th className="py-3 px-4">Program</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Frequency</th>
                    <th className="py-3 px-4">Total Collected</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-content-border">
                  {recurringDonations.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-soft transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-brand-purple">{r.subscriptionNumber}</td>
                      <td className="py-3 px-4 font-semibold text-content-primary">{r.donorName}</td>
                      <td className="py-3 px-4 max-w-[160px] truncate">{r.projectName}</td>
                      <td className="py-3 px-4 font-bold">{r.currency} {r.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 capitalize">{r.frequency}</td>
                      <td className="py-3 px-4 font-bold text-brand-purple">${r.totalCollectedUSD}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${r.status === 'active' ? 'bg-emerald-100 text-emerald-700' : r.status === 'past_due' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {r.status === 'past_due' && (
                          <button
                            onClick={() => simulateRetryRecurringPayment(r.id)}
                            className="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold"
                          >
                            Retry Charge
                          </button>
                        )}
                        {r.status === 'active' && (
                          <button
                            onClick={() => updateRecurringStatus(r.id, 'paused')}
                            className="text-amber-700 hover:underline font-semibold"
                          >
                            Pause
                          </button>
                        )}
                        {r.status === 'paused' && (
                          <button
                            onClick={() => updateRecurringStatus(r.id, 'active')}
                            className="text-emerald-700 hover:underline font-semibold"
                          >
                            Resume
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. FINANCIAL REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <h3 className="text-lg font-extrabold text-content-primary">
              Generate & Export Financial Reports
            </h3>
            <p className="text-xs text-content-secondary">
              Export verified ledgers to CSV, Microsoft Excel (.xlsx), or formatted executive PDF statements.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="p-6 rounded-2xl bg-surface-soft border border-content-border space-y-4 text-center">
                <FileText className="w-8 h-8 text-brand-purple mx-auto" />
                <div>
                  <h4 className="font-bold text-sm text-content-primary">Donations Ledger Report</h4>
                  <p className="text-[11px] text-content-muted">All verified gifts and allocations</p>
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => ReportService.exportToCSV(donations, 'ASFJK_Donations_Report')}
                    className="btn-outline !py-1.5 !px-3 text-xs font-bold"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => ReportService.exportToExcel(donations, 'ASFJK_Donations_Report')}
                    className="btn-primary !py-1.5 !px-3 text-xs font-bold"
                  >
                    Excel
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface-soft border border-content-border space-y-4 text-center">
                <RefreshCw className="w-8 h-8 text-brand-blue mx-auto" />
                <div>
                  <h4 className="font-bold text-sm text-content-primary">Recurring Plans Report</h4>
                  <p className="text-[11px] text-content-muted">Monthly and annual donor subscriptions</p>
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => ReportService.exportToCSV(recurringDonations, 'ASFJK_Recurring_Report')}
                    className="btn-outline !py-1.5 !px-3 text-xs font-bold"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => ReportService.exportToExcel(recurringDonations, 'ASFJK_Recurring_Report')}
                    className="btn-primary !py-1.5 !px-3 text-xs font-bold"
                  >
                    Excel
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface-soft border border-content-border space-y-4 text-center">
                <RotateCcw className="w-8 h-8 text-rose-600 mx-auto" />
                <div>
                  <h4 className="font-bold text-sm text-content-primary">Refunds & Reversals Report</h4>
                  <p className="text-[11px] text-content-muted">Approved refunds and financial notes</p>
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => ReportService.exportToCSV(refunds, 'ASFJK_Refunds_Report')}
                    className="btn-outline !py-1.5 !px-3 text-xs font-bold"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => ReportService.exportToExcel(refunds, 'ASFJK_Refunds_Report')}
                    className="btn-primary !py-1.5 !px-3 text-xs font-bold"
                  >
                    Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. AUDIT LOGS TAB */}
        {activeTab === 'audit-logs' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-extrabold text-content-primary">
                  System Audit Trail & Immutability Log
                </h3>
                <p className="text-xs text-content-muted">
                  Tamper-resistant historical logs of all financial mutations, logins, and project updates.
                </p>
              </div>
              <button
                onClick={() => ReportService.exportToCSV(auditLogs, 'ASFJK_Audit_Trail_Log')}
                className="btn-outline !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Audit Log
              </button>
            </div>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-2xl bg-surface-soft border border-content-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-brand-purple/10 text-brand-purple uppercase">
                        {log.action}
                      </span>
                      <span className="font-semibold text-content-primary">{log.userName} ({log.userRole})</span>
                    </div>
                    <p className="text-content-secondary">{log.description}</p>
                  </div>
                  <div className="text-right text-[11px] font-mono text-content-muted flex-shrink-0">
                    <div>{new Date(log.timestamp).toLocaleString()}</div>
                    <div>IP: {log.ipAddress}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <h3 className="text-lg font-extrabold text-brand-purple">
              Foundation Statutory Credentials & System Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Foundation Name</label>
                <input
                  type="text"
                  value={settings.foundationName}
                  onChange={(e) => updateSettings({ foundationName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Trust Registration Number</label>
                <input
                  type="text"
                  value={settings.registrationNumber}
                  onChange={(e) => updateSettings({ registrationNumber: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Section 80G Tax Exemption Number</label>
                <input
                  type="text"
                  value={settings.taxExemptionNumber80G}
                  onChange={(e) => updateSettings({ taxExemptionNumber80G: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">FCRA Registration Number</label>
                <input
                  type="text"
                  value={settings.fcraRegistrationNumber}
                  onChange={(e) => updateSettings({ fcraRegistrationNumber: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1">Registered Office Address</label>
              <input
                type="text"
                value={settings.registeredAddress}
                onChange={(e) => updateSettings({ registeredAddress: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>
          </div>
        )}
      </main>

      {/* Refund Modal */}
      {refundModalDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-content-border shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-content-primary">
              Issue Refund for {refundModalDonation.donationNumber}
            </h3>
            <p className="text-xs text-content-secondary">
              Donor: <span className="font-bold">{refundModalDonation.donorName}</span> | Original Amount: {refundModalDonation.currency} {refundModalDonation.amount.toLocaleString()} (${refundModalDonation.amountUSD} USD)
            </p>

            <form onSubmit={handleProcessRefundSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">Refund Amount in USD</label>
                <input
                  type="number"
                  min="1"
                  max={refundModalDonation.amountUSD}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">Reason for Reversal *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Accidental double charge reported by donor"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModalDonation(null)}
                  className="btn-outline !py-2 !px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Process Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-content-border shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-content-primary">
              Create New Humanitarian Project
            </h3>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gurez Mountain Solar Well"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-1">Category</label>
                  <select
                    value={newProjCategory}
                    onChange={(e: any) => setNewProjCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none bg-white"
                  >
                    <option value="Clean Water">Clean Water</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Emergency Relief">Emergency Relief</option>
                    <option value="Orphan Sponsorship">Orphan Sponsorship</option>
                    <option value="Winter Relief">Winter Relief</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-1">Funding Goal (USD) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={newProjGoal}
                    onChange={(e) => setNewProjGoal(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">City / District in J&K</label>
                <input
                  type="text"
                  value={newProjCity}
                  onChange={(e) => setNewProjCity(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">Short Description</label>
                <textarea
                  rows={3}
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="btn-outline !py-2 !px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary !py-2 !px-4 text-xs font-bold"
                >
                  Publish Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
