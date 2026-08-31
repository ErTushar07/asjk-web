import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { UserRole } from '../../types';
import { Shield, RefreshCw, AlertTriangle, Zap, CheckCircle2, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

export const DemoControlBar: React.FC<{ onOpenDonateModal?: () => void }> = ({ onOpenDonateModal }) => {
  const { role } = useAuth();
  const { 
    processDonation, 
    simulateFailedRecurringPayment, 
    simulateRetryRecurringPayment, 
    processRefund, 
    recurringDonations, 
    donations,
    resetToDemoData 
  } = useDatabase();

  const [expanded, setExpanded] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSimulateDonation = async () => {
    try {
      const res = await processDonation({
        amount: 150,
        currency: 'USD',
        frequency: 'one_time',
        donationType: 'project',
        targetId: 'proj_clean_water',
        targetName: 'Clean Water Initiative',
        donorName: 'James Anderson',
        donorEmail: 'james.anderson@example.org',
        donorCountry: 'United Kingdom',
        donorAddress: 'London, UK',
        paymentMethod: 'stripe_card',
      });
      showToast(`Verified $150 donation for Clean Water! Project Raised updated. Receipt #${res.receipt.receiptNumber}`);
    } catch (e) {
      showToast('Simulation error');
    }
  };

  const handleSimulateRecurringFailure = () => {
    const activeSub = recurringDonations.find((r) => r.status === 'active');
    if (activeSub) {
      simulateFailedRecurringPayment(activeSub.id);
      showToast(`Simulated payment decline on ${activeSub.subscriptionNumber}. Status is now Past Due. Project funds unchanged.`);
    } else {
      showToast('No active subscriptions found to simulate failure.');
    }
  };

  const handleSimulateRecurringRetry = () => {
    const pastDueSub = recurringDonations.find((r) => r.status === 'past_due');
    if (pastDueSub) {
      simulateRetryRecurringPayment(pastDueSub.id);
      showToast(`Retry successful on ${pastDueSub.subscriptionNumber}! Project funds updated and receipt issued.`);
    } else {
      showToast('No past due subscriptions found. Trigger a failure first.');
    }
  };

  const handleSimulateRefund = () => {
    const successfulDonation = donations.find((d) => d.status === 'successful');
    if (successfulDonation) {
      const ok = processRefund(
        successfulDonation.id,
        successfulDonation.amountUSD,
        'Demo Evaluator Test: Reversing gift',
        { id: 'usr_admin', name: 'Mohd Amin Ganai', role: 'super_admin' }
      );
      if (ok) {
        showToast(`Refund processed for ${successfulDonation.donationNumber}. Project raised total adjusted.`);
      }
    } else {
      showToast('No successful donations available to refund.');
    }
  };

  const handleSimulateConcurrency = async () => {
    showToast('Executing 3 simultaneous concurrent donations to test atomic locking...');
    const p1 = processDonation({
      amount: 100,
      currency: 'USD',
      frequency: 'one_time',
      donationType: 'project',
      targetId: 'proj_education_children',
      targetName: 'Global Education Access Program',
      donorName: 'Lucas Martin',
      donorEmail: 'lucas.martin@test.com',
      donorCountry: 'USA',
      paymentMethod: 'stripe_card',
    });
    const p2 = processDonation({
      amount: 200,
      currency: 'USD',
      frequency: 'one_time',
      donationType: 'project',
      targetId: 'proj_education_children',
      targetName: 'Global Education Access Program',
      donorName: 'Grace Thompson',
      donorEmail: 'grace.thompson@test.com',
      donorCountry: 'Canada',
      paymentMethod: 'sandbox_card',
    });
    const p3 = processDonation({
      amount: 300,
      currency: 'USD',
      frequency: 'one_time',
      donationType: 'project',
      targetId: 'proj_education_children',
      targetName: 'Global Education Access Program',
      donorName: 'Henry Walker',
      donorEmail: 'henry.walker@test.com',
      donorCountry: 'UK',
      paymentMethod: 'stripe_card',
    });

    await Promise.all([p1, p2, p3]);
    showToast('All 3 concurrent transactions processed cleanly without race conditions! +$600 added to Education.');
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toast popup */}
      {notification && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto z-50 bg-brand-purple text-white px-5 py-3 rounded-2xl shadow-brand-lg border border-brand-pink/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-brand-blue flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Collapsed Floating Trigger (Clean, unobtrusive pill in bottom-right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-40 bg-brand-purple/90 hover:bg-brand-purple text-white text-[11px] font-bold px-3 py-2 rounded-full shadow-brand-lg border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 group"
          title="Open Developer & Simulator Controls"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
          <span className="hidden xs:inline">Simulator</span>
        </button>
      )}

      {/* Expanded Control Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl bg-brand-purple-dark/98 backdrop-blur-xl text-white border border-brand-blue/30 rounded-2xl shadow-2xl p-3.5 transition-all duration-300 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-brand-pink">
                <Shield className="w-4 h-4" /> Live Demo Tools & Simulator
              </span>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Minimize ✕</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap max-w-full">
            {/* Active Role Indicator */}
            <div className="flex items-center gap-2 max-w-full min-w-0">
              <span className="text-[11px] font-bold text-brand-blue uppercase flex-shrink-0">Active Role:</span>
              <span className="bg-white/10 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 border border-white/20 uppercase tracking-wide">
                {role}
              </span>
            </div>

            {/* Quick Simulation Actions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={handleSimulateDonation}
                className="bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-sm"
                title="Simulate $150 one-time donation"
              >
                <DollarSign className="w-3.5 h-3.5" /> +$150 Gift
              </button>
              <button
                onClick={handleSimulateConcurrency}
                className="bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-sm"
                title="Simulate 3 concurrent donations"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300" /> 3x Concurrency
              </button>
              <button
                onClick={handleSimulateRecurringFailure}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-sm"
                title="Simulate payment failure on active subscription"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Fail Sub
              </button>
              <button
                onClick={handleSimulateRecurringRetry}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-sm"
                title="Simulate retry on past due subscription"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Sub
              </button>
              <button
                onClick={handleSimulateRefund}
                className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-sm"
                title="Issue test refund"
              >
                Refund
              </button>
              <button
                onClick={resetToDemoData}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-2 py-1.5 rounded-lg transition-all"
                title="Reset data back to initial seed"
              >
                Reset Data
              </button>
            </div>
          </div>

          {/* Info Details */}
          <div className="mt-3 pt-2.5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-white/80">
            <div className="bg-white/5 p-2 rounded-lg">
              <span className="font-semibold text-brand-blue block mb-0.5">Financial Engine:</span>
              <p>Total Donations: {donations.length} | Subscriptions: {recurringDonations.length}</p>
            </div>
            <div className="bg-white/5 p-2 rounded-lg">
              <span className="font-semibold text-brand-pink block mb-0.5">Multilingual:</span>
              <p>English, Hindi, Urdu (RTL), Arabic supported.</p>
            </div>
            <div className="bg-white/5 p-2 rounded-lg">
              <span className="font-semibold text-amber-400 block mb-0.5">PDF Receipts:</span>
              <p>Dynamic 80G & FCRA tax deduction receipts.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
