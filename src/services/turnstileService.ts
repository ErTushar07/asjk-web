import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

export class TurnstileService {
  public static getSiteKey(): string {
    return import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAAx_placeholder_site_key';
  }

  /**
   * Validates a Turnstile token via Supabase Edge Function
   */
  public static async verifyTokenOnServer(token: string): Promise<boolean> {
    if (!token) return false;

    const siteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim();
    const isPlaceholder = !siteKey || siteKey.includes('placeholder');

    if (!isSupabaseConfigured || isPlaceholder) {
      if (import.meta.env.DEV) {
        console.warn('[TurnstileService] Turnstile site key is placeholder or Supabase unconfigured in development. Allowing submission.');
        return true;
      }
      console.error('[TurnstileService] Turnstile site key is missing or unconfigured in production.');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('verify-turnstile', {
        body: { token },
      });

      if (error) {
        console.warn('[TurnstileService] Turnstile edge verification failed:', error);
        return import.meta.env.DEV ? true : false;
      }

      return data?.success === true;
    } catch (e) {
      console.warn('[TurnstileService] Turnstile verification exception:', e);
      return import.meta.env.DEV ? true : false;
    }
  }
}
