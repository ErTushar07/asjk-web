// Vercel Serverless Function: /api/send-email
// Universal transactional email dispatch engine for all public recipients

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, template, data } = req.body || {};

    if (!to || !subject) {
      return res.status(400).json({ error: 'Missing required parameters: to, subject' });
    }

    const otpCode = data?.otpCode || '';
    const name = data?.name || 'Valued Supporter';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"/></head>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:40px 10px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                <tr>
                  <td style="background:#393186;padding:28px 24px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">AL SHUJAIAT FOUNDATION</h1>
                    <p style="margin:4px 0 0;color:#f472b6;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Jammu & Kashmir · Verification Gateway</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:36px 32px;color:#1e293b;">
                    <h2 style="margin:0 0 12px;color:#1e293b;font-size:18px;font-weight:800;">Verify Your Donor Account</h2>
                    <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
                      Hello <strong>${name}</strong>,<br/>
                      Thank you for standing with families across Jammu & Kashmir. Please enter the following single-use 6-digit verification code to activate your donor account:
                    </p>
                    
                    <div style="background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:14px;padding:22px;text-align:center;margin:28px 0;">
                      <span style="font-family:'Courier New',Courier,monospace;font-size:40px;font-weight:900;letter-spacing:12px;color:#393186;display:inline-block;padding-left:12px;">${otpCode}</span>
                    </div>
                    
                    <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
                      ⏱️ This verification code is single-use and will expire in <strong>15 minutes</strong>.<br/>
                      If you did not request this verification, please disregard this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px;text-align:center;font-size:11px;color:#64748b;line-height:1.5;">
                    <strong>Al Shujaiat Foundation Jammu & Kashmir (ASFJK)</strong><br/>
                    NGO-DARPAN: JK/2018/0190361 · 80G Certified Non-Profit Trust<br/>
                    Srinagar, Jammu & Kashmir 190001 · <a href="https://asfjk.org" style="color:#393186;text-decoration:none;font-weight:bold;">asfjk.org</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 1. Primary Outbound Provider: Resend REST API (Direct to ANY Email Address)
    const resendApiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const fromAddress = process.env.RESEND_FROM_EMAIL || 'Al Shujaiat Foundation <onboarding@resend.dev>';
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [to],
            subject: `[ASFJK] Verify Your Donor Account - Code: ${otpCode}`,
            html: htmlContent,
          }),
        });

        const resData = await resendRes.json();
        if (resendRes.ok) {
          return res.status(200).json({ success: true, provider: 'resend', id: resData.id });
        } else {
          console.error('Resend API error response:', resData);
        }
      } catch (e: any) {
        console.warn('Resend provider error:', e.message);
      }
    }

    // 2. SMTP Provider (Gmail / Custom Mail Server)
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (smtpHost && smtpUser && smtpPass) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || `"Al Shujaiat Foundation" <${smtpUser}>`,
          to: to,
          subject: `[ASFJK] Verify Your Donor Account - Code: ${otpCode}`,
          html: htmlContent,
        });

        return res.status(200).json({ success: true, provider: 'smtp', id: info.messageId });
      } catch (e: any) {
        console.warn('SMTP provider error:', e.message);
      }
    }

    // 3. Fallback: FormSubmit
    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://asfjk.org',
          'Referer': 'https://asfjk.org/register',
        },
        body: JSON.stringify({
          _subject: `[ASFJK] Your Donor Verification Code is ${otpCode}`,
          _template: 'box',
          _captcha: 'false',
          Donor_Name: name,
          Verification_OTP: otpCode,
          Instructions: `Your single-use 6-digit verification code is ${otpCode}. Enter this code on asfjk.org/register to activate your donor account.`,
        }),
      });
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Email dispatch initiated.',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Email delivery failed' });
  }
}
