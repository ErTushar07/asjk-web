import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Project, Campaign, Donation, Payment, RecurringDonation, Receipt, Refund,
  Story, NewsArticle, ImpactMetric, VolunteerApplication, PartnershipRequest,
  NgoMembership, SupportTicket, AuditLog, SystemSettings, DonationFrequency, PaymentMethod, PaymentStatus
} from '../types';
import {
  INITIAL_PROJECTS, INITIAL_CAMPAIGNS, INITIAL_DONATIONS, INITIAL_PAYMENTS,
  INITIAL_RECURRING_DONATIONS, INITIAL_RECEIPTS, INITIAL_REFUNDS, INITIAL_STORIES,
  INITIAL_NEWS, INITIAL_IMPACT_METRICS, INITIAL_VOLUNTEERS, INITIAL_PARTNERSHIPS,
  INITIAL_MEMBERSHIPS, INITIAL_SUPPORT_TICKETS, INITIAL_AUDIT_LOGS, INITIAL_SYSTEM_SETTINGS
} from '../data/initialData';
import { PaymentService } from '../services/paymentService';
import { ValidationService } from '../services/validationService';
import { SecurityService } from '../services/securityService';

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
}

interface ProcessDonationResult {
  donation: Donation;
  receipt: Receipt;
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
  supportTickets: SupportTicket[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  
  // Actions
  processDonation: (input: ProcessDonationInput) => Promise<ProcessDonationResult>;
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
  addVolunteerApplication: (app: Omit<VolunteerApplication, 'id' | 'submittedAt' | 'status'>) => VolunteerApplication;
  updateVolunteerStatus: (id: string, status: any) => void;
  addPartnershipRequest: (req: Omit<PartnershipRequest, 'id' | 'submittedAt' | 'status'>) => void;
  updatePartnershipStatus: (id: string, status: any) => void;
  addMembership: (data: Omit<NgoMembership, 'id' | 'membershipNumber' | 'createdAt' | 'status' | 'validFrom' | 'validThru'> & { validFrom?: string; validThru?: string; status?: NgoMembership['status'] }) => NgoMembership;
  updateMembershipStatus: (id: string, status: NgoMembership['status']) => void;
  addSupportTicket: (tkt: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => void;
  updateSupportTicketStatus: (id: string, status: 'open' | 'in_progress' | 'resolved' | 'closed', response?: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetToDemoData: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      };
    } catch {
      return INITIAL_SYSTEM_SETTINGS;
    }
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('asfjk_db_projects', JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    localStorage.setItem('asfjk_db_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);
  useEffect(() => {
    localStorage.setItem('asfjk_db_donations', JSON.stringify(donations));
  }, [donations]);
  useEffect(() => {
    localStorage.setItem('asfjk_db_payments', JSON.stringify(payments));
  }, [payments]);
  useEffect(() => {
    localStorage.setItem('asfjk_db_recurring', JSON.stringify(recurringDonations));
  }, [recurringDonations]);
  useEffect(() => {
    localStorage.setItem('asfjk_db_receipts', JSON.stringify(receipts));
  }, [receipts]);
  useEffect(() => {
    localStorage.setItem('asfjk_db_refunds', JSON.stringify(refunds));
  }, [refunds]);
  useEffect(() => {
    localStorage.setItem('asfjk_db_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem('asfjk_db_memberships', JSON.stringify(memberships));
  }, [memberships]);
  useEffect(() => {
    localStorage.setItem('asfjk_db_settings', JSON.stringify(settings));
  }, [settings]);

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
    });

    const now = new Date().toISOString();

    // 1. Create Donation Record
    const newDonation: Donation = {
      id: paymentResult.donationId,
      donationNumber: `ASJ-DON-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
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
      status: 'successful',
      paymentMethod: input.paymentMethod,
      paymentId: paymentResult.paymentId,
      receiptNumber: paymentResult.receiptNumber,
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
      status: 'successful',
      method: input.paymentMethod,
      idempotencyKey: `idem_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    // 3. Create Receipt Record
    const newReceipt: Receipt = {
      id: `rec_doc_${Date.now()}`,
      receiptNumber: paymentResult.receiptNumber,
      donationId: paymentResult.donationId,
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

    // 4. Create Recurring Subscription if applicable
    let newRecurring: RecurringDonation | undefined;
    if (input.frequency !== 'one_time') {
      const nextDate = new Date();
      if (input.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      else nextDate.setFullYear(nextDate.getFullYear() + 1);

      newRecurring = {
        id: `rec_${Date.now()}`,
        subscriptionNumber: `ASJ-SUB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
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
        paymentMethodRef: `${input.paymentMethod} ending in 4242`,
        startDate: now,
        nextPaymentDate: nextDate.toISOString(),
        lastSuccessfulPayment: now,
        totalCollectedUSD: paymentResult.amountUSD,
        successfulPaymentCount: 1,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };

      setRecurringDonations((prev) => [newRecurring!, ...prev]);
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
    setReceipts((prev) => [newReceipt, ...prev]);

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

  const addVolunteerApplication = (app: Omit<VolunteerApplication, 'id' | 'submittedAt' | 'status'>): VolunteerApplication => {
    const val = ValidationService.validateVolunteerApplication(app);
    if (!val.isValid) {
      throw new Error(`Volunteer application validation error: ${Object.values(val.errors).join(', ')}`);
    }
    const cleanApp = val.sanitizedData;

    const now = new Date();
    const newApp: VolunteerApplication = {
      ...cleanApp,
      id: `vol_${Date.now()}`,
      status: 'submitted', // Under review until approved by admin
      submittedAt: now.toISOString(),
    };
    setVolunteers((prev) => [newApp, ...prev]);
    recordAudit('sys_public', cleanApp.fullName, 'public', 'VOLUNTEER_APPLIED', 'user', newApp.id, `New volunteer application submitted by ${cleanApp.fullName} (${cleanApp.city})`);
    return newApp;
  };

  const updateVolunteerStatus = (id: string, status: any) => {
    checkAdminAuth();
    const now = new Date();
    const validThru = new Date();
    validThru.setFullYear(now.getFullYear() + 1);

    setVolunteers((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const isApproving = status === 'approved';
          return {
            ...v,
            status,
            membershipNumber: v.membershipNumber || (isApproving ? `ASF-VOL-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
            roleDesignation: v.roleDesignation || 'Humanitarian Field Specialist',
            bloodGroup: v.bloodGroup || 'O+',
            validFrom: v.validFrom || (isApproving ? now.toISOString().split('T')[0] : undefined),
            validThru: v.validThru || (isApproving ? validThru.toISOString().split('T')[0] : undefined),
          };
        }
        return v;
      })
    );
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'VOLUNTEER_STATUS_UPDATED', 'user', id, `Updated volunteer status to ${status}`);
  };

  const addPartnershipRequest = (req: Omit<PartnershipRequest, 'id' | 'submittedAt' | 'status'>) => {
    const cleanOrgName = ValidationService.sanitizeString(req.organizationName);
    const cleanContact = ValidationService.sanitizeString(req.contactPerson);
    const cleanEmail = req.email ? req.email.trim().toLowerCase() : '';
    const cleanPhone = ValidationService.sanitizeString(req.phone);
    const cleanProposal = ValidationService.sanitizeString(req.proposalSummary);

    const newReq: PartnershipRequest = {
      ...req,
      organizationName: cleanOrgName,
      contactPerson: cleanContact,
      email: cleanEmail,
      phone: cleanPhone,
      proposalSummary: cleanProposal,
      id: `part_${Date.now()}`,
      status: 'new',
      submittedAt: new Date().toISOString(),
    };
    setPartnerships((prev) => [newReq, ...prev]);
    recordAudit('sys_public', cleanOrgName, 'public', 'PARTNERSHIP_REQUESTED', 'setting', newReq.id, `New partnership inquiry from ${cleanOrgName}`);
  };

  const addMembership = (data: Omit<NgoMembership, 'id' | 'membershipNumber' | 'createdAt' | 'status' | 'validFrom' | 'validThru'> & { validFrom?: string; validThru?: string; status?: NgoMembership['status'] }): NgoMembership => {
    const val = ValidationService.validateMembership(data);
    if (!val.isValid) {
      throw new Error(`Membership validation error: ${Object.values(val.errors).join(', ')}`);
    }
    const cleanData = val.sanitizedData;

    const now = new Date();
    const validThru = new Date();
    validThru.setFullYear(now.getFullYear() + (cleanData.durationYears || 1));

    const newMbr: NgoMembership = {
      ...cleanData,
      id: `mbr_${Date.now()}`,
      membershipNumber: `ASF-MBR-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: cleanData.status || 'active',
      validFrom: cleanData.validFrom || now.toISOString().split('T')[0],
      validThru: cleanData.validThru || validThru.toISOString().split('T')[0],
      createdAt: now.toISOString(),
    };
    setMemberships((prev) => [newMbr, ...prev]);
    recordAudit('sys_public', cleanData.fullName, 'public', 'MEMBERSHIP_ENROLLED', 'user', newMbr.id, `Enrolled in NGO Membership (${newMbr.tierName}, ${newMbr.durationYears} Years)`);
    return newMbr;
  };

  const updateMembershipStatus = (id: string, status: NgoMembership['status']) => {
    checkAdminAuth();
    setMemberships((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
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
    setSupportTickets(INITIAL_SUPPORT_TICKETS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSettings(INITIAL_SYSTEM_SETTINGS);
    localStorage.clear();
  };

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
        supportTickets,
        auditLogs,
        settings,
        processDonation,
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
        addSupportTicket,
        updateSupportTicketStatus,
        updateSettings,
        resetToDemoData,
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
