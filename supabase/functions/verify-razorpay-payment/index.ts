// Supabase Edge Function: verify-razorpay-payment
// Runtime: Deno / TypeScript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { HmacSha256 } from 'https://deno.land/std@0.160.0/crypto/sha256.ts';

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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: VerifyPaymentPayload = await req.json();

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return new Response(JSON.stringify({ error: 'Missing payment identifiers' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Cryptographic HMAC-SHA256 Signature Verification
    if (razorpayKeySecret && razorpaySignature) {
      const textToSign = `${razorpayOrderId}|${razorpayPaymentId}`;
      const hmac = new HmacSha256(razorpayKeySecret);
      hmac.update(textToSign);
      const generatedSignature = hmac.hex();

      if (generatedSignature !== razorpaySignature) {
        return new Response(JSON.stringify({ error: 'Cryptographic signature mismatch. Unauthorized payment attempt.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 2. Fetch Pending Donation Record from Supabase Database
    const { data: donation, error: fetchErr } = await supabase
      .from('donations')
      .select('*')
      .eq('gateway_order_id', razorpayOrderId)
      .single();

    if (fetchErr || !donation) {
      return new Response(JSON.stringify({ error: 'Matching donation order record not found in ledger' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Idempotent State Guard (Don't double process if already successful)
    if (donation.status === 'successful' && donation.receipt_number) {
      return new Response(
        JSON.stringify({
          success: true,
          donationId: donation.id,
          donationNumber: donation.donation_number,
          receiptNumber: donation.receipt_number,
          status: 'successful',
          alreadyProcessed: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. Generate Official Receipt Serial Number
    const year = new Date().getFullYear();
    const randomReceiptSuffix = Math.floor(10000 + Math.random() * 90000);
    const receiptNumber = `ASJ-REC-${year}-${randomReceiptSuffix}`;

    // 5. Update Donation to Successful
    const { error: updateErr } = await supabase
      .from('donations')
      .update({
        status: 'successful',
        gateway_payment_id: razorpayPaymentId,
        gateway_signature: razorpaySignature,
        receipt_number: receiptNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('id', donation.id);

    if (updateErr) {
      throw new Error(`Failed to update donation status: ${updateErr.message}`);
    }

    // 6. Insert Official Receipt Record into public.receipts
    const { data: receiptRecord, error: receiptErr } = await supabase
      .from('receipts')
      .insert([
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
          tax_exemption_text: 'Donations to Al Shujaiat Foundation are eligible for tax deduction under Section 80G of the Indian Income Tax Act.',
          issued_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    // 7. Update Donor Lifetime Totals
    const { data: existingDonor } = await supabase
      .from('donors')
      .select('*')
      .eq('email', donation.donor_email)
      .maybeSingle();

    if (existingDonor) {
      await supabase
        .from('donors')
        .update({
          total_donated_usd: (existingDonor.total_donated_usd || 0) + Number(donation.amount_usd),
          donations_count: (existingDonor.donations_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDonor.id);
    }

    // 8. Insert Immutable Audit Log
    await supabase.from('audit_logs').insert([
      {
        actor_email: donation.donor_email,
        role: 'donor',
        action: 'donation:capture',
        resource: 'donations',
        resource_id: donation.id,
        metadata: {
          donationNumber: donation.donation_number,
          receiptNumber,
          amount: donation.amount,
          currency: donation.currency,
          paymentId: razorpayPaymentId,
        },
      },
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        donationId: donation.id,
        donationNumber: donation.donation_number,
        receiptNumber,
        receipt: receiptRecord,
        status: 'successful',
        amount: donation.amount,
        currency: donation.currency,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Payment verification failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
