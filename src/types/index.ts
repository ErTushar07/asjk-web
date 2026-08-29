export type UserRole = 
  | 'super_admin' 
  | 'finance_admin' 
  | 'project_manager' 
  | 'content_manager' 
  | 'donor_support' 
  | 'reporting_user' 
  | 'auditor' 
  | 'donor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  preferredLanguage: string;
  preferredCurrency: string;
  twoFactorEnabled?: boolean;
  createdAt: string;
}

export interface DonorProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  organization?: string;
  taxId?: string; // PAN or Tax Identification Number
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  communicationPreferences: {
    emailReceipts: boolean;
    projectUpdates: boolean;
    newsletter: boolean;
    annualReports: boolean;
  };
  totalDonatedUSD: number;
  totalDonationsCount: number;
  activeRecurringCount: number;
  createdAt: string;
}

export type ProjectStatus = 
  | 'draft' 
  | 'pending_review' 
  | 'active' 
  | 'funded' 
  | 'completed' 
  | 'paused' 
  | 'cancelled' 
  | 'archived';

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completionPercentage: number;
  status: 'pending' | 'in_progress' | 'completed';
  costRequirementUSD: number;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  authorName: string;
  images: string[];
  documents?: { name: string; url: string; size: string }[];
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  category: 'Clean Water' | 'Education' | 'Healthcare' | 'Emergency Relief' | 'Orphan Sponsorship' | 'Livelihood' | 'Winter Relief';
  country: string;
  region: string;
  city: string;
  locationDetails: string;
  shortDescription: string;
  longDescription: string;
  problemStatement: string;
  objectives: string[];
  activities: string[];
  expectedOutcomes: string[];
  beneficiariesCount: number;
  beneficiariesDescription: string;
  startDate: string;
  expectedCompletionDate: string;
  fundingGoalUSD: number;
  fundingCurrency: string;
  amountRaisedUSD: number;
  donorCount: number;
  status: ProjectStatus;
  heroImage: string;
  galleryImages: string[];
  videoUrl?: string;
  milestones: ProjectMilestone[];
  updates: ProjectUpdate[];
  impactMetrics: { label: string; value: string }[];
  featured?: boolean;
  urgent?: boolean;
}

export type CampaignType = 'emergency' | 'seasonal' | 'fundraising' | 'event' | 'corporate';
export type CampaignStatus = 'active' | 'upcoming' | 'completed' | 'paused';

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  type: CampaignType;
  description: string;
  goalUSD: number;
  amountRaisedUSD: number;
  startDate: string;
  endDate: string;
  heroImage: string;
  relatedProjectIds: string[];
  status: CampaignStatus;
  donorCount: number;
  featured?: boolean;
}

export type DonationFrequency = 'one_time' | 'monthly' | 'yearly';
export type DonationType = 'project' | 'campaign' | 'general' | 'emergency' | 'program';
export type DonationStatus = 'pending' | 'successful' | 'failed' | 'refunded' | 'partially_refunded' | 'cancelled';

export interface Donation {
  id: string;
  donationNumber: string; // e.g. ASJ-DON-2026-00123
  donorId?: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorCountry: string;
  donorTaxId?: string;
  anonymous: boolean;
  frequency: DonationFrequency;
  donationType: DonationType;
  targetId?: string; // Project ID or Campaign ID
  targetName: string;
  amount: number; // in original currency
  currency: string;
  amountUSD: number; // normalized source of truth
  exchangeRate: number;
  status: DonationStatus;
  paymentMethod: string;
  paymentId: string;
  receiptNumber?: string;
  receiptUrl?: string;
  recurringDonationId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type PaymentMethod = 'stripe_card' | 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'bank_wire' | 'sandbox_card';
export type PaymentStatus = 'initiated' | 'pending' | 'successful' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';

export interface Payment {
  id: string;
  transactionId: string;
  donationId: string;
  provider: 'stripe' | 'razorpay' | 'bank' | 'sandbox';
  providerPaymentId: string;
  amount: number;
  currency: string;
  amountUSD: number;
  feeAmountUSD: number;
  netAmountUSD: number;
  status: PaymentStatus;
  method: PaymentMethod;
  failureReason?: string;
  idempotencyKey: string;
  gatewayResponse?: any;
  createdAt: string;
  updatedAt: string;
}

export type RecurringStatus = 'active' | 'paused' | 'past_due' | 'payment_failed' | 'cancelled' | 'completed';

export interface RecurringDonation {
  id: string;
  subscriptionNumber: string; // e.g. ASJ-SUB-2026-0042
  donorId: string;
  donorName: string;
  donorEmail: string;
  projectId?: string;
  projectName: string;
  amount: number;
  currency: string;
  amountUSD: number;
  frequency: 'monthly' | 'yearly';
  provider: 'stripe' | 'razorpay' | 'sandbox';
  providerSubscriptionId: string;
  paymentMethodRef: string;
  startDate: string;
  nextPaymentDate: string;
  lastSuccessfulPayment?: string;
  lastFailedPayment?: string;
  totalCollectedUSD: number;
  successfulPaymentCount: number;
  status: RecurringStatus;
  pausedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string; // e.g. ASJ-REC-2026-00987
  donationId: string;
  recurringDonationId?: string;
  transactionId: string;
  donationDate: string;
  donorName: string;
  donorOrganization?: string;
  donorEmail: string;
  donorAddress: string;
  donorTaxId?: string;
  projectName: string;
  campaignName?: string;
  amount: number;
  currency: string;
  amountUSD: number;
  paymentMethod: string;
  language: string;
  taxExemptionText: string;
  issuedAt: string;
  pdfGenerated: boolean;
}

export interface Refund {
  id: string;
  refundNumber: string;
  donationId: string;
  donationNumber: string;
  paymentId: string;
  amountUSD: number;
  amountOriginal: number;
  currency: string;
  reason: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  requestedBy: string;
  approvedBy?: string;
  donorEmail: string;
  donorName: string;
  projectId?: string;
  projectName?: string;
  createdAt: string;
  processedAt?: string;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  location: string;
  beneficiaryName: string;
  relatedProjectId?: string;
  coverImage: string;
  publishedDate: string;
  status: 'draft' | 'published' | 'archived';
  readTime: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: 'Press Release' | 'Event' | 'Announcement' | 'Media Coverage';
  coverImage: string;
  publishedDate: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
}

export interface ImpactMetric {
  id: string;
  key: string;
  label: string;
  value: number;
  unit: string;
  iconName: string;
  category: string;
  description: string;
}

export interface VolunteerApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  skills: string[];
  availability: 'weekdays' | 'weekends' | 'full_time' | 'flexible';
  experienceYears: number;
  statement: string;
  status: 'submitted' | 'under_review' | 'interview_scheduled' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface PartnershipRequest {
  id: string;
  organizationName: string;
  organizationType: 'corporate' | 'ngo' | 'foundation' | 'academic' | 'government';
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  country: string;
  interestAreas: string[];
  message: string;
  status: 'new' | 'in_discussion' | 'partnered' | 'declined';
  submittedAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  subject: string;
  category: 'donation_issue' | 'receipt_request' | 'recurring_cancellation' | 'refund_request' | 'general';
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  response?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: 'donation' | 'payment' | 'refund' | 'receipt' | 'project' | 'campaign' | 'user' | 'role' | 'setting' | 'auth' | 'recurring';
  entityId: string;
  description: string;
  timestamp: string;
  ipAddress: string;
  metadata?: Record<string, any>;
}

export interface SystemSettings {
  foundationName: string;
  foundationLegalName: string;
  registrationNumber: string;
  taxExemptionNumber80G: string;
  fcraRegistrationNumber: string;
  registeredAddress: string;
  email: string;
  phone: string;
  emergencyPhone: string;
  websiteUrl: string;
  defaultCurrency: string;
  supportedCurrencies: string[];
  presetAmounts: number[];
  donationGoalExceededPolicy: 'continue_support' | 'redirect_general' | 'stop_recurring';
  paymentGateways: {
    stripeEnabled: boolean;
    stripePublishableKey?: string;
    razorpayEnabled: boolean;
    razorpayKeyId?: string;
    sandboxEnabled: boolean;
    bankTransferEnabled: boolean;
  };
  notificationThresholds: {
    largeDonationUSD: number;
    lowProjectFundsAlertUSD: number;
  };
}

export interface TranslationItem {
  id: string;
  key: string;
  category: 'common' | 'nav' | 'home' | 'donate' | 'projects' | 'impact' | 'receipts' | 'admin';
  en: string;
  hi: string;
  ur: string;
  ar: string;
  fr?: string;
  es?: string;
  de?: string;
  tr?: string;
  status: 'published' | 'machine_translated' | 'under_review';
}
