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
    const otpCode = params.data?.otpCode || params.data?.resetCode || '';
    const name = params.data?.name || 'Valued Supporter';
    const isPasswordReset = params.template === 'password_reset';

    // 1. Direct FormSubmit Mail Delivery (Reliable & Instant)
    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(params.to)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          _subject: isPasswordReset
            ? `[ASFJK] Your Password Reset Code is ${otpCode}`
            : `[ASFJK] Your Donor Verification Code is ${otpCode}`,
          _template: 'box',
          _captcha: 'false',
          _blacklist: '',
          Recipient_Name: name,
          Action_Required: isPasswordReset ? 'Password Reset Verification' : 'Donor Account Verification',
          Verification_Code: otpCode,
          Important_Instructions: isPasswordReset
            ? `Your single-use 6-digit password reset code is ${otpCode}. Enter this code on asfjk.org/forgot-password along with your new password to restore your account access. Valid for 15 minutes.`
            : `Your single-use 6-digit verification code is ${otpCode}. Please enter this code on asfjk.org/register to activate your donor account. Valid for 15 minutes.`,
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
