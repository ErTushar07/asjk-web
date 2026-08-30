import { jsPDF } from 'jspdf';
import { NgoMembership, SystemSettings } from '../types';
import { ASFJK_LOGO_BASE64 } from './logoAsset';

export class MembershipCardService {
  /**
   * Generates a high-resolution, print-ready official NGO Membership ID Card PDF (CR80 Standard Vertical: 54mm x 86mm)
   */
  public static generateMembershipCardPDF(member: NgoMembership, settings: SystemSettings): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [54, 86], // Standard Vertical Portrait CR80 (54mm x 86mm)
    });

    const goldAccent = [217, 119, 6]; // #D97706
    const goldLight = [251, 191, 36]; // #FBBF24

    // Tier-specific primary color palette
    let primaryColor = [10, 77, 60]; // General Member: Forest Green (#0A4D3C)
    let tierTitle = 'GENERAL MEMBER';

    if (member.tier === 'associate_silver') {
      primaryColor = [30, 41, 59]; // Slate / Silver Charcoal (#1E293B)
      tierTitle = 'ASSOCIATE SILVER';
    } else if (member.tier === 'patron_gold') {
      primaryColor = [120, 53, 15]; // Royal Amber (#78350F)
      tierTitle = 'PATRON GOLD';
    } else if (member.tier === 'founding_platinum') {
      primaryColor = [74, 4, 78]; // Royal Velvet Purple (#4A044E)
      tierTitle = 'FOUNDING PLATINUM';
    } else if (member.tier === 'benefactor_diamond') {
      primaryColor = [8, 51, 68]; // Deep Sapphire Cyan (#083344)
      tierTitle = 'BENEFACTOR DIAMOND';
    }

    // ==========================================
    // PAGE 1: FRONT OF THE ID CARD (PORTRAIT)
    // ==========================================
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(0, 0, 54, 86, 3, 3, 'F');

    // Outer Border
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(0.5, 0.5, 53, 85, 2.5, 2.5, 'D');

    // Top-Left Tier Accent Triangle
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.triangle(0, 0, 30, 0, 0, 24, 'F');
    doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.setLineWidth(0.4);
    doc.line(0, 24, 30, 0);

    // Top Lanyard Slot
    doc.setFillColor(230, 235, 240);
    doc.roundedRect(20, 2.5, 14, 2.5, 1.2, 1.2, 'F');

    // Left Vertical Text
    doc.setFontSize(3.2);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVICE | CHARTER | EMPOWERMENT', 1.8, 48, { angle: 90 });

    // Logo & Header
    try {
      doc.addImage(ASFJK_LOGO_BASE64, 'PNG', 22.5, 6, 9, 9);
    } catch {
      // Fallback
    }

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('ASFJK', 27, 18, { align: 'center' });

    doc.setFontSize(3.8);
    doc.text('AL SHUJAIAT FOUNDATION', 27, 20.5, { align: 'center' });
    doc.setFontSize(3.2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('JAMMU & KASHMIR · REGISTERED TRUST', 27, 22.5, { align: 'center' });

    // Card Title with Gold Lines
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('NGO MEMBERSHIP', 27, 27.5, { align: 'center' });

    doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.setLineWidth(0.2);
    doc.line(10, 29.5, 16, 29.5);
    doc.line(38, 29.5, 44, 29.5);
    doc.setFontSize(3.8);
    doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.text(tierTitle, 27, 30.5, { align: 'center' });

    // Circular Photo Frame
    doc.setFillColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.circle(27, 43, 10.5, 'F');
    doc.setFillColor(245, 247, 250);
    doc.circle(27, 43, 10, 'F');

    // Avatar Placeholder Graphic
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.circle(27, 40.5, 3.5, 'F');
    doc.roundedRect(21, 44.5, 12, 8, 1.5, 1.5, 'F');

    // Bottom Tier Wave Base Container
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(0, 56, 54, 30, 4, 4, 'F');

    doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.setLineWidth(0.3);
    doc.line(0, 56, 54, 56);

    // Member Info on Bottom
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    const displayName = member.fullName.length > 22 ? member.fullName.substring(0, 22) + '...' : member.fullName;
    doc.text(displayName.toUpperCase(), 27, 61, { align: 'center' });

    doc.setTextColor(220, 230, 242);
    doc.setFontSize(4);
    doc.setFont('helvetica', 'normal');
    doc.text(`${member.tierName} · ${member.durationYears} Yrs`, 27, 64.5, { align: 'center' });

    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.setFont('courier', 'bold');
    doc.setFontSize(5);
    doc.text(`MBR ID : ${member.membershipNumber}`, 27, 68.5, { align: 'center' });

    // Split Bar: Left QR Box, Right Slogan
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 72, 16, 14, 'F');

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(3, 74, 10, 10, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(5, 76, 6, 6, 'F');
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(7, 78, 2, 2, 'F');

    // Right Slogan
    doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.rect(16, 72, 38, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.5);
    doc.text('ACCREDITED MEMBER', 35, 78, { align: 'center' });
    doc.setFontSize(3.2);
    doc.text('AL SHUJAIAT FOUNDATION', 35, 81.5, { align: 'center' });

    // ==========================================
    // PAGE 2: BACK OF THE ID CARD (PORTRAIT)
    // ==========================================
    doc.addPage([54, 86], 'portrait');

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(0, 0, 54, 86, 3, 3, 'F');

    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(0.5, 0.5, 53, 85, 2.5, 2.5, 'D');

    // Top-Left Accent
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.triangle(0, 0, 24, 0, 0, 18, 'F');
    doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.setLineWidth(0.3);
    doc.line(0, 18, 24, 0);

    // Lanyard slot
    doc.setFillColor(230, 235, 240);
    doc.roundedRect(20, 2.5, 14, 2.5, 1.2, 1.2, 'F');

    // Header Logo & Text
    try {
      doc.addImage(ASFJK_LOGO_BASE64, 'PNG', 23, 6, 8, 8);
    } catch {
      // Fallback
    }

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('ASFJK', 27, 16.5, { align: 'center' });
    doc.setFontSize(3.5);
    doc.text('AL SHUJAIAT FOUNDATION JAMMU & KASHMIR', 27, 19, { align: 'center' });

    doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.line(14, 21.5, 40, 21.5);
    doc.setFontSize(4.5);
    doc.text('— NGO MEMBERSHIP —', 27, 24, { align: 'center' });

    // Disclaimer
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(3.2);
    doc.setFont('helvetica', 'normal');
    doc.text('This card identifies the bearer as an accredited NGO Member of Al Shujaiat Foundation (ASFJK).', 27, 28, { align: 'center', maxWidth: 46 });
    doc.text('This card is valid for the statutory period shown below.', 27, 33, { align: 'center' });

    // Data Fields
    doc.setFontSize(3.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(148, 163, 184);
    doc.text('MEMBER NAME', 5, 38);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(4.2);
    doc.text(displayName, 5, 41);

    doc.setFontSize(3.5);
    doc.setTextColor(148, 163, 184);
    doc.text('TIER & CONTRIBUTION', 5, 45);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(4.2);
    doc.text(`${member.tierName} (${member.currency} ${member.paidAmount.toLocaleString()})`, 5, 48);

    doc.setFontSize(3.5);
    doc.setTextColor(148, 163, 184);
    doc.text('VALID FROM', 5, 52);
    doc.text(`VALID TILL (${member.durationYears} YRS)`, 28, 52);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(4);
    doc.text(member.validFrom, 5, 55);
    doc.text(member.validThru, 28, 55);

    doc.setFontSize(3.5);
    doc.setTextColor(148, 163, 184);
    doc.text('STATUTORY REGISTRATIONS & TAX', 5, 59);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(3.8);
    doc.text(`NGO-DARPAN: JK/2018/0190361 · 80G · 12A`, 5, 62);

    // Signatory & Seal
    doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.setLineWidth(0.2);
    doc.line(5, 64.5, 49, 64.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4);
    doc.setTextColor(15, 23, 42);
    doc.text('Mohd Amin Ganai', 5, 68);
    doc.setFontSize(3);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Founder & Chairman', 5, 70.5);

    // Stamp Circle
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.2);
    doc.circle(42, 69, 4, 'D');
    doc.setFontSize(2);
    doc.setTextColor(30, 58, 138);
    doc.text('ASFJK', 42, 69.5, { align: 'center' });

    // Footer Bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 75, 54, 11, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(3);
    doc.text('Jammu & Kashmir, India  |  www.asfjk.org  |  info@asfjk.org', 27, 79, { align: 'center' });
    doc.text(`${settings.taxExemptionNumber80G} · /asfjkfoundation`, 27, 82.5, { align: 'center' });

    return doc;
  }
}
