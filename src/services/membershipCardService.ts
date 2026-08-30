import { jsPDF } from 'jspdf';
import { NgoMembership, SystemSettings } from '../types';
import { ASFJK_LOGO_BASE64 } from './logoAsset';

export class MembershipCardService {
  /**
   * Generates a high-resolution, print-ready official NGO Membership ID Card PDF (CR80 Standard / Badge format)
   */
  public static generateMembershipCardPDF(member: NgoMembership, settings: SystemSettings): jsPDF {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [86, 54], // Standard CR80 ID Card
    });

    const navyDark = [15, 23, 42]; // #0F172A
    const navyHeader = [30, 27, 75]; // #1E1B4B
    const goldAccent = [217, 119, 6]; // #D97706
    const goldLight = [251, 191, 36]; // #FBBF24

    // Tier-specific colors
    let tierColor = [16, 185, 129]; // Emerald Green for General Member default
    let tierBadge = 'GENERAL MEMBER';

    if (member.tier === 'associate_silver') {
      tierColor = [148, 163, 184]; // Silver
      tierBadge = 'ASSOCIATE SILVER';
    } else if (member.tier === 'patron_gold') {
      tierColor = [234, 179, 8]; // Gold
      tierBadge = 'PATRON GOLD';
    } else if (member.tier === 'founding_platinum') {
      tierColor = [168, 85, 247]; // Platinum Purple
      tierBadge = 'FOUNDING PLATINUM';
    } else if (member.tier === 'benefactor_diamond') {
      tierColor = [6, 182, 212]; // Diamond Cyan
      tierBadge = 'BENEFACTOR DIAMOND';
    }

    // ==========================================
    // PAGE 1: FRONT OF THE MEMBERSHIP CARD
    // ==========================================
    doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
    doc.roundedRect(0, 0, 86, 54, 2, 2, 'F');

    // Outer Golden Border Frame
    doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(1, 1, 84, 52, 1.5, 1.5, 'D');

    // Metallic Hologram Stripe
    doc.setFillColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.rect(1.5, 1.5, 83, 0.8, 'F');

    // Header Background Bar
    doc.setFillColor(navyHeader[0], navyHeader[1], navyHeader[2]);
    doc.rect(1.5, 2.3, 83, 11.5, 'F');
    doc.setDrawColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.setLineWidth(0.2);
    doc.line(1.5, 13.8, 84.5, 13.8);

    // Golden Circular Emblem Ring & Official Logo
    doc.setFillColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.circle(8.5, 8, 4.8, 'F');
    doc.setFillColor(255, 255, 255);
    doc.circle(8.5, 8, 4.3, 'F');

    try {
      doc.addImage(ASFJK_LOGO_BASE64, 'PNG', 4.5, 4, 8, 8);
    } catch {
      // Fallback
    }

    // Header Typography
    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.5);
    doc.text('OFFICIAL NGO MEMBERSHIP CREDENTIAL', 15, 5);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('AL SHUJAIAT FOUNDATION', 15, 8);

    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.setFontSize(4.2);
    doc.setFont('helvetica', 'normal');
    doc.text('JAMMU & KASHMIR · STATUTORY TRUST', 15, 11);

    // Tier Badge Banner Top Right
    doc.setFillColor(tierColor[0], tierColor[1], tierColor[2]);
    doc.roundedRect(56, 4.5, 26, 5.5, 1, 1, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.2);
    doc.text(member.tier.replace('_', ' ').toUpperCase(), 69, 8.2, { align: 'center' });

    // Left Side: Biometric Chip & Member Avatar Frame
    doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.roundedRect(4, 16, 8, 6, 0.6, 0.6, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.15);
    doc.line(4, 19, 12, 19);
    doc.line(8, 16, 8, 22);

    doc.setFillColor(navyHeader[0], navyHeader[1], navyHeader[2]);
    doc.setDrawColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(4, 23, 20, 23, 1, 1, 'FD');

    // Emblem Avatar Graphic
    doc.setFillColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.circle(14, 31, 3.5, 'F');
    doc.roundedRect(8, 36, 12, 8, 1.5, 1.5, 'F');

    doc.setFontSize(4);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.text('HONORARY MEMBER', 14, 45, { align: 'center' });

    // Duration Indicator
    doc.setFillColor(15, 118, 110);
    doc.roundedRect(4, 47, 20, 4, 0.8, 0.8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(3.8);
    doc.setFont('helvetica', 'bold');
    doc.text(`VALID: ${member.durationYears} YEARS`, 14, 49.8, { align: 'center' });

    // Right Side: Member Information
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const displayName = member.fullName.length > 20 ? member.fullName.substring(0, 20) + '...' : member.fullName;
    doc.text(displayName.toUpperCase(), 28, 19);

    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.text(member.tierName.toUpperCase(), 28, 22.5);

    // Credential Box
    doc.setFillColor(25, 30, 50);
    doc.roundedRect(27, 24.5, 55.5, 20.5, 1, 1, 'F');

    doc.setFontSize(4.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.text('MEMBERSHIP NO:', 29, 28);
    doc.setTextColor(255, 255, 255);
    doc.setFont('courier', 'bold');
    doc.setFontSize(5);
    doc.text(member.membershipNumber, 48, 28);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.setFontSize(4.5);
    doc.text('CONTRIBUTION:', 29, 32);
    doc.setTextColor(52, 211, 153);
    doc.setFont('helvetica', 'bold');
    doc.text(`${member.currency} ${member.paidAmount.toLocaleString()} (${member.durationYears} Yrs Paid)`, 48, 32);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.text('LOCATION:', 29, 36);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text(`${member.city}, ${member.country}`, 48, 36);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.text('VALIDITY PERIOD:', 29, 40);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`${member.validFrom} to ${member.validThru}`, 48, 40);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.text('TRANSACTION REF:', 29, 43.5);
    doc.setTextColor(200, 200, 200);
    doc.setFont('courier', 'normal');
    doc.setFontSize(4);
    doc.text(member.transactionId || 'TXN-CONFIRMED', 48, 43.5);

    // Bottom Decorative Bar
    doc.setFillColor(navyHeader[0], navyHeader[1], navyHeader[2]);
    doc.rect(1.5, 46.5, 83, 6, 'F');
    doc.setDrawColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.setLineWidth(0.15);
    doc.line(1.5, 46.5, 84.5, 46.5);

    doc.setFontSize(3.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('DARPAN: JK/2018/0190361 · 80G · 12A · LEI · FCRA VERIFIED', 4, 49.5);
    doc.text('Al Shujaiat Foundation Jammu & Kashmir', 4, 51.8);

    // Authorized Stamp
    doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.roundedRect(63, 47, 20, 5, 0.8, 0.8, 'F');
    doc.setFontSize(3.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('MOHD AMIN GANAI', 73, 49.2, { align: 'center' });
    doc.setFontSize(2.8);
    doc.text('DIRECTOR GENERAL', 73, 51.2, { align: 'center' });

    // ==========================================
    // PAGE 2: BACK OF THE MEMBERSHIP CARD
    // ==========================================
    doc.addPage([86, 54], 'landscape');

    doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
    doc.roundedRect(0, 0, 86, 54, 2, 2, 'F');

    doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(1, 1, 84, 52, 1.5, 1.5, 'D');

    // Magnetic Stripe Simulation
    doc.setFillColor(10, 15, 25);
    doc.rect(1.5, 2.5, 83, 7, 'F');
    doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.setLineWidth(0.2);
    doc.line(1.5, 9.5, 84.5, 9.5);

    // Header
    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.5);
    doc.text('STATUTORY ACCREDITATION & FOUNDATION CHARTER', 43, 13, { align: 'center' });

    // Accreditation Matrix Box
    doc.setFillColor(25, 30, 50);
    doc.roundedRect(3, 15, 80, 12, 1, 1, 'F');
    doc.setFontSize(4);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.text('NGO-DARPAN: JK/2018/0190361', 5, 18.5);
    doc.text('80G Tax Exemption: DEL-AE28396-27022018/9728', 5, 22);
    doc.text('12A Registration: DEL-AR26932-27022018/8830', 5, 25.5);

    doc.text('FCRA Number: 004872022', 45, 18.5);
    doc.text('LEI ID: 9845008779YC3EE0IE41', 45, 22);
    doc.text('Legal Status: Registered Trust', 45, 25.5);

    // Office Addresses Box
    doc.setFillColor(25, 30, 50);
    doc.roundedRect(3, 28.5, 80, 14, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(3.8);
    doc.setFont('helvetica', 'bold');
    doc.text('REGISTERED OFFICE:', 5, 31.5);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.registeredAddress || 'D-45, 1st FLOOR ZAKIR NAGAR WEST DELHI NEW DELHI 110025', 5, 34.5);

    doc.setFont('helvetica', 'bold');
    doc.text('OPERATING / FIELD OFFICE:', 5, 38);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.operatingAddress || 'Luragam Tral Pulwama Jammu and Kashmir 192123', 5, 41);

    // Membership Rights & Privileges
    doc.setFillColor(30, 20, 40);
    doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.setLineWidth(0.15);
    doc.roundedRect(3, 44, 80, 7.5, 1, 1, 'FD');

    doc.setFontSize(3.4);
    doc.setTextColor(230, 230, 230);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'This card certifies accredited NGO membership of Al Shujaiat Foundation J&K with statutory governance and advisory privileges.',
      43,
      47,
      { align: 'center', maxWidth: 76 }
    );
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.text(`HELPLINE: ${settings.phone} / ${settings.emergencyPhone || '+91 94193 01319'}  |  ${settings.email}`, 43, 50.2, { align: 'center' });

    return doc;
  }
}
