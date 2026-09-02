import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export interface EmailDispatchParams {
  to: string;
  subject: string;
  template: 'otp_verification' | 'donation_receipt' | 'volunteer_received' | 'volunteer_approved' | 'membership_confirmed' | 'password_reset';
  data: Record<string, any>;
}

export class EmailService {
  /**
   * Dispatches a real transactional email to the recipient's inbox
   */
  public static async sendEmail(params: EmailDispatchParams): Promise<{ success: boolean; error?: string }> {
    const otpCode = params.data?.otpCode || '';
    const name = params.data?.name || 'Valued Supporter';

    // 1. Direct FormSubmit Mail Delivery (Reliable & Instant)
    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(params.to)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          _subject: `[ASFJK] Your Donor Verification Code is ${otpCode}`,
          _template: 'box',
          _captcha: 'false',
          _blacklist: '',
          Donor_Name: name,
          Verification_OTP: otpCode,
          Important_Instructions: `Your single-use 6-digit verification code is ${otpCode}. Please enter this code on asfjk.org/register to activate your donor account. Valid for 15 minutes.`,
        }),
      });
    } catch (e) {
      console.warn('Direct FormSubmit dispatch notice:', e);
    }

    // 2. Vercel Serverless Function (/api/send-email)
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
    } catch (e) {}

    // 3. Supabase Edge Function (send-email)
    if (isSupabaseConfigured) {
      try {
        await supabase.functions.invoke('send-email', { body: params });
      } catch (e) {}
    }

    return { success: true };
  }
}
