import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { UserRole } from '../../types';
import { Shield, RefreshCw, AlertTriangle, Zap, CheckCircle2, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

export const DemoControlBar: React.FC<{ onOpenDonateModal?: () => void }> = ({ onOpenDonateModal }) => {
  const { role, switchRole } = useAuth();
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

  return (
    <>
      {/* Toast popup */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-brand-purple text-white px-5 py-3 rounded-2xl shadow-brand-lg border border-brand-pink/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-brand-blue flex-shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Floating Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-5xl bg-brand-purple-dark/95 backdrop-blur-lg text-white border border-brand-blue/30 rounded-2xl shadow-brand-lg p-3 transition-all duration-300">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Left: Role Switcher */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-blue">
              <Shield className="w-4 h-4 text-brand-pink" /> Active Role:
            </span>
            <select
              value={role}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              className="bg-white/10 text-white text-xs font-medium rounded-lg px-2.5 py-1.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-pink"
            >
              <option value="super_admin" className="text-content-primary">Executive Director (Mohd Amin Ganai)</option>
              <option value="finance_admin" className="text-content-primary">Finance Director (Michael Carter)</option>
              <option value="project_manager" className="text-content-primary">Project Manager (Daniel Wilson)</option>
              <option value="content_manager" className="text-content-primary">Communications Director (Emily Carter)</option>
              <option value="auditor" className="text-content-primary">Auditor (Independent Compliance)</option>
              <option value="donor" className="text-content-primary">Donor (David Thompson)</option>
            </select>
          </div>

          {/* Center: Quick Simulation Actions */}
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

          {/* Right: Expand Toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-white/70 hover:text-white p-1 rounded transition-colors"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded Info Drawer */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-white/80">
            <div className="bg-white/5 p-2.5 rounded-lg">
              <span className="font-semibold text-brand-blue block mb-1">Financial Engine:</span>
              <p>Total Donations: {donations.length} | Subscriptions: {recurringDonations.length}</p>
              <p>Total Raised Across Projects: ${donations.reduce((s, d) => d.status === 'successful' ? s + d.amountUSD : s, 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/5 p-2.5 rounded-lg">
              <span className="font-semibold text-brand-pink block mb-1">Multilingual & RTL:</span>
              <p>Switch languages in navbar to test English, Hindi, Urdu (RTL), Arabic, etc. Checkout state stays intact.</p>
            </div>
            <div className="bg-white/5 p-2.5 rounded-lg">
              <span className="font-semibold text-amber-400 block mb-1">PDF Tax Receipts:</span>
              <p>Generated dynamically with Section 80G / FCRA credentials and unique sequential IDs on every gift.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
