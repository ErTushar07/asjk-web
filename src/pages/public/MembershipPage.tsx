import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { MembershipTier, NgoMembership } from '../../types';
import { MembershipCardPreview } from '../../components/membership/MembershipCardPreview';
import { PaymentService } from '../../services/paymentService';
import { ReceiptService } from '../../services/receiptService';
import { PayPalButton } from '../../components/payment/PayPalButton';
import { 
  Crown, CheckCircle2, ShieldCheck, Download, Award, 
  Sparkles, Heart, CreditCard, ArrowRight, Check, Search, 
  Globe, Clock, Users, Building, Shield, IdCard, UploadCloud,
  AlertCircle, Copy, FileText
} from 'lucide-react';

interface TierOption {
  id: MembershipTier;
  name: string;
  badge: string;
  baseAmount: number; // 100, 500, 1000, 5000, 10000
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
  const { currentCurrency } = useCurrency();
  const { t } = useLanguage();
  const toast = useToast();

  // Strict currency display helper: DO NOT convert amounts or apply exchange rates.
  // 100 INR -> 100 USD -> 100 EUR -> 100 GBP -> AED 100.
  const formatMembershipCurrency = (amount: number, currencyCode: string = currentCurrency.code) => {
    const code = (currencyCode || 'INR').toUpperCase();
    const formatted = amount.toLocaleString('en-US');
    if (code === 'AED') return `AED ${formatted}`;
    if (code === 'INR') return `₹${formatted}`;
    if (code === 'USD') return `$${formatted}`;
    if (code === 'EUR') return `€${formatted}`;
    if (code === 'GBP') return `£${formatted}`;
    if (code === 'SAR') return `﷼${formatted}`;
    if (code === 'CAD') return `CA$${formatted}`;
    if (code === 'AUD') return `AU$${formatted}`;
    return `${code} ${formatted}`;
  };

  const [selectedTier, setSelectedTier] = useState<MembershipTier>('supporting_member');
  const [durationYears, setDurationYears] = useState<number>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'paypal' | 'bank_wire'>('upi');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedMember, setConfirmedMember] = useState<NgoMembership | null>(null);
  const [pendingMember, setPendingMember] = useState<NgoMembership | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

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

  // Official 5 Membership Levels with strictly defined base prices
  const tiers: TierOption[] = [
    {
      id: 'general_member',
      name: 'General Member',
      badge: 'COMMUNITY ENTRY',
      baseAmount: 100,
      description: 'Accessible community membership supporting local relief distribution and youth welfare.',
      benefits: [
        'Official Digital & Printable NGO Membership Card',
        'Foundation Newsletter & Relief Reports',
        'Section 80G & 12A Tax Exemption Certificate',
        'Invitation to community volunteer mobilization',
      ],
      gradient: 'from-emerald-950 via-slate-900 to-teal-950',
      borderColor: 'border-emerald-500',
    },
    {
      id: 'associate_member',
      name: 'Associate Member',
      badge: 'ASSOCIATE TIER',
      baseAmount: 500,
      description: 'Foundational membership supporting grassroots healthcare & school aid in Kashmir.',
      benefits: [
        'All General Member privileges included',
        'Annual Audited Financial Transparency Report',
        'Voting rights in public community aid surveys',
        'Tax Exemption Certificate under Section 80G & 12A',
      ],
      gradient: 'from-slate-800 via-slate-900 to-slate-950',
      borderColor: 'border-slate-400',
    },
    {
      id: 'supporting_member',
      name: 'Supporting Member',
      badge: 'MOST POPULAR',
      baseAmount: 1000,
      description: 'Active patron empowering continuous clean water and winter relief logistics.',
      benefits: [
        'All Associate Member privileges included',
        'Priority quarterly project milestones & field dispatches',
        'Recognition on Foundation Annual Donor Roll',
        'Exclusive invitations to executive foundation webinars',
        'Supporting Member Metallic NGO Badge (CR80)',
      ],
      gradient: 'from-blue-950 via-indigo-950 to-slate-950',
      borderColor: 'border-blue-400',
      popular: true,
    },
    {
      id: 'patron_member',
      name: 'Patron Member',
      badge: 'HONORARY PATRON',
      baseAmount: 5000,
      description: 'Strategic patron guiding emergency response, dialysis centers, and smart education.',
      benefits: [
        'All Supporting Member privileges included',
        'Participation in Advisory Council strategic reviews',
        'Permanent plaque acknowledgment at community centers',
        'Direct consultation on new project site selections',
        'Patron Prestige Membership Card & Certificate',
      ],
      gradient: 'from-amber-950 via-slate-900 to-amber-950',
      borderColor: 'border-amber-400',
    },
    {
      id: 'benefactor_member',
      name: 'Benefactor Member',
      badge: 'PREMIER BENEFACTOR',
      baseAmount: 10000,
      description: 'Transformational philanthropist steering landmark infrastructure & multi-district relief.',
      benefits: [
        'All Patron Member privileges included',
        'One-on-one executive briefings with Director General',
        'Named sponsorship of emergency field convoys & medical camps',
        'VIP delegation access during official field visits to J&K',
        'Benefactor Metal Crest ID Emblem Badge',
      ],
      gradient: 'from-purple-950 via-slate-900 to-indigo-950',
      borderColor: 'border-purple-400',
    },
  ];

  const currentTierObj = tiers.find((t) => t.id === selectedTier) || tiers[2];
  // Strict rule: base amount multiplied by duration, absolutely no currency conversion
  const annualAmount = currentTierObj.baseAmount;
  const totalContribution = annualAmount * durationYears;

  const handleEnrollMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !city.trim() || !country.trim() || !bloodGroup.trim()) {
      setErrorMsg('Please provide all mandatory details: Full Name, Email, Phone Number, City, Country, and Blood Group.');
      return;
    }

    if (!photoUrl) {
      setErrorMsg('Please upload your passport-size photograph for the official membership ID badge.');
      return;
    }

    if (totalContribution <= 0) {
      setErrorMsg('Invalid contribution amount.');
      return;
    }

    // Direct bank wire requires a valid reference/UTR
    if (paymentMethod === 'bank_wire') {
      const cleanRef = paymentReference.trim();
      if (!cleanRef || cleanRef.length < 4) {
        setErrorMsg('Please enter a valid bank transfer reference / UTR number.');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const now = new Date();
      const validThru = new Date();
      validThru.setFullYear(now.getFullYear() + durationYears);

      // 1. Direct Bank Wire Transfer (Requires manual UTR - sets pending verification, NO instant card or receipt)
      if (paymentMethod === 'bank_wire') {
        const cleanRef = paymentReference.trim();
        await PaymentService.processPayment({
          amount: totalContribution,
          currency: currentCurrency.code,
          frequency: 'one_time',
          method: 'bank_wire',
          paymentReference: cleanRef,
          donorName: fullName.trim(),
          donorEmail: email.trim(),
          donorPhone: phone.trim() || undefined,
          targetId: `mbr_${selectedTier}`,
          targetName: `NGO Membership - ${currentTierObj.name} (${durationYears} ${durationYears === 1 ? 'Year' : 'Years'})`,
          idempotencyKey: `mbr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        });

        const newMbr = addMembership({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city: city.trim(),
          country: country.trim(),
          photoUrl: photoUrl || undefined,
          bloodGroup,
          tier: selectedTier,
          tierName: currentTierObj.name,
          durationYears,
          annualAmount,
          totalContribution,
          paidAmount: totalContribution,
          currency: currentCurrency.code,
          validFrom: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          validThru: validThru.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          paymentMethod: 'Direct Bank Wire / NEFT (Manual Verification)',
          transactionId: cleanRef,
          status: 'pending_payment',
        });

        setPendingMember(newMbr);
        toast.info(`Membership transfer submitted with UTR ${cleanRef}. Awaiting bank verification.`, 'Pending Reconciliation');
        window.scrollTo({ top: 120, behavior: 'smooth' });
        return;
      }

      // 2. Online Razorpay Checkout (Cards, UPI, NetBanking, International)
      const mappedMethod = (paymentMethod === 'card' || paymentMethod === 'paypal') ? 'stripe_card' : 'razorpay_upi';
      const paymentResult = await PaymentService.processPayment({
        amount: totalContribution,
        currency: currentCurrency.code,
        frequency: 'one_time',
        method: mappedMethod,
        donorName: fullName.trim(),
        donorEmail: email.trim(),
        donorPhone: phone.trim() || undefined,
        targetId: `mbr_${selectedTier}`,
        targetName: `NGO Membership - ${currentTierObj.name} (${durationYears} ${durationYears === 1 ? 'Year' : 'Years'})`,
        idempotencyKey: `mbr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      });

      if (!paymentResult || !paymentResult.success) {
        throw new Error('Payment was not completed.');
      }

      const methodLabel = paymentMethod === 'card'
        ? 'Credit/Debit Card (Razorpay)'
        : paymentMethod === 'paypal'
        ? 'International Card (Razorpay)'
        : 'UPI / NetBanking (Razorpay)';

      const newMbr = addMembership({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        country: country.trim(),
        photoUrl: photoUrl || undefined,
        bloodGroup,
        tier: selectedTier,
        tierName: currentTierObj.name,
        durationYears,
        annualAmount,
        totalContribution,
        paidAmount: totalContribution,
        currency: currentCurrency.code,
        validFrom: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        validThru: validThru.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        paymentMethod: methodLabel,
        transactionId: paymentResult.transactionId,
        orderId: (paymentResult as any).orderId || paymentResult.transactionId,
        paymentId: paymentResult.paymentId || paymentResult.transactionId,
        receiptNumber: paymentResult.receiptNumber,
        status: 'active',
      });

      setConfirmedMember(newMbr);
      toast.success(`Welcome, ${fullName}! Your ${currentTierObj.name} NGO Membership card is ready.`, 'Membership Enrolled');
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Membership payment error:', err);
      const msg = err.message || 'Payment could not be completed. Please try again or select another payment option.';
      setErrorMsg(msg);
      toast.error(msg, 'Payment Incomplete');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalMembershipSuccess = async (paypalOrderId: string) => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !city.trim() || !country.trim() || !bloodGroup.trim()) {
      setErrorMsg('Please provide all mandatory details: Full Name, Email, Phone Number, City, Country, and Blood Group.');
      return;
    }

    if (!photoUrl) {
      setErrorMsg('Passport size photograph is mandatory. Please upload your photo for the ID credential badge.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const now = new Date();
      const validThru = new Date();
      validThru.setFullYear(now.getFullYear() + durationYears);

      const timestamp = Date.now();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const receiptNumber = `ASJ-REC-${now.getFullYear()}-${randomSuffix}`;

      const newMbr = addMembership({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        country: country.trim(),
        photoUrl: photoUrl || undefined,
        bloodGroup,
        tier: selectedTier,
        tierName: currentTierObj.name,
        durationYears,
        annualAmount,
        totalContribution,
        paidAmount: totalContribution,
        currency: currentCurrency.code,
        validFrom: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        validThru: validThru.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        paymentMethod: 'PayPal International',
        transactionId: paypalOrderId,
        orderId: paypalOrderId,
        paymentId: paypalOrderId,
        receiptNumber,
        status: 'active',
      });

      setConfirmedMember(newMbr);
      toast.success(`Welcome, ${fullName}! Your ${currentTierObj.name} NGO Membership credential is ready.`, 'Membership Enrolled');
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'PayPal membership recording failed.');
    } finally {
      setIsProcessing(false);
    }
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
              <div className={`p-4 rounded-2xl flex items-center justify-between ${
                lookupResult.status === 'active'
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                <div className="flex items-center gap-3">
                  {lookupResult.status === 'active' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Clock className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className={`text-xs font-bold uppercase ${
                      lookupResult.status === 'active' ? 'text-emerald-900' : 'text-amber-900'
                    }`}>
                      {lookupResult.status === 'active'
                        ? t('membership.active_confirmed', 'ACTIVE NGO MEMBERSHIP CONFIRMED')
                        : 'MEMBERSHIP PENDING BANK RECONCILIATION'}
                    </h4>
                    <p className={`text-[11px] ${lookupResult.status === 'active' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      ID: <span className="font-mono font-bold">{lookupResult.membershipNumber}</span> · Tier: {lookupResult.tierName} · Valid Thru: {lookupResult.validThru}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                  lookupResult.status === 'active' ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {lookupResult.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {lookupResult.status === 'active' ? (
                <div className="space-y-4">
                  <MembershipCardPreview member={lookupResult} settings={settings} />
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => ReceiptService.downloadMembershipReceipt(lookupResult, settings)}
                      className="btn-primary !py-2.5 !px-5 text-xs font-bold shadow-pink-glow flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Official 80G Tax Receipt (PDF)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center space-y-2">
                  <Clock className="w-8 h-8 text-amber-600 mx-auto" />
                  <h4 className="text-sm font-bold text-amber-900">Membership Pending Verification</h4>
                  <p className="text-xs text-amber-800 max-w-md mx-auto">
                    Your enrollment request and bank wire transfer reference ({lookupResult.transactionId}) are currently under review by our accounts team. Once reconciled, your printable digital membership card and Section 80G tax receipt will be activated here.
                  </p>
                </div>
              )}
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

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => ReceiptService.downloadMembershipReceipt(confirmedMember, settings)}
              className="btn-primary !py-2.5 !px-6 text-xs font-bold shadow-pink-glow flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Download Official 80G Tax Receipt (PDF)
            </button>
            <button
              onClick={() => {
                setConfirmedMember(null);
                setFullName('');
                setEmail('');
                setPhone('');
                setCity('');
              }}
              className="btn-outline !py-2.5 !px-6 text-xs font-bold"
            >
              Enroll Another Member
            </button>
          </div>
        </div>
      ) : pendingMember ? (
        /* MEMBERSHIP RECORDED · PENDING BANK RECONCILIATION */
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-amber-200 shadow-brand-lg space-y-6 animate-fadeIn max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            BANK WIRE SUBMITTED · PENDING RECONCILIATION
          </span>
          <h3 className="text-2xl font-black text-content-primary">
            Membership Application Registered
          </h3>
          <p className="text-xs sm:text-sm text-content-secondary max-w-lg mx-auto leading-relaxed">
            Thank you <span className="font-bold text-brand-purple">{pendingMember.fullName}</span>! Your enrollment request for <span className="font-bold text-brand-pink">{pendingMember.tierName}</span> ({pendingMember.durationYears} {pendingMember.durationYears === 1 ? t('membership.year', 'Year') : t('membership.years', 'Years')}) has been recorded under UTR/Reference <span className="font-mono font-bold text-brand-purple">{pendingMember.transactionId}</span>.
          </p>

          <div className="p-4 rounded-2xl bg-surface-soft border border-content-border text-left space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-content-border pb-2">
              <span className="text-content-muted">Membership Reference ID:</span>
              <span className="font-mono font-bold text-brand-purple">{pendingMember.membershipNumber}</span>
            </div>
            <div className="flex justify-between border-b border-content-border pb-2">
              <span className="text-content-muted">Registered Email:</span>
              <span className="font-mono font-bold">{pendingMember.email}</span>
            </div>
            <div className="flex justify-between border-b border-content-border pb-2">
              <span className="text-content-muted">Selected Tier & Duration:</span>
              <span className="font-bold">{pendingMember.tierName} ({pendingMember.durationYears} Yr)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-muted">Bank Transfer Reference (UTR):</span>
              <span className="font-mono font-bold text-amber-700">{pendingMember.transactionId}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 text-left space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Accounting Verification in Progress
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Our accounts team reconciles incoming bank transfers daily. Once reconciled, your official digital membership card and Section 80G tax receipt will be activated and emailed to {pendingMember.email}. You can also check status anytime using your email in the "Access Existing Membership Card" tab.
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setPendingMember(null);
                setFullName('');
                setEmail('');
                setPhone('');
                setCity('');
                setPaymentReference('');
              }}
              className="btn-primary !py-2.5 !px-6 text-xs font-bold"
            >
              Enroll Another Member
            </button>
          </div>
        </div>
      ) : (
        /* STEP 1: TIER SELECTION & DURATION BUILDER */
        <div className="space-y-10">
          {/* Tiers Grid & Currency Selector */}
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-content-primary">
                {t('membership.step1_title', '1. Select Your Membership Level')}
              </h2>
              <p className="text-xs text-content-secondary max-w-xl mx-auto">
                {t('membership.step1_subtitle', 'All memberships directly sustain on-ground healthcare, emergency relief, and community welfare in Jammu & Kashmir.')}
              </p>
            </div>

            {/* 5 Membership Levels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {tiers.map((tItem) => {
                const isSelected = selectedTier === tItem.id;

                return (
                  <div
                    key={tItem.id}
                    onClick={() => setSelectedTier(tItem.id)}
                    className={`rounded-3xl border-2 p-4 cursor-pointer transition-all duration-300 relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-pink bg-gradient-to-b from-white via-purple-50/40 to-pink-50/20 shadow-brand-lg scale-[1.02] ring-2 ring-brand-pink/20'
                        : 'border-content-border bg-white hover:border-brand-purple/40 hover:shadow-brand-sm'
                    }`}
                  >
                    {tItem.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-brand-pink text-white font-black text-[8.5px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                        POPULAR CHOICE
                      </span>
                    )}

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-content-muted">
                          {tItem.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-pink flex-shrink-0" />}
                      </div>

                      <div>
                        <h3 className="text-sm sm:text-base font-black text-content-primary leading-snug">
                          {tItem.name}
                        </h3>
                        <p className="text-[10.5px] text-content-secondary mt-1 leading-relaxed line-clamp-2">
                          {tItem.description}
                        </p>
                      </div>

                      <div className="py-2 border-y border-content-border/60">
                        <div className="text-xl sm:text-2xl font-black text-brand-purple font-mono">
                          {formatMembershipCurrency(tItem.baseAmount)}
                          <span className="text-[11px] text-content-muted font-normal"> / year</span>
                        </div>
                        <p className="text-[9px] text-emerald-700 font-semibold mt-0.5">
                          100% Tax Deductible (80G & 12A)
                        </p>
                      </div>

                      <ul className="space-y-1 text-[10.5px] text-content-secondary">
                        {tItem.benefits.map((b, idx) => (
                          <li key={idx} className="flex items-start gap-1 leading-tight">
                            <Check className="w-3 h-3 text-brand-pink flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`w-full mt-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-brand-pink text-white shadow-pink-glow'
                          : 'bg-surface-soft text-content-primary hover:bg-brand-purple/10'
                      }`}
                    >
                      {isSelected ? 'Selected Level' : 'Select Level'}
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

            {/* Contribution Calculation Summary Card (Requirement 8) */}
            <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white p-5 sm:p-6 rounded-2xl border border-amber-400/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider block">
                  MEMBERSHIP CONTRIBUTION SUMMARY
                </span>
                <h4 className="text-base sm:text-lg font-black text-white">
                  {currentTierObj.name} · <span className="text-amber-300">{durationYears} {durationYears === 1 ? 'Year' : 'Years'}</span>
                </h4>
                <p className="text-xs text-white/80 font-mono">
                  {formatMembershipCurrency(annualAmount)} × {durationYears} {durationYears === 1 ? 'Year' : 'Years'}
                </p>
              </div>

              <div className="text-center sm:text-right bg-white/10 px-6 py-3.5 rounded-xl border border-white/10">
                <span className="text-[10px] text-amber-200 block uppercase font-bold tracking-wider">TOTAL CONTRIBUTION</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                  {formatMembershipCurrency(totalContribution)}
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
                  {t('membership.phone', 'Phone Number *')}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 94190 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">
                  {t('membership.city', 'City / Region *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Srinagar / New Delhi / London"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">
                  {t('membership.country', 'Country *')}
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">
                  {t('membership.blood_group', 'Blood Group (ID Badge) *')}
                </label>
                <select
                  value={bloodGroup}
                  required
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
                  <IdCard className="w-4 h-4 text-brand-pink" /> {t('membership.photo_title', 'Passport Size Photograph (for Official Membership Card Badge) *')}
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
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <p className={`text-xs font-bold ${!photoUrl ? 'text-rose-600' : 'text-content-primary'}`}>
                      {photoUrl ? 'Photograph Uploaded ✓' : 'Upload your formal portrait photo'}
                    </p>
                    {!photoUrl && (
                      <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full border border-rose-200">
                        * Mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-content-secondary">
                    This photo will be framed on your high-resolution Al Shujaiat Foundation Membership ID Card.
                  </p>
                  <div className="pt-1 flex items-center gap-2 justify-center sm:justify-start">
                    <label className={`!py-1.5 !px-3 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 rounded-xl border transition-colors ${
                      !photoUrl
                        ? 'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'btn-outline text-brand-purple'
                    }`}>
                      <UploadCloud className="w-3.5 h-3.5 text-brand-purple" />
                      <span>{photoUrl ? t('membership.change_photo', 'Change Photo') : t('membership.upload_btn', 'Upload Picture *')}</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { 
                    id: 'upi', 
                    label: t('membership.upi', 'UPI / NetBanking / Cards'), 
                    gateway: 'Razorpay Gateway',
                    icon: Sparkles, 
                    hint: 'GPay, PhonePe, Paytm, RuPay, Cards',
                    active: true 
                  },
                  { 
                    id: 'card', 
                    label: t('membership.card', 'Credit / Debit Card'), 
                    gateway: 'Cards (Visa, MC, RuPay)',
                    icon: CreditCard, 
                    hint: 'Visa, Mastercard, RuPay',
                    active: true 
                  },
                  { 
                    id: 'paypal', 
                    label: t('membership.paypal', 'PayPal / International'), 
                    gateway: 'PayPal Global',
                    icon: Globe, 
                    hint: 'Global USD / Cards',
                    active: true 
                  },
                  { 
                    id: 'bank_wire', 
                    label: t('membership.bank_wire', 'Direct Bank Wire'), 
                    gateway: 'NEFT / RTGS / IMPS',
                    icon: Building, 
                    hint: 'Direct Account Transfer',
                    active: true 
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    disabled={!m.active}
                    onClick={() => {
                      if (m.active) {
                        setPaymentMethod(m.id as any);
                        if (errorMsg) setErrorMsg(null);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center relative ${
                      !m.active
                        ? 'border-content-border/60 bg-surface-soft/60 text-content-secondary/75 opacity-80 cursor-not-allowed'
                        : paymentMethod === m.id
                        ? 'border-brand-pink bg-pink-50/50 text-brand-purple shadow-sm ring-2 ring-brand-pink/20'
                        : 'border-content-border text-content-secondary hover:border-brand-purple/40'
                    }`}
                  >
                    <m.icon className={`w-5 h-5 ${m.active ? 'text-brand-pink' : 'text-slate-400'}`} />
                    <span className="font-extrabold">{m.label}</span>
                    {m.active ? (
                      <>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Active & Instant
                        </span>
                        <span className="text-[10px] font-normal text-content-muted">{m.hint}</span>
                      </>
                    ) : (
                      <span className="text-[9.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md leading-tight mt-0.5">
                        In development phase · Will be back soon
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Direct Bank Wire Details & UTR Input */}
              {paymentMethod === 'bank_wire' && (
                <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-surface-soft border border-brand-purple/20 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-content-border pb-2">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-brand-purple" />
                      <span className="text-xs font-bold text-content-primary">
                        {t('donate.bank_account_title', 'Official Statutory Bank Account')}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      80G Tax Exempt
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-[10px] text-content-muted block">
                        Beneficiary Name
                      </span>
                      <span className="font-bold text-content-primary">{settings.bankDetails?.accountName || settings.foundationLegalName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-content-muted block">
                        Bank & Branch
                      </span>
                      <span className="font-bold text-content-primary">{settings.bankDetails?.bankName || 'The Jammu & Kashmir Bank Ltd, Tral'}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-content-muted">
                          Account Number
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settings.bankDetails?.accountNumber || '0134010100008892', 'mbr_acc')}
                          className="text-[10px] text-brand-purple hover:underline flex items-center gap-1 font-bold"
                        >
                          {copiedKey === 'mbr_acc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copiedKey === 'mbr_acc' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <span className="font-mono font-bold text-xs text-brand-purple" dir="ltr">{settings.bankDetails?.accountNumber || '0134010100008892'}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-content-muted">
                          IFSC Code
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settings.bankDetails?.ifscCode || 'JAKA0LURGAM', 'mbr_ifsc')}
                          className="text-[10px] text-brand-purple hover:underline flex items-center gap-1 font-bold"
                        >
                          {copiedKey === 'mbr_ifsc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copiedKey === 'mbr_ifsc' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <span className="font-mono font-bold text-xs text-brand-purple" dir="ltr">{settings.bankDetails?.ifscCode || 'JAKA0LURGAM'}</span>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-content-border space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-content-primary">
                          Bank Transfer Reference / UTR Number *
                        </label>
                        <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          Manual Reconciliation
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 12-digit UTR from your NEFT, RTGS or IMPS bank transfer"
                        value={paymentReference}
                        onChange={(e) => {
                          setPaymentReference(e.target.value);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        className="w-full px-3 py-2 text-xs font-mono font-bold text-brand-purple rounded-xl border border-content-border focus:border-brand-purple outline-none bg-white"
                      />
                      <p className="text-[9.5px] text-content-muted">
                        💡 Enter the 12-digit reference/UTR number from your bank transfer. Our finance desk verifies bank deposits daily and will activate your membership credential.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit & Generate Membership ID Card */}
            <div className="pt-4 border-t border-content-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-content-secondary">
                {paymentMethod === 'bank_wire' ? (
                  <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Direct bank wires require verification by our accounts desk before credential activation.
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {t('membership.security_note', 'Security Note: Official 256-bit encrypted Razorpay gateway. Verified 80G tax receipt generated.')}
                  </span>
                )}
              </div>

              {paymentMethod === 'paypal' ? (
                <div className="w-full sm:w-80">
                  <PayPalButton
                    amount={totalContribution}
                    currency={currentCurrency.code}
                    description={`Al Shujaiat Foundation Membership - ${currentTierObj.name} (${durationYears} Yr)`}
                    donorName={fullName.trim()}
                    donorEmail={email.trim()}
                    disabled={
                      isProcessing ||
                      !fullName.trim() ||
                      !email.trim() ||
                      !phone.trim() ||
                      !city.trim() ||
                      !country.trim() ||
                      !photoUrl
                    }
                    onSuccess={async ({ orderId }) => {
                      await handlePayPalMembershipSuccess(orderId);
                    }}
                    onError={(err) => setErrorMsg(err)}
                  />
                  {(!fullName.trim() || !email.trim() || !phone.trim() || !city.trim() || !country.trim() || !photoUrl) && (
                    <p className="text-[11px] text-amber-600 mt-1.5 text-center font-medium">
                      Fill all mandatory personal details & photo to activate PayPal checkout.
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full sm:w-auto btn-primary !py-3.5 !px-8 text-sm font-black shadow-pink-glow flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>{paymentMethod === 'bank_wire' ? 'Submitting Transfer Details...' : 'Launching Razorpay Gateway...'}</span>
                  ) : paymentMethod === 'bank_wire' ? (
                    <>
                      <Building className="w-4 h-4" />
                      <span>Submit Bank Wire & Register: {formatMembershipCurrency(totalContribution)}</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      <span>{t('membership.pay_btn', 'Pay & Activate Membership')}: {formatMembershipCurrency(totalContribution)}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
