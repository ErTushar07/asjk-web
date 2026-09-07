// Supabase Edge Function: create-razorpay-order
// Runtime: Deno / TypeScript

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name, *',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreateOrderPayload {
  amount: number;
  currency: string;
  targetId?: string;
  targetName: string;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  donorTaxId?: string;
  turnstileToken?: string;
  frequency?: 'one_time' | 'monthly' | 'yearly';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') ?? '';
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';
    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY') ?? '';

    const body: CreateOrderPayload = await req.json();

    // 1. Strict Server-Side Validation
    if (!body.amount || typeof body.amount !== 'number' || body.amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid donation amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const donorEmail = (body.donorEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.donorEmail))
      ? body.donorEmail
      : 'donor@asfjk.org';
    const donorName = body.donorName?.trim() || 'Valued Donor';

    // 2. Cloudflare Turnstile Verification (if provided)
    if (body.turnstileToken && turnstileSecret) {
      try {
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
          return new Response(
            JSON.stringify({ success: false, error: 'Bot verification challenge failed. Please retry.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (tErr) {
        console.warn('Turnstile verification error:', tErr);
      }
    }

    // 3. Ensure Razorpay credentials exist
    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Razorpay API credentials (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) are not configured in Supabase Edge Function Secrets.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Generate Donation Serial Number
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const donationNumber = `ASJ-DON-${new Date().getFullYear()}-${randomSuffix}`;
    const idempotencyKey = `idemp_${timestamp}_${randomSuffix}`;

    // 4B. Strict Server-Side Membership Level & Duration Verification (Anti-Tampering)
    let finalPayableAmount = body.amount;
    if (body.targetId?.startsWith('mbr_') || body.targetName?.includes('Membership')) {
      const VALID_MEMBERSHIP_TIERS: Record<string, number> = {
        mbr_general_member: 100,
        general_member: 100,
        mbr_associate_member: 500,
        associate_member: 500,
        mbr_supporting_member: 1000,
        supporting_member: 1000,
        mbr_patron_member: 5000,
        patron_member: 5000,
        mbr_benefactor_member: 10000,
        benefactor_member: 10000,
        // Legacy graceful mappings
        mbr_associate_silver: 500,
        mbr_founding_platinum: 1000,
        mbr_patron_gold: 5000,
        mbr_benefactor_diamond: 10000,
      };

      const tierKey = body.targetId?.toLowerCase() || '';
      const baseAmount = VALID_MEMBERSHIP_TIERS[tierKey];
      if (baseAmount) {
        const durationMatch = body.targetName?.match(/(\d+)\s*Years?/i);
        const durationYears = durationMatch ? parseInt(durationMatch[1], 10) : Math.round(body.amount / baseAmount);
        const safeDuration = Math.min(Math.max(durationYears || 1, 1), 10);
        finalPayableAmount = baseAmount * safeDuration;
      }
    }

    // Razorpay amounts are in smallest currency subunit (paise for INR, cents for USD)
    // Strict currency rule: exact numeric amount in chosen currency, zero conversion
    const amountInSubunits = Math.round(finalPayableAmount * 100);
    const currency = (body.currency || 'INR').toUpperCase();

    // 5. Call official Razorpay Orders API
    const authHeader = 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInSubunits,
        currency,
        receipt: donationNumber,
        notes: {
          targetName: (body.targetName || 'General Humanitarian Fund').slice(0, 40),
          donorEmail: donorEmail.slice(0, 40),
          donorName: donorName.slice(0, 40),
          donorPhone: (body.donorPhone || '').slice(0, 20),
        },
      }),
    });

    if (!rzpRes.ok) {
      const errBody = await rzpRes.json().catch(() => ({}));
      const rzpErrorMsg = errBody?.error?.description || errBody?.error?.message || `Razorpay API HTTP ${rzpRes.status}`;
      return new Response(
        JSON.stringify({ success: false, error: `Razorpay order creation failed: ${rzpErrorMsg}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rzpOrder = await rzpRes.json();

    // 6. Optional: Record pending donation in Supabase DB if configured
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.0');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from('donations').insert([
          {
            donation_number: donationNumber,
            donor_email: donorEmail.trim().toLowerCase(),
            donor_name: donorName.trim(),
            donor_phone: body.donorPhone,
            donor_tax_id: body.donorTaxId,
            target_name: body.targetName,
            amount: body.amount,
            currency,
            amount_usd: currency === 'USD' ? body.amount : body.amount * 0.012,
            status: 'pending',
            payment_method: 'razorpay',
            gateway: 'razorpay',
            gateway_order_id: rzpOrder.id,
            idempotency_key: idempotencyKey,
          },
        ]);
      } catch (dbErr) {
        console.warn('Database insert notice (non-fatal):', dbErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: rzpOrder.id,
        donationNumber,
        idempotencyKey,
        keyId: razorpayKeyId,
        amount: body.amount,
        currency,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Internal server error while creating order' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
