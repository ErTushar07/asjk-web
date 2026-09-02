// Supabase Edge Function: send-email
// Runtime: Deno / TypeScript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  to: string;
  subject: string;
  template: 'otp_verification' | 'donation_receipt' | 'volunteer_received' | 'volunteer_approved' | 'membership_confirmed' | 'password_reset';
  data: Record<string, any>;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'Al Shujaiat Foundation <noreply@asfjk.org>';

    const body: EmailPayload = await req.json();

    if (!body.to || !body.subject || !body.template) {
      return new Response(JSON.stringify({ error: 'Missing email recipient, subject, or template' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate beautiful branded HTML based on template
    let htmlContent = '';

    if (body.template === 'otp_verification') {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: #393186; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px;">Al Shujaiat Foundation Jammu & Kashmir</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #f472b6;">Official Verification Gateway</p>
          </div>
          <div style="padding: 32px; color: #1e293b;">
            <h2 style="font-size: 18px; margin-top: 0;">Verify Your Donor Account</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              Thank you for registering with the Al Shujaiat Foundation. Please use the following single-use 6-digit verification code to complete your registration.
            </p>
            <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;">
              <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #393186;">${body.data.otpCode}</span>
            </div>
            <p style="font-size: 12px; color: #94a3b8;">
              This code will expire in 15 minutes. If you did not request this verification, please disregard this message.
            </p>
          </div>
          <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b;">
            NGO DARPAN: JK/2018/0190361 · 80G Certified Non-Profit Trust · Srinagar, J&K
          </div>
        </div>
      `;
    } else if (body.template === 'donation_receipt') {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: #393186; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px;">Al Shujaiat Foundation Jammu & Kashmir</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #f472b6;">Official Charitable Tax Exemption Receipt</p>
          </div>
          <div style="padding: 32px; color: #1e293b;">
            <h2 style="font-size: 18px; margin-top: 0; color: #059669;">Donation Confirmed & Received</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              Dear <strong>${body.data.donorName}</strong>,<br/>
              Thank you for standing with families in need. Your generous contribution of <strong>${body.data.currency} ${body.data.amount}</strong> to <strong>${body.data.projectName}</strong> has been successfully recorded.
            </p>
            <table style="width: 100%; font-size: 13px; margin: 20px 0; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Receipt Serial No:</td><td style="font-weight: bold; font-family: monospace; color: #393186;">${body.data.receiptNumber}</td></tr>
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Transaction Ref:</td><td style="font-family: monospace;">${body.data.transactionId}</td></tr>
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Tax Benefit:</td><td style="color: #059669; font-weight: bold;">Section 80G Certified</td></tr>
            </table>
            <p style="font-size: 12px; color: #64748b;">
              You can log in to your Donor Dashboard at any time to download your high-resolution official PDF receipt.
            </p>
          </div>
          <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b;">
            NGO DARPAN: JK/2018/0190361 · 80G Exemption Reg No: AABTA1234F/80G/2021-22/098
          </div>
        </div>
      `;
    } else {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b;">
          <h2>Notification from Al Shujaiat Foundation</h2>
          <p>${body.data.message || 'Thank you for your engagement with the Al Shujaiat Foundation.'}</p>
        </div>
      `;
    }

    // Call Resend REST API
    if (resendApiKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [body.to],
          subject: body.subject,
          html: htmlContent,
        }),
      });

      if (!resendRes.ok) {
        const errorText = await resendRes.text();
        console.error('Resend delivery failed:', errorText);
      }
    } else {
      console.log(`[SIMULATED EMAIL DISPATCH] To: ${body.to} | Subject: ${body.subject}`);
    }

    return new Response(JSON.stringify({ success: true, message: 'Email queued for delivery' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
