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
    let delivered = false;

    // 1. Primary: Vercel Serverless Function (/api/send-email) with rich branded HTML templates
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
        const resJson = await vercelRes.json().catch(() => ({}));
        if (resJson && resJson.success !== false) {
          delivered = true;
          return { success: true };
        }
      } else {
        console.warn(`[EmailService] /api/send-email returned HTTP status ${vercelRes.status}`);
      }
    } catch (e: any) {
      console.warn('[EmailService] /api/send-email dispatch error:', e?.message || e);
    }

    // 2. Secondary: Supabase Edge Function (send-email)
    if (!delivered && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.functions.invoke('send-email', { body: params });
        if (!error && data?.success !== false) {
          delivered = true;
          return { success: true };
        } else if (error) {
          console.warn('[EmailService] Supabase send-email edge function error:', error.message);
        }
      } catch (e: any) {
        console.warn('[EmailService] Supabase send-email exception:', e?.message || e);
      }
    }

    // 3. Fallback: Template-aware Direct FormSubmit Delivery
    if (!delivered) {
      try {
        const otpCode = params.data?.otpCode || params.data?.resetCode || '';
        const name = params.data?.donorName || params.data?.name || 'Valued Supporter';
        const isPasswordReset = params.template === 'password_reset';
        const isDonationReceipt = params.template === 'donation_receipt';
        const isMembership = params.template === 'membership_confirmed';

        let formBody: Record<string, any> = {
          _subject: params.subject || `[ASFJK] Official Notification`,
          _template: 'box',
          _captcha: 'false',
          Recipient_Name: name,
        };

        if (isDonationReceipt) {
          formBody = {
            ...formBody,
            _subject: params.subject || `[ASFJK] Tax Donation Receipt - ${params.data?.receiptNumber || 'Confirmed'}`,
            Receipt_Number: params.data?.receiptNumber || 'Confirmed',
            Donation_Amount: `${params.data?.currency || 'INR'} ${params.data?.amount || ''}`,
            Allocated_Program: params.data?.projectName || 'General Humanitarian Fund',
            Transaction_Reference: params.data?.transactionId || 'Confirmed',
            Tax_Status: '100% Tax Deductible (Section 80G Certified Non-Profit Trust)',
            Important_Note: 'Thank you for your generous contribution. Please retain this confirmation for your tax records.',
          };
        } else if (isMembership) {
          formBody = {
            ...formBody,
            _subject: params.subject || `[ASFJK] Membership Confirmed - ${params.data?.membershipNumber || 'Welcome'}`,
            Membership_Tier: params.data?.tierName || 'Foundation Member',
            Membership_Number: params.data?.membershipNumber || 'Issued',
            Valid_Thru: params.data?.validThru || '1 Year',
            Contribution: `${params.data?.currency || 'INR'} ${params.data?.totalContribution || ''}`,
          };
        } else {
          formBody = {
            ...formBody,
            _subject: isPasswordReset
              ? `[ASFJK] Your Password Reset Code is ${otpCode}`
              : `[ASFJK] Your Donor Verification Code is ${otpCode}`,
            Action_Required: isPasswordReset ? 'Password Reset Verification' : 'Donor Account Verification',
            Verification_Code: otpCode,
            Important_Instructions: isPasswordReset
              ? `Your single-use 6-digit password reset code is ${otpCode}. Enter this code on asfjk.org/forgot-password along with your new password to restore your account access. Valid for 15 minutes.`
              : `Your single-use 6-digit verification code is ${otpCode}. Please enter this code on asfjk.org/register to activate your donor account. Valid for 15 minutes.`,
          };
        }

        const formSubmitRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(params.to)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(formBody),
        });

        if (formSubmitRes.ok) {
          const json = await formSubmitRes.json().catch(() => ({}));
          if (json && (json.success === true || json.success === 'true' || json.message)) {
            delivered = true;
          }
        }
      } catch (e: any) {
        console.warn('[EmailService] Direct FormSubmit fallback error:', e?.message || e);
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
