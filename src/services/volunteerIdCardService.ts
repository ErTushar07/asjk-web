import { jsPDF } from 'jspdf';
import { VolunteerApplication, SystemSettings } from '../types';
import { ASFJK_LOGO_BASE64 } from './logoAsset';

export class VolunteerIdCardService {
  /**
   * Generates a high-resolution, print-ready official Volunteer Identity Card PDF (CR80 Standard / Badge format)
   */
  public static generateIdCardPDF(volunteer: VolunteerApplication, settings: SystemSettings): jsPDF {
    // 2-page CR80 landscape card or A4 with front and back
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [86, 54], // Standard ID card size: 86mm x 54mm
    });

    const primaryColor = [57, 49, 134]; // #393186 (Purple)
    const secondaryColor = [228, 9, 129]; // #E40981 (Pink)
    const darkColor = [23, 23, 37];
    const grayColor = [95, 98, 114];

    // ==========================================
    // PAGE 1: FRONT OF THE ID CARD
    // ==========================================
    // Header Bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 86, 12, 'F');
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, 12, 86, 1.2, 'F');

    // Logo on Header
    try {
      doc.addImage(ASFJK_LOGO_BASE64, 'PNG', 3, 1.5, 9, 9);
    } catch {
      // Fallback
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('AL SHUJAIAT FOUNDATION', 14, 5);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.text('JAMMU & KASHMIR · HUMANITARIAN SERVICES', 14, 8);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL VOLUNTEER IDENTITY CARD', 14, 11);

    // Left Side: Photo Frame / Avatar Box
    doc.setFillColor(243, 245, 250);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(4, 15, 22, 26, 1.5, 1.5, 'FD');

    // Avatar Placeholder Graphics
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.circle(15, 23, 4, 'F');
    doc.roundedRect(8, 28, 14, 10, 2, 2, 'F');

    doc.setFontSize(4.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('VERIFIED', 15, 40, { align: 'center' });

    // Right Side: Volunteer Details
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const displayName = volunteer.fullName.length > 20 ? volunteer.fullName.substring(0, 20) + '...' : volunteer.fullName;
    doc.text(displayName.toUpperCase(), 29, 18);

    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(volunteer.roleDesignation || 'HUMANITARIAN FIELD SPECIALIST', 29, 21.5);

    // Details Grid
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.text('VOLUNTEER ID:', 29, 26);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('courier', 'bold');
    doc.setFontSize(5.5);
    doc.text(volunteer.membershipNumber || `ASF-VOL-2026-${volunteer.id.slice(-4)}`, 45, 26);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFontSize(5);
    doc.text('QUALIFICATION:', 29, 29.5);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'normal');
    const qualText = (volunteer.qualification || "Bachelor's Degree").length > 25 
      ? (volunteer.qualification || "Bachelor's Degree").substring(0, 25) + '...' 
      : (volunteer.qualification || "Bachelor's Degree");
    doc.text(qualText, 45, 29.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('LOCATION:', 29, 33);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(`${volunteer.city}, ${volunteer.country}`, 45, 33);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('VALID THRU:', 29, 36.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(volunteer.validThru || '2027-08-31', 45, 36.5);

    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('BLOOD GROUP:', 29, 40);
    doc.setTextColor(228, 9, 129);
    doc.setFont('helvetica', 'bold');
    doc.text(volunteer.bloodGroup || 'O+', 45, 40);

    // Bottom Decorative Bar with Security Hologram Mark
    doc.setFillColor(243, 245, 250);
    doc.rect(0, 44, 86, 10, 'F');
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 43.5, 86, 0.5, 'F');

    doc.setFontSize(4.2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('NGO-DARPAN: JK/2018/0190361 · 80G · 12A · FCRA · LEI VERIFIED', 4, 47.5);
    doc.text('Issued by Authority of Executive Director, ASFJK', 4, 51);

    // Digital Security Badge on bottom right
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(64, 44.5, 18, 7.5, 1, 1, 'FD');
    doc.setFontSize(4.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('AUTHORIZED', 73, 47.5, { align: 'center' });
    doc.setFontSize(3.8);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('MOHD AMIN GANAI', 73, 50.5, { align: 'center' });

    // ==========================================
    // PAGE 2: BACK OF THE ID CARD (LEGAL & EMERGENCY)
    // ==========================================
    doc.addPage([86, 54], 'landscape');

    // Header Stripe
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 86, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.5);
    doc.text('FOUNDATION LEGAL CREDENTIALS & EMERGENCY CONTACTS', 43, 3.5, { align: 'center' });

    // Accreditation Matrix Box
    doc.setFillColor(243, 245, 250);
    doc.roundedRect(3, 7, 80, 11, 1, 1, 'F');
    doc.setFontSize(4.2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('NITI Aayog NGO-DARPAN: JK/2018/0190361', 5, 10);
    doc.text('Section 80G Tax: DEL-AE28396-27022018/9728', 5, 13);
    doc.text('Section 12A Reg: DEL-AR26932-27022018/8830', 5, 16);

    doc.text('FCRA Number: 004872022', 45, 10);
    doc.text('Legal Entity ID (LEI): 9845008779YC3EE0IE41', 45, 13);
    doc.text('Status: Perpetual Charitable Trust', 45, 16);

    // Office Addresses Box
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(4.2);
    doc.setFont('helvetica', 'bold');
    doc.text('REGISTERED OFFICE:', 3, 21);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.registeredAddress || 'D-45, 1st FLOOR ZAKIR NAGAR WEST DELHI NEW DELHI 110025', 3, 24);

    doc.setFont('helvetica', 'bold');
    doc.text('OPERATING / FIELD OFFICE:', 3, 28);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.operatingAddress || 'Luragam Tral Pulwama Jammu and Kashmir 192123', 3, 31);

    doc.setFont('helvetica', 'bold');
    doc.text('HELPLINE & WHATSAPP:', 3, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`${settings.phone} / ${settings.emergencyPhone || '+91 94193 01319'}  |  Email: ${settings.email}`, 3, 38);

    // Terms of Authorization
    doc.setFillColor(255, 245, 248);
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(3, 40.5, 80, 11, 1, 1, 'FD');

    doc.setFontSize(3.8);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'This credential certifies that the bearer is an accredited volunteer of Al Shujaiat Foundation Jammu & Kashmir. Authorized for relief operations, community welfare, medical assistance, and field coordination.',
      4.5,
      43.5,
      { maxWidth: 77 }
    );
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('IF FOUND, PLEASE RETURN TO OPERATING OFFICE OR CALL HELPLINE DIRECTLY.', 43, 49.5, { align: 'center' });

    return doc;
  }
}
