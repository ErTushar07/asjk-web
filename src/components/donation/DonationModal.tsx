import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { DonationFrequency, PaymentMethod, Project, Campaign, Receipt } from '../../types';
import { ReceiptService } from '../../services/receiptService';
import { 
  X, Heart, Check, ShieldCheck, Download, ArrowRight, 
  CreditCard, Smartphone, Building, RefreshCw, FileText, CheckCircle2, Lock
} from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProjectId?: string;
  initialCampaignId?: string;
  onNavigate?: (route: string) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  initialProjectId,
  initialCampaignId,
  onNavigate,
}) => {
  const { t, isRTL } = useLanguage();
  const { currentCurrency, formatOriginal, convertUSDToCurrency, convertCurrencyToUSD } = useCurrency();
  const { projects, campaigns, processDonation, settings } = useDatabase();

  // Form State
  const [frequency, setFrequency] = useState<DonationFrequency>('one_time');
  const [amountUSD, setAmountUSD] = useState<number>(50);
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);
  const [customAmountInput, setCustomAmountInput] = useState<string>('');
  
  const [targetType, setTargetType] = useState<'project' | 'campaign' | 'general' | 'emergency'>('project');
  const [targetId, setTargetId] = useState<string>('');
  const [targetName, setTargetName] = useState<string>('Clean Water Initiative');

  // Donor Details
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [donorCountry, setDonorCountry] = useState<string>('United States');
  const [donorTaxId, setDonorTaxId] = useState<string>('');
  const [donorAddress, setDonorAddress] = useState<string>('');
  const [anonymous, setAnonymous] = useState<boolean>(false);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe_card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successReceipt, setSuccessReceipt] = useState<Receipt | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronize target selection on open
  useEffect(() => {
    if (initialProjectId) {
      const proj = projects.find((p) => p.id === initialProjectId);
      if (proj) {
        setTargetType('project');
        setTargetId(proj.id);
        setTargetName(proj.name);
      }
    } else if (initialCampaignId) {
      const camp = campaigns.find((c) => c.id === initialCampaignId);
      if (camp) {
        setTargetType('campaign');
        setTargetId(camp.id);
        setTargetName(camp.name);
      }
    } else if (projects.length > 0) {
      setTargetType('project');
      setTargetId(projects[0].id);
      setTargetName(projects[0].name);
    }
  }, [initialProjectId, initialCampaignId, projects, campaigns]);

  if (!isOpen) return null;

  const currentConvertedAmount = isCustomAmount
    ? parseFloat(customAmountInput) || 0
    : convertUSDToCurrency(amountUSD);

  const handlePresetClick = (usdValue: number) => {
    setIsCustomAmount(false);
    setAmountUSD(usdValue);
    setCustomAmountInput('');
  };

  const handleCustomChange = (val: string) => {
    setIsCustomAmount(true);
    setCustomAmountInput(val);
    const numeric = parseFloat(val) || 0;
    setAmountUSD(convertCurrencyToUSD(numeric, currentCurrency.code));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!donorName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!donorEmail.trim() || !donorEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address for receipt delivery');
      return;
    }
    if (currentConvertedAmount <= 0) {
      setErrorMsg('Please enter a valid donation amount');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processDonation({
        amount: currentConvertedAmount,
        currency: currentCurrency.code,
        frequency,
        donationType: targetType,
        targetId,
        targetName,
        donorName,
        donorEmail,
        donorPhone,
        donorCountry,
        donorTaxId,
        donorAddress,
        anonymous,
        paymentMethod,
      });

      setSuccessReceipt(result.receipt);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing failed. Please try another method.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (successReceipt) {
      ReceiptService.downloadReceipt(successReceipt, settings);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-content-border relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-surface-soft hover:bg-surface-card flex items-center justify-center text-content-secondary hover:text-content-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-brand-purple text-white p-6 sm:p-8 rounded-t-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-pink/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-brand-blue border border-white/15 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-pink" /> {t('donate.tax_deductible', '100% Tax Deductible (80G / 501c3)')}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {t('donate.title', 'Make a Life-Changing Contribution')}
            </h3>
            <p className="text-white/80 text-xs sm:text-sm mt-1">
              {t('donate.allocated_to', 'Allocated to')}: <span className="font-semibold text-brand-pink">{targetName}</span>
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8">
          {successReceipt ? (
            /* Success & Receipt Screen */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-2xl font-extrabold text-content-primary">
                  {t('donate.success_title', 'Thank You For Your Generosity!')}
                </h4>
                <p className="text-content-secondary text-sm max-w-md mx-auto mt-2">
                  {t('donate.success_desc', 'Your donation has been verified and allocated. An official legal tax receipt has been generated.')}
                </p>
              </div>

              {/* Receipt Summary Box */}
              <div className="bg-surface-soft border border-content-border rounded-2xl p-5 text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-content-muted">{t('receipt.number', 'Receipt Number')}:</span>
                  <span className="font-bold text-brand-purple font-mono">{successReceipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">{t('receipt.amount', 'Amount Contributed')}:</span>
                  <span className="font-bold text-brand-pink text-sm">
                    {successReceipt.currency} {successReceipt.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">{t('receipt.frequency', 'Frequency')}:</span>
                  <span className="font-semibold capitalize text-content-primary">
                    {frequency.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">{t('donate.allocated_to', 'Allocated to')}:</span>
                  <span className="font-medium text-content-primary truncate max-w-[200px]">{successReceipt.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">{t('receipt.transaction_id', 'Transaction ID')}:</span>
                  <span className="font-mono text-[11px] text-content-secondary">{successReceipt.transactionId}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleDownloadPDF}
                  className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t('donate.download_receipt', 'Download Official PDF Receipt')}
                </button>
                {onNavigate && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('/dashboard');
                    }}
                    className="btn-outline w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    {t('donate.view_dashboard', 'Go to My Donor Dashboard')}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Donation Form Wizard */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <X className="w-4 h-4 flex-shrink-0" /> {errorMsg}
                </div>
              )}

              {/* 1. Frequency Switcher (One-Time, Monthly, Yearly) */}
              <div>
                <label className="block text-xs font-bold text-content-muted uppercase tracking-wider mb-2">
                  Donation Frequency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'one_time', label: t('donate.freq.one_time', 'One-Time') },
                    { id: 'monthly', label: t('donate.freq.monthly', 'Monthly') },
                    { id: 'yearly', label: t('donate.freq.yearly', 'Yearly') },
                  ].map((f) => (
                    <button
                      type="button"
                      key={f.id}
                      onClick={() => setFrequency(f.id as DonationFrequency)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                        frequency === f.id
                          ? 'bg-brand-purple text-white shadow-brand-sm'
                          : 'bg-surface-soft text-content-secondary hover:bg-surface-card'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Amount Presets */}
              <div>
                <label className="block text-xs font-bold text-content-muted uppercase tracking-wider mb-2">
                  {t('donate.select_amount', 'Select Donation Amount')} ({currentCurrency.code})
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[25, 50, 100, 250, 500].map((presetUSD) => {
                    const converted = convertUSDToCurrency(presetUSD);
                    const isSelected = !isCustomAmount && amountUSD === presetUSD;
                    return (
                      <button
                        type="button"
                        key={presetUSD}
                        onClick={() => handlePresetClick(presetUSD)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-brand-pink text-white border-brand-pink shadow-pink-glow'
                            : 'bg-white border-content-border text-content-primary hover:border-brand-purple/40 hover:bg-surface-soft'
                        }`}
                      >
                        {currentCurrency.symbol}{converted.toLocaleString()}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomAmount(true);
                      setCustomAmountInput(currentConvertedAmount.toString());
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      isCustomAmount
                        ? 'bg-brand-pink text-white border-brand-pink shadow-pink-glow'
                        : 'bg-white border-content-border text-content-primary hover:border-brand-purple/40 hover:bg-surface-soft'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {isCustomAmount && (
                  <div className="mt-3 relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-content-muted">
                      {currentCurrency.symbol}
                    </span>
                    <input
                      type="number"
                      min="1"
                      placeholder="Enter custom amount"
                      value={customAmountInput}
                      onChange={(e) => handleCustomChange(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm font-semibold rounded-xl border border-content-border focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 3. Program Allocation Selector */}
              <div>
                <label className="block text-xs font-bold text-content-muted uppercase tracking-wider mb-2">
                  {t('donate.select_fund', 'Allocate Your Gift')}
                </label>
                <select
                  value={targetId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setTargetId(selectedId);
                    const matchedProj = projects.find((p) => p.id === selectedId);
                    if (matchedProj) {
                      setTargetType('project');
                      setTargetName(matchedProj.name);
                    } else {
                      const matchedCamp = campaigns.find((c) => c.id === selectedId);
                      if (matchedCamp) {
                        setTargetType('campaign');
                        setTargetName(matchedCamp.name);
                      } else {
                        setTargetType('general');
                        setTargetName('General Humanitarian Fund');
                      }
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-content-border focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none bg-white text-content-primary"
                >
                  <optgroup label="Core Projects">
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.status === 'funded' ? '100% Funded - Ongoing Support' : `${Math.round((p.amountRaisedUSD / p.fundingGoalUSD) * 100)}% Funded`})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Emergency & Seasonal Campaigns">
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="General Foundation Funds">
                    <option value="general_fund">General Humanitarian Relief Fund</option>
                  </optgroup>
                </select>
              </div>

              {/* 4. Donor Contact Information */}
              <div className="space-y-3 pt-2 border-t border-content-border">
                <span className="block text-xs font-bold text-brand-purple uppercase tracking-wider">
                  {t('donate.donor_details', 'Donor Information')}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                      {t('donate.full_name', 'Full Name')} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Thompson"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                      {t('donate.email', 'Email Address')} * (For PDF Receipt)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. david.thompson@example.com"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                      {t('donate.country', 'Country of Residence')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. India, United States, UK"
                      value={donorCountry}
                      onChange={(e) => setDonorCountry(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                      PAN / Tax ID (Optional for 80G tax benefit)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ABCDE1234F"
                      value={donorTaxId}
                      onChange={(e) => setDonorTaxId(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none uppercase font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="anonymousCheck"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="rounded text-brand-purple focus:ring-brand-purple w-4 h-4"
                  />
                  <label htmlFor="anonymousCheck" className="text-xs text-content-secondary cursor-pointer">
                    {t('donate.anonymous', 'Make this donation anonymous on public leaderboards')}
                  </label>
                </div>
              </div>

              {/* 5. Payment Gateway Selector */}
              <div className="space-y-3 pt-2 border-t border-content-border">
                <span className="block text-xs font-bold text-brand-purple uppercase tracking-wider">
                  {t('donate.payment_method', 'Select Payment Method')}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'stripe_card'
                        ? 'border-brand-purple bg-surface-highlight ring-1 ring-brand-purple'
                        : 'border-content-border hover:bg-surface-soft'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="stripe_card"
                      checked={paymentMethod === 'stripe_card'}
                      onChange={() => setPaymentMethod('stripe_card')}
                      className="hidden"
                    />
                    <CreditCard className="w-5 h-5 text-brand-purple flex-shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold text-content-primary">International Card (Stripe)</p>
                      <p className="text-[10px] text-content-muted">Visa, Mastercard, Amex, Apple Pay</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'razorpay_upi'
                        ? 'border-brand-purple bg-surface-highlight ring-1 ring-brand-purple'
                        : 'border-content-border hover:bg-surface-soft'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="razorpay_upi"
                      checked={paymentMethod === 'razorpay_upi'}
                      onChange={() => setPaymentMethod('razorpay_upi')}
                      className="hidden"
                    />
                    <Smartphone className="w-5 h-5 text-brand-pink flex-shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold text-content-primary">UPI & Netbanking (Razorpay)</p>
                      <p className="text-[10px] text-content-muted">GPay, PhonePe, Paytm, Indian Banks</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'bank_wire'
                        ? 'border-brand-purple bg-surface-highlight ring-1 ring-brand-purple'
                        : 'border-content-border hover:bg-surface-soft'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank_wire"
                      checked={paymentMethod === 'bank_wire'}
                      onChange={() => setPaymentMethod('bank_wire')}
                      className="hidden"
                    />
                    <Building className="w-5 h-5 text-brand-blue flex-shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold text-content-primary">Direct Bank Wire / NEFT</p>
                      <p className="text-[10px] text-content-muted">J&K Bank / HDFC Official Accounts</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'sandbox_card'
                        ? 'border-brand-purple bg-surface-highlight ring-1 ring-brand-purple'
                        : 'border-content-border hover:bg-surface-soft'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="sandbox_card"
                      checked={paymentMethod === 'sandbox_card'}
                      onChange={() => setPaymentMethod('sandbox_card')}
                      className="hidden"
                    />
                    <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold text-content-primary">Instant Sandbox Simulator</p>
                      <p className="text-[10px] text-content-muted">Auto-approved instant test gift</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-secondary w-full !py-3.5 text-sm sm:text-base flex items-center justify-center gap-2 shadow-pink-glow"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>{t('donate.processing', 'Processing Secure Transaction...')}</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 fill-white" />
                      <span>
                        {t('donate.submit', 'Complete Donation')} : {currentCurrency.symbol}
                        {currentConvertedAmount.toLocaleString()} {frequency !== 'one_time' ? `/${frequency}` : ''}
                      </span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-content-muted mt-3 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-brand-purple" /> 256-bit SSL Encrypted & PCI-DSS Compliant. No raw card numbers stored.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
