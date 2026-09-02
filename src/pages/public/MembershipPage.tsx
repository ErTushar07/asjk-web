import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { MembershipTier, NgoMembership } from '../../types';
import { MembershipCardPreview } from '../../components/membership/MembershipCardPreview';
import { 
  Crown, CheckCircle2, ShieldCheck, Download, Award, 
  Sparkles, Heart, CreditCard, ArrowRight, Check, Search, 
  Globe, Clock, Users, Building, Shield, IdCard, UploadCloud
} from 'lucide-react';

interface TierOption {
  id: MembershipTier;
  name: string;
  badge: string;
  baseAnnualUSD: number;
  description: string;
  benefits: string[];
  gradient: string;
  borderColor: string;
  popular?: boolean;
}

import { optimizePhotoForCard } from '../../utils/imageOptimizer';
import { usePageMeta } from '../../hooks/usePageMeta';

export const MembershipPage: React.FC = () => {
  usePageMeta(
    'NGO Membership & Patron Program',
    'Become an official member or patron of Al Shujaiat Foundation Jammu & Kashmir. Receive official membership credential and attend annual meetings.'
  );
  const { addMembership, lookupMembership, settings } = useDatabase();
  const { currentCurrency, convertUSDToCurrency, formatOriginal } = useCurrency();
  const { t } = useLanguage();
  const toast = useToast();

  const formatAmount = (val: number) => formatOriginal(val, currentCurrency.code);
  const convertFromUSD = (valUSD: number) => convertUSDToCurrency(valUSD);

  const [selectedTier, setSelectedTier] = useState<MembershipTier>('patron_gold');
  const [durationYears, setDurationYears] = useState<number>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'paypal' | 'bank_wire'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedMember, setConfirmedMember] = useState<NgoMembership | null>(null);

  // Status & Membership Card Retrieval
  const [activeTab, setActiveTab] = useState<'join' | 'lookup'>('join');
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<NgoMembership | null | 'not_found'>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimized = await optimizePhotoForCard(file);
        setPhotoUrl(optimized);
      } catch (err) {
        console.warn('Image optimization fallback:', err);
        const reader = new FileReader();
        reader.onload = () => setPhotoUrl(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const tiers: TierOption[] = [
    {
      id: 'general_member',
      name: t('membership.tier_general', 'General Member (Entry Tier)'),
      badge: 'COMMUNITY ENTRY · ₹500',
      baseAnnualUSD: 6,
      description: t('membership.desc_general', 'Accessible community membership supporting local relief distribution and youth welfare.'),
      benefits: [
        t('membership.ben_card', 'Official Digital & Printable NGO Membership Card'),
        t('membership.ben_newsletter', 'Foundation Newsletter & Relief Reports'),
        t('membership.ben_tax', 'Section 80G & 12A Tax Exemption Certificate'),
        t('membership.ben_volunteer', 'Invitation to community volunteer mobilization'),
      ],
      gradient: 'from-emerald-950 via-slate-900 to-teal-950',
      borderColor: 'border-emerald-400',
    },
    {
      id: 'associate_silver',
      name: t('membership.tier_silver', 'Associate Member (Silver Tier)'),
      badge: 'SILVER TIER',
      baseAnnualUSD: 50,
      description: t('membership.desc_silver', 'Foundational membership supporting grassroots healthcare & school aid in Kashmir.'),
      benefits: [
        t('membership.ben_audit', 'Annual Audited Financial Transparency Report'),
        t('membership.ben_card', 'Official Digital & Printable NGO Membership Card'),
        t('membership.ben_voting', 'Voting rights in public community aid surveys'),
        t('membership.ben_tax', 'Tax Exemption Certificate under Section 80G & 12A'),
      ],
      gradient: 'from-slate-700 via-slate-800 to-slate-900',
      borderColor: 'border-slate-300',
    },
    {
      id: 'patron_gold',
      name: t('membership.tier_gold', 'Sustaining Patron (Gold Tier)'),
      badge: 'MOST POPULAR · GOLD TIER',
      baseAnnualUSD: 150,
      description: t('membership.desc_gold', 'Active patron empowering continuous clean water and winter relief logistics.'),
      benefits: [
        t('membership.desc_silver', 'Associate Silver Member privileges'),
        t('membership.ben_milestones', 'Priority quarterly project milestones & field dispatches'),
        t('membership.ben_roll', 'Recognition on Foundation Annual Donor Roll'),
        t('membership.ben_webinars', 'Exclusive invitations to executive foundation webinars'),
        t('membership.ben_gold_badge', 'Gold Metallic NGO Membership Badge (CR80)'),
      ],
      gradient: 'from-amber-950 via-slate-900 to-amber-950',
      borderColor: 'border-amber-400',
      popular: true,
    },
    {
      id: 'founding_platinum',
      name: t('membership.tier_platinum', 'Founding Council (Platinum Tier)'),
      badge: 'PLATINUM TIER',
      baseAnnualUSD: 500,
      description: t('membership.desc_platinum', 'Strategic patron guiding emergency response, dialysis centers, and smart education.'),
      benefits: [
        t('membership.desc_gold', 'Sustaining Patron privileges'),
        t('membership.ben_advisory', 'Participation in Advisory Council strategic reviews'),
        t('membership.ben_plaque', 'Permanent plaque acknowledgment at community centers'),
        t('membership.ben_consultation', 'Direct consultation on new project site selections'),
        t('membership.ben_platinum_badge', 'Platinum Prestige Membership Card & Certificate'),
      ],
      gradient: 'from-purple-950 via-slate-900 to-indigo-950',
      borderColor: 'border-purple-400',
    },
    {
      id: 'benefactor_diamond',
      name: t('membership.tier_diamond', 'Benefactor Governor (Diamond Tier)'),
      badge: 'DIAMOND CREST TIER',
      baseAnnualUSD: 1500,
      description: t('membership.desc_diamond', 'Transformational philanthropist steering landmark infrastructure & multi-district relief.'),
      benefits: [
        t('membership.desc_platinum', 'Founding Council privileges'),
        t('membership.ben_briefings', 'One-on-one executive briefings with Director General'),
        t('membership.ben_sponsorship', 'Named sponsorship of emergency field convoys & medical camps'),
        t('membership.ben_vip', 'VIP delegation access during official field visits to J&K'),
        t('membership.ben_diamond_badge', 'Diamond Governor Metal Emblem ID Badge'),
      ],
      gradient: 'from-cyan-950 via-slate-900 to-slate-950',
      borderColor: 'border-cyan-400',
    },
  ];

  const currentTierObj = tiers.find((t) => t.id === selectedTier) || tiers[0];
  const annualAmountLocal = currentCurrency.code === 'INR' && currentTierObj.id === 'general_member'
    ? 500
    : convertFromUSD(currentTierObj.baseAnnualUSD);
  const totalAmountUSD = currentTierObj.baseAnnualUSD * durationYears;
  const totalAmountLocal = annualAmountLocal * durationYears;

  const handleEnrollMembership = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setIsProcessing(true);

    setTimeout(() => {
      try {
        const now = new Date();
        const validThru = new Date();
        validThru.setFullYear(now.getFullYear() + durationYears);

        const newMbr = addMembership({
          fullName,
          email,
          phone,
          city,
          country,
          photoUrl: photoUrl || undefined,
          bloodGroup,
          tier: selectedTier,
          tierName: currentTierObj.name,
          durationYears,
          annualAmountUSD: currentTierObj.baseAnnualUSD,
          totalAmountUSD,
          currency: currentCurrency.code,
          paidAmount: totalAmountLocal,
          validFrom: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          validThru: validThru.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          paymentMethod: paymentMethod === 'card' ? 'Credit/Debit Card (Stripe)' : paymentMethod === 'upi' ? 'UPI / NetBanking' : paymentMethod === 'paypal' ? 'PayPal' : 'Bank Wire Transfer',
          transactionId: `TXN-MBR-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
          receiptNumber: `ASJ-REC-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'active',
        });

        setConfirmedMember(newMbr);
        toast.success(`Welcome, ${fullName}! Your ${currentTierObj.name} NGO Membership card is ready.`, 'Membership Enrolled');
        window.scrollTo({ top: 120, behavior: 'smooth' });
      } catch (err) {
        console.error('Membership activation error:', err);
        toast.error('Could not complete membership enrollment. Please try again.', 'Enrollment Error');
      } finally {
        setIsProcessing(false);
      }
    }, 400);
  };

  const handleLookupMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    const found = lookupMembership(lookupQuery);
    setLookupResult(found || 'not_found');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <span className="text-xs font-black text-brand-pink tracking-widest uppercase block">
          {t('membership.badge', 'Al Shujaiat Foundation · Jammu & Kashmir')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-content-primary tracking-tight">
          {t('membership.title', 'Official NGO Membership Program')}
        </h1>
        <p className="text-content-secondary text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
          {t('membership.subtitle', 'Become an accredited patron of Al Shujaiat Foundation. Choose your membership tier and duration from 1 to 10 Years, receive statutory voting rights, 80G tax exemptions, and an official printable Membership Credential.')}
        </p>

        {/* Tab Toggle */}
        <div className="flex justify-center pt-3">
          <div className="inline-flex bg-surface-soft p-1 rounded-2xl border border-content-border shadow-inner">
            <button
              onClick={() => setActiveTab('join')}
              className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'join' ? 'bg-brand-purple text-white shadow-md' : 'text-content-secondary hover:text-content-primary'}`}
            >
              {t('membership.tab_join', 'Enroll as New NGO Member')}
            </button>
            <button
              onClick={() => setActiveTab('lookup')}
              className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'lookup' ? 'bg-brand-purple text-white shadow-md' : 'text-content-secondary hover:text-content-primary'}`}
            >
              <Search className="w-3.5 h-3.5" /> {t('membership.tab_lookup', 'Access Existing Membership Card')}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'lookup' ? (
        /* MEMBERSHIP LOOKUP SECTION */
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-content-border shadow-brand-md max-w-2xl mx-auto space-y-6 animate-fadeIn">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <Crown className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-content-primary">
              {t('membership.lookup_title', 'Lookup NGO Membership Credential')}
            </h3>
            <p className="text-xs text-content-secondary">
              {t('membership.lookup_subtitle', 'Enter your registered email address or Membership ID to access and download your official Membership Card.')}
            </p>
          </div>

          <form onSubmit={handleLookupMember} className="flex gap-2">
            <input
              type="text"
              required
              placeholder={t('membership.lookup_placeholder', 'Email address or Membership ID...')}
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
            />
            <button type="submit" className="btn-primary !py-2.5 !px-5 text-xs font-bold">
              {t('membership.lookup_btn', 'Search')}
            </button>
          </form>

          {lookupResult === 'not_found' && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-center text-xs space-y-1">
              <p className="font-bold">{t('membership.no_record', 'No active membership found for this query')}: "{lookupQuery}"</p>
              <p className="text-[11px] text-rose-600">Please verify your details or enroll for a new membership below.</p>
            </div>
          )}

          {lookupResult && lookupResult !== 'not_found' && (
            <div className="space-y-6 pt-4 border-t border-content-border">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase">
                      {t('membership.active_confirmed', 'ACTIVE NGO MEMBERSHIP CONFIRMED')}
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      ID: <span className="font-mono font-bold">{lookupResult.membershipNumber}</span> · Tier: {lookupResult.tierName} · Valid Thru: {lookupResult.validThru}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2.5 py-1 rounded-full uppercase">
                  ACTIVE
                </span>
              </div>

              <MembershipCardPreview member={lookupResult} settings={settings} />
            </div>
          )}
        </div>
      ) : confirmedMember ? (
        /* MEMBERSHIP CONFIRMED & ID CARD GENERATED SCREEN */
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-content-border shadow-brand-lg space-y-8 animate-fadeIn max-w-3xl mx-auto">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Crown className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              PAYMENT VERIFIED · {confirmedMember.durationYears} {confirmedMember.durationYears === 1 ? t('membership.year', 'Year') : t('membership.years', 'Years')} ACCREDITED
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-content-primary">
              Welcome to the Al Shujaiat Foundation Charter!
            </h3>
            <p className="text-xs sm:text-sm text-content-secondary max-w-lg mx-auto leading-relaxed">
              Congratulations <span className="font-bold text-brand-purple">{confirmedMember.fullName}</span>. You are now an officially accredited <span className="font-bold text-brand-pink">{confirmedMember.tierName}</span> of Al Shujaiat Foundation Jammu & Kashmir.
            </p>
          </div>

          {/* Membership Card Preview Component */}
          <div className="bg-surface-soft p-6 sm:p-8 rounded-3xl border border-content-border space-y-6">
            <div className="flex items-center justify-between border-b border-content-border pb-3">
              <div className="flex items-center gap-2 text-brand-purple font-bold text-xs uppercase tracking-wider">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>Official Digital Membership ID Credential</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                VALID: {confirmedMember.validFrom} TO {confirmedMember.validThru}
              </span>
            </div>

            <MembershipCardPreview member={confirmedMember} settings={settings} />
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setConfirmedMember(null);
                setFullName('');
                setEmail('');
              }}
              className="btn-outline !py-2.5 !px-6 text-xs font-bold"
            >
              Enroll Another Member
            </button>
          </div>
        </div>
      ) : (
        /* STEP 1: TIER SELECTION & DURATION BUILDER */
        <div className="space-y-10">
          {/* Tiers Grid */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-black text-content-primary">
                {t('membership.step1_title', '1. Select Your Membership Level')}
              </h2>
              <p className="text-xs text-content-secondary">
                {t('membership.step1_subtitle', 'All memberships directly sustain on-ground healthcare, emergency food packs, and clean water engineering.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.map((tItem) => {
                const isSelected = selectedTier === tItem.id;
                const convertedAnnual = convertFromUSD(tItem.baseAnnualUSD);

                return (
                  <div
                    key={tItem.id}
                    onClick={() => setSelectedTier(tItem.id)}
                    className={`rounded-3xl border-2 p-5 cursor-pointer transition-all duration-300 relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-pink bg-gradient-to-b from-white via-purple-50/30 to-pink-50/20 shadow-brand-lg scale-[1.02]'
                        : 'border-content-border bg-white hover:border-brand-purple/40 hover:shadow-brand-sm'
                    }`}
                  >
                    {tItem.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-brand-pink text-white font-black text-[9px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                        {t('membership.popular', 'POPULAR CHOICE')}
                      </span>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-content-muted">
                          {tItem.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-pink" />}
                      </div>

                      <div>
                        <h3 className="text-base font-black text-content-primary leading-snug">
                          {tItem.name}
                        </h3>
                        <p className="text-[11px] text-content-secondary mt-1 leading-relaxed">
                          {tItem.description}
                        </p>
                      </div>

                      <div className="py-2 border-y border-content-border/60">
                        <div className="text-2xl font-black text-brand-purple font-mono">
                          {formatAmount(convertedAnnual)}
                          <span className="text-xs text-content-muted font-normal"> {t('membership.per_year', '/ year')}</span>
                        </div>
                        <p className="text-[9.5px] text-emerald-700 font-semibold mt-0.5">
                          {t('membership.tax_deductible', '100% Tax Deductible (80G & 12A)')}
                        </p>
                      </div>

                      <ul className="space-y-1.5 text-[11px] text-content-secondary">
                        {tItem.benefits.map((b, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-tight">
                            <Check className="w-3.5 h-3.5 text-brand-pink flex-shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`w-full mt-5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-brand-pink text-white shadow-pink-glow'
                          : 'bg-surface-soft text-content-primary hover:bg-brand-purple/10'
                      }`}
                    >
                      {isSelected ? t('membership.selected_tier', 'Selected Tier') : t('membership.choose_level', 'Choose Level')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: DURATION SELECTOR (1 YEAR TO 10 YEARS) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-content-border shadow-brand-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-content-border pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-content-primary flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-pink" /> {t('membership.step2_title', '2. Choose Membership Duration (1 to 10 Years)')}
                </h2>
                <p className="text-xs text-content-secondary mt-0.5">
                  {t('membership.step2_subtitle', 'Select how many consecutive years you wish to enroll. Multi-year memberships receive long-term ID credential validation.')}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-content-muted uppercase">{t('membership.duration_label', 'Duration:')}</span>{' '}
                <span className="text-base font-black text-brand-purple font-mono">
                  {durationYears} {durationYears === 1 ? t('membership.year', 'Year') : t('membership.years', 'Years')}
                </span>
              </div>
            </div>

            {/* Quick Select Buttons: 1 to 10 Years */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setDurationYears(yr)}
                  className={`py-3 rounded-2xl text-xs font-black transition-all border ${
                    durationYears === yr
                      ? 'bg-brand-purple text-white border-brand-purple shadow-md scale-105'
                      : 'bg-surface-soft border-content-border text-content-secondary hover:border-brand-purple/40 hover:text-content-primary'
                  }`}
                >
                  <div className="text-sm">{yr}</div>
                  <div className="text-[9px] font-normal uppercase">{yr === 1 ? t('membership.year', 'Yr') : t('membership.years', 'Yrs')}</div>
                </button>
              ))}
            </div>

            {/* Contribution Calculation Summary Card */}
            <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white p-5 rounded-2xl border border-amber-400/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[9.5px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                  {t('membership.summary_title', 'MEMBERSHIP CONTRIBUTION SUMMARY')}
                </span>
                <h4 className="text-base font-extrabold text-white">
                  {currentTierObj.name} · <span className="text-amber-300">{durationYears} {durationYears === 1 ? t('membership.year', 'Year') : t('membership.years', 'Years')}</span>
                </h4>
                <p className="text-xs text-white/70">
                  {formatAmount(annualAmountLocal)} × {durationYears} {durationYears === 1 ? t('membership.year', 'Year') : t('membership.years', 'Years')}
                </p>
              </div>

              <div className="text-center sm:text-right bg-white/10 px-5 py-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-amber-200 block uppercase font-bold">{t('membership.total_contribution', 'Total Contribution')}</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                  {formatAmount(totalAmountLocal)}
                </span>
              </div>
            </div>
          </div>

          {/* STEP 3: MEMBER DETAILS & CHECKOUT FORM */}
          <form onSubmit={handleEnrollMembership} className="bg-white p-6 sm:p-10 rounded-3xl border border-content-border shadow-brand-md space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-content-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-pink" /> {t('membership.step3_title', '3. Member Information & Credential Details')}
              </h2>
              <p className="text-xs text-content-secondary mt-0.5">
                {t('membership.step3_subtitle', 'These details will be encoded onto your official Al Shujaiat Foundation Membership ID Badge and 80G Tax Receipt.')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">
                  {t('membership.full_name', 'Full Name (As on ID Card) *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zubair Ahmad Lone"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">
                  {t('membership.email', 'Email Address (For Tax Receipt & Digital Card) *')}
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. member@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">
                  {t('membership.phone', 'Phone Number')}
                </label>
                <input
                  type="tel"
                  placeholder="+91 94190 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">
                  {t('membership.city', 'City / Region')}
                </label>
                <input
                  type="text"
                  placeholder="Srinagar / New Delhi / London"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">
                  {t('membership.country', 'Country')}
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">
                  {t('membership.blood_group', 'Blood Group (ID Badge)')}
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none bg-white font-mono"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>
            </div>

            {/* Member Photo Upload for ID Card */}
            <div className="bg-surface-soft p-4 sm:p-5 rounded-2xl border border-content-border space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-brand-purple uppercase tracking-wider flex items-center gap-1.5">
                  <IdCard className="w-4 h-4 text-brand-pink" /> {t('membership.photo_title', 'Passport Size Photograph (for Official Membership Card Badge)')}
                </h4>
                <span className="text-[10px] text-content-muted">JPG, PNG up to 5MB</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-content-border">
                <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-amber-300 shadow-md flex-shrink-0 flex items-center justify-center">
                  <div className="w-full h-full rounded-full overflow-hidden border border-white bg-slate-100 flex items-center justify-center">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Photo Preview" className="w-full h-full object-cover object-top" />
                    ) : (
                      <span className="text-[9px] font-bold text-slate-400 text-center px-1">No Photo</span>
                    )}
                  </div>
                </div>

                <div className="flex-1 w-full text-center sm:text-left space-y-1">
                  <p className="text-xs font-bold text-content-primary">
                    {photoUrl ? 'Photograph Uploaded' : 'Upload your formal portrait photo'}
                  </p>
                  <p className="text-[11px] text-content-secondary">
                    This photo will be framed on your high-resolution Al Shujaiat Foundation Membership ID Card.
                  </p>
                  <div className="pt-1 flex items-center gap-2 justify-center sm:justify-start">
                    <label className="btn-outline !py-1.5 !px-3 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5 text-brand-purple" />
                      <span>{photoUrl ? t('membership.change_photo', 'Change Photo') : t('membership.upload_btn', 'Upload Picture')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        {t('membership.remove_photo', 'Remove')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-content-primary">
                {t('membership.payment_method', 'Select Payment Method')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'card', label: t('membership.card', 'Credit / Debit Card'), icon: CreditCard },
                  { id: 'upi', label: t('membership.upi', 'UPI / NetBanking'), icon: Sparkles },
                  { id: 'paypal', label: t('membership.paypal', 'PayPal Global'), icon: Globe },
                  { id: 'bank_wire', label: t('membership.bank_wire', 'Direct Bank Wire'), icon: Building },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === m.id
                        ? 'border-brand-pink bg-pink-50/50 text-brand-purple shadow-sm'
                        : 'border-content-border text-content-secondary hover:border-brand-purple/40'
                    }`}
                  >
                    <m.icon className="w-5 h-5 text-brand-pink" />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit & Generate Membership ID Card */}
            <div className="pt-4 border-t border-content-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-content-secondary">
                {t('membership.security_note', 'Security Note: Encrypted 256-bit payment gateway. Instant 80G tax receipt generated.')}
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full sm:w-auto btn-primary !py-3.5 !px-8 text-sm font-black shadow-pink-glow flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>{t('membership.processing', 'Activating Membership & Generating Card...')}</span>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    <span>{t('membership.pay_btn', 'Pay & Activate Membership')}: {formatAmount(totalAmountLocal)}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
