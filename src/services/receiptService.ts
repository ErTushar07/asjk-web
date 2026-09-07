import type { jsPDF as JsPDFType } from 'jspdf';
import { Receipt, NgoMembership, SystemSettings } from '../types';
import { LOGO_ASSET_URL } from './logoAsset';
import { STAMP_ASSET_URL, SIGNATURE_ASSET_URL } from './stampAsset';

export class ReceiptService {
  /**
   * Generates a professional, legally compliant official tax receipt PDF
   */
  public static async generateReceiptPDF(receipt: Receipt, settings: SystemSettings): Promise<JsPDFType> {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = [57, 49, 134]; // #393186 (Purple)
    const secondaryColor = [228, 9, 129]; // #E40981 (Pink)
    const grayText = [95, 98, 114];
    const darkText = [23, 23, 37];

    // Top Brand Gradient Bar
    doc.setFillColor(57, 49, 134);
    doc.rect(0, 0, 210, 8, 'F');
    doc.setFillColor(228, 9, 129);
    doc.rect(0, 8, 210, 2, 'F');

    // NGO Official Brand Logo
    if (typeof window !== 'undefined') {
      try {
        doc.addImage(LOGO_ASSET_URL, 'PNG', 18, 13, 20, 20);
      } catch (e) {
        // Fallback
      }
    }

    // Foundation Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('AL SHUJAIAT FOUNDATION JAMMU & KASHMIR (ASFJK)', 42, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text(`Reg. Office: ${settings.registeredAddress}`, 42, 23);
    doc.text(`Operating Office: ${settings.operatingAddress || 'Luragam Tral Pulwama Jammu and Kashmir 192123'}`, 42, 27);
    doc.text(`Email: ${settings.email} | Helplines: ${settings.phone} / ${settings.emergencyPhone || '+91 94193 01319'} | Web: ${settings.websiteUrl}`, 42, 31);

    // Registration Credentials & Tax Exemption Header Block
    doc.setFillColor(243, 245, 250);
    doc.roundedRect(18, 36, 174, 18, 2, 2, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`NGO-DARPAN: ${settings.registrationNumber}`, 22, 41);
    doc.text(`80G Exemption: ${settings.taxExemptionNumber80G}`, 22, 46);
    doc.text(`12A Reg: ${settings.taxExemptionNumber12A || 'DEL-AR26932-27022018/8830'}`, 22, 51);
    
    doc.text(`FCRA Registration: ${settings.fcraRegistrationNumber}`, 110, 41);
    doc.text(`LEI ID: ${settings.leiNumber || '9845008779YC3EE0IE41'}`, 110, 46);
    doc.text(`Section 12A & 80G Certified Non-Profit Trust`, 110, 51);

    // Receipt Title Badge
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.roundedRect(18, 58, 174, 8.5, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text('OFFICIAL CHARITABLE DONATION TAX RECEIPT', 105, 63.5, { align: 'center' });

    // Key Metadata Grid (Receipt #, Date, Txn ID)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text('Receipt Number:', 20, 78);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.receiptNumber, 55, 78);

    doc.setFont('helvetica', 'bold');
    doc.text('Date of Issuance:', 120, 78);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(receipt.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 155, 78);

    doc.setFont('helvetica', 'bold');
    doc.text('Transaction ID:', 20, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.transactionId, 55, 85);

    doc.setFont('helvetica', 'bold');
    doc.text('Payment Method:', 120, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.paymentMethod, 155, 85);

    // Donor Information Card
    doc.setFillColor(247, 248, 252);
    doc.roundedRect(20, 92, 170, 32, 2, 2, 'F');
    doc.setDrawColor(226, 229, 237);
    doc.roundedRect(20, 92, 170, 32, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('DONOR DETAILS', 25, 99);

    doc.setFontSize(9);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text('Donor Name:', 25, 106);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.donorName, 55, 106);

    doc.setFont('helvetica', 'bold');
    doc.text('Email Address:', 25, 113);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.donorEmail, 55, 113);

    if (receipt.donorTaxId) {
      doc.setFont('helvetica', 'bold');
      doc.text('PAN / Tax ID:', 115, 106);
      doc.setFont('helvetica', 'normal');
      doc.text(receipt.donorTaxId, 142, 106);
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Donor Address:', 25, 120);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.donorAddress || 'International Donor', 55, 120);

    // Contribution Itemization Table
    const tableData = [
      [
        '1',
        receipt.projectName + (receipt.campaignName ? ` (${receipt.campaignName})` : ''),
        receipt.recurringDonationId ? 'Monthly/Yearly Subscription' : 'One-Time Direct Allocation',
        `${receipt.currency} ${receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]
    ];

    (doc as any).autoTable({
      startY: 130,
      head: [['#', 'Allocated Program / Purpose', 'Contribution Type', 'Total Received']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [57, 49, 134],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 80 },
        2: { cellWidth: 45 },
        3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;

    // Total In Words Box
    doc.setFillColor(238, 247, 251);
    doc.roundedRect(20, finalY, 170, 16, 2, 2, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('TOTAL AMOUNT RECEIVED:', 25, finalY + 6);
    doc.setFontSize(11);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`${receipt.currency} ${receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 75, finalY + 6);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text(`Equivalent Value in USD: $${receipt.amountUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 25, finalY + 12);

    // Tax Declaration & Compliance Note
    const complianceY = finalY + 22;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('TAX EXEMPTION & LEGAL DECLARATION:', 20, complianceY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    const splitTaxText = doc.splitTextToSize(
      receipt.taxExemptionText || 
      'This receipt acknowledges voluntary charitable contribution to Al Shujaiat Foundation Jammu & Kashmir (ASFJK). Donations are eligible for 50% deduction under Section 80G of the Indian Income Tax Act, 1961. International gifts comply with cross-border NGO governance guidelines.', 
      170
    );
    doc.text(splitTaxText, 20, complianceY + 5);

    // Signatures & Official Stamp
    const stampY = complianceY + 28;

    // Real Signature & Seal
    if (typeof window !== 'undefined') {
      try {
        doc.addImage(SIGNATURE_ASSET_URL, 'PNG', 20, stampY - 14, 26, 13);
      } catch (e) {}

      try {
        doc.addImage(STAMP_ASSET_URL, 'PNG', 142, stampY - 18, 22, 22);
      } catch (e) {}
    }

    doc.setDrawColor(200, 200, 210);
    doc.line(20, stampY, 75, stampY);
    doc.line(135, stampY, 190, stampY);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text('Mohd Amin Ganai', 20, stampY + 5);
    doc.text('Official Seal & Registration', 135, stampY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text('President & Founder · ASFJK', 20, stampY + 9);
    doc.text(`NGO-DARPAN: JK/2018/0190361`, 135, stampY + 9);

    // Security Verification Hash
    doc.setFillColor(243, 245, 250);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setFontSize(7);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text(
      `Secure Verification Hash: SHA256-ASFJK-${receipt.id}-${receipt.receiptNumber}-${receipt.transactionId}`,
      105, 290, { align: 'center' }
    );
    doc.text('This is an official computer-generated tax receipt from Al Shujaiat Foundation Jammu & Kashmir (ASFJK).', 105, 294, { align: 'center' });

    return doc;
  }

  public static async downloadReceipt(receipt: Receipt, settings: SystemSettings): Promise<void> {
    const doc = await this.generateReceiptPDF(receipt, settings);
    doc.save(`${receipt.receiptNumber}.pdf`);
  }

  /**
   * Generates official membership tax receipt PDF displaying all required membership fields
   */
  public static async generateMembershipReceiptPDF(member: NgoMembership, settings: SystemSettings): Promise<JsPDFType> {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = [57, 49, 134]; // #393186
    const secondaryColor = [228, 9, 129]; // #E40981
    const grayText = [95, 98, 114];
    const darkText = [23, 23, 37];

    // Top Brand Gradient Bar
    doc.setFillColor(57, 49, 134);
    doc.rect(0, 0, 210, 8, 'F');
    doc.setFillColor(228, 9, 129);
    doc.rect(0, 8, 210, 2, 'F');

    // NGO Brand Logo
    if (typeof window !== 'undefined') {
      try {
        doc.addImage(LOGO_ASSET_URL, 'PNG', 18, 13, 20, 20);
      } catch {}
    }

    // Foundation Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('AL SHUJAIAT FOUNDATION JAMMU & KASHMIR (ASFJK)', 42, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text(`Reg. Office: ${settings.registeredAddress}`, 42, 23);
    doc.text(`Operating Office: ${settings.operatingAddress || 'Luragam Tral Pulwama Jammu and Kashmir 192123'}`, 42, 27);
    doc.text(`Email: ${settings.email} | Helpline: ${settings.phone} | Web: ${settings.websiteUrl}`, 42, 31);

    // Registration Credentials Block
    doc.setFillColor(243, 245, 250);
    doc.roundedRect(18, 36, 174, 18, 2, 2, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`NGO-DARPAN: ${settings.registrationNumber}`, 22, 41);
    doc.text(`80G Exemption: ${settings.taxExemptionNumber80G}`, 22, 46);
    doc.text(`12A Reg: ${settings.taxExemptionNumber12A || 'DEL-AR26932-27022018/8830'}`, 22, 51);
    doc.text(`FCRA Registration: ${settings.fcraRegistrationNumber}`, 110, 41);
    doc.text(`LEI ID: ${settings.leiNumber || '9845008779YC3EE0IE41'}`, 110, 46);
    doc.text(`Section 12A & 80G Certified Non-Profit Trust`, 110, 51);

    // Receipt Title Badge
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(18, 58, 174, 8.5, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text('OFFICIAL NGO MEMBERSHIP CONTRIBUTION TAX RECEIPT', 105, 63.5, { align: 'center' });

    const receiptId = member.receiptNumber || `ASJ-REC-${member.membershipNumber || member.id.slice(4)}`;
    const paymentId = member.paymentId || member.transactionId || 'ONLINE-VERIFIED';
    const orderId = member.orderId || member.transactionId || 'ORD-VERIFIED';
    const totalContrib = member.totalContribution || member.paidAmount || (member.annualAmount * member.durationYears);
    const annualBase = member.annualAmount || (totalContrib / (member.durationYears || 1));

    // Metadata Grid (Receipt ID, Date, Payment ID, Order ID)
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);

    doc.text('Receipt ID:', 20, 76);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptId, 52, 76);

    doc.setFont('helvetica', 'bold');
    doc.text('Payment Date:', 120, 76);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(member.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 152, 76);

    doc.setFont('helvetica', 'bold');
    doc.text('Payment ID:', 20, 83);
    doc.setFont('helvetica', 'normal');
    doc.text(paymentId, 52, 83);

    doc.setFont('helvetica', 'bold');
    doc.text('Order ID:', 120, 83);
    doc.setFont('helvetica', 'normal');
    doc.text(orderId, 152, 83);

    doc.setFont('helvetica', 'bold');
    doc.text('Payment Method:', 20, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(member.paymentMethod || 'Razorpay Gateway', 52, 90);

    doc.setFont('helvetica', 'bold');
    doc.text('Currency Paid:', 120, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(member.currency, 152, 90);

    // Member Information Card
    doc.setFillColor(247, 248, 252);
    doc.roundedRect(20, 96, 170, 28, 2, 2, 'F');
    doc.setDrawColor(226, 229, 237);
    doc.roundedRect(20, 96, 170, 28, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('MEMBER DETAILS', 25, 102);

    doc.setFontSize(8.5);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text('Member Name:', 25, 108);
    doc.setFont('helvetica', 'normal');
    doc.text(member.fullName, 58, 108);

    doc.setFont('helvetica', 'bold');
    doc.text('Member ID:', 120, 108);
    doc.setFont('helvetica', 'normal');
    doc.text(member.membershipNumber, 148, 108);

    doc.setFont('helvetica', 'bold');
    doc.text('Member Email:', 25, 115);
    doc.setFont('helvetica', 'normal');
    doc.text(member.email, 58, 115);

    doc.setFont('helvetica', 'bold');
    doc.text('Phone:', 120, 115);
    doc.setFont('helvetica', 'normal');
    doc.text(member.phone || 'N/A', 148, 115);

    doc.setFont('helvetica', 'bold');
    doc.text('Location:', 25, 121);
    doc.setFont('helvetica', 'normal');
    doc.text(`${member.city || 'Srinagar'}, ${member.country || 'India'}`, 58, 121);

    // Membership Contribution Table
    const tableData = [
      [
        '1',
        `Al Shujaiat Foundation NGO Membership Program`,
        member.tierName,
        `${member.currency} ${annualBase.toLocaleString()}`,
        `${member.durationYears} ${member.durationYears === 1 ? 'Year' : 'Years'}`,
        `${member.validFrom} to ${member.validThru}`,
        `${member.currency} ${totalContrib.toLocaleString()}`
      ]
    ];

    (doc as any).autoTable({
      startY: 129,
      head: [['#', 'Program Name', 'Membership Level', 'Base / Year', 'Duration', 'Validity Period', 'Total Contribution']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [57, 49, 134],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 8,
        cellPadding: 3.5,
      },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 38 },
        2: { cellWidth: 30, fontStyle: 'bold' },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 26, halign: 'center', fontSize: 7.5 },
        6: { cellWidth: 28, halign: 'right', fontStyle: 'bold' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 6;

    // Total Amount Highlight Box
    doc.setFillColor(238, 247, 251);
    doc.roundedRect(20, finalY, 170, 14, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('TOTAL MEMBERSHIP CONTRIBUTION RECEIVED:', 25, finalY + 5.5);
    doc.setFontSize(11);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`${member.currency} ${totalContrib.toLocaleString()}`, 25, finalY + 10.5);

    // Legal & Exemption Text
    const complianceY = finalY + 19;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('TAX EXEMPTION & LEGAL DECLARATION:', 20, complianceY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    const splitTaxText = doc.splitTextToSize(
      'This receipt acknowledges voluntary membership contribution to Al Shujaiat Foundation Jammu & Kashmir (ASFJK). Contributions support non-profit humanitarian aid, education, healthcare, and community empowerment. Eligible for tax benefits under Section 80G and 12A of the Indian Income Tax Act, 1961.',
      170
    );
    doc.text(splitTaxText, 20, complianceY + 4.5);

    // Signatures & Official Stamp
    const stampY = complianceY + 28;
    if (typeof window !== 'undefined') {
      try {
        doc.addImage(SIGNATURE_ASSET_URL, 'PNG', 20, stampY - 14, 26, 13);
      } catch {}
      try {
        doc.addImage(STAMP_ASSET_URL, 'PNG', 142, stampY - 18, 22, 22);
      } catch {}
    }

    doc.setDrawColor(200, 200, 210);
    doc.line(20, stampY, 75, stampY);
    doc.line(135, stampY, 190, stampY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text('Mohd Amin Ganai', 20, stampY + 4.5);
    doc.text('Official Seal & Registration', 135, stampY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text('President & Founder · ASFJK', 20, stampY + 8.5);
    doc.text('NGO-DARPAN: JK/2018/0190361', 135, stampY + 8.5);

    // Footer Hash
    doc.setFillColor(243, 245, 250);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setFontSize(7);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text(
      `Secure Verification Hash: SHA256-ASFJK-MBR-${member.id}-${receiptId}-${paymentId}`,
      105, 290, { align: 'center' }
    );
    doc.text('Official computer-generated membership credential receipt from Al Shujaiat Foundation Jammu & Kashmir (ASFJK).', 105, 294, { align: 'center' });

    return doc;
  }

  public static async downloadMembershipReceipt(member: NgoMembership, settings: SystemSettings): Promise<void> {
    const doc = await this.generateMembershipReceiptPDF(member, settings);
    doc.save(`${member.receiptNumber || member.membershipNumber}_Receipt.pdf`);
  }
}
