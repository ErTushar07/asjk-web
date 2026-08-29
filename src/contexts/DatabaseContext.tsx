import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Project, Campaign, Donation, Payment, RecurringDonation, Receipt, Refund,
  Story, NewsArticle, ImpactMetric, VolunteerApplication, PartnershipRequest,
  SupportTicket, AuditLog, SystemSettings, DonationFrequency, PaymentMethod, PaymentStatus
} from '../types';
import {
  INITIAL_PROJECTS, INITIAL_CAMPAIGNS, INITIAL_DONATIONS, INITIAL_PAYMENTS,
  INITIAL_RECURRING_DONATIONS, INITIAL_RECEIPTS, INITIAL_REFUNDS, INITIAL_STORIES,
  INITIAL_NEWS, INITIAL_IMPACT_METRICS, INITIAL_VOLUNTEERS, INITIAL_PARTNERSHIPS,
  INITIAL_SUPPORT_TICKETS, INITIAL_AUDIT_LOGS, INITIAL_SYSTEM_SETTINGS
} from '../data/initialData';
import { PaymentService } from '../services/paymentService';

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
  addStory: (story: Omit<Story, 'id'>) => void;
  addNews: (news: Omit<NewsArticle, 'id'>) => void;
  addVolunteerApplication: (app: Omit<VolunteerApplication, 'id' | 'submittedAt' | 'status'>) => void;
  addPartnershipRequest: (req: Omit<PartnershipRequest, 'id' | 'submittedAt' | 'status'>) => void;
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
        email: !parsed.email || parsed.email.includes('alshujaiat.org') || parsed.email.includes('asfjk.org') ? 'info@asjk.org' : parsed.email,
        websiteUrl: !parsed.websiteUrl || parsed.websiteUrl.includes('alshujaiat.org') || parsed.websiteUrl.includes('asfjk.org') ? 'https://asjk.org' : parsed.websiteUrl,
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
    const paymentResult = await PaymentService.processPayment({
      amount: input.amount,
      currency: input.currency,
      frequency: input.frequency,
      method: input.paymentMethod,
      donorName: input.donorName,
      donorEmail: input.donorEmail,
      targetId: input.targetId,
      targetName: input.targetName,
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
   * Process full or partial refund
   */
  const processRefund = (
    donationId: string,
    amountUSD: number,
    reason: string,
    user: { id: string; name: string; role: string }
  ): boolean => {
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
   * Project Management
   */
  const createProject = (projectData: Omit<Project, 'id' | 'amountRaisedUSD' | 'donorCount'>): Project => {
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
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'PROJECT_UPDATED', 'project', id, `Updated project fields`);
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'PROJECT_DELETED', 'project', id, `Deleted project`);
  };

  /**
   * Campaign Management
   */
  const createCampaign = (campData: Omit<Campaign, 'id' | 'amountRaisedUSD' | 'donorCount'>): Campaign => {
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
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const addStory = (story: Omit<Story, 'id'>) => {
    const newStory: Story = { ...story, id: `story_${Date.now()}` };
    setStories((prev) => [newStory, ...prev]);
  };

  const addNews = (article: Omit<NewsArticle, 'id'>) => {
    const newArticle: NewsArticle = { ...article, id: `news_${Date.now()}` };
    setNews((prev) => [newArticle, ...prev]);
  };

  const addVolunteerApplication = (app: Omit<VolunteerApplication, 'id' | 'submittedAt' | 'status'>) => {
    const newApp: VolunteerApplication = {
      ...app,
      id: `vol_${Date.now()}`,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };
    setVolunteers((prev) => [newApp, ...prev]);
    recordAudit('sys_public', app.fullName, 'public', 'VOLUNTEER_APPLIED', 'user', newApp.id, `New volunteer application from ${app.fullName} (${app.city})`);
  };

  const addPartnershipRequest = (req: Omit<PartnershipRequest, 'id' | 'submittedAt' | 'status'>) => {
    const newReq: PartnershipRequest = {
      ...req,
      id: `part_${Date.now()}`,
      status: 'new',
      submittedAt: new Date().toISOString(),
    };
    setPartnerships((prev) => [newReq, ...prev]);
    recordAudit('sys_public', req.organizationName, 'public', 'PARTNERSHIP_REQUESTED', 'setting', newReq.id, `New partnership inquiry from ${req.organizationName}`);
  };

  const addSupportTicket = (tkt: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => {
    const newTkt: SupportTicket = {
      ...tkt,
      id: `tkt_${Date.now()}`,
      ticketNumber: `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    setSupportTickets((prev) => [newTkt, ...prev]);
    recordAudit('sys_public', tkt.name, 'public', 'SUPPORT_TICKET_CREATED', 'setting', newTkt.id, `Support ticket created: ${tkt.subject}`);
  };

  const updateSupportTicketStatus = (id: string, status: 'open' | 'in_progress' | 'resolved' | 'closed', response?: string) => {
    setSupportTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, response: response || t.response } : t))
    );
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    recordAudit('usr_admin', 'Administrator', 'super_admin', 'SETTINGS_UPDATED', 'setting', 'sys_core', `Updated foundation system settings`);
  };

  const resetToDemoData = () => {
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
        addStory,
        addNews,
        addVolunteerApplication,
        addPartnershipRequest,
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
