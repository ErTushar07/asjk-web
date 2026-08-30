import { jsPDF } from 'jspdf';
import { VolunteerApplication, SystemSettings } from '../types';
import { ASFJK_LOGO_BASE64 } from './logoAsset';

export class VolunteerIdCardService {
  /**
   * Generates a high-resolution, print-ready official Volunteer Identity Card PDF (CR80 Standard Vertical Portrait: 54mm x 86mm)
   */
  public static generateIdCardPDF(volunteer: VolunteerApplication, settings: SystemSettings): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [54, 86], // Standard Vertical Portrait CR80 (54mm x 86mm)
    });

    const royalNavy = [30, 27, 75]; // #1E1B4B (Brand Logo Font Color)
    const goldAccent = [217, 119, 6]; // #D97706
    const goldLight = [251, 191, 36]; // #FBBF24

    // ==========================================
    // PAGE 1: FRONT OF THE ID CARD (PORTRAIT)
    // ==========================================
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(0, 0, 54, 86, 3, 3, 'F');

    // Outer Border
    doc.setDrawColor(royalNavy[0], royalNavy[1], royalNavy[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(0.5, 0.5, 53, 85, 2.5, 2.5, 'D');

    // Top-Left Corner Accent
    doc.setFillColor(royalNavy[0], royalNavy[1], royalNavy[2]);
    doc.triangle(0, 0, 18, 0, 0, 16, 'F');
    doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.setLineWidth(0.3);
    doc.line(0, 16, 18, 0);

    // Top Lanyard Slot
    doc.setFillColor(230, 235, 240);
    doc.roundedRect(20, 2.5, 14, 2.5, 1.2, 1.2, 'F');

    // Left Vertical Text
    doc.setFontSize(3.2);
    doc.setTextColor(royalNavy[0], royalNavy[1], royalNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVICE | COMPASSION | EMPOWERMENT', 1.8, 48, { angle: 90 });

    // Logo & Header
    try {
      doc.addImage(ASFJK_LOGO_BASE64, 'PNG', 20.5, 5, 13, 13);
    } catch {
      // Fallback
    }

    doc.setTextColor(royalNavy[0], royalNavy[1], royalNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('ASFJK', 27, 21.5, { align: 'center' });

    doc.setFontSize(3.8);
    doc.text('AL SHUJAIAT FOUNDATION', 27, 24, { align: 'center' });
    doc.setFontSize(3.2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('JAMMU & KASHMIR', 27, 26, { align: 'center' });

    // Card Title with Gold Lines
    doc.setTextColor(royalNavy[0], royalNavy[1], royalNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('VOLUNTEER', 27, 30.5, { align: 'center' });

    doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.setLineWidth(0.2);
    doc.line(12, 32.5, 18, 32.5);
    doc.line(36, 32.5, 42, 32.5);
    doc.setFontSize(4);
    doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.text('IDENTITY CARD', 27, 33.5, { align: 'center' });

    // Circular Photo Frame
    doc.setFillColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.circle(27, 45.5, 9.5, 'F');
    doc.setFillColor(245, 247, 250);
    doc.circle(27, 45.5, 9, 'F');

    // Avatar Placeholder Graphic
    doc.setFillColor(royalNavy[0], royalNavy[1], royalNavy[2]);
    doc.circle(27, 43, 3, 'F');
    doc.roundedRect(21.5, 47, 11, 7, 1.5, 1.5, 'F');

    // Bottom Royal Navy Wave Base Container
    doc.setFillColor(royalNavy[0], royalNavy[1], royalNavy[2]);
    doc.roundedRect(0, 56.5, 54, 29.5, 4, 4, 'F');

    doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.setLineWidth(0.3);
    doc.line(0, 56.5, 54, 56.5);

    // Candidate Info on Bottom
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    const displayName = volunteer.fullName.length > 22 ? volunteer.fullName.substring(0, 22) + '...' : volunteer.fullName;
    doc.text(displayName.toUpperCase(), 27, 61.5, { align: 'center' });

    doc.setTextColor(199, 210, 254);
    doc.setFontSize(4.2);
    doc.setFont('helvetica', 'normal');
    doc.text(volunteer.roleDesignation || 'Community Outreach Volunteer', 27, 65, { align: 'center' });

    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.setFont('courier', 'bold');
    doc.setFontSize(5);
    doc.text(`VOL ID : ${volunteer.membershipNumber || 'ASFJK25V078'}`, 27, 69, { align: 'center' });

    // Split Bar: Left QR Box, Right Slogan
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 72.5, 16, 13.5, 'F');

    doc.setFillColor(royalNavy[0], royalNavy[1], royalNavy[2]);
    doc.rect(3, 74.5, 10, 9.5, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(5, 76.5, 6, 5.5, 'F');
    doc.setFillColor(royalNavy[0], royalNavy[1], royalNavy[2]);
    doc.rect(7, 78.5, 2, 1.5, 'F');

    // Right Slogan
    doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.rect(16, 72.5, 38, 13.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.5);
    doc.text('TOGETHER', 35, 78, { align: 'center' });
    doc.setFontSize(3.5);
    doc.text('WE MAKE A DIFFERENCE', 35, 81.5, { align: 'center' });

    // ==========================================
    // PAGE 2: BACK OF THE ID CARD (PORTRAIT)
    // ==========================================
    doc.addPage([54, 86], 'portrait');

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(0, 0, 54, 86, 3, 3, 'F');

    doc.setDrawColor(royalNavy[0], royalNavy[1], royalNavy[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(0.5, 0.5, 53, 85, 2.5, 2.5, 'D');

    // Top-Left Corner Accent
    doc.setFillColor(royalNavy[0], royalNavy[1], royalNavy[2]);
    doc.triangle(0, 0, 18, 0, 0, 16, 'F');
    doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.setLineWidth(0.3);
    doc.line(0, 16, 18, 0);

    // Lanyard slot
    doc.setFillColor(230, 235, 240);
    doc.roundedRect(20, 2.5, 14, 2.5, 1.2, 1.2, 'F');

    // Header Logo & Text
    try {
      doc.addImage(ASFJK_LOGO_BASE64, 'PNG', 23, 6, 8, 8);
    } catch {
      // Fallback
    }

    doc.setTextColor(royalNavy[0], royalNavy[1], royalNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('ASFJK', 27, 16.5, { align: 'center' });
    doc.setFontSize(3.5);
    doc.text('AL SHUJAIAT FOUNDATION JAMMU & KASHMIR', 27, 19, { align: 'center' });

    doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.line(14, 21.5, 40, 21.5);
    doc.setFontSize(4.5);
    doc.text('— VOLUNTEER —', 27, 24, { align: 'center' });

    // Disclaimer
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(3.2);
    doc.setFont('helvetica', 'normal');
    doc.text('This card identifies the bearer as an authorized volunteer of Al Shujaiat Foundation (ASFJK).', 27, 28, { align: 'center', maxWidth: 46 });
    doc.text('This card is valid for the period shown below.', 27, 33, { align: 'center' });

    // Data Fields
    doc.setFontSize(3.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(148, 163, 184);
    doc.text('NAME', 5, 38);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(4.2);
    doc.text(displayName, 5, 41);

    doc.setFontSize(3.5);
    doc.setTextColor(148, 163, 184);
    doc.text('ROLE', 5, 45);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(4.2);
    doc.text(volunteer.roleDesignation || 'Community Outreach Volunteer', 5, 48);

    doc.setFontSize(3.5);
    doc.setTextColor(148, 163, 184);
    doc.text('VALID FROM', 5, 52);
    doc.text('VALID TILL', 30, 52);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(4);
    doc.text(volunteer.validFrom || '01 May 2025', 5, 55);
    doc.text(volunteer.validThru || '30 Apr 2026', 30, 55);

    doc.setFontSize(3.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`EMERGENCY CONTACT · BLOOD: ${volunteer.bloodGroup || 'O+'}`, 5, 59);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(4);
    doc.text(volunteer.phone || settings.phone || '+91 94193 01319', 5, 62);

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
    doc.setFillColor(royalNavy[0], royalNavy[1], royalNavy[2]);
    doc.rect(0, 75, 54, 11, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(3);
    doc.text('Jammu & Kashmir, India  |  www.asfjk.org  |  info@asfjk.org', 27, 79, { align: 'center' });
    doc.text('NGO-DARPAN: JK/2018/0190361 · 80G · 12A · LEI · /asfjkfoundation', 27, 82.5, { align: 'center' });

    return doc;
  }
}
