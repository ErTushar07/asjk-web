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

    let delivered = false;

    // 1. Direct FormSubmit Mail Delivery (Reliable & Instant)
    try {
      const formSubmitRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(params.to)}`, {
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

      if (formSubmitRes.ok) {
        const json = await formSubmitRes.json();
        if (json && (json.success === true || json.success === 'true' || json.message)) {
          delivered = true;
        }
      } else {
        console.warn(`[EmailService] FormSubmit returned HTTP status ${formSubmitRes.status}`);
      }
    } catch (e: any) {
      console.warn('[EmailService] Direct FormSubmit dispatch error:', e?.message || e);
    }

    // 2. Vercel Serverless Function (/api/send-email)
    try {
      const vercelRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': import.meta.env.VITE_INTERNAL_API_SECRET || '',
        },
        body: JSON.stringify(params),
      });

      if (vercelRes.ok) {
        delivered = true;
      } else {
        console.warn(`[EmailService] /api/send-email returned HTTP status ${vercelRes.status}`);
      }
    } catch (e: any) {
      console.warn('[EmailService] /api/send-email dispatch error:', e?.message || e);
    }

    // 3. Supabase Edge Function (send-email)
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.functions.invoke('send-email', { body: params });
        if (!error && data?.success !== false) {
          delivered = true;
        } else if (error) {
          console.warn('[EmailService] Supabase send-email edge function error:', error.message);
        }
      } catch (e: any) {
        console.warn('[EmailService] Supabase send-email exception:', e?.message || e);
      }
    }

    if (delivered) {
      return { success: true };
    }

    return {
      success: false,
      error: 'Email delivery failed across all channels. Please check your inbox or contact support.',
    };
  }
}
