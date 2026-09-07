import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { DonationFrequency, PaymentMethod } from '../../types';
import { 
  Heart, ShieldCheck, FileText, CheckCircle2, Lock, 
  CreditCard, Smartphone, Building, Sparkles, Download, ArrowRight,
  Copy, Check, AlertCircle, ExternalLink, RefreshCw, UserPlus, Globe
} from 'lucide-react';
import { PayPalButton } from '../../components/payment/PayPalButton';

export const DonatePage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  usePageMeta('Donate Securely', 'Donate to clean water, education, and humanitarian relief projects across Jammu & Kashmir with 100% financial transparency.');
  const { user } = useAuth();
  const { projects, campaigns, settings, processDonation } = useDatabase();
  const { currentCurrency, convertUSDToCurrency, convertCurrencyToUSD } = useCurrency();
  const { t } = useLanguage();

  // Currency-aware preset amounts for natural local currency denominations
  const getCurrencyPresets = (code: string): number[] => {
    switch (code) {
      case 'INR':
        return [500, 1000, 2500, 5000, 10000];
      case 'GBP':
        return [20, 50, 100, 250, 500];
      case 'EUR':
        return [25, 50, 100, 250, 500];
      case 'AED':
      case 'SAR':
        return [100, 200, 500, 1000, 2500];
      default:
        return [25, 50, 100, 250, 500];
    }
  };

  const currentPresets = getCurrencyPresets(currentCurrency.code);
  const [frequency, setFrequency] = useState<DonationFrequency>('monthly');
  const [selectedPreset, setSelectedPreset] = useState<number>(() => currentPresets[1] || 1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedTargetType, setSelectedTargetType] = useState<'general' | 'project' | 'campaign'>('general');
  const [targetId, setTargetId] = useState<string>('');

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [country, setCountry] = useState('India');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  // Default payment method: Razorpay is the active payment gateway
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay_upi');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [hasOpenedRazorpay, setHasOpenedRazorpay] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Update preset when user changes currency
  React.useEffect(() => {
    if (!customAmount) {
      const p = getCurrencyPresets(currentCurrency.code);
      setSelectedPreset(p[1] || 1000);
    }
  }, [currentCurrency.code]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // The effective donation amount directly in the selected currency
  const effectiveLocalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedPreset;

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (effectiveLocalAmount <= 0) {
      setErrorMessage('Please enter a valid donation amount.');
      return;
    }

    // Strict check: For Bank Wire, manual UTR reference is required
    if (paymentMethod === 'bank_wire') {
      if (!paymentReference.trim()) {
        setErrorMessage('Please enter your Bank Transfer Reference / UTR Number to confirm your donation.');
        return;
      }
      if (paymentReference.trim().length < 4) {
        setErrorMessage('Please enter a valid bank transfer UTR or transaction reference number.');
        return;
      }
    }

    if (!fullName.trim()) {
      setErrorMessage('Please enter your Full Legal Name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid Email Address for your official tax receipt.');
      return;
    }

    if (!country.trim()) {
      setErrorMessage('Please enter your Country of Residence.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Please enter your Phone Number.');
      return;
    }

    const effectiveDonorEmail = email.trim();
    const effectiveDonorName = fullName.trim();

    setIsProcessing(true);
    try {
      let targetName = 'General Humanitarian Relief Fund';
      if (selectedTargetType === 'project') {
        const p = projects.find((x) => x.id === targetId);
        if (p) targetName = p.name;
      } else if (selectedTargetType === 'campaign') {
        const c = campaigns.find((x) => x.id === targetId);
        if (c) targetName = c.name;
      }

      const result = await processDonation({
        amount: effectiveLocalAmount,
        currency: currentCurrency.code,
        frequency,
        donationType: selectedTargetType,
        targetId: targetId || undefined,
        targetName,
        donorName: effectiveDonorName,
        donorEmail: effectiveDonorEmail,
        donorPhone: phone.trim() || undefined,
        donorCountry: country.trim() || 'India',
        donorTaxId: taxId.trim() || undefined,
        donorAddress: address.trim() || undefined,
        anonymous,
        paymentMethod,
      });

      setSuccessResult(result);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Payment authorization failed. Please try another payment option or bank wire.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalSuccess = async (paypalOrderId: string) => {
    if (!fullName.trim()) {
      setErrorMessage('Please enter your Full Legal Name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid Email Address for your official tax receipt.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your Phone Number.');
      return;
    }
    if (!country.trim()) {
      setErrorMessage('Please enter your Country of Residence.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      let targetName = 'General Humanitarian Relief Fund';
      if (selectedTargetType === 'project') {
        const p = projects.find((x) => x.id === targetId);
        if (p) targetName = p.name;
      } else if (selectedTargetType === 'campaign') {
        const c = campaigns.find((x) => x.id === targetId);
        if (c) targetName = c.name;
      }

      const result = await processDonation({
        amount: effectiveLocalAmount,
        currency: currentCurrency.code,
        frequency,
        donationType: selectedTargetType,
        targetId: targetId || undefined,
        targetName,
        donorName: fullName.trim(),
        donorEmail: email.trim(),
        donorPhone: phone.trim(),
        donorCountry: country.trim(),
        donorTaxId: taxId.trim() || undefined,
        donorAddress: address.trim() || undefined,
        anonymous,
        paymentMethod: 'paypal',
        paymentReference: paypalOrderId,
      });

      setSuccessResult(result);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'PayPal payment processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          {t('donate.badge', 'Al Shujaiat Foundation · Jammu & Kashmir')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          {t('donate.main_title', 'Make a Secure, Tax-Exempt Contribution')}
        </h1>
        <p className="text-content-secondary text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          {t('donate.main_subtitle', 'Your voluntary donation directly supports verified water pipelines, digital classrooms, emergency heating, and medicine across Jammu & Kashmir.')}
        </p>
      </div>

      {successResult ? (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-content-border shadow-brand-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-content-primary">
              {successResult.receipt
                ? t('donate.success_title', 'Thank You for Your Generous Support!')
                : 'Bank Transfer Reference Submitted!'}
            </h3>
            <p className="text-xs sm:text-sm text-content-secondary max-w-md mx-auto">
              {successResult.receipt
                ? `Your donation of ${currentCurrency.symbol}${effectiveLocalAmount.toLocaleString()} ${currentCurrency.code} has been verified and allocated.`
                : `Your transfer of ${currentCurrency.symbol}${effectiveLocalAmount.toLocaleString()} ${currentCurrency.code} has been registered for reconciliation.`}
            </p>
          </div>

          <div className="p-4 bg-surface-soft rounded-2xl border border-content-border max-w-md mx-auto space-y-2 text-xs text-left">
            {successResult.receipt ? (
              <div className="flex justify-between">
                <span className="text-content-muted">{t('receipt.number', 'Receipt Number')}:</span>
                <span className="font-mono font-bold text-brand-purple">{successResult.receipt.receiptNumber}</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-content-muted">Verification Status:</span>
                <span className="font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                  Pending Account Reconciliation
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-content-muted">{t('receipt.transaction_id', 'Transaction / UTR ID')}:</span>
              <span className="font-mono text-content-primary">{successResult.payment.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-muted">{t('donate.allocated_to', 'Allocated To')}:</span>
              <span className="font-semibold text-content-primary">{successResult.donation.targetName}</span>
            </div>
          </div>

          {!successResult.receipt && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs max-w-md mx-auto text-left leading-relaxed">
              <p className="font-bold mb-1">📋 Section 80G Tax Receipt Notice:</p>
              <p className="text-[11px] text-amber-800">
                Because bank wire transfers require manual bank statement reconciliation, our finance desk will verify the credit in our statutory J&K Bank account. Your official Section 80G tax receipt will be issued and emailed to <strong className="underline">{email}</strong> within 24–48 business hours.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {successResult.receipt && (
              <button
                onClick={async () => {
                  const { ReceiptService } = await import('../../services/receiptService');
                  await ReceiptService.downloadReceipt(successResult.receipt, settings);
                }}
                className="btn-primary w-full sm:w-auto !py-3 !px-6 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{t('donate.download_receipt', 'Download Official PDF Tax Receipt')}</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('/dashboard')}
              className="btn-outline w-full sm:w-auto !py-3 !px-6 text-xs font-bold"
            >
              {t('donate.view_dashboard', 'Go to Donor Portal')}
            </button>
          </div>

          {/* Guest account creation card to permanently save and link donation */}
          {!user && (
            <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-2xl p-5 text-left max-w-md mx-auto space-y-3 mt-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-content-primary">Save This Donation to Your Donor Account</p>
                  <p className="text-xs text-content-secondary mt-1">
                    Create a free account with <span className="font-semibold text-brand-purple">{email || 'your email'}</span> to automatically link this payment, download 80G tax receipts at any time, and track your ongoing humanitarian impact.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate(`/register?email=${encodeURIComponent(email)}&name=${encodeURIComponent(fullName)}`)}
                className="btn-primary w-full !py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Donor Account & Link Donation</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleDonateSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-content-border shadow-brand-md space-y-8">
          {/* Frequency Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-content-primary uppercase tracking-wider">
              Donation Frequency
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['one-time', 'monthly', 'quarterly', 'yearly'] as DonationFrequency[]).map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`py-3 px-4 rounded-2xl text-xs font-extrabold capitalize transition-all ${
                    frequency === f
                      ? 'bg-brand-purple text-white shadow-brand-sm'
                      : 'bg-surface-soft text-content-secondary hover:bg-surface-card border border-content-border'
                  }`}
                >
                  {f.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Target Designation Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-content-primary uppercase tracking-wider">
              Designate Your Gift
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-content-border cursor-pointer hover:bg-surface-soft">
                <input
                  type="radio"
                  name="targetType"
                  checked={selectedTargetType === 'general'}
                  onChange={() => {
                    setSelectedTargetType('general');
                    setTargetId('');
                  }}
                  className="text-brand-purple focus:ring-brand-purple"
                />
                <span className="text-xs font-bold text-content-primary">
                  {t('donate.general_relief_fund', 'General Humanitarian Relief Fund')}
                </span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-content-border cursor-pointer hover:bg-surface-soft">
                <input
                  type="radio"
                  name="targetType"
                  checked={selectedTargetType === 'project'}
                  onChange={() => {
                    setSelectedTargetType('project');
                    setTargetId(projects[0]?.id || '');
                  }}
                  className="text-brand-purple focus:ring-brand-purple"
                />
                <span className="text-xs font-bold text-content-primary">
                  {t('donate.specific_project_fund', 'Specific Project Fund')}
                </span>
              </label>
            </div>

            {selectedTargetType === 'project' && (
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-content-border bg-white outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {t(`project.${p.id}.name`, p.name)} ({t(p.category, p.category)})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Amount Presets */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">
              {t('donate.select_amount', '2. Select Donation Amount')} ({currentCurrency.code})
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {currentPresets.map((amt) => {
                const isSelected = selectedPreset === amt && !customAmount;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(amt);
                      setCustomAmount('');
                    }}
                    className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'border-brand-pink bg-brand-pink text-white shadow-pink-glow'
                        : 'border-content-border bg-white text-content-primary hover:border-brand-purple'
                    }`}
                  >
                    {currentCurrency.symbol}{amt.toLocaleString()}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-content-muted">
                {currentCurrency.symbol}
              </span>
              <input
                type="number"
                min="1"
                placeholder={t('donate.custom_amount_placeholder', `Or enter custom amount in ${currentCurrency.code} (${currentCurrency.symbol})...`)}
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  if (e.target.value) {
                    setSelectedPreset(0);
                  }
                }}
                className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>
          </div>

          {/* Donor Information */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">
              {t('donate.donor_info_title', '4. Donor Information (for Section 80G Tax Exemption Receipt)')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">
                  {t('donate.full_legal_name', 'Full Legal Name')} <span className="text-brand-purple font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Thompson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">
                  {t('donate.email_address', 'Email Address')} <span className="text-brand-purple font-bold">*</span> <span className="text-[10px] text-content-muted font-normal">({t('For PDF Receipt', 'For PDF Receipt')})</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. david.thompson@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">
                  {t('donate.phone_number', 'Phone Number')} <span className="text-brand-purple font-bold">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 415 555 0192"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">
                  {t('donate.country_label', 'Country')} <span className="text-brand-purple font-bold">*</span>
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
                  {t('donate.tax_id_label', 'PAN / Tax ID (for 80G)')}
                </label>
                <input
                  type="text"
                  placeholder="Optional Tax ID"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none uppercase font-mono"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">
              {t('donate.payment_method_title', '5. Payment Method')}
            </label>
            <div className="space-y-3">
              {/* Razorpay Active Gateway */}
              <label className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === 'razorpay_upi' ? 'border-brand-purple bg-surface-highlight ring-2 ring-brand-purple/20' : 'border-content-border'}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'razorpay_upi'}
                  onChange={() => setPaymentMethod('razorpay_upi')}
                  className="text-brand-purple focus:ring-brand-purple"
                />
                <div className="w-10 h-10 rounded-2xl bg-brand-pink/10 text-brand-pink flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-content-primary">
                      {t('donate.upi_razorpay', 'UPI, Cards & Netbanking (Razorpay Gateway)')}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Active & Instant
                    </span>
                  </div>
                  <p className="text-[11px] text-content-secondary mt-0.5">
                    GPay, PhonePe, Paytm, Debit/Credit Cards (Visa, Mastercard, RuPay), and all Netbanking
                  </p>
                </div>
              </label>

              {/* PayPal (Active Gateway) */}
              <label className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-brand-purple bg-surface-highlight ring-2 ring-brand-purple/20' : 'border-content-border'}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')}
                  className="text-brand-purple focus:ring-brand-purple"
                />
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-content-primary">
                      {t('donate.paypal_global', 'PayPal & International Cards')}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Active & Instant
                    </span>
                  </div>
                  <p className="text-[11px] text-content-secondary mt-0.5">
                    Worldwide contributions via PayPal account, International Debit & Credit Cards (Visa, Mastercard, Amex).
                  </p>
                </div>
              </label>

              {/* Direct Bank Wire */}
              <label
                className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'bank_wire'
                    ? 'border-brand-purple bg-surface-highlight ring-2 ring-brand-purple/20'
                    : 'border-content-border hover:bg-surface-soft'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bank_wire'}
                  onChange={() => setPaymentMethod('bank_wire')}
                  className="text-brand-purple focus:ring-brand-purple"
                />
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-content-primary">
                      {t('donate.bank_wire', 'Direct Bank Wire / NEFT / IMPS')}
                    </p>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Backend Reconciliation
                    </span>
                  </div>
                  <p className="text-[11px] text-content-secondary mt-0.5">
                    Direct transfer to statutory foundation bank account. Reconciled before tax receipt issuance.
                  </p>
                </div>
              </label>
            </div>

            {/* Official Bank Account Details Box when Bank Wire is selected */}
            {paymentMethod === 'bank_wire' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-surface-soft border border-brand-purple/20 space-y-3.5 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-content-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-brand-purple" />
                    <span className="text-xs font-extrabold text-content-primary">
                      {t('donate.bank_account_title', 'Official Statutory Bank Account')}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    80G Tax Exempt
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-content-muted block font-semibold">
                      {t('donate.beneficiary_name', 'Beneficiary Name')}
                    </span>
                    <span className="font-bold text-content-primary">{settings.bankDetails?.accountName || 'M/S AL-SHUJAIAT FOUNDATION JAMMU & KASHMIR'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-content-muted block font-semibold">
                      {t('donate.account_type', 'Account Type')}
                    </span>
                    <span className="font-bold text-content-primary">
                      {settings.bankDetails?.accountType || 'Saving Account'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-content-muted block font-semibold">
                      {t('donate.bank_branch', 'Bank & Branch')}
                    </span>
                    <span className="font-bold text-content-primary">{settings.bankDetails?.bankName || 'Axis Bank Ltd'} ({settings.bankDetails?.branch || 'Larikpora, Awantipora, Pulwama'})</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-content-muted font-semibold">
                        {t('donate.account_number', 'Account Number')}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings.bankDetails?.accountNumber || '925010008902563', 'acc')}
                        className="text-[10px] text-brand-purple hover:underline flex items-center gap-1 font-bold"
                      >
                        {copiedKey === 'acc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === 'acc' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <span className="font-mono font-bold text-sm text-brand-purple" dir="ltr">{settings.bankDetails?.accountNumber || '925010008902563'}</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-content-muted font-semibold">
                        {t('donate.ifsc_code', 'IFSC Code')}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings.bankDetails?.ifscCode || 'UTIB0002378', 'ifsc')}
                        className="text-[10px] text-brand-purple hover:underline flex items-center gap-1 font-bold"
                      >
                        {copiedKey === 'ifsc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === 'ifsc' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <span className="font-mono font-bold text-sm text-brand-purple" dir="ltr">{settings.bankDetails?.ifscCode || 'UTIB0002378'}</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-content-muted font-semibold">
                        {t('donate.direct_vpa', 'Direct UPI VPA')}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings.bankDetails?.upiId || 'asfjk@jksbi', 'upi')}
                        className="text-[10px] text-brand-purple hover:underline flex items-center gap-1 font-bold"
                      >
                        {copiedKey === 'upi' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === 'upi' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <span className="font-mono font-bold text-sm text-brand-pink" dir="ltr">{settings.bankDetails?.upiId || 'asfjk@jksbi'}</span>
                  </div>
                  {/* Bank Transfer Reference Input */}
                  <div className="sm:col-span-2 pt-2 border-t border-content-border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-content-primary">
                        {t('donate.bank_wire_ref_label', 'Bank Transfer Reference / UTR Number *')}
                      </label>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        Manual Verification
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 12-digit UTR from your NEFT, RTGS or IMPS bank transfer"
                      value={paymentReference}
                      onChange={(e) => {
                        setPaymentReference(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full px-3.5 py-2.5 text-xs font-mono font-bold text-brand-purple rounded-xl border border-content-border focus:border-brand-purple outline-none bg-white"
                    />
                    <p className="text-[10px] text-content-muted leading-relaxed">
                      💡 {t('donate.bank_wire_ref_hint', 'Enter the 12-digit reference/UTR number from your bank transfer. Our accounts desk will verify the deposit in the foundation account before issuing your Section 80G tax receipt.')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {paymentMethod === 'paypal' ? (
            <div className="space-y-3 pt-2">
              {(!fullName.trim() || !email.trim() || !phone.trim() || !country.trim()) && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                  ⚠️ Please ensure your Full Name, Email, Phone, and Country are filled above to activate PayPal checkout.
                </p>
              )}
              <PayPalButton
                amount={effectiveLocalAmount}
                currency={currentCurrency.code}
                description={`Donation to ${selectedTargetType === 'project' ? 'Project Fund' : 'General Humanitarian Relief'}`}
                donorName={fullName.trim()}
                donorEmail={email.trim()}
                disabled={isProcessing || !fullName.trim() || !email.trim() || !phone.trim() || !country.trim()}
                onSuccess={async ({ orderId }) => {
                  await handlePayPalSuccess(orderId);
                }}
                onError={(err) => setErrorMessage(err)}
              />
            </div>
          ) : (
            <button
              type="submit"
              disabled={isProcessing}
              className="btn-secondary w-full !py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-pink-glow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {paymentMethod === 'razorpay_upi'
                    ? 'Opening Razorpay & Verifying Signature...'
                    : 'Verifying and Authorizing Transaction...'}
                </span>
              ) : paymentMethod === 'razorpay_upi' ? (
                <>
                  <Smartphone className="w-5 h-5 text-brand-pink" />
                  <span>
                    Proceed to Pay & Verify ({currentCurrency.symbol}{effectiveLocalAmount.toLocaleString()} {currentCurrency.code})
                  </span>
                </>
              ) : paymentMethod === 'bank_wire' ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  <span>Submit Transfer for Accounting Reconciliation ({currentCurrency.symbol}{effectiveLocalAmount.toLocaleString()})</span>
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 fill-white" />
                  <span>
                    Complete Donation of {currentCurrency.symbol}{effectiveLocalAmount.toLocaleString()} {currentCurrency.code}
                  </span>
                </>
              )}
            </button>
          )}
        </form>
      )}
    </div>
  );
};
