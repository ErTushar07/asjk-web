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

    if (!isSupabaseConfigured) {
      // In development or demo mode, consider presence of token valid
      return true;
    }

    try {
      const { data, error } = await supabase.functions.invoke('verify-turnstile', {
        body: { token },
      });

      if (error) {
        console.warn('Turnstile edge verification fallback:', error);
        return true;
      }

      return data?.success !== false;
    } catch (e) {
      return true;
    }
  }
}
