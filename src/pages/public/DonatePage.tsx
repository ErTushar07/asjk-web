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
  Copy, Check, AlertCircle
} from 'lucide-react';

export const DonatePage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  usePageMeta('Donate Securely', 'Donate to clean water, education, and humanitarian relief projects across Jammu & Kashmir with 100% financial transparency.');
  const { user } = useAuth();
  const { projects, campaigns, settings, processDonation } = useDatabase();
  const { currentCurrency, convertUSDToCurrency, convertCurrencyToUSD } = useCurrency();
  const { t } = useLanguage();

  const [frequency, setFrequency] = useState<DonationFrequency>('monthly');
  const [selectedPresetUSD, setSelectedPresetUSD] = useState<number>(50);
  const [customAmountUSD, setCustomAmountUSD] = useState<string>('');
  const [selectedTargetType, setSelectedTargetType] = useState<'general' | 'project' | 'campaign'>('general');
  const [targetId, setTargetId] = useState<string>('');

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [country, setCountry] = useState('India');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const effectiveAmountUSD = customAmountUSD ? parseFloat(customAmountUSD) || 0 : selectedPresetUSD;
  const effectiveLocalAmount = convertUSDToCurrency(effectiveAmountUSD);

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (effectiveAmountUSD <= 0) {
      setErrorMessage('Please enter a valid donation amount.');
      return;
    }
    if (!email) {
      setErrorMessage('Please provide a valid email address for your official Section 80G tax receipt.');
      return;
    }

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
        donorName: anonymous ? 'Anonymous Donor' : fullName || 'Valued Donor',
        donorEmail: email,
        donorPhone: phone,
        donorCountry: country,
        donorTaxId: taxId,
        donorAddress: address,
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
              {t('donate.success_title', 'Thank You for Your Generous Support!')}
            </h3>
            <p className="text-xs sm:text-sm text-content-secondary max-w-md mx-auto">
              Your donation of <span className="font-bold text-brand-purple">{currentCurrency.symbol}{effectiveLocalAmount.toLocaleString()} {currentCurrency.code}</span> has been processed and allocated.
            </p>
          </div>

          <div className="p-4 bg-surface-soft rounded-2xl border border-content-border max-w-md mx-auto space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-content-muted">{t('receipt.number', 'Receipt Number')}:</span>
              <span className="font-mono font-bold text-brand-purple">{successResult.receipt.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-muted">{t('receipt.transaction_id', 'Transaction ID')}:</span>
              <span className="font-mono text-content-primary">{successResult.payment.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-muted">{t('donate.allocated_to', 'Allocated To')}:</span>
              <span className="font-semibold text-content-primary">{successResult.donation.targetName}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                import('../../services/receiptService').then(({ ReceiptService }) => {
                  ReceiptService.downloadReceipt(successResult.receipt, settings);
                });
              }}
              className="btn-primary w-full sm:w-auto !py-3 !px-6 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{t('donate.download_receipt', 'Download Official PDF Tax Receipt')}</span>
            </button>

            <button
              onClick={() => onNavigate('/dashboard')}
              className="btn-outline w-full sm:w-auto !py-3 !px-6 text-xs font-bold"
            >
              {t('donate.view_dashboard', 'Go to Donor Portal')}
            </button>
          </div>
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
                <span className="text-xs font-bold text-content-primary">General Humanitarian Relief Fund</span>
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
                <span className="text-xs font-bold text-content-primary">Specific Project Fund</span>
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
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Amount Presets */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">
              2. Select Donation Amount ({currentCurrency.code})
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {settings.presetAmounts.map((amtUSD) => {
                const localAmt = convertUSDToCurrency(amtUSD);
                const isSelected = selectedPresetUSD === amtUSD && !customAmountUSD;
                return (
                  <button
                    key={amtUSD}
                    type="button"
                    onClick={() => {
                      setSelectedPresetUSD(amtUSD);
                      setCustomAmountUSD('');
                    }}
                    className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'border-brand-pink bg-brand-pink text-white shadow-pink-glow'
                        : 'border-content-border bg-white text-content-primary hover:border-brand-purple'
                    }`}
                  >
                    {currentCurrency.symbol}{localAmt.toLocaleString()}
                  </button>
                );
              })}
            </div>

            <div>
              <input
                type="number"
                min="1"
                placeholder={`Or enter custom amount in ${currentCurrency.code}...`}
                value={customAmountUSD}
                onChange={(e) => setCustomAmountUSD(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
              />
            </div>
          </div>

          {/* Allocation Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">
              3. Allocate Your Donation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <span className="text-xs font-bold text-content-primary">General Humanitarian Relief Fund</span>
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
                <span className="text-xs font-bold text-content-primary">Specific Project Fund</span>
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
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Donor Information */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">
              4. Donor Information (for Section 80G Tax Exemption Receipt)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">Full Legal Name *</label>
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
                <label className="block text-xs font-semibold text-content-primary mb-1">Email Address *</label>
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
                <label className="block text-xs font-semibold text-content-primary mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 415 555 0192"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">PAN / Tax ID (for 80G)</label>
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
              5. Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${paymentMethod === 'stripe_card' ? 'border-brand-purple bg-surface-highlight' : 'border-content-border'}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'stripe_card'}
                  onChange={() => setPaymentMethod('stripe_card')}
                  className="text-brand-purple focus:ring-brand-purple"
                />
                <CreditCard className="w-4 h-4 text-brand-purple" />
                <span className="text-xs font-semibold text-content-primary">Credit / Debit Card (Stripe International)</span>
              </label>

              <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${paymentMethod === 'razorpay_upi' ? 'border-brand-purple bg-surface-highlight' : 'border-content-border'}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'razorpay_upi'}
                  onChange={() => setPaymentMethod('razorpay_upi')}
                  className="text-brand-purple focus:ring-brand-purple"
                />
                <Smartphone className="w-4 h-4 text-brand-pink" />
                <span className="text-xs font-semibold text-content-primary">UPI & Netbanking (Razorpay India)</span>
              </label>

              <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${paymentMethod === 'bank_wire' ? 'border-brand-purple bg-surface-highlight' : 'border-content-border'}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bank_wire'}
                  onChange={() => setPaymentMethod('bank_wire')}
                  className="text-brand-purple focus:ring-brand-purple"
                />
                <Building className="w-4 h-4 text-brand-blue" />
                <span className="text-xs font-semibold text-content-primary">Direct Bank Wire / NEFT</span>
              </label>
            </div>

            {/* Official Bank Account Details Box when Bank Wire is selected */}
            {paymentMethod === 'bank_wire' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-surface-soft border border-brand-purple/20 space-y-3.5 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-content-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-brand-purple" />
                    <span className="text-xs font-extrabold text-content-primary">Official Statutory Bank Account</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    80G Tax Exempt
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-content-muted block font-semibold">Beneficiary Name</span>
                    <span className="font-bold text-content-primary">{settings.bankDetails?.accountName || settings.foundationLegalName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-content-muted block font-semibold">Account Type</span>
                    <span className="font-bold text-content-primary">Current Account (Charitable Trust)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-content-muted block font-semibold">Bank & Branch</span>
                    <span className="font-bold text-content-primary">{settings.bankDetails?.bankName || 'The Jammu & Kashmir Bank Ltd, Tral Pulwama'}</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-content-muted font-semibold">Account Number</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings.bankDetails?.accountNumber || '0134010100008892', 'acc')}
                        className="text-[10px] text-brand-purple hover:underline flex items-center gap-1 font-bold"
                      >
                        {copiedKey === 'acc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === 'acc' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <span className="font-mono font-bold text-sm text-brand-purple">{settings.bankDetails?.accountNumber || '0134010100008892'}</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-content-muted font-semibold">IFSC Code</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings.bankDetails?.ifscCode || 'JAKA0LURGAM', 'ifsc')}
                        className="text-[10px] text-brand-purple hover:underline flex items-center gap-1 font-bold"
                      >
                        {copiedKey === 'ifsc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === 'ifsc' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <span className="font-mono font-bold text-sm text-brand-purple">{settings.bankDetails?.ifscCode || 'JAKA0LURGAM'}</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-content-muted font-semibold">Direct UPI VPA</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings.bankDetails?.upiId || 'asfjk@jksbi', 'upi')}
                        className="text-[10px] text-brand-purple hover:underline flex items-center gap-1 font-bold"
                      >
                        {copiedKey === 'upi' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === 'upi' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <span className="font-mono font-bold text-sm text-brand-pink">{settings.bankDetails?.upiId || 'asfjk@jksbi'}</span>
                  </div>
                </div>

                <p className="text-[11px] text-content-secondary pt-1 border-t border-content-border leading-relaxed">
                  💡 <strong>Instructions:</strong> Complete your NEFT/RTGS/IMPS transfer and submit the form below. Your official Section 80G tax receipt will be issued immediately with your verification reference.
                </p>
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

          <button
            type="submit"
            disabled={isProcessing}
            className="btn-secondary w-full !py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-pink-glow"
          >
            <Heart className="w-5 h-5 fill-white" />
            <span>
              {isProcessing
                ? 'Verifying and Authorizing Transaction...'
                : `Complete Donation of ${currentCurrency.symbol}${effectiveLocalAmount.toLocaleString()} ${currentCurrency.code}`}
            </span>
          </button>
        </form>
      )}
    </div>
  );
};
