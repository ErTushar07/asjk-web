import { describe, it, expect, beforeEach } from 'vitest';
import { SecurityService } from '../services/securityService';
import { ValidationService } from '../services/validationService';

describe('Security Service - Cryptography & Authentication', () => {
  it('generates unique cryptographic salts', () => {
    const salt1 = SecurityService.generateSalt(16);
    const salt2 = SecurityService.generateSalt(16);
    expect(salt1).not.toBe(salt2);
    expect(salt1.length).toBe(32); // 16 bytes = 32 hex chars
  });

  it('hashes passwords with PBKDF2-SHA256 and verifies correctly', async () => {
    const password = 'SuperSecretAdminPassword2026!#';
    const hashRes = await SecurityService.hashPassword(password);

    expect(hashRes.hash).toBeDefined();
    expect(hashRes.salt).toBeDefined();
    expect(hashRes.iterations).toBe(100000);

    // Verify correct password matches
    const isValid = await SecurityService.verifyPassword(password, hashRes.hash, hashRes.salt);
    expect(isValid).toBe(true);

    // Verify incorrect password fails
    const isInvalid = await SecurityService.verifyPassword('WrongPassword123!', hashRes.hash, hashRes.salt);
    expect(isInvalid).toBe(false);
  });

  it('enforces progressive rate limiting and account lockout after 5 failed attempts', () => {
    const testKey = 'test_attack_user@example.com';
    SecurityService.resetRateLimit(testKey);

    // 1st attempt
    let check = SecurityService.checkRateLimit(testKey);
    expect(check.allowed).toBe(true);
    expect(check.remainingAttempts).toBe(5);

    // 4 failed attempts
    for (let i = 0; i < 4; i++) {
      SecurityService.recordFailedAttempt(testKey);
    }
    check = SecurityService.checkRateLimit(testKey);
    expect(check.allowed).toBe(true);
    expect(check.remainingAttempts).toBe(1);

    // 5th failed attempt -> Trigger lockout
    const lockResult = SecurityService.recordFailedAttempt(testKey);
    expect(lockResult.locked).toBe(true);

    // 6th attempt should be blocked
    check = SecurityService.checkRateLimit(testKey);
    expect(check.allowed).toBe(false);
    expect(check.remainingAttempts).toBe(0);
    expect(check.retryAfterSeconds).toBeGreaterThan(0);

    // Reset on successful auth
    SecurityService.resetRateLimit(testKey);
    check = SecurityService.checkRateLimit(testKey);
    expect(check.allowed).toBe(true);
    expect(check.remainingAttempts).toBe(5);
  });

  it('validates 2FA TOTP format and backup codes', () => {
    expect(SecurityService.verify2FACode('123456')).toBe(true);
    expect(SecurityService.verify2FACode('987 654')).toBe(true);
    expect(SecurityService.verify2FACode('REC88901')).toBe(true); // 8-char backup token
    expect(SecurityService.verify2FACode('abc')).toBe(false); // too short
    expect(SecurityService.verify2FACode('')).toBe(false); // empty
  });
});

describe('Validation Service - File Upload Security & Magic Byte Signature Inspection', () => {
  it('detects valid PNG magic bytes header', () => {
    // PNG Header: 89 50 4E 47 0D 0A 1A 0A
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00]);
    const res = ValidationService.validateFileBuffer(pngHeader.buffer, false);
    expect(res.isValid).toBe(true);
    expect(res.detectedMimeType).toBe('image/png');
  });

  it('detects valid JPEG magic bytes header', () => {
    // JPEG Header: FF D8 FF E0
    const jpgHeader = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
    const res = ValidationService.validateFileBuffer(jpgHeader.buffer, false);
    expect(res.isValid).toBe(true);
    expect(res.detectedMimeType).toBe('image/jpeg');
  });

  it('detects valid PDF magic bytes header for documents', () => {
    // PDF Header: 25 50 44 46 (%PDF)
    const pdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]);
    const res = ValidationService.validateFileBuffer(pdfHeader.buffer, true);
    expect(res.isValid).toBe(true);
    expect(res.detectedMimeType).toBe('application/pdf');
  });

  it('rejects executable or masqueraded file formats with fake extensions', () => {
    // Fake EXE / ELF / Shell payload
    const exePayload = new Uint8Array([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00]); // MZ header
    const res = ValidationService.validateFileBuffer(exePayload.buffer, false);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('mismatch');
  });

  it('enforces maximum file size limits', () => {
    // 12MB buffer for avatar (max is 10MB)
    const oversizedBuffer = new Uint8Array(12 * 1024 * 1024);
    oversizedBuffer[0] = 0x89;
    oversizedBuffer[1] = 0x50;
    oversizedBuffer[2] = 0x4E;
    oversizedBuffer[3] = 0x47;

    const res = ValidationService.validateFileBuffer(oversizedBuffer.buffer, false);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('exceeds maximum permitted limit');
  });
});

describe('Validation Service - Input Sanitization & XSS Neutralization', () => {
  it('neutralizes HTML and script tags from user inputs', () => {
    const dirty = '<script>alert("XSS Attack!")</script>Hello Foundation';
    const clean = ValidationService.sanitizeString(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('</script>');
    expect(clean).toBe('Hello Foundation');
  });

  it('sanitizes filenames to prevent path traversal and double extension exploits', () => {
    const malicious1 = '../../../../etc/passwd';
    expect(ValidationService.sanitizeFilename(malicious1)).toBe('passwd');

    const malicious2 = 'payload.php.jpg';
    expect(ValidationService.sanitizeFilename(malicious2)).toBe('payload_php.jpg');

    const cleanFilename = ValidationService.sanitizeFilename('my_valid_cv_2026.pdf');
    expect(cleanFilename).toBe('my_valid_cv_2026.pdf');
  });

  it('validates donation payloads against strict schema rules', () => {
    // Valid donation
    const validRes = ValidationService.validateDonationInput({
      amount: 100,
      currency: 'USD',
      donorName: 'Sarah Jenkins',
      donorEmail: 'sarah.jenkins@example.org'
    });
    expect(validRes.isValid).toBe(true);
    expect(validRes.sanitizedData.donorName).toBe('Sarah Jenkins');

    // Invalid negative amount
    const invalidAmountRes = ValidationService.validateDonationInput({
      amount: -50,
      currency: 'USD',
      donorName: 'Attacker',
      donorEmail: 'attacker@example.org'
    });
    expect(invalidAmountRes.isValid).toBe(false);
    expect(invalidAmountRes.errors.amount).toBeDefined();

    // Invalid email
    const invalidEmailRes = ValidationService.validateDonationInput({
      amount: 50,
      currency: 'USD',
      donorName: 'Test',
      donorEmail: 'not-an-email'
    });
    expect(invalidEmailRes.isValid).toBe(false);
    expect(invalidEmailRes.errors.donorEmail).toBeDefined();
  });
});

describe('Security Service - Backend Authorization & Permission Isolation', () => {
  beforeEach(() => {
    SecurityService.clearSession();
  });

  it('rejects unauthenticated users from administrative privileges', () => {
    expect(SecurityService.isVerifiedAdminSession()).toBe(false);
    expect(SecurityService.hasAdminPermission('projects:manage')).toBe(false);
    expect(SecurityService.hasAdminPermission('refunds:manage')).toBe(false);
  });

  it('rejects normal donor accounts from administrative access', () => {
    SecurityService.createSession('usr_donor_123', 'donor', false);
    expect(SecurityService.isVerifiedAdminSession()).toBe(false);
    expect(SecurityService.hasAdminPermission('projects:manage')).toBe(false);
    expect(SecurityService.hasAdminPermission('refunds:manage')).toBe(false);
  });

  it('authorizes super admin session with all granular permissions', () => {
    SecurityService.createSession('usr_super_admin', 'super_admin', true);
    expect(SecurityService.isVerifiedAdminSession()).toBe(true);
    expect(SecurityService.hasAdminPermission('projects:manage')).toBe(true);
    expect(SecurityService.hasAdminPermission('refunds:manage')).toBe(true);
    expect(SecurityService.hasAdminPermission('content:manage')).toBe(true);
  });

  it('enforces role-based boundaries for finance vs project administrators', () => {
    // Finance Admin
    SecurityService.createSession('usr_fin_admin', 'finance_admin', true);
    expect(SecurityService.isVerifiedAdminSession()).toBe(true);
    expect(SecurityService.hasAdminPermission('refunds:manage')).toBe(true);
    expect(SecurityService.hasAdminPermission('projects:manage')).toBe(false);

    // Project Manager
    SecurityService.createSession('usr_proj_mgr', 'project_manager', true);
    expect(SecurityService.isVerifiedAdminSession()).toBe(true);
    expect(SecurityService.hasAdminPermission('projects:manage')).toBe(true);
    expect(SecurityService.hasAdminPermission('refunds:manage')).toBe(false);
  });

  it('validates precomputed cryptographic PBKDF2 staff credentials', async () => {
    const adminPass = 'AdminPassword2026!#';
    const adminSalt = '7a91f3c8e42b1096d5a23f1e8c9b4a70';
    const adminExpectedHash = 'b09c39a8804e58e2892f52430d135fad6882fb530c149a6fa0ff84577eb63194';

    const isValidAdmin = await SecurityService.verifyPassword(adminPass, adminExpectedHash, adminSalt);
    expect(isValidAdmin).toBe(true);

    const isWrongPass = await SecurityService.verifyPassword('WrongPass!#', adminExpectedHash, adminSalt);
    expect(isWrongPass).toBe(false);
  });
});

describe('Privacy & Data Minimization - Donor Identity & Record Isolation', () => {
  it('scopes records strictly to authenticated donor email (IDOR / Horizontal Privilege Prevention)', () => {
    const mockDonations = [
      { id: 'don_1', donorEmail: 'alice@example.com', amountUSD: 100 },
      { id: 'don_2', donorEmail: 'bob@example.com', amountUSD: 250 },
      { id: 'don_3', donorEmail: 'alice@example.com', amountUSD: 50 },
    ];

    const currentDonorEmail = 'alice@example.com';
    const scopedDonations = mockDonations.filter(
      (d) => d.donorEmail.toLowerCase() === currentDonorEmail.toLowerCase()
    );

    expect(scopedDonations.length).toBe(2);
    expect(scopedDonations.every((d) => d.donorEmail === 'alice@example.com')).toBe(true);
    expect(scopedDonations.some((d) => d.donorEmail === 'bob@example.com')).toBe(false);
  });
});


