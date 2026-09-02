import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Shield, CheckCircle2, ArrowRight, Building2 } from 'lucide-react';

export const PartnersPage: React.FC = () => {
  usePageMeta(
    'Corporate & NGO Partnerships',
    'Partner with Al Shujaiat Foundation for CSR projects, sustainable development grants, and humanitarian initiatives in Jammu & Kashmir.'
  );
  const { addPartnershipRequest } = useDatabase();
  const { t } = useLanguage();
  const toast = useToast();

  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<any>('corporate');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !email) return;

    addPartnershipRequest({
      organizationName: orgName,
      organizationType: orgType,
      contactPerson: contactPerson || 'Institutional Representative',
      email,
      phone,
      website,
      country,
      interestAreas: ['Clean Water', 'Education', 'Disaster Relief'],
      message,
    });

    toast.success('Partnership inquiry received. Our Programs team will reach out within 2 business days.', 'Proposal Submitted');
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          {t('partners.badge', 'Al Shujaiat Foundation · Jammu & Kashmir')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          {t('partners.title', 'Institutional & Corporate Partnerships')}
        </h1>
        <p className="text-content-secondary text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          {t('partners.subtitle', 'Collaborate with our foundation through Corporate Social Responsibility (CSR), institutional grants, technology partnerships, and sustainable developmental funding.')}
        </p>
      </div>

      {submitted ? (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-content-border shadow-brand-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-extrabold text-content-primary">{t('partners.success_title', 'Partnership Proposal Received')}</h3>
          <p className="text-xs sm:text-sm text-content-secondary max-w-md mx-auto leading-relaxed">
            Thank you, <span className="font-bold text-brand-purple">{contactPerson || orgName}</span>. Our International Programs Director, James Anderson, will review your inquiry and initiate a dialogue within 2 business days.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="btn-primary !py-2.5 !px-6 text-xs font-bold mt-4"
          >
            {t('partners.another_proposal', 'Submit Another Proposal')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">{t('partners.org_name', 'Organization / Foundation Name')} *</label>
              <input
                type="text"
                required
                placeholder="e.g. Global Water Alliance"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">{t('partners.org_type', 'Organization Type')}</label>
              <select
                value={orgType}
                onChange={(e: any) => setOrgType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none bg-white"
              >
                <option value="corporate">{t('partners.type_corporate', 'Corporate / CSR Entity')}</option>
                <option value="ngo">{t('partners.type_ngo', 'International Non-Profit / Foundation')}</option>
                <option value="government">{t('partners.type_gov', 'Government / Multilateral Agency')}</option>
                <option value="academic">{t('partners.type_academic', 'University / Academic Institution')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">{t('partners.contact_person', 'Contact Person Name')}</label>
              <input
                type="text"
                placeholder="e.g. Sophia Williams"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">{t('partners.official_email', 'Official Email')} *</label>
              <input
                type="email"
                required
                placeholder="e.g. partnerships@example.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">{t('partners.country', 'Country')}</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-primary mb-1">{t('partners.scope', 'Partnership Objectives & Scope')}</label>
            <textarea
              rows={4}
              required
              placeholder="Outline your organization's focus areas, grant scope, or co-funding proposal..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            <span>{t('partners.submit_proposal', 'Submit Institutional Proposal')}</span>
          </button>
        </form>
      )}
    </div>
  );
};
