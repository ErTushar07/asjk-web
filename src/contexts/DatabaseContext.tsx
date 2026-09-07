import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Project, Campaign, Donation, Payment, RecurringDonation, Receipt, Refund,
  Story, NewsArticle, ImpactMetric, VolunteerApplication, PartnershipRequest,
  NgoMembership, SupportTicket, AuditLog, SystemSettings, DonationFrequency, PaymentMethod, PaymentStatus,
  LeadershipMember, MandateDetails
} from '../types';
import {
  INITIAL_PROJECTS, INITIAL_CAMPAIGNS, INITIAL_DONATIONS, INITIAL_PAYMENTS,
  INITIAL_RECURRING_DONATIONS, INITIAL_RECEIPTS, INITIAL_REFUNDS, INITIAL_STORIES,
  INITIAL_NEWS, INITIAL_IMPACT_METRICS, INITIAL_VOLUNTEERS, INITIAL_PARTNERSHIPS,
  INITIAL_MEMBERSHIPS, INITIAL_SUPPORT_TICKETS, INITIAL_AUDIT_LOGS, INITIAL_SYSTEM_SETTINGS,
  INITIAL_LEADERSHIP_MEMBERS
} from '../data/initialData';
import { PaymentService } from '../services/paymentService';
import { MandateService } from '../services/mandateService';
import { ValidationService } from '../services/validationService';
import { SecurityService } from '../services/securityService';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface ProcessDonationInput {
  amount: number;
  currency: string;
  frequency: DonationFrequency;
  donationType: 'project' | 'campaign' | 'general' | 'emergency';
  targetId?: string;
  targetName: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorCountry: string;
  donorTaxId?: string;
  donorAddress?: string;
  anonymous?: boolean;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  mandateNumber?: string;
  mandate?: MandateDetails;
}

interface ProcessDonationResult {
  donation: Donation;
  receipt?: Receipt;
  payment: Payment;
  recurringDonation?: RecurringDonation;
}

interface DatabaseContextType {
  projects: Project[];
  campaigns: Campaign[];
  donations: Donation[];
  payments: Payment[];
  recurringDonations: RecurringDonation[];
  receipts: Receipt[];
  refunds: Refund[];
  stories: Story[];
  news: NewsArticle[];
  impactMetrics: ImpactMetric[];
  volunteers: VolunteerApplication[];
  partnerships: PartnershipRequest[];
  memberships: NgoMembership[];
  leadership: LeadershipMember[];
  supportTickets: SupportTicket[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  
  // Actions
  processDonation: (input: ProcessDonationInput) => Promise<ProcessDonationResult>;
  verifyBankTransferDonation: (donationId: string) => void;
  updateRecurringStatus: (id: string, newStatus: 'active' | 'paused' | 'cancelled') => void;
  simulateFailedRecurringPayment: (recurringId: string) => void;
  simulateRetryRecurringPayment: (recurringId: string) => void;
  processRefund: (donationId: string, amountUSD: number, reason: string, user: { id: string; name: string; role: string }) => boolean;
  createProject: (project: Omit<Project, 'id' | 'amountRaisedUSD' | 'donorCount'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'amountRaisedUSD' | 'donorCount'>) => Campaign;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  addStory: (story: Omit<Story, 'id'>) => void;
  addNews: (news: Omit<NewsArticle, 'id'>) => void;
  addVolunteerApplication: (app: Omit<VolunteerApplication, 'id' | 'submittedAt' | 'status'> & { status?: VolunteerApplication['status'] }) => VolunteerApplication;
  updateVolunteerStatus: (id: string, status: any) => void;
  addPartnershipRequest: (req: Omit<PartnershipRequest, 'id' | 'submittedAt' | 'status'>) => void;
  updatePartnershipStatus: (id: string, status: any) => void;
  addMembership: (data: Omit<NgoMembership, 'id' | 'membershipNumber' | 'createdAt' | 'status' | 'validFrom' | 'validThru'> & { validFrom?: string; validThru?: string; status?: NgoMembership['status'] }) => NgoMembership;
  updateMembershipStatus: (id: string, status: NgoMembership['status']) => void;
  createLeadershipMember: (member: Omit<LeadershipMember, 'id' | 'createdAt' | 'updatedAt'>) => LeadershipMember;
  updateLeadershipMember: (id: string, updates: Partial<LeadershipMember>) => void;
  deleteLeadershipMember: (id: string) => void;
  toggleLeadershipStatus: (id: string) => void;
  getPublicLeadership: () => LeadershipMember[];
  getPublicLeadershipBySlug: (slug: string) => LeadershipMember | null;
  addSupportTicket: (tkt: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => void;
  updateSupportTicketStatus: (id: string, status: 'open' | 'in_progress' | 'resolved' | 'closed', response?: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetToDemoData: () => void;

  // Data Minimization Lookup Queries
  lookupVolunteerStatus: (email: string) => VolunteerApplication | null;
  lookupMembership: (query: string) => NgoMembership | null;
  lookupDonationReceipt: (receiptNumber: string, donorEmail: string) => Receipt | null;

  // Account Linking Action
  linkDonationsToUser: (email: string, userId: string, name?: string) => Promise<number>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('asfjk_db_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('asfjk_db_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [donations, setDonations] = useState<Donation[]>(() => {
    const saved = localStorage.getItem('asfjk_db_donations');
    return saved ? JSON.parse(saved) : INITIAL_DONATIONS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('asfjk_db_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [recurringDonations, setRecurringDonations] = useState<RecurringDonation[]>(() => {
    const saved = localStorage.getItem('asfjk_db_recurring');
    return saved ? JSON.parse(saved) : INITIAL_RECURRING_DONATIONS;
  });

  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    const saved = localStorage.getItem('asfjk_db_receipts');
    return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
  });

  const [refunds, setRefunds] = useState<Refund[]>(() => {
    const saved = localStorage.getItem('asfjk_db_refunds');
    return saved ? JSON.parse(saved) : INITIAL_REFUNDS;
  });

  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('asfjk_db_stories');
    return saved ? JSON.parse(saved) : INITIAL_STORIES;
  });

  const [news, setNews] = useState<NewsArticle[]>(() => {
    const saved = localStorage.getItem('asfjk_db_news');
    return saved ? JSON.parse(saved) : INITIAL_NEWS;
  });

  const [impactMetrics, setImpactMetrics] = useState<ImpactMetric[]>(() => {
    const saved = localStorage.getItem('asfjk_db_metrics');
    if (!saved) return INITIAL_IMPACT_METRICS;
    try {
      const parsed: ImpactMetric[] = JSON.parse(saved);
      return parsed.map((m) => ({
        ...m,
        unit: m.unit && !['Units', 'Children', 'Meals', 'Patients', 'Villages'].includes(m.unit) ? m.unit : '+'
      }));
    } catch {
      return INITIAL_IMPACT_METRICS;
    }
  });

  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>(() => {
    const saved = localStorage.getItem('asfjk_db_volunteers');
    return saved ? JSON.parse(saved) : INITIAL_VOLUNTEERS;
  });

  const [partnerships, setPartnerships] = useState<PartnershipRequest[]>(() => {
    const saved = localStorage.getItem('asfjk_db_partnerships');
    return saved ? JSON.parse(saved) : INITIAL_PARTNERSHIPS;
  });

  const [memberships, setMemberships] = useState<NgoMembership[]>(() => {
    const saved = localStorage.getItem('asfjk_db_memberships');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERSHIPS;
  });

  const [leadership, setLeadership] = useState<LeadershipMember[]>(() => {
    const saved = localStorage.getItem('asfjk_db_leadership');
    return saved ? JSON.parse(saved) : INITIAL_LEADERSHIP_MEMBERS;
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('asfjk_db_tickets');
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_TICKETS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('asfjk_db_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('asfjk_db_settings');
    if (!saved) return INITIAL_SYSTEM_SETTINGS;
    try {
      const parsed: SystemSettings = JSON.parse(saved);
      return {
        ...parsed,
        registrationNumber: !parsed.registrationNumber || parsed.registrationNumber.includes('889042') ? 'JK/2018/0190361' : parsed.registrationNumber,
        darpanUniqueId: parsed.darpanUniqueId || 'JK/2018/0190361',
        leiNumber: parsed.leiNumber || '9845008779YC3EE0IE41',
        taxExemptionNumber80G: !parsed.taxExemptionNumber80G || parsed.taxExemptionNumber80G.includes('AACTA8920E') ? 'DEL-AE28396-27022018/9728' : parsed.taxExemptionNumber80G,
        taxExemptionNumber12A: parsed.taxExemptionNumber12A || 'DEL-AR26932-27022018/8830',
        fcraRegistrationNumber: !parsed.fcraRegistrationNumber || parsed.fcraRegistrationNumber.includes('083420194') || parsed.fcraRegistrationNumber.includes('4872022R') ? '004872022' : parsed.fcraRegistrationNumber,
        registeredAddress: !parsed.registeredAddress || parsed.registeredAddress.includes('Srinagar') || parsed.registeredAddress.includes('Foundation Complex') 
          ? 'D-45, 1st FLOOR ZAKIR NAGAR WEST DELHI NEW DELHI 110025' 
          : parsed.registeredAddress,
        operatingAddress: parsed.operatingAddress || 'Luragam Tral Pulwama Jammu and Kashmir 192123',
        phone: parsed.phone && !parsed.phone.includes('194') ? parsed.phone : '+91 1933 351585',
        emergencyPhone: parsed.emergencyPhone && !parsed.emergencyPhone.includes('94190 00000') ? parsed.emergencyPhone : '+91 94193 01319',
        email: !parsed.email || parsed.email.includes('alshujaiat.org') || parsed.email.includes('asjk.org') ? 'info@asfjk.org' : parsed.email,
        websiteUrl: !parsed.websiteUrl || parsed.websiteUrl.includes('alshujaiat.org') || parsed.websiteUrl.includes('asjk.org') ? 'https://www.asfjk.org' : parsed.websiteUrl,
        paymentGateways: {
          ...INITIAL_SYSTEM_SETTINGS.paymentGateways,
          ...parsed.paymentGateways,
          razorpayPaymentUrl: parsed.paymentGateways?.razorpayPaymentUrl || 'https://razorpay.me/@asfjk',
        },
        bankDetails: {
          ...INITIAL_SYSTEM_SETTINGS.bankDetails,
          ...parsed.bankDetails,
          accountNumber: (!parsed.bankDetails?.accountNumber || parsed.bankDetails.accountNumber === '0134010100008892') ? '925010008902563' : parsed.bankDetails.accountNumber,
          bankName: (!parsed.bankDetails?.bankName || parsed.bankDetails.bankName.includes('Jammu & Kashmir')) ? 'Axis Bank Ltd' : parsed.bankDetails.bankName,
          ifscCode: (!parsed.bankDetails?.ifscCode || parsed.bankDetails.ifscCode === 'JAKA0LURGAM') ? 'UTIB0002378' : parsed.bankDetails.ifscCode,
          branch: (!parsed.bankDetails?.branch || parsed.bankDetails.branch.includes('Luragam')) ? 'Larikpora, Awantipora, Pulwama, J&K - 192122' : parsed.bankDetails.branch,
          accountName: (!parsed.bankDetails?.accountName || parsed.bankDetails.accountName === 'Al Shujaiat Foundation Jammu & Kashmir') ? 'M/S AL-SHUJAIAT FOUNDATION JAMMU & KASHMIR' : parsed.bankDetails.accountName,
          accountType: parsed.bankDetails?.accountType || 'Savings Account',
          razorpayMeUrl: parsed.bankDetails?.razorpayMeUrl || 'https://razorpay.me/@asfjk',
        },
      };
    } catch {
      return INITIAL_SYSTEM_SETTINGS;
    }
  });

  // Safe LocalStorage persistence helper
  const safeSetItem = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn(`LocalStorage write error for ${key} (storage quota exceeded), attempting compact write:`, err);
      try {
        if (Array.isArray(data)) {
          const compact = data.map((item: any) => {
            if (item && typeof item === 'object') {
              const copy = { ...item };
              if (copy.resumeDataUrl && copy.resumeDataUrl.length > 50000) {
                delete copy.resumeDataUrl;
              }
              if (copy.photoUrl && copy.photoUrl.length > 100000) {
                copy.photoUrl = undefined;
              }
              return copy;
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(compact));
        }
      } catch (innerErr) {
        console.error(`Final localStorage write failure for ${key}:`, innerErr);
      }
    }
  };

  // Sync to local storage
  useEffect(() => {
    safeSetItem('asfjk_db_projects', projects);
  }, [projects]);
  useEffect(() => {
    safeSetItem('asfjk_db_campaigns', campaigns);
  }, [campaigns]);
  useEffect(() => {
    safeSetItem('asfjk_db_donations', donations);
  }, [donations]);
  useEffect(() => {
    safeSetItem('asfjk_db_payments', payments);
  }, [payments]);
  useEffect(() => {
    safeSetItem('asfjk_db_recurring', recurringDonations);
  }, [recurringDonations]);
  useEffect(() => {
    safeSetItem('asfjk_db_receipts', receipts);
  }, [receipts]);
  useEffect(() => {
    safeSetItem('asfjk_db_refunds', refunds);
  }, [refunds]);
  useEffect(() => {
    safeSetItem('asfjk_db_audit', auditLogs);
  }, [auditLogs]);
  useEffect(() => {
    safeSetItem('asfjk_db_volunteers', volunteers);
  }, [volunteers]);
  useEffect(() => {
    safeSetItem('asfjk_db_partnerships', partnerships);
  }, [partnerships]);
  useEffect(() => {
    safeSetItem('asfjk_db_memberships', memberships);
  }, [memberships]);
  useEffect(() => {
    safeSetItem('asfjk_db_leadership', leadership);
  }, [leadership]);
  useEffect(() => {
    safeSetItem('asfjk_db_metrics', impactMetrics);
  }, [impactMetrics]);
  useEffect(() => {
    safeSetItem('asfjk_db_tickets', supportTickets);
  }, [supportTickets]);
  useEffect(() => {
    safeSetItem('asfjk_db_stories', stories);
  }, [stories]);
  useEffect(() => {
    safeSetItem('asfjk_db_news', news);
  }, [news]);
  useEffect(() => {
    safeSetItem('asfjk_db_settings', settings);
  }, [settings]);

  // Reconcile and load remote memberships from Supabase on mount (Permanent Storage)
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from('memberships')
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          console.warn('Supabase memberships load notice:', error.message);
          return;
        }
        if (data && data.length > 0) {
          setMemberships((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const existingNums = new Set(prev.map((m) => m.membershipNumber));
            const remote: NgoMembership[] = data.map((r: any) => ({
              id: r.id || r.member_id,
              membershipNumber: r.membership_number,
              fullName: r.full_name,
              email: r.email,
              phone: r.phone || '',
              city: r.city || '',
              country: r.country || 'India',
              tier: r.membership_tier || r.tier || 'general_member',
              tierName: r.membership_level || 'General Member',
              durationYears: r.membership_duration || r.duration_years || 1,
              annualAmount: r.membership_amount || 100,
              totalContribution: r.total_contribution || (r.membership_amount || 100) * (r.membership_duration || r.duration_years || 1),
              currency: r.selected_currency || r.currency || 'INR',
              paidAmount: r.total_contribution || r.fee_amount_usd || 100,
              validFrom: r.membership_start_date || r.start_date || '',
              validThru: r.membership_expiry_date || r.expiry_date || '',
              paymentMethod: r.payment_method || 'Razorpay',
              transactionId: r.payment_id || r.payment_transaction_id || '',
              orderId: r.order_id,
              paymentId: r.payment_id,
              receiptNumber: r.receipt_id,
              status: (r.payment_status === 'completed' || r.status === 'active') ? 'active' : 'pending_payment',
              createdAt: r.created_at || r.registration_date || new Date().toISOString(),
            }));
            const toAdd = remote.filter((m) => !existingIds.has(m.id) && !existingNums.has(m.membershipNumber));
            return toAdd.length > 0 ? [...toAdd, ...prev] : prev;
          });
        }
      });
  }, []);

  // Log Audit Helper
  const recordAudit = (
    userId: string,
    userName: string,
    userRole: string,
    action: string,
    entity: AuditLog['entity'],
    entityId: string,
    description: string,
    metadata?: Record<string, any>
  ) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId,
      userName,
      userRole,
      action,
      entity,
      entityId,
      description,
      timestamp: new Date().toISOString(),
      ipAddress: '103.24.112.5',
      metadata,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  /**
   * Process Donation with atomic financial calculations & receipts
   */
  const processDonation = async (input: ProcessDonationInput): Promise<ProcessDonationResult> => {
    const val = ValidationService.validateDonationInput(input);
    if (!val.isValid) {
      throw new Error(`Donation validation failed: ${Object.values(val.errors).join(', ')}`);
    }
    const cleanInput: ProcessDonationInput = val.sanitizedData;

    const paymentResult = await PaymentService.processPayment({
      amount: cleanInput.amount,
      currency: cleanInput.currency,
      frequency: cleanInput.frequency,
      method: cleanInput.paymentMethod,
      donorName: cleanInput.donorName,
      donorEmail: cleanInput.donorEmail,
      targetId: cleanInput.targetId,
      targetName: cleanInput.targetName,
      idempotencyKey: `idem_${Date.now()}`,
      razorpayKeyId: settings.paymentGateways?.razorpayKeyId,
      razorpayPaymentUrl: settings.paymentGateways?.razorpayPaymentUrl || 'https://razorpay.me/@asfjk',
      paymentReference: cleanInput.paymentReference,
    });

    const now = new Date().toISOString();

    // Generate e-Mandate if switching or contributing with recurring monthly/yearly frequency
    let activeMandate: MandateDetails | undefined;
    if (input.frequency !== 'one_time') {
      activeMandate = input.mandate || MandateService.generateMandate({
        frequency: input.frequency,
        amount: input.amount,
        currency: input.currency,
        donorName: input.donorName,
        paymentMethod: input.paymentMethod,
      });
    }

    // 1. Create Donation Record
    const newDonation: Donation = {
      id: paymentResult.donationId,
      donationNumber: `ASJ-DON-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      donorId: user?.id,
      donorName: input.anonymous ? 'Anonymous Donor' : input.donorName,
      donorEmail: input.donorEmail,
      donorPhone: input.donorPhone,
      donorCountry: input.donorCountry,
      donorTaxId: input.donorTaxId,
      anonymous: !!input.anonymous,
      frequency: input.frequency,
      donationType: input.donationType,
      targetId: input.targetId,
      targetName: input.targetName,
      amount: input.amount,
      currency: input.currency,
      amountUSD: paymentResult.amountUSD,
      exchangeRate: input.amount > 0 ? paymentResult.amountUSD / input.amount : 1,
      status: paymentResult.status === 'successful' ? 'successful' : paymentResult.status === 'failed' ? 'failed' : paymentResult.status === 'cancelled' ? 'cancelled' : 'pending',
      paymentMethod: input.paymentMethod,
      paymentId: paymentResult.paymentId,
      receiptNumber: paymentResult.receiptNumber || undefined,
      mandateNumber: activeMandate?.mandateNumber,
      mandate: activeMandate,
      notes: cleanInput.paymentReference ? `Payment Ref: ${cleanInput.paymentReference}` : undefined,
      createdAt: now,
      updatedAt: now,
    };

    // 2. Create Payment Record
    const newPayment: Payment = {
      id: paymentResult.paymentId,
      transactionId: paymentResult.transactionId,
      donationId: paymentResult.donationId,
      provider: paymentResult.provider,
      providerPaymentId: paymentResult.providerPaymentId,
      amount: input.amount,
      currency: input.currency,
      amountUSD: paymentResult.amountUSD,
      feeAmountUSD: parseFloat((paymentResult.amountUSD * 0.025).toFixed(2)),
      netAmountUSD: parseFloat((paymentResult.amountUSD * 0.975).toFixed(2)),
      status: paymentResult.status || 'successful',
      method: input.paymentMethod,
      idempotencyKey: `idem_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    // 3. Create Receipt Record ONLY IF payment was successful and verified
    let newReceipt: Receipt | undefined;
    if (paymentResult.status === 'successful' && paymentResult.receiptNumber) {
      newReceipt = {
        id: `rec_doc_${Date.now()}`,
        receiptNumber: paymentResult.receiptNumber,
        donationId: paymentResult.donationId,
        recurringDonationId: activeMandate ? `rec_${Date.now()}` : undefined,
        mandateNumber: activeMandate?.mandateNumber,
        transactionId: paymentResult.transactionId,
        donationDate: now,
        donorName: input.donorName,
        donorEmail: input.donorEmail,
        donorAddress: input.donorAddress || `${input.donorCountry}`,
        donorTaxId: input.donorTaxId,
        projectName: input.targetName,
        amount: input.amount,
        currency: input.currency,
        amountUSD: paymentResult.amountUSD,
        paymentMethod: input.paymentMethod,
        language: 'en',
        taxExemptionText: settings.taxExemptionNumber80G
          ? `Donations are 50% tax exempt under Section 80G (Reg: ${settings.taxExemptionNumber80G}). 501(c)(3) equivalent for international donors.`
          : 'Official Charitable Tax Receipt',
        issuedAt: now,
        pdfGenerated: true,
      };
    }

    // 4. Create Recurring Subscription if applicable
    let newRecurring: RecurringDonation | undefined;
    if (input.frequency !== 'one_time') {
      const nextDate = new Date();
      if (input.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      else nextDate.setFullYear(nextDate.getFullYear() + 1);

      newRecurring = {
        id: `rec_${Date.now()}`,
        subscriptionNumber: `ASJ-SUB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        mandateNumber: activeMandate?.mandateNumber,
        mandate: activeMandate,
        donorId: `usr_donor_${Date.now()}`,
        donorName: input.donorName,
        donorEmail: input.donorEmail,
        projectId: input.targetId,
        projectName: input.targetName,
        amount: input.amount,
        currency: input.currency,
        amountUSD: paymentResult.amountUSD,
        frequency: input.frequency,
        provider: paymentResult.provider === 'stripe' ? 'stripe' : paymentResult.provider === 'razorpay' ? 'razorpay' : 'sandbox',
        providerSubscriptionId: paymentResult.providerSubscriptionId || `sub_${Date.now()}`,
        paymentMethodRef: `${input.paymentMethod} (e-Mandate ${activeMandate?.mandateNumber || 'Active'})`,
        startDate: now,
        nextPaymentDate: activeMandate?.nextDebitDate || nextDate.toISOString(),
        lastSuccessfulPayment: now,
        totalCollectedUSD: paymentResult.amountUSD,
        successfulPaymentCount: 1,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };

      setRecurringDonations((prev) => [newRecurring!, ...prev]);

      if (activeMandate) {
        recordAudit(
          user?.id || 'usr_donor',
          input.donorName,
          'donor',
          'MANDATE_REGISTERED',
          'recurring',
          newRecurring.id,
          `Registered ${input.frequency} e-mandate ${activeMandate.mandateNumber} with URN ${activeMandate.urn} (Max debit: ${activeMandate.currency} ${activeMandate.maxDebitAmount})`
        );
      }
    }

    // 5. Update Project Funding Atomically
    if (input.targetId) {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === input.targetId) {
            const updatedRaised = p.amountRaisedUSD + paymentResult.amountUSD;
            const isNowFunded = updatedRaised >= p.fundingGoalUSD;
            return {
              ...p,
              amountRaisedUSD: updatedRaised,
              donorCount: p.donorCount + 1,
              status: isNowFunded && p.status === 'active' ? 'funded' : p.status,
            };
          }
          return p;
        })
      );

      // Also update campaign if matching
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id === input.targetId || c.relatedProjectIds.includes(input.targetId!)) {
            return {
              ...c,
              amountRaisedUSD: c.amountRaisedUSD + paymentResult.amountUSD,
              donorCount: c.donorCount + 1,
            };
          }
          return c;
        })
      );
    }

    // 6. Commit to state
    setDonations((prev) => [newDonation, ...prev]);
    setPayments((prev) => [newPayment, ...prev]);
    if (newReceipt) {
      setReceipts((prev) => [newReceipt, ...prev]);
    }

    // Cache last donation details for seamless account linking after checkout
    try {
      localStorage.setItem('asfjk_last_guest_donation', JSON.stringify({
        email: input.donorEmail,
        name: input.donorName,
        donationId: newDonation.id,
        donationNumber: newDonation.donationNumber,
        receiptNumber: paymentResult.receiptNumber,
        timestamp: Date.now(),
      }));
    } catch (e) {}

    // 7. Audit Log
    recordAudit(
      'sys_donor',
      input.donorName,
      'donor',
      'DONATION_CREATED',
      'donation',
      newDonation.id,
      `Received ${input.currency} ${input.amount} ($${paymentResult.amountUSD} USD) for ${input.targetName} via ${input.paymentMethod}`,
      { transactionId: paymentResult.transactionId, receiptNumber: paymentResult.receiptNumber }
    );

    return {
      donation: newDonation,
      receipt: newReceipt,
      payment: newPayment,
      recurringDonation: newRecurring,
    };
  };

  /**
   * Update Recurring Donation Status (Pause, Resume, Cancel)
   */
  const updateRecurringStatus = (id: string, newStatus: 'active' | 'paused' | 'cancelled') => {
    const now = new Date().toISOString();
    setRecurringDonations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: newStatus,
            pausedAt: newStatus === 'paused' ? now : undefined,
            cancelledAt: newStatus === 'cancelled' ? now : undefined,
            updatedAt: now,
          };
        }
        return r;
      })
    );

    recordAudit(
      'usr_current',
      'System Admin / Donor',
      'admin',
      `RECURRING_${newStatus.toUpperCase()}`,
      'recurring',
      id,
      `Recurring subscription status updated to ${newStatus}`
    );
  };

  /**
   * Simulate a failed recurring billing attempt
   */
  const simulateFailedRecurringPayment = (recurringId: string) => {
    const now = new Date().toISOString();
    setRecurringDonations((prev) =>
      prev.map((r) => {
        if (r.id === recurringId) {
          return {
            ...r,
            status: 'past_due',
            lastFailedPayment: now,
            updatedAt: now,
          };
        }
        return r;
      })
    );

    recordAudit(
      'sys_webhook',
      'Payment Gateway Webhook',
      'system',
      'PAYMENT_FAILED',
      'recurring',
      recurringId,
      `Simulated card decline on subscription ${recurringId}. Project total unchanged.`
    );
  };

  /**
   * Simulate a successful retry on a past due recurring billing
   */
  const simulateRetryRecurringPayment = (recurringId: string) => {
    const matched = recurringDonations.find((r) => r.id === recurringId);
    if (!matched) return;

    const now = new Date().toISOString();
    const nextDate = new Date();
    if (matched.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else nextDate.setFullYear(nextDate.getFullYear() + 1);

    const newPaymentResult = {
      paymentId: `pay_retry_${Date.now()}`,
      transactionId: `txn_retry_${Date.now()}`,
      receiptNumber: `ASJ-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    // 1. Update recurring plan
    setRecurringDonations((prev) =>
      prev.map((r) => {
        if (r.id === recurringId) {
          return {
            ...r,
            status: 'active',
            lastSuccessfulPayment: now,
            nextPaymentDate: nextDate.toISOString(),
            totalCollectedUSD: r.totalCollectedUSD + r.amountUSD,
            successfulPaymentCount: r.successfulPaymentCount + 1,
            updatedAt: now,
          };
        }
        return r;
      })
    );

    // 2. Increase project funding
    if (matched.projectId) {
      setProjects((prev) =>
        prev.map((p) => (p.id === matched.projectId ? { ...p, amountRaisedUSD: p.amountRaisedUSD + matched.amountUSD } : p))
      );
    }

    // 3. Create new receipt
    const newReceipt: Receipt = {
      id: `rec_retry_${Date.now()}`,
      receiptNumber: newPaymentResult.receiptNumber,
      donationId: `don_retry_${Date.now()}`,
      recurringDonationId: matched.id,
      transactionId: newPaymentResult.transactionId,
      donationDate: now,
      donorName: matched.donorName,
      donorEmail: matched.donorEmail,
      donorAddress: 'Active Recurring Donor',
      projectName: matched.projectName,
      amount: matched.amount,
      currency: matched.currency,
      amountUSD: matched.amountUSD,
      paymentMethod: matched.paymentMethodRef,
      language: 'en',
      taxExemptionText: 'Recurring Donation Tax Exemption Receipt under Section 80G.',
      issuedAt: now,
      pdfGenerated: true,
    };
    setReceipts((prev) => [newReceipt, ...prev]);

    recordAudit(
      'sys_webhook',
      'Payment Gateway Retry',
      'system',
      'PAYMENT_RETRY_SUCCESS',
      'recurring',
      recurringId,
      `Successful retry payment of ${matched.currency} ${matched.amount} ($${matched.amountUSD} USD). Project funds updated.`
    );
  };

  /**
   * Strict Administrative Authorization Guard
   * Throws 401/403 if called without a verified, 2FA-validated admin session
   */
  const checkAdminAuth = (permission?: string): void => {
    if (!SecurityService.isVerifiedAdminSession()) {
      throw new Error('401 Unauthorized: Administrative session required.');
    }
    if (permission && !SecurityService.hasAdminPermission(permission)) {
      throw new Error(`403 Forbidden: Missing required administrative permission "${permission}".`);
    }
  };

  /**
   * Process full or partial refund (Protected: Finance Admin only)
   */
  const processRefund = (
    donationId: string,
    amountUSD: number,
    reason: string,
    user: { id: string; name: string; role: string }
  ): boolean => {
    checkAdminAuth('refunds:manage');

    const donation = donations.find((d) => d.id === donationId);
    if (!donation) return false;

    const now = new Date().toISOString();
    const isFullRefund = amountUSD >= donation.amountUSD;

    // 1. Update Donation Status (Preserve original record)
    setDonations((prev) =>
      prev.map((d) => {
        if (d.id === donationId) {
          return {
            ...d,
            status: isFullRefund ? 'refunded' : 'partially_refunded',
            updatedAt: now,
          };
        }
        return d;
      })
    );

    // 2. Adjust Project funding safely
    if (donation.targetId) {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === donation.targetId) {
            const adjustedRaised = Math.max(0, p.amountRaisedUSD - amountUSD);
            return {
              ...p,
              amountRaisedUSD: adjustedRaised,
              status: adjustedRaised < p.fundingGoalUSD && p.status === 'funded' ? 'active' : p.status,
            };
          }
          return p;
        })
      );
    }

    // 3. Create Refund record
    const newRefund: Refund = {
      id: `ref_${Date.now()}`,
      refundNumber: `ASJ-REF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      donationId,
      donationNumber: donation.donationNumber,
      paymentId: donation.paymentId,
      amountUSD,
      amountOriginal: amountUSD / (donation.exchangeRate || 1),
      currency: donation.currency,
      reason,
      status: 'processed',
      requestedBy: user.name,
      approvedBy: user.name,
      donorEmail: donation.donorEmail,
      donorName: donation.donorName,
      projectId: donation.targetId,
      projectName: donation.targetName,
      createdAt: now,
      processedAt: now,
    };
    setRefunds((prev) => [newRefund, ...prev]);

    // 4. Audit Log
    recordAudit(
      user.id,
      user.name,
      user.role,
      'REFUND_PROCESSED',
      'refund',
      newRefund.id,
      `Processed ${isFullRefund ? 'full' : 'partial'} refund of $${amountUSD} USD for donation ${donation.donationNumber}. Reason: ${reason}`
    );

    return true;
  };

  /**
   * Project Management (Protected)
   */
  const createProject = (projectData: Omit<Project, 'id' | 'amountRaisedUSD' | 'donorCount'>): Project => {
    checkAdminAuth('projects:manage');
    const newProj: Project = {
      ...projectData,
      id: `proj_${Date.now()}`,
      amountRaisedUSD: 0,
      donorCount: 0,
    };
    setProjects((prev) => [newProj, ...prev]);
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'PROJECT_CREATED', 'project', newProj.id, `Created new project "${newProj.name}" with goal $${newProj.fundingGoalUSD}`);
    return newProj;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    checkAdminAuth('projects:manage');
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'PROJECT_UPDATED', 'project', id, `Updated project fields`);
  };

  const deleteProject = (id: string) => {
    checkAdminAuth('projects:manage');
    setProjects((prev) => prev.filter((p) => p.id !== id));
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'PROJECT_DELETED', 'project', id, `Deleted project`);
  };

  /**
   * Campaign Management (Protected)
   */
  const createCampaign = (campData: Omit<Campaign, 'id' | 'amountRaisedUSD' | 'donorCount'>): Campaign => {
    checkAdminAuth('projects:manage');
    const newCamp: Campaign = {
      ...campData,
      id: `camp_${Date.now()}`,
      amountRaisedUSD: 0,
      donorCount: 0,
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'CAMPAIGN_CREATED', 'campaign', newCamp.id, `Created campaign "${newCamp.name}"`);
    return newCamp;
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    checkAdminAuth('projects:manage');
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCampaign = (id: string) => {
    checkAdminAuth('projects:manage');
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'CAMPAIGN_DELETED', 'campaign', id, `Deleted campaign`);
  };

  const addStory = (story: Omit<Story, 'id'>) => {
    checkAdminAuth('content:manage');
    const newStory: Story = { ...story, id: `story_${Date.now()}` };
    setStories((prev) => [newStory, ...prev]);
  };

  const addNews = (article: Omit<NewsArticle, 'id'>) => {
    checkAdminAuth('content:manage');
    const newArticle: NewsArticle = { ...article, id: `news_${Date.now()}` };
    setNews((prev) => [newArticle, ...prev]);
  };

  const addVolunteerApplication = (app: Omit<VolunteerApplication, 'id' | 'submittedAt' | 'status'> & { status?: VolunteerApplication['status'] }): VolunteerApplication => {
    const val = ValidationService.validateVolunteerApplication(app);
    const cleanApp = val.isValid ? val.sanitizedData : app;

    const now = new Date();
    const validThru = new Date();
    validThru.setFullYear(now.getFullYear() + 1);

    const yearSuffix = now.getFullYear().toString().slice(-2);
    const randDigits = Math.floor(100 + Math.random() * 900);
    const membershipNumber = app.membershipNumber || `ASFJK${yearSuffix}V${randDigits}`;

    const newApp: VolunteerApplication = {
      ...cleanApp,
      id: `vol_${Date.now()}`,
      membershipNumber,
      status: app.status || 'submitted',
      validFrom: app.validFrom || now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      validThru: app.validThru || validThru.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      submittedAt: now.toISOString(),
    };
    setVolunteers((prev) => {
      const updated = [newApp, ...prev.filter((p) => p.id !== newApp.id)];
      safeSetItem('asfjk_db_volunteers', updated);
      return updated;
    });
    recordAudit('sys_public', cleanApp.fullName, 'public', 'VOLUNTEER_APPLIED', 'user', newApp.id, `Volunteer application registered: ${cleanApp.fullName} (${cleanApp.city || 'India'})`);
    return newApp;
  };

  const updateVolunteerStatus = (id: string, status: any) => {
    checkAdminAuth();
    const now = new Date();
    const validThru = new Date();
    validThru.setFullYear(now.getFullYear() + 1);

    setVolunteers((prev) => {
      const updated = prev.map((v) => {
        if (v.id === id) {
          const isApproving = status === 'approved';
          return {
            ...v,
            status,
            membershipNumber: v.membershipNumber || (isApproving ? `ASFJK26V${Math.floor(100 + Math.random() * 900)}` : undefined),
            roleDesignation: v.roleDesignation || 'Humanitarian Field Specialist',
            bloodGroup: v.bloodGroup || 'O+',
            validFrom: v.validFrom || (isApproving ? now.toISOString().split('T')[0] : undefined),
            validThru: v.validThru || (isApproving ? validThru.toISOString().split('T')[0] : undefined),
          };
        }
        return v;
      });
      safeSetItem('asfjk_db_volunteers', updated);
      return updated;
    });
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'VOLUNTEER_STATUS_UPDATED', 'user', id, `Updated volunteer status to ${status}`);
  };

  const addPartnershipRequest = (req: Omit<PartnershipRequest, 'id' | 'submittedAt' | 'status'>) => {
    const cleanOrgName = ValidationService.sanitizeString(req.organizationName);
    const cleanContact = ValidationService.sanitizeString(req.contactPerson);
    const cleanEmail = req.email ? req.email.trim().toLowerCase() : '';
    const cleanPhone = ValidationService.sanitizeString(req.phone);
    const cleanMessage = ValidationService.sanitizeString(req.message);

    const newReq: PartnershipRequest = {
      ...req,
      organizationName: cleanOrgName,
      contactPerson: cleanContact,
      email: cleanEmail,
      phone: cleanPhone,
      message: cleanMessage,
      id: `part_${Date.now()}`,
      status: 'new',
      submittedAt: new Date().toISOString(),
    };
    setPartnerships((prev) => [newReq, ...prev]);
    recordAudit('sys_public', cleanOrgName, 'public', 'PARTNERSHIP_REQUESTED', 'setting', newReq.id, `New partnership inquiry from ${cleanOrgName}`);
  };

  const addMembership = (data: Omit<NgoMembership, 'id' | 'membershipNumber' | 'createdAt' | 'status' | 'validFrom' | 'validThru'> & { validFrom?: string; validThru?: string; status?: NgoMembership['status'] }): NgoMembership => {
    const val = ValidationService.validateMembership(data);
    const cleanData = val.isValid ? val.sanitizedData : data;

    const now = new Date();
    const validThru = new Date();
    validThru.setFullYear(now.getFullYear() + (cleanData.durationYears || 1));

    const yearSuffix = now.getFullYear().toString().slice(-2);
    const randDigits = Math.floor(100 + Math.random() * 900);
    const membershipNumber = `ASFJK${yearSuffix}M${randDigits}`;
    const receiptNumber = cleanData.receiptNumber || `ASJ-REC-${new Date().getFullYear()}-${randDigits}`;

    const newMbr: NgoMembership = {
      ...cleanData,
      id: `mbr_${Date.now()}`,
      membershipNumber,
      receiptNumber,
      status: cleanData.status || 'active',
      validFrom: cleanData.validFrom || now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      validThru: cleanData.validThru || validThru.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdAt: now.toISOString(),
    };
    setMemberships((prev) => [newMbr, ...prev]);

    // Generate and link official tax receipt if active
    if (newMbr.status === 'active') {
      const receiptObj: Receipt = {
        id: `rec_mbr_${Date.now()}`,
        receiptNumber,
        donationId: newMbr.id,
        transactionId: newMbr.transactionId,
        donationDate: newMbr.createdAt,
        donorName: newMbr.fullName,
        donorEmail: newMbr.email,
        donorAddress: `${newMbr.city}, ${newMbr.country}`,
        projectName: `Al Shujaiat Foundation NGO Membership · ${newMbr.tierName} (${newMbr.durationYears} ${newMbr.durationYears === 1 ? 'Year' : 'Years'})`,
        amount: newMbr.totalContribution || newMbr.paidAmount,
        currency: newMbr.currency,
        amountUSD: newMbr.totalContribution || newMbr.paidAmount,
        paymentMethod: newMbr.paymentMethod,
        language: 'en',
        taxExemptionText: 'Voluntary charitable contribution eligible for 50% deduction under Section 80G and Section 12A of the Indian Income Tax Act, 1961.',
        issuedAt: newMbr.createdAt,
        pdfGenerated: true,
      };
      setReceipts((prev) => [receiptObj, ...prev]);

      if (isSupabaseConfigured) {
        supabase.from('receipts').insert({
          id: receiptObj.id,
          receipt_number: receiptObj.receiptNumber,
          donation_id: receiptObj.donationId,
          donor_id: user?.id,
          transaction_id: receiptObj.transactionId,
          donation_date: receiptObj.donationDate,
          donor_name: receiptObj.donorName,
          donor_email: receiptObj.donorEmail,
          donor_address: receiptObj.donorAddress,
          project_name: receiptObj.projectName,
          amount: receiptObj.amount,
          currency: receiptObj.currency,
          payment_method: receiptObj.paymentMethod,
          issued_at: receiptObj.issuedAt,
          tax_exemption_text: receiptObj.taxExemptionText,
          pdf_generated: true,
        }).then(() => {});
      }
    }

    // Permanent Supabase Storage as Source of Truth (Requirement 6)
    if (isSupabaseConfigured) {
      supabase.from('memberships').insert({
        id: newMbr.id,
        member_id: newMbr.id,
        membership_number: newMbr.membershipNumber,
        full_name: newMbr.fullName,
        email: newMbr.email,
        phone: newMbr.phone,
        city: newMbr.city,
        country: newMbr.country,
        blood_group: newMbr.bloodGroup || 'O+',
        tier: newMbr.tier,
        membership_tier: newMbr.tier,
        membership_level: newMbr.tierName,
        duration_years: newMbr.durationYears,
        membership_duration: newMbr.durationYears,
        fee_amount_usd: newMbr.totalContribution || newMbr.paidAmount,
        membership_amount: newMbr.annualAmount,
        total_contribution: newMbr.totalContribution || newMbr.paidAmount,
        currency: newMbr.currency,
        selected_currency: newMbr.currency,
        payment_id: newMbr.paymentId || newMbr.transactionId,
        order_id: newMbr.orderId || newMbr.transactionId,
        payment_status: newMbr.status === 'active' ? 'completed' : 'pending',
        payment_method: newMbr.paymentMethod,
        payment_transaction_id: newMbr.transactionId,
        start_date: newMbr.validFrom,
        expiry_date: newMbr.validThru,
        membership_start_date: newMbr.validFrom,
        membership_expiry_date: newMbr.validThru,
        receipt_id: newMbr.receiptNumber || '',
        registration_date: newMbr.createdAt,
        created_at: newMbr.createdAt,
      }).then(({ error }) => {
        if (error) {
          console.warn('Supabase memberships insert notice:', error.message);
        }
      });
    }

    recordAudit('sys_public', cleanData.fullName, 'public', 'MEMBERSHIP_ENROLLED', 'user', newMbr.id, `Enrolled in NGO Membership (${newMbr.tierName}, ${newMbr.durationYears} Years, ${newMbr.currency} ${newMbr.totalContribution})`);
    return newMbr;
  };

  const verifyBankTransferDonation = (donationId: string) => {
    checkAdminAuth();
    const d = donations.find((x) => x.id === donationId);
    if (!d) return;

    const receiptNumber = d.receiptNumber || `ASJ-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    setDonations((prev) =>
      prev.map((item) =>
        item.id === donationId
          ? { ...item, status: 'successful', receiptNumber, updatedAt: now }
          : item
      )
    );

    const receiptObj: Receipt = {
      id: `rec_${Date.now()}`,
      receiptNumber,
      donationId: d.id,
      transactionId: d.paymentId || d.notes || `BANK-${Date.now()}`,
      donationDate: now,
      donorName: d.donorName,
      donorEmail: d.donorEmail,
      donorAddress: d.donorCountry || 'India',
      donorTaxId: d.donorTaxId,
      projectName: d.targetName,
      amount: d.amount,
      currency: d.currency,
      amountUSD: d.amountUSD,
      paymentMethod: d.paymentMethod,
      language: 'en',
      taxExemptionText: 'Voluntary charitable contribution eligible for 50% deduction under Section 80G of the Indian Income Tax Act, 1961.',
      issuedAt: now,
      pdfGenerated: true,
    };
    setReceipts((prev) => [receiptObj, ...prev.filter((r) => r.receiptNumber !== receiptNumber)]);

    setPayments((prev) =>
      prev.map((p) =>
        p.donationId === donationId ? { ...p, status: 'successful', updatedAt: now } : p
      )
    );

    recordAudit('usr_admin', 'Administrator', 'super_admin', 'DONATION_VERIFIED', 'donation', donationId, `Verified bank wire transfer for donation ${d.donationNumber} and issued receipt ${receiptNumber}`);
  };

  const updateMembershipStatus = (id: string, status: NgoMembership['status']) => {
    checkAdminAuth();
    setMemberships((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const receiptNumber = m.receiptNumber || `ASJ-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        if (status === 'active' && m.status !== 'active') {
          const now = new Date().toISOString();
          const receiptObj: Receipt = {
            id: `rec_mbr_${Date.now()}`,
            receiptNumber,
            donationId: m.id,
            transactionId: m.transactionId,
            donationDate: now,
            donorName: m.fullName,
            donorEmail: m.email,
            donorAddress: `${m.city}, ${m.country}`,
            projectName: `Al Shujaiat Foundation NGO Membership · ${m.tierName} (${m.durationYears} ${m.durationYears === 1 ? 'Year' : 'Years'})`,
            amount: m.totalContribution || m.paidAmount,
            currency: m.currency,
            amountUSD: m.totalContribution || m.paidAmount,
            paymentMethod: m.paymentMethod,
            language: 'en',
            taxExemptionText: 'Voluntary charitable contribution eligible for 50% deduction under Section 80G and Section 12A of the Indian Income Tax Act, 1961.',
            issuedAt: now,
            pdfGenerated: true,
          };
          setReceipts((rPrev) => [receiptObj, ...rPrev.filter((r) => r.receiptNumber !== receiptNumber)]);
        }
        return { ...m, status, receiptNumber };
      })
    );
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'MEMBERSHIP_STATUS_UPDATED', 'user', id, `Updated membership status to ${status}`);
  };

  const addSupportTicket = (tkt: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => {
    const cleanName = ValidationService.sanitizeString(tkt.name);
    const cleanEmail = tkt.email ? tkt.email.trim().toLowerCase() : '';
    const cleanSubject = ValidationService.sanitizeString(tkt.subject);
    const cleanMessage = ValidationService.sanitizeString(tkt.message);

    const newTkt: SupportTicket = {
      ...tkt,
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      id: `tkt_${Date.now()}`,
      ticketNumber: `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    setSupportTickets((prev) => [newTkt, ...prev]);
    recordAudit('sys_public', cleanName, 'public', 'SUPPORT_TICKET_CREATED', 'setting', newTkt.id, `Support ticket created: ${cleanSubject}`);
  };

  const updatePartnershipStatus = (id: string, status: any) => {
    checkAdminAuth();
    setPartnerships((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'PARTNERSHIP_STATUS_UPDATED', 'setting', id, `Updated partnership status to ${status}`);
  };

  const updateSupportTicketStatus = (id: string, status: 'open' | 'in_progress' | 'resolved' | 'closed', response?: string) => {
    checkAdminAuth();
    setSupportTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, response: response || t.response } : t))
    );
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    checkAdminAuth();
    setSettings((prev) => ({ ...prev, ...newSettings }));
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'SETTINGS_UPDATED', 'setting', 'sys_core', `Updated foundation system settings`);
  };

  const createLeadershipMember = (memberData: Omit<LeadershipMember, 'id' | 'createdAt' | 'updatedAt'>): LeadershipMember => {
    checkAdminAuth();
    const now = new Date().toISOString();
    const cleanSlug = memberData.slug ? memberData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-') : memberData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newMember: LeadershipMember = {
      ...memberData,
      id: `lead_${Date.now()}`,
      slug: cleanSlug,
      createdAt: now,
      updatedAt: now,
    };
    setLeadership((prev) => [...prev, newMember]);
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'LEADERSHIP_CREATED', 'setting', newMember.id, `Created leadership profile "${newMember.name}" (${newMember.role})`);
    return newMember;
  };

  const updateLeadershipMember = (id: string, updates: Partial<LeadershipMember>) => {
    checkAdminAuth();
    const now = new Date().toISOString();
    setLeadership((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = { ...m, ...updates, updatedAt: now };
          if (updates.name && !updates.slug) {
            updated.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          }
          return updated;
        }
        return m;
      })
    );
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'LEADERSHIP_UPDATED', 'setting', id, `Updated leadership profile ${id}`);
  };

  const deleteLeadershipMember = (id: string) => {
    checkAdminAuth();
    setLeadership((prev) => prev.filter((m) => m.id !== id));
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'LEADERSHIP_DELETED', 'setting', id, `Deleted leadership profile ${id}`);
  };

  const toggleLeadershipStatus = (id: string) => {
    checkAdminAuth();
    const now = new Date().toISOString();
    setLeadership((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isActive: !m.isActive, updatedAt: now } : m))
    );
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'LEADERSHIP_STATUS_TOGGLED', 'setting', id, `Toggled published state for leadership profile ${id}`);
  };

  const getPublicLeadership = (): LeadershipMember[] => {
    return leadership
      .filter((m) => m.isActive)
      .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
  };

  const getPublicLeadershipBySlug = (slug: string): LeadershipMember | null => {
    const found = leadership.find((m) => m.slug === slug && m.isActive);
    return found ? { ...found } : null;
  };

  const resetToDemoData = () => {
    checkAdminAuth();
    setProjects(INITIAL_PROJECTS);
    setCampaigns(INITIAL_CAMPAIGNS);
    setDonations(INITIAL_DONATIONS);
    setPayments(INITIAL_PAYMENTS);
    setRecurringDonations(INITIAL_RECURRING_DONATIONS);
    setReceipts(INITIAL_RECEIPTS);
    setRefunds(INITIAL_REFUNDS);
    setStories(INITIAL_STORIES);
    setNews(INITIAL_NEWS);
    setImpactMetrics(INITIAL_IMPACT_METRICS);
    setVolunteers(INITIAL_VOLUNTEERS);
    setPartnerships(INITIAL_PARTNERSHIPS);
    setMemberships(INITIAL_MEMBERSHIPS);
    setLeadership(INITIAL_LEADERSHIP_MEMBERS);
    setSupportTickets(INITIAL_SUPPORT_TICKETS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSettings(INITIAL_SYSTEM_SETTINGS);
    try {
      localStorage.clear();
    } catch (e) {}
  };

  /**
   * Data Minimization Query: Single-record lookup for Volunteer status
   */
  const lookupVolunteerStatus = (email: string): VolunteerApplication | null => {
    if (!email || !email.trim()) return null;
    const cleanEmail = email.trim().toLowerCase();
    const found = volunteers.find((v) => v.email.trim().toLowerCase() === cleanEmail);
    return found ? { ...found } : null;
  };

  /**
   * Data Minimization Query: Single-record lookup for NGO Membership status
   */
  const lookupMembership = (query: string): NgoMembership | null => {
    if (!query || !query.trim()) return null;
    const cleanQuery = query.trim().toLowerCase();
    const found = memberships.find(
      (m) => m.membershipNumber.toLowerCase() === cleanQuery || m.email.toLowerCase() === cleanQuery
    );
    return found ? { ...found } : null;
  };

  /**
   * Data Minimization Query: Single-record lookup for official donation receipt
   */
  const lookupDonationReceipt = (receiptNumber: string, donorEmail: string): Receipt | null => {
    if (!receiptNumber || !donorEmail) return null;
    const cleanRec = receiptNumber.trim().toLowerCase();
    const cleanEmail = donorEmail.trim().toLowerCase();
    const found = receipts.find(
      (r) => r.receiptNumber.toLowerCase() === cleanRec && r.donorEmail.toLowerCase() === cleanEmail
    );
    return found ? { ...found } : null;
  };

  /**
   * Reconciles past guest/anonymous donations with newly created donor accounts or logins
   */
  const linkDonationsToUser = async (email: string, userId: string, name?: string): Promise<number> => {
    if (!email || !userId) return 0;
    const cleanEmail = email.trim().toLowerCase();
    let linkedCount = 0;

    // Check if there was a guest donation completed in this browser session
    let guestDonationId: string | null = null;
    try {
      const lastGuestStr = localStorage.getItem('asfjk_last_guest_donation');
      if (lastGuestStr) {
        const parsed = JSON.parse(lastGuestStr);
        if (parsed?.donationId) {
          guestDonationId = parsed.donationId;
        }
      }
    } catch (e) {}

    // 1. Update local donations in state
    setDonations((prev) =>
      prev.map((d) => {
        const matchesEmail = d.donorEmail.trim().toLowerCase() === cleanEmail;
        const matchesGuestId = guestDonationId && d.id === guestDonationId;

        if (matchesEmail || matchesGuestId) {
          linkedCount++;
          return {
            ...d,
            donorId: userId,
            donorEmail: cleanEmail,
            donorName: name && (!d.donorName || d.donorName === 'Valued Donor' || d.donorName === 'Anonymous Donor') ? name : d.donorName,
          };
        }
        return d;
      })
    );

    // 2. Update local receipts in state
    setReceipts((prev) =>
      prev.map((r) => {
        const matchesEmail = r.donorEmail.trim().toLowerCase() === cleanEmail;
        const matchesGuestId = guestDonationId && r.donationId === guestDonationId;

        if (matchesEmail || matchesGuestId) {
          return {
            ...r,
            donorEmail: cleanEmail,
            donorName: name && (!r.donorName || r.donorName === 'Valued Donor' || r.donorName === 'Anonymous Donor') ? name : r.donorName,
          };
        }
        return r;
      })
    );

    // 3. Update recurring subscriptions in state
    setRecurringDonations((prev) =>
      prev.map((rec) => {
        if (rec.donorEmail.trim().toLowerCase() === cleanEmail) {
          return {
            ...rec,
            donorId: userId,
            donorEmail: cleanEmail,
            donorName: name || rec.donorName,
          };
        }
        return rec;
      })
    );

    // 4. If Supabase is configured, pull historical donations from Supabase for this email
    if (isSupabaseConfigured) {
      try {
        const { data: remoteDonations, error: donErr } = await supabase
          .from('donations')
          .select('*')
          .eq('donor_email', cleanEmail);

        if (!donErr && remoteDonations && remoteDonations.length > 0) {
          setDonations((prev) => {
            const existingIds = new Set(prev.map((d) => d.id));
            const existingNums = new Set(prev.map((d) => d.donationNumber));
            const newFromRemote: Donation[] = [];

            for (const rem of remoteDonations) {
              if (!existingIds.has(rem.id) && !existingNums.has(rem.donation_number)) {
                newFromRemote.push({
                  id: rem.id,
                  donationNumber: rem.donation_number,
                  donorId: userId,
                  donorName: rem.donor_name || name || 'Valued Donor',
                  donorEmail: cleanEmail,
                  donorPhone: rem.donor_phone,
                  donorCountry: rem.donor_country || 'India',
                  donorTaxId: rem.donor_tax_id,
                  anonymous: false,
                  frequency: rem.frequency || 'one_time',
                  donationType: 'general',
                  targetName: rem.target_name || 'General Humanitarian Relief Fund',
                  amount: rem.amount,
                  currency: rem.currency || 'INR',
                  amountUSD: rem.amount_usd || rem.amount * 0.012,
                  exchangeRate: rem.amount_usd ? rem.amount_usd / rem.amount : 0.012,
                  status: rem.status === 'successful' ? 'successful' : 'pending',
                  paymentMethod: rem.payment_method || 'Razorpay',
                  paymentId: rem.gateway_payment_id || rem.id,
                  receiptNumber: rem.receipt_number,
                  createdAt: rem.created_at || new Date().toISOString(),
                  updatedAt: rem.updated_at || new Date().toISOString(),
                });
              }
            }

            return newFromRemote.length > 0 ? [...newFromRemote, ...prev] : prev;
          });

          // Also update donor_id in remote Supabase table
          await supabase
            .from('donations')
            .update({ donor_id: userId })
            .eq('donor_email', cleanEmail);
        }

        // Pull remote receipts from Supabase if missing
        const { data: remoteReceipts } = await supabase
          .from('receipts')
          .select('*')
          .eq('donor_email', cleanEmail);

        if (remoteReceipts && remoteReceipts.length > 0) {
          setReceipts((prev) => {
            const existingRecNums = new Set(prev.map((r) => r.receiptNumber));
            const newRecs: Receipt[] = [];

            for (const rr of remoteReceipts) {
              if (!existingRecNums.has(rr.receipt_number)) {
                newRecs.push({
                  id: rr.id || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                  receiptNumber: rr.receipt_number,
                  donationId: rr.donation_id,
                  transactionId: rr.transaction_id,
                  donationDate: rr.donation_date || rr.created_at || new Date().toISOString(),
                  donorName: rr.donor_name || name || 'Valued Donor',
                  donorEmail: cleanEmail,
                  donorAddress: rr.donor_address || 'India',
                  donorTaxId: rr.donor_tax_id,
                  projectName: rr.project_name || 'General Humanitarian Relief Fund',
                  amount: rr.amount,
                  currency: rr.currency || 'INR',
                  amountUSD: rr.amount_usd || rr.amount * 0.012,
                  paymentMethod: rr.payment_method || 'Razorpay Online',
                  language: 'en',
                  taxExemptionText: rr.tax_exemption_text || 'Donations are tax deductible under Section 80G.',
                  issuedAt: rr.issued_at || new Date().toISOString(),
                  pdfGenerated: true,
                });
              }
            }
            return newRecs.length > 0 ? [...newRecs, ...prev] : prev;
          });
        }
      } catch (sbSyncErr) {
        console.warn('Supabase remote donation sync notice:', sbSyncErr);
      }
    }

    return linkedCount;
  };

  // Automatically reconcile past donations whenever user logs in or registers
  useEffect(() => {
    if (user?.id && user?.email) {
      linkDonationsToUser(user.email, user.id, user.name);
    }
  }, [user?.id, user?.email]);

  return (
    <DatabaseContext.Provider
      value={{
        projects,
        campaigns,
        donations,
        payments,
        recurringDonations,
        receipts,
        refunds,
        stories,
        news,
        impactMetrics,
        volunteers,
        partnerships,
        memberships,
        leadership,
        supportTickets,
        auditLogs,
        settings,
        processDonation,
        verifyBankTransferDonation,
        updateRecurringStatus,
        simulateFailedRecurringPayment,
        simulateRetryRecurringPayment,
        processRefund,
        createProject,
        updateProject,
        deleteProject,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        addStory,
        addNews,
        addVolunteerApplication,
        updateVolunteerStatus,
        addPartnershipRequest,
        updatePartnershipStatus,
        addMembership,
        updateMembershipStatus,
        createLeadershipMember,
        updateLeadershipMember,
        deleteLeadershipMember,
        toggleLeadershipStatus,
        getPublicLeadership,
        getPublicLeadershipBySlug,
        addSupportTicket,
        updateSupportTicketStatus,
        updateSettings,
        resetToDemoData,
        lookupVolunteerStatus,
        lookupMembership,
        lookupDonationReceipt,
        linkDonationsToUser,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
