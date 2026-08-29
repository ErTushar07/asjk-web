import React from 'react';
import { ShieldCheck, FileText, Lock, RefreshCw, AlertCircle } from 'lucide-react';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'refund-policy' | 'donation-policy' | 'cookie-policy';
}

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const contentMap = {
    privacy: {
      title: 'Privacy Policy',
      badge: 'Data Protection & Security',
      date: 'Last updated: August 2026',
      body: (
        <>
          <p>
            Al Shujaiat Foundation Jammu & Kashmir (ASFJK) (&ldquo;Foundation&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is committed to respecting your privacy and protecting personal information collected through our website and donation platforms.
          </p>
          <h3 className="text-base font-bold text-content-primary">1. Information We Collect</h3>
          <p>
            When you make a voluntary donation, apply to volunteer, or submit a partnership inquiry, we collect your name, email address, phone number, physical address, and optional tax identification details (such as PAN in India for Section 80G tax benefit).
          </p>
          <h3 className="text-base font-bold text-content-primary">2. Financial Data & Security</h3>
          <p>
            We do NOT store full credit/debit card numbers or bank credentials on our servers. All financial transactions are securely processed by PCI-DSS Level 1 compliant payment gateways (Stripe, Razorpay) using 256-bit SSL encryption.
          </p>
          <h3 className="text-base font-bold text-content-primary">3. How We Use Your Data</h3>
          <p>
            Your information is used solely to issue official ASFJK tax receipts, communicate critical project updates, comply with statutory NGO reporting regulations in Jammu & Kashmir, and manage recurring donations. We never sell or lease donor information to third parties.
          </p>
        </>
      ),
    },
    terms: {
      title: 'Terms and Conditions',
      badge: 'Legal Agreement',
      date: 'Last updated: August 2026',
      body: (
        <>
          <p>
            By accessing or using the website of Al Shujaiat Foundation Jammu & Kashmir (ASFJK), you agree to comply with and be bound by these Terms and Conditions.
          </p>
          <h3 className="text-base font-bold text-content-primary">1. Charitable Purpose</h3>
          <p>
            All funds collected through this platform are utilized exclusively for registered charitable, educational, healthcare, and humanitarian relief objectives in Jammu & Kashmir in compliance with Trust Deed JK-TR-2018/889042.
          </p>
          <h3 className="text-base font-bold text-content-primary">2. Donor Rights & Tax Receipts</h3>
          <p>
            Donors receive an automatic computer-generated PDF tax receipt upon verified payment processing. Receipts are issued in accordance with Section 80G of the Indian Income Tax Act.
          </p>
          <h3 className="text-base font-bold text-content-primary">3. Limitation of Liability</h3>
          <p>
            The Foundation strives to maintain uninterrupted, error-free platform operation but accepts no liability for payment gateway outages or technical force majeure events beyond reasonable control.
          </p>
        </>
      ),
    },
    'refund-policy': {
      title: 'Refund Policy & Procedures',
      badge: 'Financial Integrity',
      date: 'Last updated: August 2026',
      body: (
        <>
          <p>
            Al Shujaiat Foundation Jammu & Kashmir (ASFJK) exercises radical transparency and responsible stewardship of all charitable funds. Because donations are utilized immediately for field operations, refunds are processed under specific verified conditions.
          </p>
          <h3 className="text-base font-bold text-content-primary">1. Grounds for Refund</h3>
          <p>
            A refund may be issued in the event of:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Accidental duplicate payment due to network glitch or browser refresh.</li>
            <li>Unauthorized transaction or verified payment fraud.</li>
            <li>Typographical error in donation amount submitted within 7 calendar days of the transaction.</li>
          </ul>
          <h3 className="text-base font-bold text-content-primary">2. Refund Processing</h3>
          <p>
            To request a refund, email <span className="font-mono text-brand-purple">finance@asfjk.org</span> with your Transaction ID and Donation Receipt Number. Upon verification by our Finance Director (Michael Carter) and Executive Director (Mohd Amin Ganai), approved refunds are credited back to the original payment method within 5–7 banking days.
          </p>
        </>
      ),
    },
    'donation-policy': {
      title: 'Donation & Allocation Policy',
      badge: 'Fund Governance',
      date: 'Last updated: August 2026',
      body: (
        <>
          <p>
            This policy outlines how donations—one-time, monthly, and yearly—are accepted, allocated, and managed across our developmental projects.
          </p>
          <h3 className="text-base font-bold text-content-primary">1. Explicit Fund Allocation</h3>
          <p>
            When a donor selects a specific project (e.g. Clean Water Initiative), 100% of the net funds are earmarked directly for that project&apos;s physical execution and maintenance.
          </p>
          <h3 className="text-base font-bold text-content-primary">2. Project Goal Exceeded Policy</h3>
          <p>
            In the event that a project reaches 100% of its budget goal, subsequent recurring gifts will continue to fund operational upkeep of that project or will be redirected to the ASFJK General Humanitarian Relief Fund as approved by the Board.
          </p>
        </>
      ),
    },
    'cookie-policy': {
      title: 'Cookie Policy',
      badge: 'User Preferences',
      date: 'Last updated: August 2026',
      body: (
        <>
          <p>
            Our website uses minimal, privacy-respecting cookies and local storage tokens strictly to maintain your session authentication, preferred language (e.g., Urdu, Hindi, English), and preferred currency (e.g., USD, INR, EUR).
          </p>
          <h3 className="text-base font-bold text-content-primary">1. Essential Cookies</h3>
          <p>
            These cookies are required to allow secure login, donor portal access, and uninterrupted checkout state during multi-step donations.
          </p>
          <h3 className="text-base font-bold text-content-primary">2. Analytics & Performance</h3>
          <p>
            We collect anonymized aggregate visit metrics to understand which projects require urgent funding. We never deploy intrusive third-party cross-site trackers.
          </p>
        </>
      ),
    },
  };

  const current = contentMap[type] || contentMap.privacy;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          {current.badge}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          {current.title}
        </h1>
        <p className="text-xs text-content-muted font-mono">{current.date}</p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-content-border shadow-brand-sm space-y-6 text-xs sm:text-sm text-content-secondary leading-relaxed">
        {current.body}
      </div>
    </div>
  );
};
