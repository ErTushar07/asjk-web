import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const FAQPage: React.FC = () => {
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
      q: t('faq.q6', 'Can I visit or volunteer at project sites in Jammu & Kashmir?'),
      a: t('faq.a6', 'Yes. We welcome international donors, researchers, and volunteers to visit our community filtration plants and schools. Please submit a volunteer application or request a field visit through our Contact Desk.'),
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
          {t('faq.subtitle', 'Everything you need to know about our legal status, donation allocations, recurring plans, and tax exemption certificates.')}
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-content-border shadow-brand-sm overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-content-primary hover:text-brand-purple"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-brand-pink flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-content-muted flex-shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-content-secondary leading-relaxed border-t border-content-border/60 pt-3">
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
