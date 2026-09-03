import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { 
  Shield, CheckCircle2, Building2, Globe, MapPin, 
  Landmark, HeartHandshake, Award, ExternalLink, Filter, Droplets, BookOpen, AlertCircle
} from 'lucide-react';

interface PartnerEntity {
  id: string;
  nameKey: string;
  badgeKey: string;
  descKey: string;
  focusKey: string;
  locationKey?: string;
  type: 'indian' | 'international';
  icon: any;
  color: string;
  bgLight: string;
}

interface GovEntity {
  id: string;
  nameKey: string;
  badgeKey: string;
  descKey: string;
  focusKey: string;
  icon: any;
  color: string;
  bgLight: string;
}

export const PartnersPage: React.FC = () => {
  usePageMeta(
    'Government & Institutional Partnerships',
    'Explore Al Shujaiat Foundation’s accredited partnerships with government bodies, Indian national institutions, and global humanitarian organizations in Jammu & Kashmir.'
  );
  const { addPartnershipRequest } = useDatabase();
  const { t } = useLanguage();
  const toast = useToast();

  const [partnerFilter, setPartnerFilter] = useState<'all' | 'indian' | 'international'>('all');

  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<any>('corporate');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [country, setCountry] = useState('India');
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

  // Government & Statutory Bodies
  const govEntities: GovEntity[] = [
    {
      id: 'darpan',
      nameKey: 'partners.gov.darpan.title',
      badgeKey: 'partners.gov.darpan.badge',
      descKey: 'partners.gov.darpan.desc',
      focusKey: 'partners.gov.darpan.focus',
      icon: Landmark,
      color: 'text-brand-purple',
      bgLight: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800'
    },
    {
      id: 'social_welfare',
      nameKey: 'partners.gov.social_welfare.title',
      badgeKey: 'partners.gov.social_welfare.badge',
      descKey: 'partners.gov.social_welfare.desc',
      focusKey: 'partners.gov.social_welfare.focus',
      icon: HeartHandshake,
      color: 'text-brand-pink',
      bgLight: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800'
    },
    {
      id: 'water',
      nameKey: 'partners.gov.water.title',
      badgeKey: 'partners.gov.water.badge',
      descKey: 'partners.gov.water.desc',
      focusKey: 'partners.gov.water.focus',
      icon: Droplets,
      color: 'text-brand-blue',
      bgLight: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
    },
    {
      id: 'education',
      nameKey: 'partners.gov.education.title',
      badgeKey: 'partners.gov.education.badge',
      descKey: 'partners.gov.education.desc',
      focusKey: 'partners.gov.education.focus',
      icon: BookOpen,
      color: 'text-amber-600',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
    },
    {
      id: 'disaster',
      nameKey: 'partners.gov.disaster.title',
      badgeKey: 'partners.gov.disaster.badge',
      descKey: 'partners.gov.disaster.desc',
      focusKey: 'partners.gov.disaster.focus',
      icon: AlertCircle,
      color: 'text-rose-600',
      bgLight: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
    },
    {
      id: 'district',
      nameKey: 'partners.gov.district.title',
      badgeKey: 'partners.gov.district.badge',
      descKey: 'partners.gov.district.desc',
      focusKey: 'partners.gov.district.focus',
      icon: Shield,
      color: 'text-emerald-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
    }
  ];

  // Existing Accredited Partners (Indian & International)
  const accreditedPartners: PartnerEntity[] = [
    // Indian National Partners
    {
      id: 'tata',
      nameKey: 'partners.in.tata.title',
      badgeKey: 'partners.in.tata.badge',
      descKey: 'partners.in.tata.desc',
      focusKey: 'Clean Water & Solar Infrastructure',
      locationKey: 'partners.in.tata.location',
      type: 'indian',
      icon: Building2,
      color: 'text-brand-blue',
      bgLight: 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-800/60'
    },
    {
      id: 'healthcare',
      nameKey: 'partners.in.healthcare.title',
      badgeKey: 'partners.in.healthcare.badge',
      descKey: 'partners.in.healthcare.desc',
      focusKey: 'Mobile Medical Dispensaries & Ultrasound Diagnostics',
      locationKey: 'partners.in.healthcare.location',
      type: 'indian',
      icon: HeartHandshake,
      color: 'text-emerald-600',
      bgLight: 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60'
    },
    {
      id: 'premji',
      nameKey: 'partners.in.premji.title',
      badgeKey: 'partners.in.premji.badge',
      descKey: 'partners.in.premji.desc',
      focusKey: 'Rural Smart Classrooms & Winter Uniforms',
      locationKey: 'partners.in.premji.location',
      type: 'indian',
      icon: Award,
      color: 'text-brand-purple',
      bgLight: 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-200/80 dark:border-purple-800/60'
    },
    {
      id: 'goonj',
      nameKey: 'partners.in.goonj.title',
      badgeKey: 'partners.in.goonj.badge',
      descKey: 'partners.in.goonj.desc',
      focusKey: 'Disaster Woollen Blankets & Family Relief Kits',
      locationKey: 'partners.in.goonj.location',
      type: 'indian',
      icon: Landmark,
      color: 'text-amber-600',
      bgLight: 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/60'
    },

    // International Global Partners
    {
      id: 'grt',
      nameKey: 'partners.intl.grt.title',
      badgeKey: 'partners.intl.grt.badge',
      descKey: 'partners.intl.grt.desc',
      focusKey: 'Emergency Rapid Grants & Flood Logistics',
      locationKey: 'partners.intl.grt.location',
      type: 'international',
      icon: Globe,
      color: 'text-brand-pink',
      bgLight: 'bg-pink-50/60 dark:bg-pink-950/30 border-pink-200/80 dark:border-pink-800/60'
    },
    {
      id: 'water_foundation',
      nameKey: 'partners.intl.water_foundation.title',
      badgeKey: 'partners.intl.water_foundation.badge',
      descKey: 'partners.intl.water_foundation.desc',
      focusKey: 'High-Altitude Reverse Osmosis & IoT Water Quality Sensors',
      locationKey: 'partners.intl.water_foundation.location',
      type: 'international',
      icon: Droplets,
      color: 'text-brand-blue',
      bgLight: 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-800/60'
    },
    {
      id: 'emirates',
      nameKey: 'partners.intl.emirates.title',
      badgeKey: 'partners.intl.emirates.badge',
      descKey: 'partners.intl.emirates.desc',
      focusKey: 'Orphan Sponsorships & Single-Parent Livelihoods',
      locationKey: 'partners.intl.emirates.location',
      type: 'international',
      icon: HeartHandshake,
      color: 'text-emerald-600',
      bgLight: 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60'
    },
    {
      id: 'direct_relief',
      nameKey: 'partners.intl.direct_relief.title',
      badgeKey: 'partners.intl.direct_relief.badge',
      descKey: 'partners.intl.direct_relief.desc',
      focusKey: 'Emergency Pediatric Pharmaceuticals & Sterile Maternal Kits',
      locationKey: 'partners.intl.direct_relief.location',
      type: 'international',
      icon: Shield,
      color: 'text-brand-purple',
      bgLight: 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-200/80 dark:border-purple-800/60'
    }
  ];

  const filteredPartners = accreditedPartners.filter(p => {
    if (partnerFilter === 'all') return true;
    return p.type === partnerFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          {t('partners.badge', 'Al Shujaiat Foundation · Jammu & Kashmir')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-content-primary tracking-tight">
          {t('partners.title', 'Institutional & Corporate Partnerships')}
        </h1>
        <p className="text-content-secondary text-sm sm:text-base leading-relaxed">
          {t('partners.subtitle', 'Collaborate with our foundation through Corporate Social Responsibility (CSR), institutional grants, technology partnerships, and sustainable developmental funding.')}
        </p>

        {/* Quick Highlights Counters */}
        <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto pt-4 text-center">
          <div className="bg-surface-soft dark:bg-slate-900 border border-content-border dark:border-slate-800 rounded-2xl p-3">
            <span className="text-lg sm:text-2xl font-black text-brand-purple block">18+</span>
            <span className="text-[10px] sm:text-xs font-semibold text-content-muted">{t('partners.stat_projects', 'Coordinated Programs')}</span>
          </div>
          <div className="bg-surface-soft dark:bg-slate-900 border border-content-border dark:border-slate-800 rounded-2xl p-3">
            <span className="text-lg sm:text-2xl font-black text-brand-pink block">100%</span>
            <span className="text-[10px] sm:text-xs font-semibold text-content-muted">{t('partners.stat_compliance', 'Audit & Compliance')}</span>
          </div>
          <div className="bg-surface-soft dark:bg-slate-900 border border-content-border dark:border-slate-800 rounded-2xl p-3">
            <span className="text-lg sm:text-2xl font-black text-emerald-600 block">10</span>
            <span className="text-[10px] sm:text-xs font-semibold text-content-muted">{t('partners.stat_districts', 'Covered Districts')}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: GOVERNMENT & STATUTORY BODIES */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-content-border dark:border-slate-800 pb-4">
          <div className="space-y-1.5 text-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-brand-purple dark:text-purple-300 text-xs font-bold">
              <Landmark className="w-3.5 h-3.5" />
              <span>{t('partners.nav_gov', 'Government & Statutory Bodies')}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-content-primary">
              {t('partners.nav_gov', 'Government & Statutory Bodies')}
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary max-w-3xl leading-relaxed">
              {t('partners.gov_desc', 'Al Shujaiat Foundation works in close institutional coordination with central and state government directorates, statutory authorities, and district administrations across Jammu & Kashmir.')}
            </p>
          </div>

          <a
            href="/transparency"
            className="btn-outline !py-2 !px-4 text-xs font-bold inline-flex items-center gap-1.5 self-start md:self-auto flex-shrink-0"
          >
            <Shield className="w-3.5 h-3.5 text-brand-pink" />
            <span>{t('partners.view_statutory_btn', 'Verify Statutory Credentials & Filings')}</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {govEntities.map((gov) => {
            const Icon = gov.icon;
            return (
              <div
                key={gov.id}
                className="bg-white dark:bg-slate-900 border border-content-border dark:border-slate-800 rounded-3xl p-6 shadow-brand-sm hover:shadow-brand-md transition-all duration-300 flex flex-col justify-between space-y-4 group hover:-translate-y-1"
              >
                <div className="space-y-3 text-start">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${gov.bgLight}`}>
                      <Icon className={`w-6 h-6 ${gov.color}`} />
                    </div>
                    <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full border bg-surface-soft dark:bg-slate-800 text-content-secondary dark:text-slate-300">
                      {t(gov.badgeKey, gov.badgeKey)}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-content-primary group-hover:text-brand-purple dark:group-hover:text-purple-300 transition-colors">
                    {t(gov.nameKey, gov.nameKey)}
                  </h3>

                  <p className="text-xs text-content-secondary leading-relaxed line-clamp-3">
                    {t(gov.descKey, gov.descKey)}
                  </p>
                </div>

                <div className="pt-3 border-t border-content-border/60 dark:border-slate-800 text-start">
                  <span className="text-[10px] font-mono font-bold text-brand-purple dark:text-purple-400 block truncate">
                    ✓ {t(gov.focusKey, gov.focusKey)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: ACCREDITED PARTNERS (INDIAN & INTERNATIONAL) */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-content-border dark:border-slate-800 pb-4">
          <div className="space-y-1.5 text-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/80 text-brand-pink dark:text-pink-300 text-xs font-bold">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>{t('partners.nav_existing', 'Our Accredited Partners')}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-content-primary">
              {t('partners.nav_existing', 'Our Accredited Partners')}
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary max-w-3xl leading-relaxed">
              {t('partners.existing_desc', 'Proudly collaborating with leading national CSR trusts, philanthropic endowments, and international humanitarian relief networks.')}
            </p>
          </div>

          {/* Segmented Filter: All | Indian | International */}
          <div className="inline-flex p-1 rounded-2xl bg-surface-soft dark:bg-slate-900 border border-content-border dark:border-slate-800 self-start md:self-auto flex-shrink-0">
            <button
              type="button"
              onClick={() => setPartnerFilter('all')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                partnerFilter === 'all'
                  ? 'bg-brand-purple text-white shadow-sm'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              {t('All', 'All')}
            </button>
            <button
              type="button"
              onClick={() => setPartnerFilter('indian')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                partnerFilter === 'indian'
                  ? 'bg-brand-purple text-white shadow-sm'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              <span>🇮🇳</span>
              <span>{t('partners.tab_indian', 'Indian Partners')}</span>
            </button>
            <button
              type="button"
              onClick={() => setPartnerFilter('international')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                partnerFilter === 'international'
                  ? 'bg-brand-purple text-white shadow-sm'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>{t('partners.tab_international', 'International Partners')}</span>
            </button>
          </div>
        </div>

        {/* Partners Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredPartners.map((partner) => {
            const Icon = partner.icon;
            return (
              <div
                key={partner.id}
                className="bg-white dark:bg-slate-900 border border-content-border dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-brand-sm hover:shadow-brand-md transition-all duration-300 flex flex-col justify-between space-y-4 group hover:-translate-y-1"
              >
                <div className="space-y-3 text-start">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${partner.bgLight}`}>
                      <Icon className={`w-5 h-5 ${partner.color}`} />
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                      partner.type === 'indian'
                        ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    }`}>
                      {partner.type === 'indian' ? '🇮🇳 ' : '🌐 '}
                      {t(partner.badgeKey, partner.badgeKey)}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-content-primary group-hover:text-brand-purple dark:group-hover:text-purple-300 transition-colors line-clamp-1">
                    {t(partner.nameKey, partner.nameKey)}
                  </h3>

                  {partner.locationKey && (
                    <div className="flex items-center gap-1 text-[11px] text-content-muted">
                      <MapPin className="w-3 h-3 text-brand-pink flex-shrink-0" />
                      <span className="truncate">{t(partner.locationKey, partner.locationKey)}</span>
                    </div>
                  )}

                  <p className="text-xs text-content-secondary leading-relaxed line-clamp-3">
                    {t(partner.descKey, partner.descKey)}
                  </p>
                </div>

                <div className="pt-3 border-t border-content-border/60 dark:border-slate-800 text-start">
                  <span className="text-[10px] font-medium text-brand-purple dark:text-purple-300 block truncate">
                    • {partner.focusKey}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: PROPOSAL SUBMISSION FORM */}
      <section className="space-y-6 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
            {t('partners.join_title', 'Join Our Institutional Network')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-content-primary">
            {t('partners.join_title', 'Join Our Institutional Network')}
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            {t('partners.join_desc', 'Submit a proposal for Corporate Social Responsibility (CSR), institutional grant co-funding, or field development projects.')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {submitted ? (
            <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-content-border dark:border-slate-800 shadow-brand-md text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-content-primary">{t('partners.success_title', 'Partnership Proposal Received')}</h3>
              <p className="text-xs sm:text-sm text-content-secondary max-w-md mx-auto leading-relaxed">
                Thank you, <span className="font-bold text-brand-purple">{contactPerson || orgName}</span>. Our International Programs Director, James Anderson, will review your inquiry and initiate a dialogue within 2 business days.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="btn-primary !py-2.5 !px-6 text-xs font-bold mt-4"
              >
                {t('partners.another_proposal', 'Submit Another Proposal')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-content-border dark:border-slate-800 shadow-brand-sm space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-start">
                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-1">{t('partners.org_name', 'Organization / Foundation Name')} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Global Water Alliance"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border dark:border-slate-800 bg-white dark:bg-slate-950 text-content-primary focus:border-brand-purple outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-1">{t('partners.org_type', 'Organization Type')}</label>
                  <select
                    value={orgType}
                    onChange={(e: any) => setOrgType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border dark:border-slate-800 bg-white dark:bg-slate-950 text-content-primary focus:border-brand-purple outline-none"
                  >
                    <option value="corporate">{t('partners.type_corporate', 'Corporate / CSR Entity')}</option>
                    <option value="ngo">{t('partners.type_ngo', 'International Non-Profit / Foundation')}</option>
                    <option value="government">{t('partners.type_gov', 'Government / Multilateral Agency')}</option>
                    <option value="academic">{t('partners.type_academic', 'University / Academic Institution')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-start">
                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-1">{t('partners.contact_person', 'Contact Person Name')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Sophia Williams"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border dark:border-slate-800 bg-white dark:bg-slate-950 text-content-primary focus:border-brand-purple outline-none"
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
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border dark:border-slate-800 bg-white dark:bg-slate-950 text-content-primary focus:border-brand-purple outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-1">{t('partners.country', 'Country')}</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border dark:border-slate-800 bg-white dark:bg-slate-950 text-content-primary focus:border-brand-purple outline-none"
                  />
                </div>
              </div>

              <div className="text-start">
                <label className="block text-xs font-semibold text-content-primary mb-1">{t('partners.scope', 'Partnership Objectives & Scope')}</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Outline your organization's focus areas, grant scope, or co-funding proposal..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border dark:border-slate-800 bg-white dark:bg-slate-950 text-content-primary focus:border-brand-purple outline-none"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-brand-sm"
              >
                <Building2 className="w-4 h-4" />
                <span>{t('partners.submit_proposal', 'Submit Institutional Proposal')}</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
