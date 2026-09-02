// Supabase Edge Function: razorpay-webhook
// Runtime: Deno / TypeScript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { HmacSha256 } from 'https://deno.land/std@0.160.0/crypto/sha256.ts';

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') ?? '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get('x-razorpay-signature');
    const rawBody = await req.text();

    // 1. Verify Webhook Cryptographic HMAC Signature
    if (webhookSecret && signature) {
      const hmac = new HmacSha256(webhookSecret);
      hmac.update(rawBody);
      const computed = hmac.hex();

      if (computed !== signature) {
        return new Response('Invalid webhook signature', { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    if (!orderId) {
      return new Response('Ignored (no order ID)', { status: 200 });
    }

    // 2. Handle Payment Captured Event
    if (event === 'payment.captured' || event === 'order.paid') {
      const { data: donation } = await supabase
        .from('donations')
        .select('*')
        .eq('gateway_order_id', orderId)
        .single();

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

    return new Response(JSON.stringify({ status: 'processed', event }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
