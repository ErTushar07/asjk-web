import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { DonationFrequency, PaymentMethod, Project, Campaign, Receipt } from '../../types';
import { MandateService } from '../../services/mandateService';
import { 
  X, Heart, Check, ShieldCheck, Download, ArrowRight, 
  CreditCard, Smartphone, Building, RefreshCw, FileText, CheckCircle2, Lock,
  Copy, AlertCircle, ExternalLink, UserPlus, Globe
} from 'lucide-react';
import { PayPalButton } from '../payment/PayPalButton';

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
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const { currentCurrency, formatOriginal, convertUSDToCurrency, convertCurrencyToUSD } = useCurrency();
  const { projects, campaigns, processDonation, settings } = useDatabase();

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

  const modalPresets = getCurrencyPresets(currentCurrency.code);

  // Form State
  const [frequency, setFrequency] = useState<DonationFrequency>('one_time');
  const [selectedLocalAmount, setSelectedLocalAmount] = useState<number>(() => modalPresets[1] || 1000);
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);
  const [customAmountInput, setCustomAmountInput] = useState<string>('');
  
  const [targetType, setTargetType] = useState<'project' | 'campaign' | 'general' | 'emergency'>('project');
  const [targetId, setTargetId] = useState<string>('');
  const [targetName, setTargetName] = useState<string>('Clean Water Initiative');

  // Donor Details
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [donorCountry, setDonorCountry] = useState<string>('India');
  const [donorTaxId, setDonorTaxId] = useState<string>('');
  const [donorAddress, setDonorAddress] = useState<string>('');
  const [anonymous, setAnonymous] = useState<boolean>(false);

  // Payment Method: Razorpay is the active gateway
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay_upi');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [hasOpenedRazorpay, setHasOpenedRazorpay] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successReceipt, setSuccessReceipt] = useState<Receipt | null>(null);
  const [pendingTransferResult, setPendingTransferResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Update preset when currency changes
  useEffect(() => {
    if (!isCustomAmount) {
      const p = getCurrencyPresets(currentCurrency.code);
      setSelectedLocalAmount(p[1] || 1000);
    }
  }, [currentCurrency.code]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

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

  const handleClose = () => {
    setErrorMsg(null);
    onClose();
  };

  // Keyboard accessibility: Close modal when pressing Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentConvertedAmount = isCustomAmount
    ? parseFloat(customAmountInput) || 0
    : selectedLocalAmount;

  // Dynamically generate e-Mandate specification when switching to monthly or yearly
  const generatedMandate = useMemo(() => {
    if (frequency === 'one_time') return null;
    return MandateService.generateMandate({
      frequency,
      amount: currentConvertedAmount,
      currency: currentCurrency.code,
      donorName: donorName.trim() || undefined,
      paymentMethod,
    });
  }, [frequency, currentConvertedAmount, currentCurrency.code, paymentMethod, donorName]);

  const handlePresetClick = (val: number) => {
    setIsCustomAmount(false);
    setSelectedLocalAmount(val);
    setCustomAmountInput('');
  };

  const handleCustomChange = (val: string) => {
    setIsCustomAmount(true);
    setCustomAmountInput(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (currentConvertedAmount <= 0) {
      setErrorMsg('Please enter a valid donation amount');
      return;
    }

    // Strict check: For Bank Wire, manual UTR reference is required
    if (paymentMethod === 'bank_wire') {
      if (!paymentReference.trim()) {
        setErrorMsg('Please enter your Bank Transfer Reference / UTR Number to confirm your donation.');
        return;
      }
      if (paymentReference.trim().length < 4) {
        setErrorMsg('Please enter a valid bank transfer UTR or transaction reference number.');
        return;
      }
    }

    if (!donorName.trim()) {
      setErrorMsg('Please enter your Full Legal Name.');
      return;
    }

    if (!donorEmail.trim() || !donorEmail.includes('@')) {
      setErrorMsg('Please enter a valid Email Address for your official tax receipt.');
      return;
    }

    if (!donorCountry.trim()) {
      setErrorMsg('Please enter your Country of Residence.');
      return;
    }

    if (!donorPhone.trim()) {
      setErrorMsg('Please enter your Phone Number.');
      return;
    }

    const effectiveDonorName = donorName.trim();
    const effectiveDonorEmail = donorEmail.trim().toLowerCase();

    setIsProcessing(true);
    try {
      const result = await processDonation({
        amount: currentConvertedAmount,
        currency: currentCurrency.code,
        frequency,
        donationType: targetType,
        targetId,
        targetName,
        donorName: effectiveDonorName,
        donorEmail: effectiveDonorEmail,
        donorPhone: donorPhone.trim() || undefined,
        donorCountry: donorCountry.trim() || 'India',
        donorTaxId: donorTaxId.trim() || undefined,
        donorAddress: donorAddress.trim() || undefined,
        anonymous,
        paymentMethod,
        paymentReference: paymentReference.trim() || undefined,
        mandateNumber: generatedMandate?.mandateNumber,
        mandate: generatedMandate || undefined,
      });

      if (result.receipt) {
        setSuccessReceipt(result.receipt);
      } else {
        setPendingTransferResult(result);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing failed. Please try another method.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalSuccess = async (paypalOrderId: string) => {
    if (!donorName.trim()) {
      setErrorMsg('Please enter your Full Legal Name.');
      return;
    }
    if (!donorEmail.trim() || !donorEmail.includes('@')) {
      setErrorMsg('Please enter a valid Email Address for your official tax receipt.');
      return;
    }
    if (!donorPhone.trim()) {
      setErrorMsg('Please enter your Phone Number.');
      return;
    }
    if (!donorCountry.trim()) {
      setErrorMsg('Please enter your Country of Residence.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const result = await processDonation({
        amount: currentConvertedAmount,
        currency: currentCurrency.code,
        frequency,
        donationType: targetType,
        targetId,
        targetName,
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim().toLowerCase(),
        donorPhone: donorPhone.trim(),
        donorCountry: donorCountry.trim(),
        donorTaxId: donorTaxId.trim() || undefined,
        donorAddress: donorAddress.trim() || undefined,
        anonymous,
        paymentMethod: 'paypal',
        paymentReference: paypalOrderId,
        mandateNumber: generatedMandate?.mandateNumber,
        mandate: generatedMandate || undefined,
      });

      if (result.receipt) {
        setSuccessReceipt(result.receipt);
      } else {
        setPendingTransferResult(result);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'PayPal transaction recording failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (successReceipt) {
      const { ReceiptService } = await import('../../services/receiptService');
      await ReceiptService.downloadReceipt(successReceipt, settings);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* Outer Modal Container: Keeps close button pinned at top-right even when scrolling modal content */}
      <div className="relative max-w-2xl w-full">
        {/* Pinned Close Button */}
        <button
          type="button"
          id="btn-close-donation-modal"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClose();
          }}
          aria-label="Close donation modal"
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white text-gray-800 hover:text-black hover:bg-gray-100 shadow-2xl border border-white/60 flex items-center justify-center transition-all duration-150 transform hover:scale-110 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-pink"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="donation-modal-title"
          className="bg-white rounded-3xl shadow-2xl w-full max-h-[90vh] overflow-y-auto border border-content-border relative animate-fadeIn"
        >
          {/* Modal Header */}
          <div className="bg-brand-purple text-white p-6 sm:p-8 pr-16 rounded-t-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-pink/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-brand-blue border border-white/15 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-pink" /> {t('donate.tax_deductible', '100% Tax Deductible (80G / 501c3)')}
              </span>
              <h3 id="donation-modal-title" className="text-xl sm:text-2xl font-extrabold tracking-tight">
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
                {successReceipt.mandateNumber && (
                  <div className="flex justify-between items-center bg-brand-purple/10 p-2 rounded-lg border border-brand-purple/20">
                    <span className="text-brand-purple font-bold text-[11px]">⚡ Active e-Mandate:</span>
                    <span className="font-mono font-bold text-brand-purple text-[11px]">
                      {successReceipt.mandateNumber}
                    </span>
                  </div>
                )}
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

              {/* Guest account creation prompt to permanently link donations */}
              {!user && onNavigate && (
                <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2.5 mt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center flex-shrink-0 mt-0.5">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-content-primary">Save This Donation to Your Donor Account</p>
                      <p className="text-[11px] text-content-secondary mt-0.5">
                        Create an account with <span className="font-semibold text-brand-purple">{donorEmail || 'your email'}</span> to permanently link this donation, download 80G tax certificates anytime, and view your complete contribution history.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate(`/register?email=${encodeURIComponent(donorEmail)}&name=${encodeURIComponent(donorName)}`);
                    }}
                    className="btn-primary w-full !py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Donor Account & Link Past Donations</span>
                  </button>
                </div>
              )}
            </div>
          ) : pendingTransferResult ? (
            /* Pending Bank Transfer View */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-2xl font-extrabold text-content-primary">
                  Bank Transfer Reference Submitted!
                </h4>
                <p className="text-content-secondary text-sm max-w-md mx-auto mt-2">
                  Your pledge has been registered and is pending reconciliation with our statutory bank statement.
                </p>
              </div>

              <div className="bg-surface-soft border border-content-border rounded-2xl p-5 text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-content-muted">Bank UTR / Ref:</span>
                  <span className="font-bold text-brand-purple font-mono">{pendingTransferResult.payment?.transactionId || paymentReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">Amount Pledged:</span>
                  <span className="font-bold text-brand-pink text-sm">
                    {currentCurrency.symbol}{currentConvertedAmount.toLocaleString()} {currentCurrency.code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">Verification Status:</span>
                  <span className="font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                    Pending Bank Clearance
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">Allocated to:</span>
                  <span className="font-medium text-content-primary truncate max-w-[200px]">{targetName}</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs max-w-md mx-auto text-left leading-relaxed">
                <p className="font-bold mb-1">📋 Section 80G Tax Receipt Notice:</p>
                <p className="text-[11px] text-amber-800">
                  Because bank wire transfers require manual reconciliation, our accounts desk will verify the credit in our J&K Bank account. Your official Section 80G tax receipt will be issued and emailed to <strong className="underline">{donorEmail}</strong> within 24–48 business hours.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Done</span>
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
                    <span>Go to Donor Dashboard</span>
                  </button>
                )}
              </div>

              {/* Guest account creation prompt for bank transfer */}
              {!user && onNavigate && (
                <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2.5 mt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center flex-shrink-0 mt-0.5">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-content-primary">Save This Donation to Your Donor Account</p>
                      <p className="text-[11px] text-content-secondary mt-0.5">
                        Create an account with <span className="font-semibold text-brand-purple">{donorEmail || 'your email'}</span> so this pledge and your future receipts appear automatically in your donor portal.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate(`/register?email=${encodeURIComponent(donorEmail)}&name=${encodeURIComponent(donorName)}`);
                    }}
                    className="btn-primary w-full !py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Donor Account & Link Past Donations</span>
                  </button>
                </div>
              )}
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

                {/* Generated e-Mandate Summary Card */}
                {generatedMandate && (
                  <div className="mt-3 p-3.5 rounded-xl bg-brand-purple/5 border border-brand-purple/20 space-y-2.5 text-xs animate-fadeIn">
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide bg-brand-purple text-white">
                          ⚡ e-Mandate Generated
                        </span>
                        <span className="font-mono font-bold text-brand-purple text-[11px]">
                          {generatedMandate.mandateNumber}
                        </span>
                      </div>
                      <span className="text-[10px] text-content-muted font-mono">
                        {generatedMandate.urn}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-white/90 p-2 rounded-lg border border-brand-purple/10">
                        <div className="text-[9px] uppercase font-bold text-content-muted">Frequency</div>
                        <div className="font-bold text-content-primary">
                          {frequency === 'monthly' ? 'Monthly Auto-Debit' : 'Annual Auto-Debit'}
                        </div>
                      </div>
                      <div className="bg-white/90 p-2 rounded-lg border border-brand-purple/10">
                        <div className="text-[9px] uppercase font-bold text-content-muted">Next Scheduled Debit</div>
                        <div className="font-bold text-content-primary">
                          {MandateService.formatNextDebitDate(generatedMandate.nextDebitDate)}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-content-muted leading-tight flex items-start gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>
                        Authorizes an automated recurring debit of {currentCurrency.symbol}{currentConvertedAmount.toLocaleString()} per {frequency === 'monthly' ? 'month' : 'year'}. Modify or cancel anytime with zero penalty.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Amount Presets */}
              <div>
                <label className="block text-xs font-bold text-content-muted uppercase tracking-wider mb-2">
                  {t('donate.select_amount', 'Select Donation Amount')} ({currentCurrency.code})
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {modalPresets.map((presetAmt) => {
                    const isSelected = !isCustomAmount && selectedLocalAmount === presetAmt;
                    return (
                      <button
                        type="button"
                        key={presetAmt}
                        onClick={() => handlePresetClick(presetAmt)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-brand-pink text-white border-brand-pink shadow-pink-glow'
                            : 'bg-white border-content-border text-content-primary hover:border-brand-purple/40 hover:bg-surface-soft'
                        }`}
                      >
                        {currentCurrency.symbol}{presetAmt.toLocaleString()}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomAmount(true);
                      setCustomAmountInput(currentConvertedAmount ? currentConvertedAmount.toString() : '');
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
                      placeholder={`Enter custom amount in ${currentCurrency.code} (${currentCurrency.symbol})`}
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
                  <optgroup label={t('General Foundation Funds', 'General Foundation Funds')}>
                    <option value="general_fund">
                      {t('donate.general_relief_fund', 'General Humanitarian Relief Fund')}
                    </option>
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
                      {t('donate.full_name', 'Full Legal Name')} <span className="text-brand-purple font-bold">*</span>
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
                      {t('donate.email', 'Email Address')} <span className="text-brand-purple font-bold">*</span> <span className="text-[10px] text-content-muted font-normal">({t('For PDF Receipt', 'For PDF Receipt')})</span>
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
                      {t('donate.phone', 'Phone Number')} <span className="text-brand-purple font-bold">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 94190 12345"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                      {t('donate.country', 'Country of Residence')} <span className="text-brand-purple font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. India, United States, UK"
                      value={donorCountry}
                      onChange={(e) => setDonorCountry(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                    {t('donate.tax_id_label', 'PAN / Tax ID (Optional for 80G tax benefit)')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ABCDE1234F"
                    value={donorTaxId}
                    onChange={(e) => setDonorTaxId(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-content-border focus:border-brand-purple outline-none uppercase font-mono"
                  />
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

                <div className="space-y-2.5">
                  {/* Razorpay (Active Gateway) */}
                  <label
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'razorpay_upi'
                        ? 'border-brand-purple bg-surface-highlight ring-2 ring-brand-purple/20'
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
                    <div className="w-9 h-9 rounded-xl bg-brand-pink/10 text-brand-pink flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-content-primary">
                          {t('donate.upi_razorpay', 'UPI, Cards & Netbanking (Razorpay Gateway)')}
                        </p>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Active & Instant
                        </span>
                      </div>
                      <p className="text-[11px] text-content-secondary mt-0.5">
                        Instant contribution via GPay, PhonePe, Paytm, Visa, Mastercard, RuPay & all Indian banks.
                      </p>
                    </div>
                  </label>

                  {/* PayPal (Active Gateway) */}
                  <label
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'paypal'
                        ? 'border-brand-purple bg-surface-highlight ring-2 ring-brand-purple/20'
                        : 'border-content-border hover:bg-surface-soft'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="hidden"
                    />
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-content-primary">
                          {t('donate.paypal_global', 'PayPal & International Cards')}
                        </p>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Active & Instant
                        </span>
                      </div>
                      <p className="text-[11px] text-content-secondary mt-0.5">
                        Global contribution via PayPal balance, International Debit & Credit Cards (Visa, Mastercard, Amex).
                      </p>
                    </div>
                  </label>

                  {/* Direct Bank Wire */}
                  <label
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'bank_wire'
                        ? 'border-brand-purple bg-surface-highlight ring-2 ring-brand-purple/20'
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
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
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
                        Transfer directly to statutory foundation bank account. Reconciled before receipt issuance.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Bank Account Details Box when Bank Wire selected in Modal */}
                {paymentMethod === 'bank_wire' && (
                  <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-surface-soft border border-brand-purple/20 space-y-2.5 animate-fadeIn">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] text-content-muted block">
                          {t('donate.beneficiary_name', 'Beneficiary Name')}
                        </span>
                        <span className="font-bold text-content-primary">{settings.bankDetails?.accountName || 'M/S AL-SHUJAIAT FOUNDATION JAMMU & KASHMIR'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-content-muted block">
                          {t('donate.bank_branch', 'Bank & Branch')}
                        </span>
                        <span className="font-bold text-content-primary">{settings.bankDetails?.bankName || 'Axis Bank Ltd'} ({settings.bankDetails?.branch || 'Larikpora, Awantipora, Pulwama'})</span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-content-muted">
                            {t('donate.account_number', 'Account Number')} ({settings.bankDetails?.accountType || 'Savings A/C'})
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(settings.bankDetails?.accountNumber || '925010008902563', 'modal_acc')}
                            className="text-[10px] text-brand-purple hover:underline flex items-center gap-1 font-bold"
                          >
                            {copiedKey === 'modal_acc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            {copiedKey === 'modal_acc' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <span className="font-mono font-bold text-xs text-brand-purple" dir="ltr">{settings.bankDetails?.accountNumber || '925010008902563'}</span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-content-muted">
                            {t('donate.ifsc_code', 'IFSC Code')}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(settings.bankDetails?.ifscCode || 'UTIB0002378', 'modal_ifsc')}
                            className="text-[10px] text-brand-purple hover:underline flex items-center gap-1 font-bold"
                          >
                            {copiedKey === 'modal_ifsc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            {copiedKey === 'modal_ifsc' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <span className="font-mono font-bold text-xs text-brand-purple" dir="ltr">{settings.bankDetails?.ifscCode || 'UTIB0002378'}</span>
                      </div>
                      {/* Bank Transfer Reference Input in Modal */}
                      <div className="sm:col-span-2 pt-2 border-t border-content-border space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold text-content-primary">
                            {t('donate.bank_wire_ref_label', 'Bank Transfer Reference / UTR Number *')}
                          </label>
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
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
                            if (errorMsg) setErrorMsg(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs font-mono font-bold text-brand-purple rounded-lg border border-content-border focus:border-brand-purple outline-none bg-white"
                        />
                        <p className="text-[9px] text-content-muted">
                          💡 Enter the 12-digit reference/UTR number from your bank transfer. Our finance desk verifies bank deposits daily and will email your Section 80G tax receipt.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button or PayPal Engine */}
              <div className="pt-4">
                {errorMsg && (
                  <div className="mb-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                    <X className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {paymentMethod === 'paypal' ? (
                  <div className="space-y-3">
                    {(!donorName.trim() || !donorEmail.trim() || !donorPhone.trim() || !donorCountry.trim()) && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                        ⚠️ Please ensure your Full Name, Email, Phone, and Country are filled above to activate PayPal checkout.
                      </p>
                    )}
                    <PayPalButton
                      amount={currentConvertedAmount}
                      currency={currentCurrency.code}
                      description={`Donation to ${targetName}`}
                      donorName={donorName.trim()}
                      donorEmail={donorEmail.trim()}
                      disabled={isProcessing || !donorName.trim() || !donorEmail.trim() || !donorPhone.trim() || !donorCountry.trim()}
                      onSuccess={async ({ orderId }) => {
                        await handlePayPalSuccess(orderId);
                      }}
                      onError={(err) => setErrorMsg(err)}
                    />
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="btn-secondary w-full !py-3.5 text-sm sm:text-base flex items-center justify-center gap-2 shadow-pink-glow disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>
                          {paymentMethod === 'razorpay_upi'
                            ? 'Opening Razorpay & Verifying...'
                            : t('donate.processing', 'Processing Secure Transaction...')}
                        </span>
                      </>
                    ) : paymentMethod === 'razorpay_upi' ? (
                      <>
                        <Smartphone className="w-4 h-4 text-brand-pink" />
                        <span>
                          {frequency !== 'one_time'
                            ? `Authorize ${frequency === 'monthly' ? 'Monthly' : 'Yearly'} Mandate : ${currentCurrency.symbol}${currentConvertedAmount.toLocaleString()}`
                            : `Proceed to Pay & Verify : ${currentCurrency.symbol}${currentConvertedAmount.toLocaleString()}`}
                        </span>
                      </>
                    ) : paymentMethod === 'bank_wire' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                        <span>
                          {frequency !== 'one_time'
                            ? `Submit ${frequency === 'monthly' ? 'Monthly' : 'Yearly'} Wire Mandate for Reconciliation`
                            : 'Submit Transfer for Accounting Reconciliation'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5 fill-white" />
                        <span>
                          {frequency !== 'one_time'
                            ? `Authorize ${frequency === 'monthly' ? 'Monthly' : 'Yearly'} Mandate : ${currentCurrency.symbol}${currentConvertedAmount.toLocaleString()}`
                            : `${t('donate.submit', 'Complete Donation')} : ${currentCurrency.symbol}${currentConvertedAmount.toLocaleString()}`}
                        </span>
                      </>
                    )}
                  </button>
                )}

                <p className="text-center text-[11px] text-content-muted mt-3 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-brand-purple" /> 256-bit SSL Encrypted & PCI-DSS Compliant. No raw card numbers stored.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  </div>
);
};
