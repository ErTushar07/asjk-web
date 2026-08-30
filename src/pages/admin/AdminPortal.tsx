import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ReceiptService } from '../../services/receiptService';
import { ReportService } from '../../services/reportService';
import { VolunteerIdCardService } from '../../services/volunteerIdCardService';
import { VolunteerIdCardPreview } from '../../components/volunteer/VolunteerIdCardPreview';
import { MembershipCardService } from '../../services/membershipCardService';
import { MembershipCardPreview } from '../../components/membership/MembershipCardPreview';
import { NgoMembership } from '../../types';
import { 
  Shield, DollarSign, Users, FolderKanban, Flame, RefreshCw, 
  CreditCard, FileText, RotateCcw, BarChart3, UserCheck, ShieldAlert, 
  FileEdit, Newspaper, HeartHandshake, HelpCircle, Bell, Globe, 
  Languages, Image, Settings, History, Download, Plus, Search, 
  CheckCircle2, XCircle, AlertTriangle, ArrowRight, Eye, Edit3, Trash2,
  Mail, Phone, Send, Check, X, GraduationCap, Paperclip, IdCard, Award, Crown
} from 'lucide-react';

interface AdminPortalProps {
  initialTab?: string;
  onNavigate: (route: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ initialTab = 'dashboard', onNavigate }) => {
  const { user, role, hasPermission } = useAuth();
  const { 
    projects, campaigns, donations, payments, recurringDonations, 
    receipts, refunds, stories, news, volunteers, partnerships, memberships,
    supportTickets, auditLogs, settings, createProject, updateProject, 
    deleteProject, createCampaign, updateCampaign, deleteCampaign,
    processRefund, updateRecurringStatus, simulateRetryRecurringPayment,
    updateSettings, updateSupportTicketStatus, updateVolunteerStatus, updatePartnershipStatus, updateMembershipStatus 
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

  // New Campaign Form State
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [newCampName, setNewCampName] = useState('');
  const [newCampGoal, setNewCampGoal] = useState(25000);
  const [newCampEndDate, setNewCampEndDate] = useState('2026-12-31');
  const [newCampDesc, setNewCampDesc] = useState('');
  const [newCampUrgent, setNewCampUrgent] = useState(false);

  // Support Ticket Response Modal
  const [responseModalTicket, setResponseModalTicket] = useState<any | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Selected Volunteer Modal State
  const [selectedVolunteer, setSelectedVolunteer] = useState<any | null>(null);
  const [idCardModalVolunteer, setIdCardModalVolunteer] = useState<any | null>(null);
  const [selectedMembershipModal, setSelectedMembershipModal] = useState<NgoMembership | null>(null);

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
    { id: 'memberships', label: 'NGO Memberships', icon: Crown },
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

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim()) return;

    createCampaign({
      name: newCampName,
      slug: newCampName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: newCampUrgent ? 'emergency' : 'seasonal',
      description: newCampDesc || 'Urgent humanitarian response appeal.',
      goalUSD: newCampGoal,
      startDate: new Date().toISOString().split('T')[0],
      endDate: newCampEndDate,
      heroImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
      relatedProjectIds: [projects[0]?.id || 'proj_clean_water'],
      status: 'active',
    });

    setShowNewCampaignModal(false);
    setNewCampName('');
    setNewCampDesc('');
  };

  const handleReplyTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseModalTicket || !ticketReplyText.trim()) return;
    updateSupportTicketStatus(responseModalTicket.id, 'resolved', ticketReplyText);
    setResponseModalTicket(null);
    setTicketReplyText('');
  };

  // Group unique donors for Donors Directory
  const uniqueDonorsMap = new Map<string, { email: string; name: string; totalUSD: number; count: number; country: string; lastDate: string }>();
  donations.forEach((d) => {
    if (d.status === 'successful') {
      const em = d.donorEmail.toLowerCase();
      const curr = uniqueDonorsMap.get(em) || {
        email: d.donorEmail,
        name: d.donorName,
        totalUSD: 0,
        count: 0,
        country: d.donorCountry || 'Unknown',
        lastDate: d.createdAt,
      };
      curr.totalUSD += d.amountUSD;
      curr.count += 1;
      if (new Date(d.createdAt) > new Date(curr.lastDate)) curr.lastDate = d.createdAt;
      uniqueDonorsMap.set(em, curr);
    }
  });
  const uniqueDonorsList = Array.from(uniqueDonorsMap.values());

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-brand-purple-dark text-white flex-shrink-0 p-4 lg:p-6 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-11 h-11 rounded-full bg-white p-1 flex-shrink-0 shadow-md flex items-center justify-center">
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
                onClick={() => {
                  setActiveTab(item.id);
                  setSearchTerm('');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                  isActive
                    ? 'bg-brand-purple text-white font-bold shadow-brand-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-brand-blue" />
                <span className="truncate leading-tight">{item.label}</span>
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
              {adminMenu.find((m) => m.id === activeTab)?.label || activeTab.replace('-', ' ')}
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
                    .filter((d) => 
                      d.donationNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      d.targetName.toLowerCase().includes(searchTerm.toLowerCase())
                    )
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

        {/* 3. DONORS DIRECTORY TAB */}
        {activeTab === 'donors' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search donors by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <button
                onClick={() => ReportService.exportToCSV(uniqueDonorsList, 'ASFJK_Donors_Directory')}
                className="btn-outline !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Donors CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-soft border-b border-content-border text-content-muted uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Donor Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Country</th>
                    <th className="py-3 px-4">Donation Count</th>
                    <th className="py-3 px-4">Lifetime Contributed</th>
                    <th className="py-3 px-4">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-content-border">
                  {uniqueDonorsList
                    .filter((u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((dn, i) => (
                      <tr key={i} className="hover:bg-surface-soft transition-colors">
                        <td className="py-3 px-4 font-bold text-content-primary">{dn.name}</td>
                        <td className="py-3 px-4 font-mono text-content-secondary">{dn.email}</td>
                        <td className="py-3 px-4">{dn.country}</td>
                        <td className="py-3 px-4 font-semibold">{dn.count} gifts</td>
                        <td className="py-3 px-4 font-bold text-brand-pink">${dn.totalUSD.toLocaleString()} USD</td>
                        <td className="py-3 px-4 text-content-muted">{new Date(dn.lastDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. PROJECTS MANAGEMENT TAB */}
        {activeTab === 'projects' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-content-primary">
                Active Projects & Welfare Programs ({projects.length})
              </h3>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => {
                const pct = Math.min(100, Math.round((p.amountRaisedUSD / p.fundingGoalUSD) * 100));
                return (
                  <div key={p.id} className="p-5 rounded-3xl bg-surface-soft border border-content-border space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-purple/10 text-brand-purple uppercase">
                          {p.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-card text-content-muted'}`}>
                          {p.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-content-primary line-clamp-1">{p.name}</h4>
                      <p className="text-xs text-content-secondary line-clamp-2">{p.shortDescription}</p>
                      
                      <div className="pt-2">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-brand-purple">${p.amountRaisedUSD.toLocaleString()}</span>
                          <span className="text-content-muted">${p.fundingGoalUSD.toLocaleString()} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-content-border rounded-full overflow-hidden">
                          <div className="h-full bg-brand-gradient-pink rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-content-border/60 text-xs">
                      <button
                        onClick={() => onNavigate(`/projects/${p.slug}`)}
                        className="text-brand-purple hover:underline font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Public Page
                      </button>
                      <button
                        onClick={() => deleteProject(p.id)}
                        className="text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. CAMPAIGNS & APPEALS TAB */}
        {activeTab === 'campaigns' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-content-primary">
                Active Appeals & Emergency Drives ({campaigns.length})
              </h3>
              <button
                onClick={() => setShowNewCampaignModal(true)}
                className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Campaign
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((c) => {
                const pct = Math.min(100, Math.round((c.amountRaisedUSD / c.goalUSD) * 100));
                return (
                  <div key={c.id} className="p-5 rounded-3xl bg-surface-soft border border-content-border space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        {c.type === 'emergency' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 uppercase flex items-center gap-1">
                            <Flame className="w-3 h-3" /> Urgent Appeal
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-blue/10 text-brand-blue uppercase">
                            Seasonal Appeal
                          </span>
                        )}
                        <span className="text-[10px] text-content-muted font-mono">Ends: {c.endDate}</span>
                      </div>
                      <h4 className="font-bold text-sm text-content-primary line-clamp-1">{c.name}</h4>
                      <p className="text-xs text-content-secondary line-clamp-2">{c.description}</p>
                      
                      <div className="pt-2">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-brand-pink">${c.amountRaisedUSD.toLocaleString()}</span>
                          <span className="text-content-muted">${c.goalUSD.toLocaleString()} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-content-border rounded-full overflow-hidden">
                          <div className="h-full bg-brand-gradient-blue rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-content-border/60 text-xs">
                      <button
                        onClick={() => onNavigate(`/campaigns/${c.slug}`)}
                        className="text-brand-purple hover:underline font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Appeal
                      </button>
                      <button
                        onClick={() => deleteCampaign(c.id)}
                        className="text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. RECURRING SUBSCRIPTIONS TAB */}
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

        {/* 7. PAYMENT GATEWAYS TAB */}
        {activeTab === 'payments' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <h3 className="text-lg font-extrabold text-content-primary">
              Payment Gateways & Processing Settings
            </h3>
            <p className="text-xs text-content-secondary">
              Configure active merchant credentials, sandbox test modes, and direct wire transfer banking settings.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Stripe */}
              <div className="p-6 rounded-3xl bg-surface-soft border border-content-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-brand-purple" />
                    <div>
                      <h4 className="font-extrabold text-sm text-content-primary">Stripe Payments</h4>
                      <p className="text-[11px] text-content-muted">Global Visa, Mastercard, AMEX, Apple Pay</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    {settings.paymentGateways?.stripeEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <label className="block text-[11px] font-bold text-content-muted">Publishable Key</label>
                  <input
                    type="text"
                    value={settings.paymentGateways?.stripePublishableKey || 'pk_test_sample_asfjk'}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-content-border bg-white"
                    readOnly
                  />
                </div>
              </div>

              {/* Razorpay */}
              <div className="p-6 rounded-3xl bg-surface-soft border border-content-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-brand-blue" />
                    <div>
                      <h4 className="font-extrabold text-sm text-content-primary">Razorpay (India)</h4>
                      <p className="text-[11px] text-content-muted">UPI (Google Pay, PhonePe, Paytm), Netbanking</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    {settings.paymentGateways?.razorpayEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <label className="block text-[11px] font-bold text-content-muted">Key ID</label>
                  <input
                    type="text"
                    value={settings.paymentGateways?.razorpayKeyId || 'rzp_test_sample_asfjk'}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-content-border bg-white"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. TAX RECEIPTS (80G) TAB */}
        {activeTab === 'receipts' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-content-primary">
                  Official Section 80G Tax Receipts Archive ({receipts.length})
                </h3>
                <p className="text-xs text-content-secondary">
                  Computer-generated legal tax receipts issued to donors.
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search receipt # or donor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-soft border-b border-content-border text-content-muted uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Issued Date</th>
                    <th className="py-3 px-4">Donor Name</th>
                    <th className="py-3 px-4">Program</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Tax ID / PAN</th>
                    <th className="py-3 px-4 text-right">PDF Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-content-border">
                  {receipts
                    .filter((r) => r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) || r.donorName.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-surface-soft transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-brand-purple">{r.receiptNumber}</td>
                        <td className="py-3 px-4 font-mono text-content-muted">{new Date(r.issuedAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-semibold text-content-primary">{r.donorName}</td>
                        <td className="py-3 px-4 max-w-[180px] truncate">{r.projectName}</td>
                        <td className="py-3 px-4 font-bold text-brand-pink">{r.currency} {r.amount.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono">{r.donorTaxId || 'N/A'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => ReceiptService.downloadReceipt(r, settings)}
                            className="btn-outline !py-1.5 !px-3 text-xs font-bold inline-flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. REFUNDS & REVERSALS TAB */}
        {activeTab === 'refunds' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <h3 className="text-lg font-extrabold text-content-primary">
              Refunds & Transaction Reversals Ledger ({refunds.length})
            </h3>
            <p className="text-xs text-content-secondary">
              Audited transaction reversals approved by Foundation Executive Directors.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-soft border-b border-content-border text-content-muted uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Refund ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount Refunded</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Authorized By</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-content-border">
                  {refunds.map((rf) => (
                    <tr key={rf.id} className="hover:bg-surface-soft transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-rose-700">{rf.refundNumber || rf.id}</td>
                      <td className="py-3 px-4 font-mono text-content-muted">{new Date(rf.processedAt || rf.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-bold text-rose-600">${rf.amountUSD.toLocaleString()} USD</td>
                      <td className="py-3 px-4 max-w-[250px] truncate">{rf.reason}</td>
                      <td className="py-3 px-4 font-semibold">{rf.approvedBy || rf.requestedBy || 'Executive Director'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 uppercase">
                          {rf.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. FINANCIAL REPORTS TAB */}
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

        {/* 11. VOLUNTEER APPLICATIONS TAB */}
        {activeTab === 'volunteers' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-content-primary">
                  Volunteer Applications & Candidate Dossiers ({volunteers.length})
                </h3>
                <p className="text-xs text-content-secondary">
                  Review applicant academic qualifications, verified credentials, and downloadable resumes.
                </p>
              </div>
              <button
                onClick={() => ReportService.exportToCSV(volunteers, 'ASFJK_Volunteer_Applications')}
                className="btn-outline !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Applications CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-soft border-b border-content-border text-content-muted uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Qualification & Resume</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Skills</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-content-border">
                  {volunteers.map((v) => (
                    <tr key={v.id} className="hover:bg-surface-soft transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-content-primary">{v.fullName}</div>
                        <div className="text-content-secondary font-mono text-[11px]">{v.email}</div>
                        <div className="text-[10px] text-content-muted">{v.phone}</div>
                      </td>
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="flex items-center gap-1.5 text-brand-purple font-semibold">
                          <GraduationCap className="w-4 h-4 flex-shrink-0 text-brand-pink" />
                          <span className="truncate">{v.qualification || 'Higher Education'}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-content-secondary bg-surface-card px-2 py-0.5 rounded border border-content-border truncate max-w-[170px]">
                            <Paperclip className="w-3 h-3 text-brand-blue" />
                            {v.resumeFileName || 'Resume.pdf'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{v.city}, {v.country}</td>
                      <td className="py-3 px-4 max-w-[180px]">
                        <div className="flex flex-wrap gap-1">
                          {v.skills.map((sk, idx) => (
                            <span key={idx} className="bg-brand-purple/10 text-brand-purple text-[9px] px-1.5 py-0.5 rounded font-semibold">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 capitalize">{v.availability.replace('_', ' ')}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${v.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedVolunteer(v)}
                          className="btn-primary !py-1 !px-2.5 text-[10px] font-bold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View Dossier
                        </button>
                        <button
                          onClick={() => setIdCardModalVolunteer(v)}
                          className="btn-outline !py-1 !px-2.5 text-[10px] font-bold inline-flex items-center gap-1 text-brand-purple hover:bg-brand-purple/10"
                        >
                          <IdCard className="w-3 h-3 text-brand-pink" /> ID Card
                        </button>
                        {v.status !== 'approved' && (
                          <button
                            onClick={() => updateVolunteerStatus(v.id, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[10px] font-bold"
                          >
                            Approve
                          </button>
                        )}
                        <a
                          href={`mailto:${v.email}`}
                          className="btn-outline !py-1 !px-2 text-[10px] font-bold inline-flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" /> Email
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 11B. NGO MEMBERSHIPS LEDGER TAB */}
        {activeTab === 'memberships' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-content-primary flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  Accredited NGO Memberships Ledger ({memberships.length})
                </h3>
                <p className="text-xs text-content-secondary">
                  Manage tiered patron enrollments (1 to 10 Years duration), total contribution receipts, and issue official NGO Membership Cards.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => ReportService.exportToCSV(memberships, 'ASFJK_NGO_Memberships')}
                  className="btn-outline !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export Members CSV
                </button>
                <button
                  onClick={() => onNavigate('/membership')}
                  className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5 shadow-pink-glow"
                >
                  <Plus className="w-3.5 h-3.5" /> New Member Enrollment
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-soft border-b border-content-border text-content-muted uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Member Details</th>
                    <th className="py-3 px-4">Tier Level</th>
                    <th className="py-3 px-4">Duration & Validity</th>
                    <th className="py-3 px-4">Contribution Paid</th>
                    <th className="py-3 px-4">Payment & Receipt</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-content-border">
                  {memberships.map((m) => (
                    <tr key={m.id} className="hover:bg-surface-soft transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-content-primary uppercase">{m.fullName}</div>
                        <div className="text-content-secondary font-mono text-[11px]">{m.email}</div>
                        <div className="text-[10px] text-content-muted">{m.city}, {m.country}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                          m.tier === 'general_member' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                          m.tier === 'patron_gold' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          m.tier === 'founding_platinum' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                          m.tier === 'benefactor_diamond' ? 'bg-cyan-100 text-cyan-900 border border-cyan-300' :
                          'bg-slate-100 text-slate-800 border border-slate-300'
                        }`}>
                          <Crown className="w-3 h-3" />
                          {m.tier.replace('_', ' ')}
                        </span>
                        <div className="text-[10px] text-content-muted mt-0.5 font-mono">{m.membershipNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-brand-purple font-mono">{m.durationYears} {m.durationYears === 1 ? 'Year' : 'Years'}</div>
                        <div className="text-[10px] text-content-secondary">{m.validFrom} to {m.validThru}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-emerald-700 font-mono text-xs">
                          {m.currency} {m.paidAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-content-muted">Total Paid</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[11px] font-medium text-content-primary">{m.paymentMethod}</div>
                        <div className="text-[10px] font-mono text-content-secondary truncate max-w-[130px]">{m.receiptNumber || m.transactionId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${m.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedMembershipModal(m)}
                          className="btn-primary !py-1 !px-2.5 text-[10px] font-bold inline-flex items-center gap-1 shadow-pink-glow"
                        >
                          <Crown className="w-3 h-3 text-amber-300" /> Membership Card
                        </button>
                        <a
                          href={`mailto:${m.email}`}
                          className="btn-outline !py-1 !px-2 text-[10px] font-bold inline-flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" /> Email
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 12. PARTNERSHIP REQUESTS TAB */}
        {activeTab === 'partners' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <h3 className="text-lg font-extrabold text-content-primary">
              Institutional & Corporate Partnership Proposals ({partnerships.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-soft border-b border-content-border text-content-muted uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Representative</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-content-border">
                  {partnerships.map((pr) => (
                    <tr key={pr.id} className="hover:bg-surface-soft transition-colors">
                      <td className="py-3 px-4 font-bold text-content-primary">{pr.organizationName}</td>
                      <td className="py-3 px-4 uppercase font-semibold text-[10px] text-brand-purple">{pr.organizationType}</td>
                      <td className="py-3 px-4">{pr.contactPerson}</td>
                      <td className="py-3 px-4 font-mono text-content-secondary">{pr.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${pr.status === 'partnered' ? 'bg-emerald-100 text-emerald-700' : pr.status === 'in_discussion' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-surface-card text-content-muted'}`}>
                          {pr.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {pr.status !== 'partnered' && (
                          <button
                            onClick={() => updatePartnershipStatus(pr.id, 'partnered')}
                            className="bg-brand-purple hover:bg-brand-purple-dark text-white px-2 py-1 rounded text-[10px] font-bold"
                          >
                            Approve
                          </button>
                        )}
                        <a
                          href={`mailto:${pr.email}`}
                          className="btn-outline !py-1 !px-2 text-[10px] font-bold inline-flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" /> Contact
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 13. SUPPORT TICKETS TAB */}
        {activeTab === 'support' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <h3 className="text-lg font-extrabold text-content-primary">
              Donor & Public Support Desk ({supportTickets.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-soft border-b border-content-border text-content-muted uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Ticket #</th>
                    <th className="py-3 px-4">Requester</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-content-border">
                  {supportTickets.map((tkt) => (
                    <tr key={tkt.id} className="hover:bg-surface-soft transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-brand-purple">{tkt.ticketNumber}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-content-primary">{tkt.name}</div>
                        <div className="text-[10px] font-mono text-content-muted">{tkt.email}</div>
                      </td>
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="font-semibold truncate">{tkt.subject}</div>
                        <div className="text-[11px] text-content-secondary truncate">{tkt.message}</div>
                      </td>
                      <td className="py-3 px-4 uppercase text-[10px] text-brand-pink font-bold">{tkt.category.replace('_', ' ')}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tkt.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {tkt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setResponseModalTicket(tkt);
                            setTicketReplyText(tkt.response || '');
                          }}
                          className="btn-primary !py-1 !px-3 text-xs font-bold inline-flex items-center gap-1"
                        >
                          Respond
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 14. LANGUAGES & TRANSLATIONS TAB */}
        {activeTab === 'languages' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <h3 className="text-lg font-extrabold text-content-primary">
              Supported International Languages & Dialects
            </h3>
            <p className="text-xs text-content-secondary">
              All 8 registered languages with active RTL & LTR font rendering engines.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {supportedLanguages.map((l) => (
                <div key={l.code} className="p-4 rounded-2xl bg-surface-soft border border-content-border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">{l.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-purple/10 text-brand-purple uppercase">
                      {l.code}
                    </span>
                  </div>
                  <div className="text-xs text-content-muted flex justify-between items-center">
                    <span>Native: <span className="text-content-primary font-medium">{l.nativeName}</span></span>
                    <span className="uppercase text-[10px] font-bold text-brand-pink">{l.dir}</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Dictionary Coverage
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 15. AUDIT LOGS TAB */}
        {activeTab === 'audit-logs' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-extrabold text-content-primary">
                  System Audit Trail & Immutability Log ({auditLogs.length})
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

        {/* 16. SETTINGS TAB */}
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
                <label className="block text-xs font-semibold text-content-secondary mb-1">NITI Aayog NGO-DARPAN / Registration Number</label>
                <input
                  type="text"
                  value={settings.registrationNumber}
                  onChange={(e) => updateSettings({ registrationNumber: e.target.value, darpanUniqueId: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Section 80G Tax Exemption</label>
                <input
                  type="text"
                  value={settings.taxExemptionNumber80G}
                  onChange={(e) => updateSettings({ taxExemptionNumber80G: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Section 12A Registration</label>
                <input
                  type="text"
                  value={settings.taxExemptionNumber12A || ''}
                  onChange={(e) => updateSettings({ taxExemptionNumber12A: e.target.value })}
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
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Legal Entity Identifier (LEI)</label>
                <input
                  type="text"
                  value={settings.leiNumber || ''}
                  onChange={(e) => updateSettings({ leiNumber: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Primary Foundation Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSettings({ email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Official Website URL</label>
                <input
                  type="text"
                  value={settings.websiteUrl}
                  onChange={(e) => updateSettings({ websiteUrl: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Registered Office Address</label>
                <input
                  type="text"
                  value={settings.registeredAddress}
                  onChange={(e) => updateSettings({ registeredAddress: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Operating / Field Office Address</label>
                <input
                  type="text"
                  value={settings.operatingAddress || ''}
                  onChange={(e) => updateSettings({ operatingAddress: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Response to Support Ticket Modal */}
      {responseModalTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-content-border shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-content-primary">
                Respond to Ticket {responseModalTicket.ticketNumber}
              </h3>
              <button
                onClick={() => setResponseModalTicket(null)}
                className="p-1 rounded-full text-content-muted hover:text-content-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-surface-soft rounded-2xl text-xs space-y-1">
              <p><span className="font-bold text-content-primary">Requester:</span> {responseModalTicket.name} ({responseModalTicket.email})</p>
              <p><span className="font-bold text-content-primary">Subject:</span> {responseModalTicket.subject}</p>
              <p className="text-content-secondary pt-1">{responseModalTicket.message}</p>
            </div>
            <form onSubmit={handleReplyTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">Official Response *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your resolution or response to the donor..."
                  value={ticketReplyText}
                  onChange={(e) => setTicketReplyText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResponseModalTicket(null)}
                  className="btn-outline !py-2 !px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Send Response & Resolve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModalDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-content-border shadow-2xl space-y-4 animate-fadeIn">
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-content-border shadow-2xl space-y-4 animate-fadeIn">
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

      {/* New Campaign Modal */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-content-border shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="text-lg font-extrabold text-content-primary">
              Create New Appeal or Campaign
            </h3>

            <form onSubmit={handleCreateCampaignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Warmth 2026 Drive"
                  value={newCampName}
                  onChange={(e) => setNewCampName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-1">Funding Goal (USD) *</label>
                  <input
                    type="number"
                    required
                    min="500"
                    value={newCampGoal}
                    onChange={(e) => setNewCampGoal(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={newCampEndDate}
                    onChange={(e) => setNewCampEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgentCampCheck"
                  checked={newCampUrgent}
                  onChange={(e) => setNewCampUrgent(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="urgentCampCheck" className="text-xs font-bold text-rose-700 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Mark as Emergency Rapid Response Appeal
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">Campaign Description</label>
                <textarea
                  rows={3}
                  value={newCampDesc}
                  onChange={(e) => setNewCampDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCampaignModal(false)}
                  className="btn-outline !py-2 !px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary !py-2 !px-4 text-xs font-bold"
                >
                  Launch Appeal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Volunteer Dossier & Resume Modal */}
      {selectedVolunteer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-content-border shadow-2xl space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-content-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink block">Volunteer Candidate Dossier</span>
                <h3 className="text-xl font-extrabold text-content-primary">{selectedVolunteer.fullName}</h3>
                <p className="text-xs text-content-muted">{selectedVolunteer.city}, {selectedVolunteer.country} · Applied {new Date(selectedVolunteer.submittedAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setSelectedVolunteer(null)}
                className="p-1.5 rounded-full text-content-muted hover:text-content-primary hover:bg-surface-soft"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Academic & Professional Qualification Box */}
            <div className="p-4 rounded-2xl bg-surface-soft border border-brand-purple/20 space-y-2">
              <div className="flex items-center gap-2 text-brand-purple font-bold text-xs">
                <GraduationCap className="w-4 h-4 text-brand-pink" />
                <span>Highest Qualification & Field of Study</span>
              </div>
              <p className="text-xs font-extrabold text-content-primary pl-6">
                {selectedVolunteer.qualification || 'Higher Education & Professional Training'}
              </p>
            </div>

            {/* Attached Resume Box */}
            <div className="p-4 rounded-2xl bg-white border border-content-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-content-primary">{selectedVolunteer.resumeFileName || `${selectedVolunteer.fullName.replace(/\s+/g, '_')}_Resume.pdf`}</p>
                  <p className="text-[10px] text-content-muted">Applicant Curriculum Vitae / Resume Dossier</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (selectedVolunteer.resumeDataUrl) {
                    const a = document.createElement('a');
                    a.href = selectedVolunteer.resumeDataUrl;
                    a.download = selectedVolunteer.resumeFileName || 'Resume.pdf';
                    a.click();
                  } else {
                    // Generate a rich mock PDF summary blob
                    const resumeBlob = new Blob([
                      `=====================================================\n` +
                      `AL SHUJAIAT FOUNDATION JAMMU & KASHMIR (ASFJK)\n` +
                      `VOLUNTEER APPLICANT RESUME & PROFILE DOSSIER\n` +
                      `=====================================================\n\n` +
                      `CANDIDATE NAME: ${selectedVolunteer.fullName}\n` +
                      `EMAIL: ${selectedVolunteer.email}\n` +
                      `PHONE: ${selectedVolunteer.phone || 'N/A'}\n` +
                      `LOCATION: ${selectedVolunteer.city}, ${selectedVolunteer.country}\n\n` +
                      `ACADEMIC QUALIFICATION:\n${selectedVolunteer.qualification || 'Degree in Humanitarian Logistics'}\n\n` +
                      `YEARS OF EXPERIENCE: ${selectedVolunteer.experienceYears} Years\n` +
                      `AVAILABILITY: ${selectedVolunteer.availability}\n\n` +
                      `AREAS OF EXPERTISE / SKILLS:\n- ${selectedVolunteer.skills.join('\n- ')}\n\n` +
                      `PERSONAL MOTIVATION STATEMENT:\n"${selectedVolunteer.statement || 'Committed to humanitarian relief work in Jammu & Kashmir.'}"\n\n` +
                      `APPLICATION STATUS: ${selectedVolunteer.status.toUpperCase()}\n` +
                      `SUBMITTED AT: ${new Date(selectedVolunteer.submittedAt).toUTCString()}\n`
                    ], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(resumeBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = selectedVolunteer.resumeFileName || `${selectedVolunteer.fullName.replace(/\s+/g, '_')}_Resume.txt`;
                    a.click();
                  }
                }}
                className="btn-primary !py-2 !px-3.5 text-xs font-bold flex items-center gap-1.5 flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Download Resume
              </button>
            </div>

            {/* Candidate Statement */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary uppercase tracking-wider block">Volunteer Motivation & Statement</label>
              <div className="p-3.5 rounded-xl bg-surface-soft border border-content-border text-xs text-content-primary leading-relaxed italic">
                "{selectedVolunteer.statement || 'Eager to support field initiatives in healthcare, education, and clean water distribution.'}"
              </div>
            </div>

            {/* Skills Badges */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary uppercase tracking-wider block">Verified Skillsets</label>
              <div className="flex flex-wrap gap-1.5">
                {selectedVolunteer.skills.map((sk: string, idx: number) => (
                  <span key={idx} className="bg-brand-purple/10 text-brand-purple text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-content-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-content-muted">Current Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${selectedVolunteer.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {selectedVolunteer.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIdCardModalVolunteer(selectedVolunteer);
                  }}
                  className="btn-primary !py-2 !px-3 text-xs font-bold inline-flex items-center gap-1.5 shadow-pink-glow"
                >
                  <IdCard className="w-3.5 h-3.5" /> View Official ID Card
                </button>
                <a
                  href={`mailto:${selectedVolunteer.email}`}
                  className="btn-outline !py-2 !px-3 text-xs font-bold inline-flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" /> Email Candidate
                </a>
                {selectedVolunteer.status !== 'approved' && (
                  <button
                    onClick={() => {
                      updateVolunteerStatus(selectedVolunteer.id, 'approved');
                      setSelectedVolunteer({ ...selectedVolunteer, status: 'approved' });
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Approve Application
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Identity Card Modal */}
      {idCardModalVolunteer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-content-border shadow-2xl space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-content-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                  <IdCard className="w-5 h-5 text-brand-pink" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-content-primary">
                    Official Volunteer Identity Card
                  </h3>
                  <p className="text-[11px] text-content-secondary font-mono">
                    ID: {idCardModalVolunteer.membershipNumber || `ASF-VOL-2026-${idCardModalVolunteer.id.slice(-4)}`} · Status: {idCardModalVolunteer.status.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIdCardModalVolunteer(null)}
                className="p-1.5 rounded-full text-content-muted hover:text-content-primary hover:bg-surface-soft transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <VolunteerIdCardPreview volunteer={idCardModalVolunteer} settings={settings} />
          </div>
        </div>
      )}

      {/* NGO Membership Card Modal */}
      {selectedMembershipModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-content-border shadow-2xl space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-content-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-content-primary">
                    Official NGO Membership Credential
                  </h3>
                  <p className="text-[11px] text-content-secondary font-mono">
                    ID: {selectedMembershipModal.membershipNumber} · {selectedMembershipModal.tierName} · {selectedMembershipModal.durationYears} Years
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMembershipModal(null)}
                className="p-1.5 rounded-full text-content-muted hover:text-content-primary hover:bg-surface-soft transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <MembershipCardPreview member={selectedMembershipModal} settings={settings} />
          </div>
        </div>
      )}
    </div>
  );
};
