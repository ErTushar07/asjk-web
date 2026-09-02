-- ==============================================================================
-- AL SHUJAIAT FOUNDATION JAMMU & KASHMIR (ASFJK)
-- PRODUCTION SUPABASE POSTGRESQL SCHEMA & SECURITY SPECIFICATION
-- ==============================================================================

-- Enable UUID and Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ENUMS & DOMAINS
-- ==============================================================================
CREATE TYPE user_role_enum AS ENUM (
  'super_admin',
  'finance_admin',
  'project_manager',
  'volunteer_manager',
  'membership_manager',
  'content_manager',
  'auditor',
  'donor'
);

CREATE TYPE donation_frequency_enum AS ENUM ('one_time', 'monthly', 'yearly');
CREATE TYPE donation_status_enum AS ENUM ('pending', 'successful', 'failed', 'refunded', 'partially_refunded', 'cancelled');
CREATE TYPE payment_gateway_enum AS ENUM ('razorpay', 'stripe', 'bank_wire', 'sandbox');
CREATE TYPE project_status_enum AS ENUM ('draft', 'pending_review', 'active', 'funded', 'completed', 'paused', 'cancelled', 'archived');
CREATE TYPE campaign_status_enum AS ENUM ('active', 'upcoming', 'completed', 'paused');
CREATE TYPE volunteer_status_enum AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'inactive');
CREATE TYPE membership_status_enum AS ENUM ('pending', 'active', 'expired', 'renewed', 'cancelled');
CREATE TYPE membership_tier_enum AS ENUM ('general_member', 'associate_silver', 'patron_gold', 'founding_platinum', 'benefactor_diamond');
CREATE TYPE ticket_status_enum AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE leadership_category_enum AS ENUM ('trustee', 'executive', 'core_team', 'advisory_board', 'volunteer_lead');

-- ==============================================================================
-- 2. CORE USERS & PROFILES (Linked to Supabase Auth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  country TEXT DEFAULT 'India',
  pan_tax_id TEXT, -- Masked / encrypted for privacy
  role user_role_enum NOT NULL DEFAULT 'donor',
  preferred_language TEXT DEFAULT 'en',
  preferred_currency TEXT DEFAULT 'USD',
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  totp_secret_encrypted TEXT, -- Encrypted Base32 TOTP secret
  is_email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donors Table (Normalized metadata & impact tracking)
CREATE TABLE IF NOT EXISTS public.donors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  country TEXT DEFAULT 'India',
  tax_id TEXT,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_postal_code TEXT,
  communication_email_receipts BOOLEAN DEFAULT TRUE,
  communication_project_updates BOOLEAN DEFAULT TRUE,
  communication_newsletter BOOLEAN DEFAULT TRUE,
  total_donated_usd NUMERIC(12, 2) DEFAULT 0.00,
  donations_count INTEGER DEFAULT 0,
  active_recurring_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. PROJECTS & HUMANITARIAN INITIATIVES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  region TEXT NOT NULL DEFAULT 'Jammu & Kashmir',
  city TEXT NOT NULL,
  location_details TEXT,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  objectives TEXT[] DEFAULT '{}',
  activities TEXT[] DEFAULT '{}',
  expected_outcomes TEXT[] DEFAULT '{}',
  beneficiaries_count INTEGER DEFAULT 0,
  beneficiaries_description TEXT,
  start_date DATE,
  expected_completion_date DATE,
  funding_goal_usd NUMERIC(12, 2) NOT NULL,
  funding_currency TEXT DEFAULT 'USD',
  amount_raised_usd NUMERIC(12, 2) DEFAULT 0.00,
  donor_count INTEGER DEFAULT 0,
  status project_status_enum NOT NULL DEFAULT 'active',
  hero_image TEXT NOT NULL,
  gallery_images TEXT[] DEFAULT '{}',
  video_url TEXT,
  milestones JSONB DEFAULT '[]'::jsonb,
  updates JSONB DEFAULT '[]'::jsonb,
  impact_metrics JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT FALSE,
  urgent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns & Emergency Appeals
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'emergency',
  description TEXT NOT NULL,
  goal_usd NUMERIC(12, 2) NOT NULL,
  amount_raised_usd NUMERIC(12, 2) DEFAULT 0.00,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  hero_image TEXT NOT NULL,
  related_project_ids UUID[] DEFAULT '{}',
  status campaign_status_enum NOT NULL DEFAULT 'active',
  donor_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. DONATIONS, PAYMENTS & 80G RECEIPTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_number TEXT UNIQUE NOT NULL, -- e.g. ASJ-DON-2026-00123
  donor_id UUID REFERENCES public.donors(id) ON DELETE SET NULL,
  donor_email TEXT NOT NULL,
  donor_name TEXT NOT NULL,
  donor_phone TEXT,
  donor_country TEXT DEFAULT 'India',
  donor_tax_id TEXT, -- Section 80G PAN
  anonymous BOOLEAN DEFAULT FALSE,
  frequency donation_frequency_enum NOT NULL DEFAULT 'one_time',
  donation_type TEXT NOT NULL DEFAULT 'project',
  target_id UUID, -- Project ID or Campaign ID
  target_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  amount_usd NUMERIC(12, 2) NOT NULL,
  exchange_rate NUMERIC(10, 6) DEFAULT 1.0,
  status donation_status_enum NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  gateway payment_gateway_enum NOT NULL DEFAULT 'razorpay',
  gateway_order_id TEXT, -- Razorpay Order ID (e.g. order_O88901abc)
  gateway_payment_id TEXT, -- Razorpay Payment ID (e.g. pay_O88901def)
  gateway_signature TEXT,
  idempotency_key TEXT UNIQUE NOT NULL,
  receipt_number TEXT UNIQUE,
  receipt_url TEXT,
  recurring_donation_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Official Section 80G Tax Exemption Receipts
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_number TEXT UNIQUE NOT NULL, -- e.g. ASJ-REC-2026-00987
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  recurring_donation_id UUID,
  transaction_id TEXT NOT NULL,
  donation_date TIMESTAMPTZ NOT NULL,
  donor_name TEXT NOT NULL,
  donor_organization TEXT,
  donor_email TEXT NOT NULL,
  donor_address TEXT NOT NULL,
  donor_tax_id TEXT, -- Section 80G PAN
  project_name TEXT NOT NULL,
  campaign_name TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL,
  amount_usd NUMERIC(12, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  tax_exemption_text TEXT NOT NULL,
  pdf_storage_path TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring Subscriptions
CREATE TABLE IF NOT EXISTS public.recurring_donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_number TEXT UNIQUE NOT NULL, -- e.g. ASJ-SUB-2026-00042
  donor_id UUID REFERENCES public.donors(id) ON DELETE CASCADE,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  amount_usd NUMERIC(12, 2) NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  provider payment_gateway_enum NOT NULL DEFAULT 'razorpay',
  provider_subscription_id TEXT,
  payment_method_ref TEXT,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  next_payment_date TIMESTAMPTZ NOT NULL,
  last_successful_payment TIMESTAMPTZ,
  last_failed_payment TIMESTAMPTZ,
  total_collected_usd NUMERIC(12, 2) DEFAULT 0.00,
  successful_payment_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  paused_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Refunds & Reversals Ledger
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  refund_number TEXT UNIQUE NOT NULL,
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE RESTRICT,
  donation_number TEXT NOT NULL,
  gateway_refund_id TEXT,
  amount_usd NUMERIC(12, 2) NOT NULL,
  amount_original NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  donor_email TEXT NOT NULL,
  donor_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ==============================================================================
-- 5. VOLUNTEERS & NGO MEMBERSHIPS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  membership_number TEXT UNIQUE, -- e.g. ASJ-VOL-2026-0012
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Jammu & Kashmir',
  country TEXT NOT NULL DEFAULT 'India',
  qualification TEXT NOT NULL,
  role_designation TEXT DEFAULT 'Humanitarian Aid Volunteer',
  blood_group TEXT DEFAULT 'O+',
  statement TEXT,
  skills TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'Full-Time',
  photo_storage_path TEXT,
  resume_storage_path TEXT,
  status volunteer_status_enum NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  membership_number TEXT UNIQUE NOT NULL, -- e.g. ASJ-MEM-2026-0045
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Jammu & Kashmir',
  country TEXT NOT NULL DEFAULT 'India',
  blood_group TEXT DEFAULT 'O+',
  tier membership_tier_enum NOT NULL DEFAULT 'general_member',
  duration_years INTEGER NOT NULL DEFAULT 1 CHECK (duration_years >= 1 AND duration_years <= 10),
  fee_amount_usd NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  photo_storage_path TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  status membership_status_enum NOT NULL DEFAULT 'active',
  payment_transaction_id TEXT,
  card_pdf_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. BOARD OF TRUSTEES & LEADERSHIP
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leadership_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  category leadership_category_enum NOT NULL DEFAULT 'trustee',
  bio TEXT NOT NULL,
  department TEXT,
  education TEXT,
  professional_background TEXT,
  email TEXT,
  linkedin TEXT,
  responsibilities TEXT[] DEFAULT '{}',
  photo_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. AUDIT LOGS, NOTIFICATIONS & SYSTEM SETTINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_email TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL, -- e.g. 'donation:refund', 'volunteer:approve', 'settings:update'
  resource TEXT NOT NULL, -- e.g. 'donations', 'volunteers', 'settings'
  resource_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inquiries & Support Tickets
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  status ticket_status_enum NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.partner_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  partnership_type TEXT NOT NULL,
  estimated_budget_usd NUMERIC(12, 2),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  link_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  type TEXT NOT NULL, -- 'registration', 'password_reset', 'email_change'
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Statutory Foundation Settings (Singleton Row)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  foundation_name TEXT NOT NULL DEFAULT 'Al Shujaiat Foundation Jammu & Kashmir',
  short_name TEXT NOT NULL DEFAULT 'ASFJK',
  tagline TEXT NOT NULL DEFAULT 'Empowering Communities, Restoring Dignity & Fostering Sustainable Hope',
  registration_number TEXT NOT NULL DEFAULT 'JK/2018/0190361',
  tax_exemption_number_80g TEXT NOT NULL DEFAULT 'AABTA1234F/80G/2021-22/098',
  tax_exemption_number_12a TEXT NOT NULL DEFAULT 'DEL-AR26932-27022018/8830',
  fcra_registration_number TEXT NOT NULL DEFAULT 'FCRA-JK-094193-2022',
  lei_number TEXT NOT NULL DEFAULT '9845008779YC3EE0IE41',
  email TEXT NOT NULL DEFAULT 'info@asfjk.org',
  phone TEXT NOT NULL DEFAULT '+91 94193 01319',
  emergency_phone TEXT NOT NULL DEFAULT '+91 94193 01319',
  website_url TEXT NOT NULL DEFAULT 'https://asfjk.org',
  registered_address TEXT NOT NULL DEFAULT '124 Shujaiat Complex, M.A. Road, Srinagar, Jammu & Kashmir 190001',
  operating_address TEXT NOT NULL DEFAULT 'Luragam Tral Pulwama Jammu and Kashmir 192123',
  bank_name TEXT NOT NULL DEFAULT 'Jammu & Kashmir Bank Ltd',
  bank_account_name TEXT NOT NULL DEFAULT 'Al Shujaiat Foundation Trust',
  bank_account_number TEXT NOT NULL DEFAULT '0190040100019283',
  bank_ifsc_code TEXT NOT NULL DEFAULT 'JAKA0TRALXX',
  bank_swift_code TEXT NOT NULL DEFAULT 'JAKAINBBXXX',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. INDEXES FOR PERFORMANCE & FAST LOOKUPS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_donations_donor_email ON public.donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_donor_email ON public.receipts(donor_email);
CREATE INDEX IF NOT EXISTS idx_receipts_donation_id ON public.receipts(donation_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_volunteers_email ON public.volunteers(email);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON public.volunteers(status);
CREATE INDEX IF NOT EXISTS idx_memberships_email ON public.memberships(email);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON public.memberships(status);
CREATE INDEX IF NOT EXISTS idx_leadership_category ON public.leadership_members(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_email_type ON public.otp_verifications(email, type);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Enable RLS on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper function: Get authenticated user's role from profiles table
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role_enum AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: Check if current user is any administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'finance_admin', 'project_manager', 'volunteer_manager', 'membership_manager', 'content_manager', 'auditor')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------------------------
-- RLS: Profiles Table
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Super Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Super Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.get_auth_role() = 'super_admin');

-- ------------------------------------------------------------------------------
-- RLS: Projects Table (Public Read / Admin Write)
-- ------------------------------------------------------------------------------
CREATE POLICY "Anyone can view active projects" ON public.projects
  FOR SELECT USING (status = 'active' OR public.is_admin());

CREATE POLICY "Project managers and Super Admins can insert/update projects" ON public.projects
  FOR ALL USING (public.get_auth_role() IN ('super_admin', 'project_manager', 'content_manager'));

-- ------------------------------------------------------------------------------
-- RLS: Campaigns Table (Public Read / Admin Write)
-- ------------------------------------------------------------------------------
CREATE POLICY "Anyone can view active campaigns" ON public.campaigns
  FOR SELECT USING (status = 'active' OR public.is_admin());

CREATE POLICY "Admins can manage campaigns" ON public.campaigns
  FOR ALL USING (public.get_auth_role() IN ('super_admin', 'project_manager', 'content_manager'));

-- ------------------------------------------------------------------------------
-- RLS: Leadership Members Table (Public Read / Admin Write)
-- ------------------------------------------------------------------------------
CREATE POLICY "Anyone can view active leadership" ON public.leadership_members
  FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Super Admin and Content Manager can edit leadership" ON public.leadership_members
  FOR ALL USING (public.get_auth_role() IN ('super_admin', 'content_manager'));

-- ------------------------------------------------------------------------------
-- RLS: Donations Table (Strict Isolation)
-- ------------------------------------------------------------------------------
CREATE POLICY "Donors can view their own donations" ON public.donations
  FOR SELECT USING (
    donor_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    OR public.get_auth_role() IN ('super_admin', 'finance_admin', 'auditor')
  );

CREATE POLICY "System / Server can insert donations" ON public.donations
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Finance Admin and Super Admin can update donations" ON public.donations
  FOR UPDATE USING (public.get_auth_role() IN ('super_admin', 'finance_admin'));

-- ------------------------------------------------------------------------------
-- RLS: Receipts Table (Strict Isolation)
-- ------------------------------------------------------------------------------
CREATE POLICY "Donors can view their own receipts" ON public.receipts
  FOR SELECT USING (
    donor_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    OR public.get_auth_role() IN ('super_admin', 'finance_admin', 'auditor')
  );

CREATE POLICY "Finance Admin and System can manage receipts" ON public.receipts
  FOR ALL USING (public.get_auth_role() IN ('super_admin', 'finance_admin'));

-- ------------------------------------------------------------------------------
-- RLS: Volunteers Table
-- ------------------------------------------------------------------------------
CREATE POLICY "Anyone can submit volunteer application" ON public.volunteers
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Volunteers can view their own application" ON public.volunteers
  FOR SELECT USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    OR public.get_auth_role() IN ('super_admin', 'volunteer_manager')
  );

CREATE POLICY "Volunteer Manager and Super Admin can update volunteer status" ON public.volunteers
  FOR UPDATE USING (public.get_auth_role() IN ('super_admin', 'volunteer_manager'));

-- ------------------------------------------------------------------------------
-- RLS: Memberships Table
-- ------------------------------------------------------------------------------
CREATE POLICY "Anyone can enroll in membership" ON public.memberships
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Members can view own membership" ON public.memberships
  FOR SELECT USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    OR public.get_auth_role() IN ('super_admin', 'membership_manager', 'finance_admin')
  );

CREATE POLICY "Membership Manager can update memberships" ON public.memberships
  FOR UPDATE USING (public.get_auth_role() IN ('super_admin', 'membership_manager'));

-- ------------------------------------------------------------------------------
-- RLS: Audit Logs Table (Append-Only: No UPDATE or DELETE for anyone)
-- ------------------------------------------------------------------------------
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.get_auth_role() IN ('super_admin', 'auditor'));

CREATE POLICY "Authenticated users and system can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (TRUE);

-- ------------------------------------------------------------------------------
-- RLS: Site Settings Table (Public Read / Super Admin Write)
-- ------------------------------------------------------------------------------
CREATE POLICY "Anyone can read site settings" ON public.site_settings
  FOR SELECT USING (TRUE);

CREATE POLICY "Super Admins can update site settings" ON public.site_settings
  FOR UPDATE USING (public.get_auth_role() = 'super_admin');

-- ------------------------------------------------------------------------------
-- RLS: Notifications Table
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view and update their own notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- ==============================================================================
-- 10. INITIAL SEED DATA FOR SYSTEM SETTINGS & DEMO ADMIN
-- ==============================================================================
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
