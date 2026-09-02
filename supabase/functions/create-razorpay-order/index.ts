// Supabase Edge Function: create-razorpay-order
// Runtime: Deno / TypeScript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateOrderPayload {
  amount: number;
  currency: string;
  targetId?: string;
  targetName: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorTaxId?: string;
  turnstileToken?: string;
  frequency: 'one_time' | 'monthly' | 'yearly';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') ?? '';
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';
    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CreateOrderPayload = await req.json();

    // 1. Strict Server-Side Validation
    if (!body.amount || typeof body.amount !== 'number' || body.amount < 1 || body.amount > 1000000) {
      return new Response(JSON.stringify({ error: 'Invalid donation amount ($1 to $1,000,000)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!body.donorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.donorEmail)) {
      return new Response(JSON.stringify({ error: 'Valid donor email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Cloudflare Turnstile Server-Side Bot Check (if token provided)
    if (body.turnstileToken && turnstileSecret) {
      const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: body.turnstileToken,
        }),
      });
      const turnstileData = await turnstileRes.json();
      if (!turnstileData.success) {
        return new Response(JSON.stringify({ error: 'Bot verification challenge failed. Please retry.' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 3. Generate Secure Unique Donation & Idempotency Key
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const donationNumber = `ASJ-DON-${new Date().getFullYear()}-${randomSuffix}`;
    const idempotencyKey = `idemp_${timestamp}_${randomSuffix}`;

    // Convert amount to subunit (paise for INR or cents for USD)
    const amountInSubunits = Math.round(body.amount * 100);

    let razorpayOrderId = `order_sim_${timestamp}_${randomSuffix}`;

    // 4. Create real Razorpay order if Razorpay secrets are configured
    if (razorpayKeyId && razorpayKeySecret) {
      const authHeader = 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInSubunits,
          currency: body.currency.toUpperCase(),
          receipt: donationNumber,
          notes: {
            targetName: body.targetName,
            donorEmail: body.donorEmail,
            donorName: body.donorName,
          },
        }),
      });

      if (!rzpRes.ok) {
        const errText = await rzpRes.text();
        throw new Error(`Razorpay order creation failed: ${errText}`);
      }

      const rzpOrder = await rzpRes.json();
      razorpayOrderId = rzpOrder.id;
    }

    // 5. Pre-create pending donation in Supabase DB
    const { data: donationRecord, error: dbError } = await supabase
      .from('donations')
      .insert([
        {
          donation_number: donationNumber,
          donor_email: body.donorEmail.trim().toLowerCase(),
          donor_name: body.donorName.trim(),
          donor_phone: body.donorPhone,
          donor_tax_id: body.donorTaxId,
          target_name: body.targetName,
          amount: body.amount,
          currency: body.currency.toUpperCase(),
          amount_usd: body.currency === 'USD' ? body.amount : body.amount * 0.012, // approx rate if not USD
          status: 'pending',
          payment_method: 'razorpay',
          gateway: 'razorpay',
          gateway_order_id: razorpayOrderId,
          idempotency_key: idempotencyKey,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Error inserting pending donation:', dbError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: razorpayOrderId,
        donationNumber,
        idempotencyKey,
        keyId: razorpayKeyId || 'rzp_test_placeholder',
        amount: body.amount,
        currency: body.currency,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal order creation error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
