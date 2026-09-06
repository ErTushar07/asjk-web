// Supabase Edge Function: verify-razorpay-payment
// Runtime: Deno / TypeScript

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  donationNumber?: string;
}

/**
 * Validates HMAC-SHA256 signature using native Web Crypto API (zero external dependencies)
 */
async function verifyHmacSha256(secret: string, message: string, expectedHex: string): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  const hex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hex.toLowerCase() === expectedHex.trim().toLowerCase();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';

    const body: VerifyPaymentPayload = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, donationNumber } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing payment verification identifiers (order, payment or signature)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!razorpayKeySecret) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Razorpay secret (RAZORPAY_KEY_SECRET) is not configured in Supabase Edge Function Secrets.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Cryptographic Signature Verification (HMAC-SHA256)
    const textToSign = `${razorpayOrderId}|${razorpayPaymentId}`;
    const isValid = await verifyHmacSha256(razorpayKeySecret, textToSign, razorpaySignature);

    if (!isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Signature mismatch. Cryptographic verification failed. Fraudulent or altered transaction.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Generate Receipt Number
    const year = new Date().getFullYear();
    const randomReceiptSuffix = Math.floor(10000 + Math.random() * 90000);
    const receiptNumber = `ASJ-REC-${year}-${randomReceiptSuffix}`;
    let donationId = donationNumber || `don_${Date.now()}`;

    // 3. Update database if Supabase credentials available
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.0');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: donation } = await supabase
          .from('donations')
          .select('*')
          .eq('gateway_order_id', razorpayOrderId)
          .maybeSingle();

        if (donation) {
          donationId = donation.id;

          // If already successful, return idempotent receipt
          if (donation.status === 'successful' && donation.receipt_number) {
            return new Response(
              JSON.stringify({
                success: true,
                donationId: donation.id,
                donationNumber: donation.donation_number,
                receiptNumber: donation.receipt_number,
                status: 'successful',
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Mark successful
          await supabase
            .from('donations')
            .update({
              status: 'successful',
              gateway_payment_id: razorpayPaymentId,
              gateway_signature: razorpaySignature,
              receipt_number: receiptNumber,
              updated_at: new Date().toISOString(),
            })
            .eq('id', donation.id);

          // Insert into public.receipts
          await supabase.from('receipts').insert([
            {
              receipt_number: receiptNumber,
              donation_id: donation.id,
              transaction_id: razorpayPaymentId,
              donation_date: new Date().toISOString(),
              donor_name: donation.donor_name,
              donor_email: donation.donor_email,
              donor_address: donation.donor_country || 'India',
              donor_tax_id: donation.donor_tax_id,
              project_name: donation.target_name,
              amount: donation.amount,
              currency: donation.currency,
              amount_usd: donation.amount_usd,
              payment_method: 'Razorpay Online',
              tax_exemption_text: 'Donations to Al Shujaiat Foundation are eligible for tax deduction under Section 80G.',
              issued_at: new Date().toISOString(),
            },
          ]);

          // Audit log
          await supabase.from('audit_logs').insert([
            {
              actor_email: donation.donor_email,
              role: 'donor',
              action: 'donation:capture',
              resource: 'donations',
              resource_id: donation.id,
              metadata: {
                receiptNumber,
                razorpayPaymentId,
                razorpayOrderId,
              },
            },
          ]);
        }
      } catch (dbErr) {
        console.warn('Database post-verification notice (non-fatal):', dbErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        donationId,
        receiptNumber,
        paymentId: razorpayPaymentId,
        orderId: razorpayOrderId,
        status: 'successful',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Payment verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
