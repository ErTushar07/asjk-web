import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { ChevronDown, ChevronUp, HelpCircle, Sparkles } from 'lucide-react';

export const FAQPage: React.FC = () => {
  usePageMeta(
    'Frequently Asked Questions',
    'Find answers to questions about Section 80G tax receipts, donation allocations, recurring plans, and volunteering with Al Shujaiat Foundation.'
  );
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: t('faq.q1', 'Is Al Shujaiat Foundation a registered charitable organization?'),
      a: t('faq.a1', 'Yes. Al Shujaiat Foundation is a legally registered non-profit charitable trust in Jammu & Kashmir and enrolled on NITI Aayog NGO-DARPAN under Unique ID / Registration Number JK/2018/0190361. Donations are recognized for tax exemption under Section 80G (Reg: DEL-AE28396-27022018/9728) and Section 12A (Reg: DEL-AR26932-27022018/8830) of the Indian Income Tax Act.'),
    },
    {
      q: t('faq.q2', 'How are project funding numbers calculated on this platform?'),
      a: t('faq.a2', 'The frontend is never the source of truth for financial totals. Project funding progress (Total Need, Raised, Remaining, and Donor Count) is calculated dynamically and strictly from verified successful payments minus approved refunds processed by our finance team.'),
    },
    {
      q: t('faq.q3', 'Will I receive an official tax deduction receipt after donating?'),
      a: t('faq.a3', 'Yes. The moment your transaction is confirmed, an official computer-generated PDF tax receipt is generated containing unique serial numbers, statutory registration numbers, transaction IDs, and authorized digital verification stamps. You can download it immediately or retrieve it anytime from your Donor Portal.'),
    },
    {
      q: t('faq.q4', 'Can international donors contribute in USD, GBP, EUR, or other currencies?'),
      a: t('faq.a4', 'Absolutely. We accept international payments via Stripe (supporting Visa, Mastercard, American Express, Apple Pay) and direct international wire transfers. Our platform supports independent language and currency selection.'),
    },
    {
      q: t('faq.q5', 'How do monthly and yearly recurring subscriptions work?'),
      a: t('faq.a5', 'Recurring donations are real payment subscriptions managed through secure payment gateway tokens. Donors have full autonomous control to view upcoming billing dates, pause, resume, retry failed charges, or cancel subscriptions anytime in the Donor Dashboard.'),
    },
    {
      q: t('faq.q6', 'How do I cancel or modify my recurring donation subscription?'),
      a: t('faq.a6', 'You can manage or cancel your subscription anytime with one click. Log into your Donor Dashboard, navigate to the "Recurring Plans" tab, and click "Cancel Subscription" or "Pause". No penalties or questions asked, and your past donation receipts remain permanently accessible.'),
    },
    {
      q: t('faq.q7', 'What happens if a project or emergency campaign exceeds its target goal?'),
      a: t('faq.a7', 'Surplus funds are allocated to adjacent regional emergency needs within the same program pillar (e.g. surplus water well funds are directed to nearby mountain filtration repairs in Baramulla or Kupwara), with full audit log disclosure in our annual financial report.'),
    },
    {
      q: t('faq.q8', 'Can I request a physical signed and stamped Section 80G certificate by post?'),
      a: t('faq.a8', 'Yes. While digital receipts with QR verification are instant and legally valid under Indian IT rules, institutional or individual donors requiring hard copies with wet ink stamps can request dispatch via India Post Speed Post by submitting a ticket through our Contact Desk.'),
    },
    {
      q: t('faq.q9', 'Is my personal and financial information shared with third parties?'),
      a: t('faq.a9', 'Never. We strictly uphold donor confidentiality. We do not sell, trade, or share donor contact information. Payment processing is tokenized end-to-end through PCI-DSS Level 1 certified gateways (Stripe & Razorpay); our servers never store raw credit card or bank credentials.'),
    },
    {
      q: t('faq.q10', 'How quickly are emergency relief funds deployed during winter disasters?'),
      a: t('faq.a10', 'During avalanches, flash floods, or severe winter blockades, emergency relief kits (food rations, thermal blankets, kangri heating units, and medical supplies) are mobilized within 6 hours from our prepositioned disaster response warehouses in Srinagar and north Kashmir.'),
    },
    {
      q: t('faq.q11', 'How are volunteer applicants vetted and assigned identity badges?'),
      a: t('faq.a11', 'Every volunteer application is held in a "Pending Review" queue. Our Volunteer Coordinator verifies uploaded academic qualifications, photo ID, and references. Upon administrative approval, an official digital Volunteer Identity Card with QR verification is issued.'),
    },
    {
      q: t('faq.q12', 'Can I visit project sites in Jammu & Kashmir in person?'),
      a: t('faq.a12', 'Yes. We welcome international donors, researchers, and volunteers to visit our community filtration plants and schools. Please submit a volunteer application or request a field visit through our Contact Desk at least 14 days in advance to arrange logistics.'),
    },
    {
      q: t('faq.q13', 'What is your refund and transaction reversal policy?'),
      a: t('faq.a13', 'If a duplicate charge occurs or an erroneous donation is made, donors may request a full refund within 15 calendar days of the transaction date. Approved refunds are credited back to the original payment source within 5 to 7 business days.'),
    },
    {
      q: t('faq.q14', 'Are contributions eligible for Zakat and Sadaqah allocation?'),
      a: t('faq.a14', 'Yes. We maintain a dedicated 100% Zakat Policy for eligible programs, including orphan sponsorship, winter survival rations for widowed households, and emergency life-saving medical surgeries. You can specify "Zakat" during the donation checkout.'),
    },
    {
      q: t('faq.q15', 'Is Al Shujaiat Foundation eligible for Corporate CSR partnerships in India?'),
      a: t('faq.a15', 'Yes. The foundation is fully compliant with Section 135 of the Companies Act, 2013, and holds valid MCA CSR-1 registration. We partner with public and private sector enterprises for targeted healthcare, clean water, and educational infrastructure CSR projects.'),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          {t('faq.badge', 'Al Shujaiat Foundation · Jammu & Kashmir')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          {t('faq.title', 'Frequently Asked Questions')}
        </h1>
        <p className="text-content-secondary text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          {t('faq.subtitle', 'Everything you need to know about our legal registrations, Section 80G tax deductions, project allocations, and subscription governance.')}
        </p>
      </div>

      <div className="space-y-3.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen ? 'border-brand-purple/40 shadow-brand-sm ring-1 ring-brand-purple/20' : 'border-content-border hover:border-slate-300'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-content-primary hover:text-brand-purple transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-[11px] font-mono text-brand-pink font-extrabold">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <span>{faq.q}</span>
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-brand-pink flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-content-muted flex-shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-content-secondary leading-relaxed border-t border-content-border/60 pt-3 animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
