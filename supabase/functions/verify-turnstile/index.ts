// Supabase Edge Function: verify-turnstile
// Runtime: Deno / TypeScript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY') ?? '';
    const { token, remoteIp } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Missing challenge token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!turnstileSecret) {
      // In development mode when secret is not set, allow graceful pass
      return new Response(JSON.stringify({ success: true, mode: 'development_fallback' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formData = new FormData();
    formData.append('secret', turnstileSecret);
    formData.append('response', token);
    if (remoteIp) formData.append('remoteip', remoteIp);

    const verificationRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const verificationData = await verificationRes.json();

    return new Response(JSON.stringify(verificationData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
