// Supabase Edge Function: razorpay-webhook
// Runtime: Deno / TypeScript (Zero external std dependencies)

/**
 * Validates HMAC-SHA256 signature using native Web Crypto API
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
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-razorpay-signature',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') ?? '';

    const signature = req.headers.get('x-razorpay-signature');
    const rawBody = await req.text();

    // 1. Verify Webhook Cryptographic HMAC Signature
    if (webhookSecret && signature) {
      const isValid = await verifyHmacSha256(webhookSecret, rawBody, signature);
      if (!isValid) {
        return new Response('Invalid webhook signature', { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody || '{}');
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    if (!orderId) {
      return new Response('Ignored (no order ID)', { status: 200 });
    }

    if (supabaseUrl && supabaseServiceKey) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.0');
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // 2. Handle Payment Captured Event
      if (event === 'payment.captured' || event === 'order.paid') {
        const { data: donation } = await supabase
          .from('donations')
          .select('*')
          .eq('gateway_order_id', orderId)
          .maybeSingle();

        if (donation && donation.status !== 'successful') {
          const year = new Date().getFullYear();
          const receiptNumber = donation.receipt_number || `ASJ-REC-${year}-${Math.floor(10000 + Math.random() * 90000)}`;

          await supabase
            .from('donations')
            .update({
              status: 'successful',
              gateway_payment_id: paymentId,
              receipt_number: receiptNumber,
              updated_at: new Date().toISOString(),
            })
            .eq('id', donation.id);

          await supabase.from('receipts').insert([
            {
              receipt_number: receiptNumber,
              donation_id: donation.id,
              transaction_id: paymentId || 'webhook_captured',
              donation_date: new Date().toISOString(),
              donor_name: donation.donor_name,
              donor_email: donation.donor_email,
              donor_address: donation.donor_country || 'India',
              donor_tax_id: donation.donor_tax_id,
              project_name: donation.target_name,
              amount: donation.amount,
              currency: donation.currency,
              amount_usd: donation.amount_usd,
              payment_method: 'Razorpay Webhook',
              tax_exemption_text: 'Donations are eligible for 80G tax benefits under the Indian Income Tax Act.',
              issued_at: new Date().toISOString(),
            },
          ]);
        }
      }

      // 3. Handle Payment Failed Event
      if (event === 'payment.failed') {
        await supabase
          .from('donations')
          .update({
            status: 'failed',
            notes: paymentEntity?.error_description || 'Payment failed at gateway',
            updated_at: new Date().toISOString(),
          })
          .eq('gateway_order_id', orderId);
      }
    }

    return new Response(JSON.stringify({ status: 'processed', event }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
