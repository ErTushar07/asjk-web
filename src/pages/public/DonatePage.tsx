import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { DonationFrequency, PaymentMethod } from '../../types';
import { 
  Heart, ShieldCheck, FileText, CheckCircle2, Lock, 
  CreditCard, Smartphone, Building, Sparkles, Download, ArrowRight 
} from 'lucide-react';

export const DonatePage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { projects, campaigns, settings, processDonation } = useDatabase();
  const { currentCurrency, convertUSDToCurrency, convertCurrencyToUSD } = useCurrency();
  const { t } = useLanguage();

  const [frequency, setFrequency] = useState<DonationFrequency>('monthly');
  const [selectedPresetUSD, setSelectedPresetUSD] = useState<number>(50);
  const [customAmountUSD, setCustomAmountUSD] = useState<string>('');
  const [selectedTargetType, setSelectedTargetType] = useState<'general' | 'project' | 'campaign'>('general');
  const [targetId, setTargetId] = useState<string>('');

  const [fullName, setFullName] = useState('David Thompson');
  const [email, setEmail] = useState('david.thompson@example.com');
  const [phone, setPhone] = useState('+1 415 555 0192');
  const [country, setCountry] = useState('United States');
  const [taxId, setTaxId] = useState('US-TAX-88901');
  const [address, setAddress] = useState('124 Lexington Ave, New York, NY');
  const [anonymous, setAnonymous] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  const effectiveAmountUSD = customAmountUSD ? parseFloat(customAmountUSD) || 0 : selectedPresetUSD;
  const effectiveLocalAmount = convertUSDToCurrency(effectiveAmountUSD);

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveAmountUSD <= 0 || !email) return;

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
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-brand-pink tracking-widest uppercase block">
          Al Shujaiat Foundation · Jammu & Kashmir
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          Make a Secure, Tax-Exempt Contribution
        </h1>
        <p className="text-content-secondary text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Your voluntary donation directly supports verified water pipelines, digital classrooms, emergency heating, and medicine across Jammu & Kashmir.
        </p>
      </div>

      {successResult ? (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-content-border shadow-brand-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-content-primary">
              Thank You for Your Generous Support!
            </h3>
            <p className="text-xs sm:text-sm text-content-secondary max-w-md mx-auto">
              Your donation of <span className="font-bold text-brand-purple">{currentCurrency.symbol}{effectiveLocalAmount.toLocaleString()} {currentCurrency.code}</span> has been processed and allocated.
            </p>
          </div>

          <div className="p-4 bg-surface-soft rounded-2xl border border-content-border max-w-md mx-auto space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-content-muted">Receipt Number:</span>
              <span className="font-mono font-bold text-brand-purple">{successResult.receipt.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-muted">Transaction ID:</span>
              <span className="font-mono text-content-primary">{successResult.payment.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-muted">Allocated To:</span>
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
              <span>Download Official PDF Tax Receipt</span>
            </button>

            <button
              onClick={() => onNavigate('/dashboard')}
              className="btn-outline w-full sm:w-auto !py-3 !px-6 text-xs font-bold"
            >
              Go to Donor Portal
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

              <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${paymentMethod === 'sandbox_card' ? 'border-brand-purple bg-surface-highlight' : 'border-content-border'}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'sandbox_card'}
                  onChange={() => setPaymentMethod('sandbox_card')}
                  className="text-brand-purple focus:ring-brand-purple"
                />
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-content-primary">Instant Sandbox Simulator</span>
              </label>
            </div>
          </div>

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
