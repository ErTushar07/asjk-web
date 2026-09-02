import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { 
  RefreshCw, Pause, Play, XCircle, ArrowLeft, 
  Calendar, CheckCircle2, AlertTriangle, ShieldCheck 
} from 'lucide-react';

export const MyRecurringPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  usePageMeta('Recurring Subscriptions', undefined, { noindex: true });
  const { user } = useAuth();
  const { recurringDonations, updateRecurringStatus, simulateRetryRecurringPayment } = useDatabase();
  const { formatUSD } = useCurrency();

  const donorEmail = (user?.email || '').toLowerCase().trim();
  const userRecurring = recurringDonations.filter(
    (r) => r.donorEmail.toLowerCase().trim() === donorEmail
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <button
          onClick={() => onNavigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-content-secondary hover:text-brand-purple mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          My Recurring Donation Plans
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-1">
          Manage your continuous monthly and annual subscriptions. You have complete control to pause, resume, or cancel at any time.
        </p>
      </div>

      {userRecurring.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-content-border text-center space-y-4 shadow-brand-sm">
          <RefreshCw className="w-12 h-12 text-content-muted mx-auto" />
          <h3 className="text-lg font-bold text-content-primary">No Active Recurring Subscriptions</h3>
          <p className="text-xs text-content-secondary max-w-sm mx-auto">
            Become a regular sustaining donor by choosing a monthly or yearly plan on any project.
          </p>
          <button onClick={() => onNavigate('/projects')} className="btn-primary !py-2.5 !px-5 text-xs font-bold">
            Explore Projects
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userRecurring.map((sub) => {
            const isActive = sub.status === 'active';
            const isPaused = sub.status === 'paused';
            const isPastDue = sub.status === 'past_due' || sub.status === 'payment_failed';
            const isCancelled = sub.status === 'cancelled';

            return (
              <div
                key={sub.id}
                className="bg-white rounded-3xl border border-content-border p-6 sm:p-7 shadow-brand-sm space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-brand-purple block">
                        {sub.subscriptionNumber}
                      </span>
                      <h3 className="text-lg font-extrabold text-content-primary mt-0.5">
                        {sub.projectName}
                      </h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : isPaused
                          ? 'bg-amber-100 text-amber-700'
                          : isPastDue
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-content-border text-content-muted'
                      }`}
                    >
                      {sub.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Financial Details */}
                  <div className="bg-surface-soft p-4 rounded-2xl border border-content-border/60 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-content-muted">Committed Amount:</span>
                      <span className="font-bold text-brand-pink text-sm">
                        {sub.currency} {sub.amount.toLocaleString()} / {sub.frequency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-content-muted">Payment Method:</span>
                      <span className="font-medium text-content-primary">{sub.paymentMethodRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-content-muted">Total Donated to Date:</span>
                      <span className="font-bold text-brand-purple">
                        {formatUSD(sub.totalCollectedUSD)} ({sub.successfulPaymentCount} billing cycles)
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-content-border/40">
                      <span className="text-content-muted">Next Scheduled Billing:</span>
                      <span className="font-semibold text-content-primary">
                        {new Date(sub.nextPaymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {isPastDue && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>Last payment attempt declined by provider.</span>
                      </div>
                      <button
                        onClick={() => simulateRetryRecurringPayment(sub.id)}
                        className="bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
                      >
                        Retry Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Subscription Action Controls */}
                <div className="pt-3 border-t border-content-border flex items-center justify-between gap-2">
                  {isActive && (
                    <button
                      onClick={() => updateRecurringStatus(sub.id, 'paused')}
                      className="btn-outline !py-2 !px-3 text-xs font-bold flex items-center gap-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Subscription</span>
                    </button>
                  )}

                  {isPaused && (
                    <button
                      onClick={() => updateRecurringStatus(sub.id, 'active')}
                      className="btn-primary !py-2 !px-3 text-xs font-bold flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume Subscription</span>
                    </button>
                  )}

                  {!isCancelled && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to cancel ${sub.subscriptionNumber}?`)) {
                          updateRecurringStatus(sub.id, 'cancelled');
                        }
                      }}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 px-3 py-2"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}

                  {isCancelled && (
                    <span className="text-xs text-content-muted italic">Cancelled on {new Date(sub.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
