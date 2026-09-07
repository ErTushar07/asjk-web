import React, { useEffect, useRef, useState } from 'react';
import { PaymentService } from '../../services/paymentService';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

interface PayPalButtonProps {
  amount: number;
  currency: string;
  description: string;
  donorName?: string;
  donorEmail?: string;
  onSuccess: (details: { orderId: string; payerId?: string; payerEmail?: string }) => void;
  onError: (errorMsg: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  currency,
  description,
  donorName,
  donorEmail,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Supported PayPal ISO currency code
  const isDirectCurrency = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(currency.toUpperCase());
  const effectiveCurrency = isDirectCurrency ? currency.toUpperCase() : 'USD';
  const effectiveAmount = isDirectCurrency ? amount : PaymentService.calculateUSD(amount, currency);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    // Hard fallback timeout: stop spinner after 10s if script or buttons hang
    const timer = setTimeout(() => {
      if (isMounted && isLoading) {
        setIsLoading(false);
        if (!containerRef.current?.children.length) {
          setLoadError('Connecting to PayPal timed out. Please verify your connection or click Retry.');
        }
      }
    }, 10000);

    const initPayPal = async () => {
      try {
        const loaded = await PaymentService.loadPayPalScript(undefined, effectiveCurrency);
        if (!isMounted) return;

        if (!loaded || !(window as any).paypal) {
          setLoadError('Unable to load PayPal checkout engine. Please check your internet connection or try again.');
          setIsLoading(false);
          return;
        }

        if (!containerRef.current) return;
        containerRef.current.innerHTML = '';

        const paypal = (window as any).paypal;

        paypal
          .Buttons({
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'pay',
              height: 44,
            },
            createOrder: (_data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [
                  {
                    description: description || 'Al Shujaiat Foundation JK Contribution',
                    amount: {
                      currency_code: effectiveCurrency,
                      value: effectiveAmount.toFixed(2),
                    },
                  },
                ],
                payer: {
                  name: donorName ? { given_name: donorName } : undefined,
                  email_address: donorEmail && donorEmail.includes('@') ? donorEmail : undefined,
                },
                application_context: {
                  brand_name: 'Al Shujaiat Foundation JK',
                  shipping_preference: 'NO_SHIPPING',
                },
              });
            },
            onApprove: async (data: any, actions: any) => {
              try {
                const details = await actions.order.capture();
                if (!isMounted) return;
                const orderId = details?.id || data?.orderID || `PAYPAL_${Date.now()}`;
                const payerEmail = details?.payer?.email_address || data?.payerID;
                onSuccess({
                  orderId,
                  payerId: data?.payerID,
                  payerEmail,
                });
              } catch (captureErr: any) {
                onError(captureErr?.message || 'Failed to capture PayPal payment authorization.');
              }
            },
            onCancel: () => {
              if (onCancel) onCancel();
            },
            onError: (err: any) => {
              console.error('PayPal button error:', err);
              onError(err?.message || 'PayPal payment authorization failed. Please try again.');
            },
          })
          .render(containerRef.current)
          .then(() => {
            if (isMounted) setIsLoading(false);
          })
          .catch((renderErr: any) => {
            console.warn('PayPal button render catch:', renderErr);
            if (isMounted) {
              setIsLoading(false);
              setLoadError('Failed to initialize PayPal buttons. Click Retry to reload.');
            }
          });
      } catch (err: any) {
        if (isMounted) {
          setIsLoading(false);
          setLoadError(err?.message || 'Failed to initialize PayPal.');
        }
      }
    };

    initPayPal();

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [effectiveAmount, effectiveCurrency, disabled, retryKey]);

  return (
    <div className="w-full space-y-2">
      {!isDirectCurrency && (
        <div className="flex items-center justify-between text-[11px] text-content-secondary bg-surface-soft px-3 py-1.5 rounded-xl border border-content-border">
          <span>Converted for Global PayPal:</span>
          <span className="font-mono font-bold text-brand-purple">
            ${effectiveAmount.toFixed(2)} USD
          </span>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-4 bg-surface-soft/80 rounded-2xl border border-content-border text-xs text-content-secondary animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-brand-purple" />
          <span>Connecting to PayPal Secure Engine...</span>
        </div>
      )}

      {loadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className="text-[11px] font-bold text-brand-purple hover:underline bg-white px-3 py-1 rounded-lg border border-brand-purple/20 shadow-xs"
          >
            ↻ Retry Connecting to PayPal
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className={`w-full transition-opacity ${isLoading || disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
      />

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-content-muted pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Official PayPal 256-bit Encrypted Global Checkout</span>
      </div>
    </div>
  );
};
