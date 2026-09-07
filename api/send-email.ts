// Vercel Serverless Function: /api/send-email
// Universal transactional email dispatch engine for all public recipients

interface EmailPayloadData {
  name?: string;
  donorName?: string;
  otpCode?: string;
  resetCode?: string;
  amount?: number | string;
  currency?: string;
  projectName?: string;
  receiptNumber?: string;
  transactionId?: string;
  donationDate?: string;
  applicationId?: string;
  membershipNumber?: string;
  validFrom?: string;
  validThru?: string;
  roleDesignation?: string;
  tier?: string;
  tierName?: string;
  totalContribution?: number | string;
  [key: string]: any;
}

function buildEmailHtml(template: string, data: EmailPayloadData): { html: string; defaultSubject: string } {
  const headerHtml = `
    <tr>
      <td style="background:#393186;padding:28px 24px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">AL SHUJAIAT FOUNDATION</h1>
        <p style="margin:4px 0 0;color:#f472b6;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Jammu & Kashmir · Official Humanitarian Gateway</p>
      </td>
    </tr>
  `;

  const footerHtml = `
    <tr>
      <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px;text-align:center;font-size:11px;color:#64748b;line-height:1.5;">
        <strong>Al Shujaiat Foundation Jammu & Kashmir (ASFJK)</strong><br/>
        NGO-DARPAN: JK/2018/0190361 · Section 12A & 80G Certified Non-Profit Trust<br/>
        Srinagar, Jammu & Kashmir 190001 · <a href="https://asfjk.org" style="color:#393186;text-decoration:none;font-weight:bold;">asfjk.org</a>
      </td>
    </tr>
  `;

  const wrapLayout = (bodyContent: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 12px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
              ${headerHtml}
              <tr>
                <td style="padding:32px 28px;color:#1e293b;">
                  ${bodyContent}
                </td>
              </tr>
              ${footerHtml}
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  switch (template) {
    case 'password_reset': {
      const name = data.name || 'Valued Supporter';
      const code = data.resetCode || data.otpCode || '';
      const subject = `[ASFJK] Password Reset Request - Code: ${code}`;
      const body = `
        <h2 style="margin:0 0 12px;color:#1e293b;font-size:18px;font-weight:800;">Password Reset Verification</h2>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">
          Hello <strong>${name}</strong>,<br/>
          We received a request to reset your password for your Al Shujaiat Foundation account. Use the following verification code to complete the process:
        </p>
        <div style="background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:14px;padding:20px;text-align:center;margin:24px 0;">
          <span style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:900;letter-spacing:10px;color:#393186;display:inline-block;padding-left:10px;">${code}</span>
        </div>
        <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
          ⏱️ This reset code will expire in <strong>15 minutes</strong>.<br/>
          If you did not request this password reset, your account is secure and you can safely disregard this email.
        </p>
      `;
      return { html: wrapLayout(body), defaultSubject: subject };
    }

    case 'donation_receipt': {
      const donorName = data.donorName || data.name || 'Generous Donor';
      const amount = data.amount || '0';
      const currency = data.currency || 'USD';
      const projectName = data.projectName || 'General Humanitarian Fund';
      const receiptNumber = data.receiptNumber || 'N/A';
      const transactionId = data.transactionId || 'N/A';
      const donationDate = data.donationDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const subject = `[ASFJK] Tax Donation Receipt - ${receiptNumber}`;

      const body = `
        <h2 style="margin:0 0 8px;color:#1e293b;font-size:18px;font-weight:800;">Official Tax Donation Receipt</h2>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">
          Dear <strong>${donorName}</strong>,<br/>
          On behalf of the communities we serve across Jammu & Kashmir, thank you deeply for your generous contribution. Your gift brings critical relief, clean water, education, and medical support to families in urgent need.
        </p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin:22px 0;">
          <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size:13px;color:#334155;">
            <tr>
              <td style="color:#64748b;width:40%;">Receipt Number:</td>
              <td style="font-weight:bold;color:#1e293b;">${receiptNumber}</td>
            </tr>
            <tr>
              <td style="color:#64748b;">Contribution Amount:</td>
              <td style="font-weight:800;color:#393186;font-size:15px;">${currency} ${amount}</td>
            </tr>
            <tr>
              <td style="color:#64748b;">Supported Program:</td>
              <td style="font-weight:bold;color:#1e293b;">${projectName}</td>
            </tr>
            <tr>
              <td style="color:#64748b;">Transaction ID:</td>
              <td style="font-family:monospace;color:#475569;">${transactionId}</td>
            </tr>
            <tr>
              <td style="color:#64748b;">Contribution Date:</td>
              <td style="color:#334155;">${donationDate}</td>
            </tr>
          </table>
        </div>

        <p style="margin:0 0 12px;color:#64748b;font-size:12px;line-height:1.5;">
          🛡️ <strong>Statutory Exemption:</strong> Donations to Al Shujaiat Foundation Jammu & Kashmir are eligible for tax deduction under Section 80G of the Indian Income Tax Act, 1961. Please retain this email for your tax filing records.
        </p>
      `;
      return { html: wrapLayout(body), defaultSubject: subject };
    }

    case 'volunteer_received': {
      const name = data.name || 'Applicant';
      const applicationId = data.applicationId || 'APP-' + Date.now().toString().slice(-6);
      const subject = `[ASFJK] Volunteer Application Received - ${applicationId}`;

      const body = `
        <h2 style="margin:0 0 8px;color:#1e293b;font-size:18px;font-weight:800;">Volunteer Application Received</h2>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">
          Hello <strong>${name}</strong>,<br/>
          Thank you for applying to join the volunteer and disaster relief network of Al Shujaiat Foundation Jammu & Kashmir!
        </p>

        <div style="background:#f1f5f9;border-left:4px solid #393186;padding:14px 18px;border-radius:8px;margin:20px 0;">
          <p style="margin:0;font-size:13px;color:#1e293b;">
            <strong>Application Reference:</strong> <span style="font-family:monospace;">${applicationId}</span>
          </p>
        </div>

        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">
          Our volunteer coordination committee is currently reviewing your profile and credentials. You will receive a follow-up notification regarding the status of your application within <strong>7 business days</strong>.
        </p>
        <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
          If you have any questions or need to submit updated identification documents, please reach out to <a href="mailto:volunteer@asfjk.org" style="color:#393186;font-weight:bold;">volunteer@asfjk.org</a>.
        </p>
      `;
      return { html: wrapLayout(body), defaultSubject: subject };
    }

    case 'volunteer_approved': {
      const name = data.name || 'Volunteer';
      const membershipNumber = data.membershipNumber || 'VOL-JK-' + Date.now().toString().slice(-6);
      const validThru = data.validThru || 'One Year from Approval';
      const roleDesignation = data.roleDesignation || 'Humanitarian Field Volunteer';
      const subject = `[ASFJK] Welcome to the Team! Volunteer Application Approved - ${membershipNumber}`;

      const body = `
        <h2 style="margin:0 0 8px;color:#1e293b;font-size:18px;font-weight:800;">Congratulations & Welcome! 🎉</h2>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">
          Dear <strong>${name}</strong>,<br/>
          We are pleased to inform you that your volunteer application with Al Shujaiat Foundation Jammu & Kashmir has been officially <strong>approved</strong>.
        </p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin:22px 0;">
          <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size:13px;color:#334155;">
            <tr>
              <td style="color:#64748b;width:40%;">Volunteer ID:</td>
              <td style="font-weight:bold;color:#393186;font-family:monospace;font-size:14px;">${membershipNumber}</td>
            </tr>
            <tr>
              <td style="color:#64748b;">Designated Role:</td>
              <td style="font-weight:bold;color:#1e293b;">${roleDesignation}</td>
            </tr>
            <tr>
              <td style="color:#64748b;">Validity Period:</td>
              <td style="color:#334155;">Valid until ${validThru}</td>
            </tr>
          </table>
        </div>

        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">
          You can now download your official digital Volunteer ID credential directly through our portal. Our field operations team will contact you shortly regarding upcoming orientations and ground missions.
        </p>
      `;
      return { html: wrapLayout(body), defaultSubject: subject };
    }

    case 'membership_confirmed': {
      const name = data.name || 'Official Member';
      const membershipNumber = data.membershipNumber || 'MBR-JK-' + Date.now().toString().slice(-6);
      const tierName = data.tierName || (data.tier ? data.tier.replace(/_/g, ' ').toUpperCase() : 'General Member');
      const validFrom = data.validFrom || 'Today';
      const validThru = data.validThru || 'Next Year';
      const totalContribution = data.totalContribution || data.amount || '0';
      const currency = data.currency || 'INR';
      const subject = `[ASFJK] Official NGO Membership Confirmed - ${membershipNumber}`;

      const body = `
        <h2 style="margin:0 0 8px;color:#1e293b;font-size:18px;font-weight:800;">NGO Membership Confirmed</h2>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">
          Dear <strong>${name}</strong>,<br/>
          Welcome as an official member of Al Shujaiat Foundation Jammu & Kashmir. Your membership commitment directly powers sustained humanitarian relief, education, and community infrastructure across the Himalayan region.
        </p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin:22px 0;">
          <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size:13px;color:#334155;">
            <tr>
              <td style="color:#64748b;width:40%;">Membership ID:</td>
              <td style="font-weight:bold;color:#393186;font-family:monospace;font-size:14px;">${membershipNumber}</td>
            </tr>
            <tr>
              <td style="color:#64748b;">Membership Tier:</td>
              <td style="font-weight:800;color:#1e293b;">${tierName}</td>
            </tr>
            <tr>
              <td style="color:#64748b;">Validity Period:</td>
              <td style="color:#334155;">${validFrom} to ${validThru}</td>
            </tr>
            <tr>
              <td style="color:#64748b;">Annual Contribution:</td>
              <td style="font-weight:bold;color:#1e293b;">${currency} ${totalContribution}</td>
            </tr>
          </table>
        </div>

        <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
          Your official digital membership ID card and contribution tax certificate are ready for download in your donor dashboard.
        </p>
      `;
      return { html: wrapLayout(body), defaultSubject: subject };
    }

    case 'otp_verification':
    default: {
      const name = data.name || 'Valued Supporter';
      const otpCode = data.otpCode || '';
      const subject = `[ASFJK] Verify Your Donor Account - Code: ${otpCode}`;

      const body = `
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
      `;
      return { html: wrapLayout(body), defaultSubject: subject };
    }
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, subject: customSubject, template = 'otp_verification', data = {} } = req.body || {};

    if (!to) {
      return res.status(400).json({ error: 'Missing required parameter: to' });
    }

    const { html: htmlContent, defaultSubject } = buildEmailHtml(template, data);
    const finalSubject = customSubject || defaultSubject;

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
            subject: finalSubject,
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
          subject: finalSubject,
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
          _subject: finalSubject,
          _template: 'box',
          _captcha: 'false',
          Recipient: to,
          Template: template,
          Data: JSON.stringify(data),
          Message_Preview: `Notification regarding: ${finalSubject}. Please visit asfjk.org for full account details.`,
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
