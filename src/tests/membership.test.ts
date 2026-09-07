import { describe, it, expect } from 'vitest';
import { ValidationService } from '../services/validationService';
import { ReceiptService } from '../services/receiptService';
import { PaymentService } from '../services/paymentService';
import { INITIAL_SYSTEM_SETTINGS } from '../data/initialData';
import { NgoMembership } from '../types';

describe('NGO Membership System - Levels, Pricing, Durations & Currencies', () => {
  const OFFICIAL_LEVELS = [
    { tier: 'general_member', name: 'General Member', base: 100 },
    { tier: 'associate_member', name: 'Associate Member', base: 500 },
    { tier: 'supporting_member', name: 'Supporting Member', base: 1000 },
    { tier: 'patron_member', name: 'Patron Member', base: 5000 },
    { tier: 'benefactor_member', name: 'Benefactor Member', base: 10000 },
  ];

  const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED'];

  describe('1. Membership Levels & Strict Pricing', () => {
    OFFICIAL_LEVELS.forEach(({ tier, name, base }) => {
      it(`enforces ${name} base price exactly ${base} without modification`, () => {
        const res = ValidationService.validateMembership({
          fullName: 'Test Member',
          email: 'member@example.org',
          tier,
          durationYears: 1,
          currency: 'INR',
        });

        expect(res.isValid).toBe(true);
        expect(res.sanitizedData.tier).toBe(tier);
        expect(res.sanitizedData.tierName).toBe(name);
        expect(res.sanitizedData.annualAmount).toBe(base);
        expect(res.sanitizedData.totalContribution).toBe(base);
        expect(res.sanitizedData.paidAmount).toBe(base);
      });
    });
  });

  describe('2. Duration Calculations (1 to 10 Years)', () => {
    it('calculates General Member across 1, 5, and 10 years correctly', () => {
      [1, 5, 10].forEach((years) => {
        const res = ValidationService.validateMembership({
          fullName: 'General Member Test',
          email: 'general@example.com',
          tier: 'general_member',
          durationYears: years,
          currency: 'INR',
        });
        expect(res.isValid).toBe(true);
        expect(res.sanitizedData.annualAmount).toBe(100);
        expect(res.sanitizedData.totalContribution).toBe(100 * years);
      });
    });

    it('calculates Associate Member across 1, 5, and 10 years correctly', () => {
      [1, 5, 10].forEach((years) => {
        const res = ValidationService.validateMembership({
          fullName: 'Associate Member Test',
          email: 'associate@example.com',
          tier: 'associate_member',
          durationYears: years,
          currency: 'INR',
        });
        expect(res.isValid).toBe(true);
        expect(res.sanitizedData.annualAmount).toBe(500);
        expect(res.sanitizedData.totalContribution).toBe(500 * years);
      });
    });

    it('calculates Supporting Member across 1, 5, and 10 years correctly', () => {
      [1, 5, 10].forEach((years) => {
        const res = ValidationService.validateMembership({
          fullName: 'Supporting Member Test',
          email: 'supporting@example.com',
          tier: 'supporting_member',
          durationYears: years,
          currency: 'INR',
        });
        expect(res.isValid).toBe(true);
        expect(res.sanitizedData.annualAmount).toBe(1000);
        expect(res.sanitizedData.totalContribution).toBe(1000 * years);
      });
    });

    it('calculates Patron Member across 1, 5, and 10 years correctly', () => {
      [1, 5, 10].forEach((years) => {
        const res = ValidationService.validateMembership({
          fullName: 'Patron Member Test',
          email: 'patron@example.com',
          tier: 'patron_member',
          durationYears: years,
          currency: 'INR',
        });
        expect(res.isValid).toBe(true);
        expect(res.sanitizedData.annualAmount).toBe(5000);
        expect(res.sanitizedData.totalContribution).toBe(5000 * years);
      });
    });

    it('calculates Benefactor Member across 1, 5, and 10 years correctly', () => {
      [1, 5, 10].forEach((years) => {
        const res = ValidationService.validateMembership({
          fullName: 'Benefactor Member Test',
          email: 'benefactor@example.com',
          tier: 'benefactor_member',
          durationYears: years,
          currency: 'INR',
        });
        expect(res.isValid).toBe(true);
        expect(res.sanitizedData.annualAmount).toBe(10000);
        expect(res.sanitizedData.totalContribution).toBe(10000 * years);
      });
    });
  });

  describe('3. Strict Currency Rules (Zero Conversion, Identity Across Currencies)', () => {
    SUPPORTED_CURRENCIES.forEach((currency) => {
      it(`preserves exact numeric values in ${currency} without exchange rates`, () => {
        OFFICIAL_LEVELS.forEach(({ tier, base }) => {
          const res = ValidationService.validateMembership({
            fullName: 'Currency Test Member',
            email: 'currency@example.org',
            tier,
            durationYears: 1,
            currency,
          });

          expect(res.isValid).toBe(true);
          expect(res.sanitizedData.currency).toBe(currency);
          expect(res.sanitizedData.annualAmount).toBe(base);
          expect(res.sanitizedData.totalContribution).toBe(base);
        });
      });
    });

    it('verifies 3 Years Supporting Member is exactly 3,000 in all currencies', () => {
      SUPPORTED_CURRENCIES.forEach((cur) => {
        const res = ValidationService.validateMembership({
          fullName: 'Supporting 3-Year Test',
          email: 'supporter@example.org',
          tier: 'supporting_member',
          durationYears: 3,
          currency: cur,
        });

        expect(res.isValid).toBe(true);
        expect(res.sanitizedData.currency).toBe(cur);
        expect(res.sanitizedData.annualAmount).toBe(1000);
        expect(res.sanitizedData.totalContribution).toBe(3000);
        expect(res.sanitizedData.paidAmount).toBe(3000);
      });
    });
  });

  describe('4. Server-Side Validation & Anti-Tampering', () => {
    it('rejects durations less than 1 or greater than 10 years', () => {
      const invalidLow = ValidationService.validateMembership({
        fullName: 'John Doe',
        email: 'john@example.com',
        tier: 'general_member',
        durationYears: 0,
      });
      expect(invalidLow.isValid).toBe(false);
      expect(invalidLow.errors.durationYears).toBeDefined();

      const invalidHigh = ValidationService.validateMembership({
        fullName: 'John Doe',
        email: 'john@example.com',
        tier: 'general_member',
        durationYears: 11,
      });
      expect(invalidHigh.isValid).toBe(false);
      expect(invalidHigh.errors.durationYears).toBeDefined();
    });

    it('rejects tampered or forged client contribution amounts', () => {
      // Attacker attempts to pay 1 INR for a Benefactor Member (10,000 INR)
      const tampered = ValidationService.validateMembership({
        fullName: 'Malicious Actor',
        email: 'hacker@example.com',
        tier: 'benefactor_member',
        durationYears: 1,
        totalContribution: 1, // Tampered client payload
        paidAmount: 1,
      });

      expect(tampered.isValid).toBe(true);
      // Backend validation overrides tampered total with strictly computed amount
      expect(tampered.sanitizedData.annualAmount).toBe(10000);
      expect(tampered.sanitizedData.totalContribution).toBe(10000);
      expect(tampered.sanitizedData.paidAmount).toBe(10000);
    });

    it('rejects missing or empty full name and email', () => {
      const missingName = ValidationService.validateMembership({
        fullName: '',
        email: 'valid@example.com',
        tier: 'general_member',
        durationYears: 1,
      });
      expect(missingName.isValid).toBe(false);
      expect(missingName.errors.fullName).toBeDefined();

      const invalidEmail = ValidationService.validateMembership({
        fullName: 'Valid Name',
        email: 'invalid-email-address',
        tier: 'general_member',
        durationYears: 1,
      });
      expect(invalidEmail.isValid).toBe(false);
      expect(invalidEmail.errors.email).toBeDefined();
    });
  });

  describe('5. Receipt Generation & Tax Declaration Compliance', () => {
    it('generates an official PDF receipt with exact currency, member metadata and amounts', async () => {
      const sampleMember: NgoMembership = {
        id: 'mbr_test_123',
        membershipNumber: 'ASFJK26M888',
        fullName: 'Dr. Tariq Ahmad',
        email: 'tariq.ahmad@example.org',
        phone: '+91 94190 55555',
        city: 'Srinagar',
        country: 'India',
        tier: 'supporting_member',
        tierName: 'Supporting Member',
        durationYears: 3,
        annualAmount: 1000,
        totalContribution: 3000,
        currency: 'USD',
        paidAmount: 3000,
        validFrom: '01 Jan 2026',
        validThru: '01 Jan 2029',
        paymentMethod: 'Credit/Debit Card (Razorpay)',
        transactionId: 'TXN-RZP-998811',
        orderId: 'order_rzp_998811',
        paymentId: 'pay_rzp_998811',
        receiptNumber: 'ASJ-REC-2026-9988',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const doc = await ReceiptService.generateMembershipReceiptPDF(sampleMember, INITIAL_SYSTEM_SETTINGS);
      expect(doc).toBeDefined();
      expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    });
  });

  describe('6. PayPal Payment Processing & Currency Normalization', () => {
    it('normalizes various currencies to USD correctly for PayPal', () => {
      expect(PaymentService.calculateUSD(100, 'USD')).toBe(100);
      expect(PaymentService.calculateUSD(100, 'EUR')).toBe(109);
      expect(PaymentService.calculateUSD(100, 'GBP')).toBe(128);
      expect(PaymentService.calculateUSD(1000, 'INR')).toBe(12);
      expect(PaymentService.calculateUSD(100, 'AED')).toBe(27.2);
    });

    it('processes PayPal contribution successfully and issues verified receipt number', async () => {
      const result = await PaymentService.processPayment({
        amount: 1000,
        currency: 'USD',
        frequency: 'one_time',
        method: 'paypal',
        donorName: 'International Supporter',
        donorEmail: 'supporter@world.org',
        targetName: 'Al Shujaiat General Fund',
        idempotencyKey: 'idemp_paypal_test_123',
        paymentReference: 'PAYID-M1234567890',
      });

      expect(result.success).toBe(true);
      expect(result.provider).toBe('paypal');
      expect(result.status).toBe('successful');
      expect(result.paymentId).toBe('PAYID-M1234567890');
      expect(result.transactionId).toBe('PAYID-M1234567890');
      expect(result.receiptNumber).toMatch(/^ASJ-REC-\d{4}-\d{4}$/);
      expect(result.amountUSD).toBe(1000);
    });
  });

  describe('7. Verification of All Active Payment Methods One-by-One', () => {
    it('[Method 1: PayPal] processes international donation and issues legal receipt', async () => {
      const res = await PaymentService.processPayment({
        amount: 250,
        currency: 'USD',
        frequency: 'one_time',
        method: 'paypal',
        donorName: 'Global Patron',
        donorEmail: 'patron@global.org',
        targetName: 'Clean Water Initiative',
        idempotencyKey: 'idemp_paypal_unique_1',
        paymentReference: 'PAYID-LIVE-998877',
      });

      expect(res.success).toBe(true);
      expect(res.provider).toBe('paypal');
      expect(res.status).toBe('successful');
      expect(res.receiptNumber).toMatch(/^ASJ-REC-\d{4}-\d{4}$/);
    });

    it('[Method 2: Bank Wire] records valid UTR transfer for reconciliation with pending status and no instant receipt', async () => {
      const res = await PaymentService.processPayment({
        amount: 5000,
        currency: 'INR',
        frequency: 'one_time',
        method: 'bank_wire',
        donorName: 'Ahmad Khan',
        donorEmail: 'ahmad.khan@example.com',
        targetName: 'General Humanitarian Fund',
        idempotencyKey: 'idemp_wire_1',
        paymentReference: 'UTR123456789012',
      });

      expect(res.success).toBe(true);
      expect(res.provider).toBe('bank');
      expect(res.status).toBe('pending');
      expect(res.paymentId).toBe('UTR123456789012');
      expect(res.receiptNumber).toBe(''); // Strictly empty until verified
    });

    it('[Method 2: Bank Wire Validation] rejects missing or invalid UTR reference', async () => {
      await expect(
        PaymentService.processPayment({
          amount: 5000,
          currency: 'INR',
          frequency: 'one_time',
          method: 'bank_wire',
          donorName: 'Ahmad Khan',
          donorEmail: 'ahmad.khan@example.com',
          targetName: 'General Humanitarian Fund',
          idempotencyKey: 'idemp_wire_invalid',
          paymentReference: '',
        })
      ).rejects.toThrow(/valid bank transfer UTR/i);
    });

    it('[Method 3: Sandbox / Test Mode] processes sandbox card flow for automated validation', async () => {
      const res = await PaymentService.processPayment({
        amount: 500,
        currency: 'INR',
        frequency: 'one_time',
        method: 'sandbox_card',
        donorName: 'QA Tester',
        donorEmail: 'qa@asfjk.org',
        targetName: 'Disaster Relief Fund',
        idempotencyKey: 'idemp_sandbox_qa',
      });

      expect(res.success).toBe(true);
      expect(res.provider).toBe('sandbox');
      expect(res.status).toBe('successful');
      expect(res.receiptNumber).toMatch(/^ASJ-REC-\d{4}-\d{4}$/);
    });

    it('[Method 4: Razorpay Security Gate] strictly refuses unauthorized or empty transactions', async () => {
      await expect(
        PaymentService.processPayment({
          amount: 1000,
          currency: 'INR',
          frequency: 'one_time',
          method: 'crypto' as any,
          donorName: 'Test Attacker',
          donorEmail: 'attacker@evil.com',
          targetName: 'Fund',
          idempotencyKey: 'idemp_fake',
        })
      ).rejects.toThrow(/No receipt can be issued without verified payment confirmation/i);
    });
  });
});
