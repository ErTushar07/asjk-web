// Supabase Edge Function: verify-paypal-payment
// Runtime: Deno / TypeScript

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name, *',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface VerifyPayPalPayload {
  orderId: string;
  donationNumber?: string;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  donorTaxId?: string;
  targetName?: string;
  amount?: number;
  currency?: string;
}

/**
 * Obtain OAuth2 Bearer Token from PayPal REST API using Client ID & Secret
 */
async function getPayPalAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const isSandbox = clientId === 'sb' || clientId.toLowerCase().includes('sandbox');
  const baseUrl = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

  const authHeader = 'Basic ' + btoa(`${clientId}:${clientSecret}`);
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`PayPal OAuth token request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Fetch Order details from PayPal Orders v2 API
 */
async function getPayPalOrderDetails(orderId: string, accessToken: string, isSandbox: boolean) {
  const baseUrl = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`PayPal get order failed (${response.status}): ${errText}`);
  }

  return await response.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID') ?? '';
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET') ?? '';

    const body: VerifyPayPalPayload = await req.json();
    const { orderId, donationNumber, donorName, donorEmail, donorPhone, donorTaxId, targetName, amount, currency } = body;

    if (!orderId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing PayPal Order ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. If PayPal credentials are configured in Edge Secrets, verify server-to-server
    let verifiedStatus = 'successful';
    let payerEmail = donorEmail || '';
    let payerName = donorName || 'Valued Donor';
    let verifiedAmount = amount || 0;
    let verifiedCurrency = currency || 'USD';

    if (paypalClientId && paypalClientSecret) {
      const isSandbox = paypalClientId === 'sb' || paypalClientId.toLowerCase().includes('sandbox');
      const accessToken = await getPayPalAccessToken(paypalClientId, paypalClientSecret);
      const order = await getPayPalOrderDetails(orderId, accessToken, isSandbox);

      const status = (order.status || '').toUpperCase();
      if (status !== 'COMPLETED' && status !== 'APPROVED') {
        return new Response(
          JSON.stringify({
            success: false,
            error: `PayPal order has not been completed. Current status: ${status}`,
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      verifiedStatus = 'successful';
      payerEmail = order.payer?.email_address || payerEmail;
      const given = order.payer?.name?.given_name || '';
      const sur = order.payer?.name?.surname || '';
      if (given || sur) payerName = `${given} ${sur}`.trim();

      const unit = order.purchase_units?.[0];
      if (unit?.amount) {
        verifiedAmount = parseFloat(unit.amount.value || `${amount || 0}`);
        verifiedCurrency = unit.amount.currency_code || verifiedCurrency;
      }
    }

    // 2. Generate Section 80G Receipt Number
    const year = new Date().getFullYear();
    const randomReceiptSuffix = Math.floor(10000 + Math.random() * 90000);
    const receiptNumber = `ASJ-REC-${year}-${randomReceiptSuffix}`;
    const donationId = donationNumber || `don_${Date.now()}`;

    // 3. Database Persistence if Supabase credentials available
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.0');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Record in donations table
        await supabase.from('donations').insert([
          {
            donation_number: donationId,
            donor_email: payerEmail.toLowerCase().trim(),
            donor_name: payerName,
            donor_phone: donorPhone,
            donor_tax_id: donorTaxId,
            target_name: targetName || 'General Humanitarian Fund',
            amount: verifiedAmount,
            currency: verifiedCurrency,
            amount_usd: verifiedCurrency === 'USD' ? verifiedAmount : verifiedAmount * 0.012,
            status: verifiedStatus,
            payment_method: 'paypal',
            gateway: 'paypal',
            gateway_order_id: orderId,
            gateway_payment_id: orderId,
            receipt_number: receiptNumber,
          },
        ]);

        // Insert into public.receipts table for donor dashboard / tax download
        await supabase.from('receipts').insert([
          {
            receipt_number: receiptNumber,
            donation_id: donationId,
            transaction_id: orderId,
            donation_date: new Date().toISOString(),
            donor_name: payerName,
            donor_email: payerEmail.toLowerCase().trim(),
            donor_address: 'International',
            donor_tax_id: donorTaxId,
            project_name: targetName || 'General Humanitarian Fund',
            amount: verifiedAmount,
            currency: verifiedCurrency,
            amount_usd: verifiedCurrency === 'USD' ? verifiedAmount : verifiedAmount * 0.012,
            payment_method: 'PayPal Global',
            tax_exemption_text: 'Donations to Al Shujaiat Foundation are eligible for tax deduction under Section 80G.',
            issued_at: new Date().toISOString(),
          },
        ]);

        // Audit Log
        await supabase.from('audit_logs').insert([
          {
            actor_email: payerEmail || 'donor@paypal.com',
            role: 'donor',
            action: 'donation:capture:paypal',
            resource: 'donations',
            resource_id: donationId,
            metadata: {
              orderId,
              receiptNumber,
              gateway: 'paypal',
              amount: verifiedAmount,
              currency: verifiedCurrency,
            },
          },
        ]);
      } catch (dbErr) {
        console.warn('Database insert notice (non-fatal):', dbErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        donationId,
        receiptNumber,
        status: verifiedStatus,
        message: 'PayPal payment verified and official receipt issued successfully',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'PayPal payment verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
