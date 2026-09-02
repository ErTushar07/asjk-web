import * as OTPAuth from 'otpauth';

export interface TOTPEnrollmentResult {
  secret: string;
  qrUri: string;
  issuer: string;
  account: string;
}

export class TOTPService {
  private static readonly ISSUER = 'ASFJK Admin Portal';
  private static readonly DIGITS = 6;
  private static readonly PERIOD = 30; // 30 seconds

  /**
   * Generates a new cryptographically secure Base32 TOTP secret and enrollment URI
   */
  public static generateEnrollment(accountEmail: string): TOTPEnrollmentResult {
    const secret = new OTPAuth.Secret({ size: 20 }); // 160-bit secure secret
    const base32Secret = secret.base32;

    const totp = new OTPAuth.TOTP({
      issuer: this.ISSUER,
      label: accountEmail,
      algorithm: 'SHA1',
      digits: this.DIGITS,
      period: this.PERIOD,
      secret: OTPAuth.Secret.fromBase32(base32Secret),
    });

    const qrUri = totp.toString();

    return {
      secret: base32Secret,
      qrUri,
      issuer: this.ISSUER,
      account: accountEmail,
    };
  }

  /**
   * Verifies a 6-digit TOTP code against a Base32 secret with reasonable clock-drift window (+/- 1 step)
   */
  public static verifyTOTP(token: string, base32Secret: string): boolean {
    if (!token || !base32Secret) return false;

    const cleanToken = token.trim().replace(/\s|-/g, '');
    if (!/^[0-9]{6}$/.test(cleanToken)) return false;

    try {
      const totp = new OTPAuth.TOTP({
        issuer: this.ISSUER,
        label: 'Admin',
        algorithm: 'SHA1',
        digits: this.DIGITS,
        period: this.PERIOD,
        secret: OTPAuth.Secret.fromBase32(base32Secret),
      });

      // Validates token within current 30s step +/- 1 window step (tolerates 30s client clock difference)
      const delta = totp.validate({
        token: cleanToken,
        window: 1,
      });

      return delta !== null;
    } catch (e) {
      console.error('TOTP verification error:', e);
      return false;
    }
  }

  /**
   * Generates a current token for testing or validation purposes
   */
  public static generateCurrentToken(base32Secret: string): string {
    const totp = new OTPAuth.TOTP({
      issuer: this.ISSUER,
      label: 'Admin',
      algorithm: 'SHA1',
      digits: this.DIGITS,
      period: this.PERIOD,
      secret: OTPAuth.Secret.fromBase32(base32Secret),
    });

    return totp.generate();
  }
}
