import { MandateDetails, DonationFrequency } from '../types';

export class MandateService {
  /**
   * Generates a new recurring e-Mandate specification for monthly or yearly auto-debit
   */
  public static generateMandate(params: {
    frequency: 'monthly' | 'yearly';
    amount: number;
    currency: string;
    donorName?: string;
    paymentMethod?: string;
  }): MandateDetails {
    const year = new Date().getFullYear();
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const randomSuffix = 1000 + (arr[0] % 9000);
    const mandateNumber = `ASJ-MND-${year}-${randomSuffix}`;
    const urn = `URN-MND-${year}-${Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()}`;

    const startDate = new Date();
    const nextDebitDate = new Date();

    if (params.frequency === 'monthly') {
      nextDebitDate.setMonth(nextDebitDate.getMonth() + 1);
    } else {
      nextDebitDate.setFullYear(nextDebitDate.getFullYear() + 1);
    }

    // Determine authorization type based on payment method
    let authType: 'upi_autopay' | 'card_mandate' | 'standing_instruction' = 'upi_autopay';
    if (params.paymentMethod?.includes('card')) {
      authType = 'card_mandate';
    } else if (params.paymentMethod === 'bank_wire' || params.paymentMethod === 'paypal') {
      authType = 'standing_instruction';
    }

    return {
      mandateNumber,
      frequency: params.frequency,
      amount: params.amount,
      currency: (params.currency || 'INR').toUpperCase(),
      maxDebitAmount: Math.ceil(params.amount * 1.2), // Standard bank mandate buffer (1.2x cap per RBI/banking guidelines)
      startDate: startDate.toISOString(),
      nextDebitDate: nextDebitDate.toISOString(),
      status: 'authorized',
      authType,
      urn,
      cancellationNoticeDays: 0, // Donors can cancel anytime instantly with 0 days penalty
    };
  }

  /**
   * Formats human-readable billing frequency description
   */
  public static getFrequencyLabel(frequency: DonationFrequency): string {
    switch (frequency) {
      case 'monthly':
        return 'Monthly Recurring Auto-Debit';
      case 'yearly':
        return 'Yearly Recurring Auto-Debit';
      default:
        return 'One-Time Contribution';
    }
  }

  /**
   * Formats the next scheduled execution date
   */
  public static formatNextDebitDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      console.debug('[ASFJK] Suppressed non-critical error:', e);
      return dateStr;
    }
  }
}
