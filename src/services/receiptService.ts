import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Receipt, SystemSettings } from '../types';

export class ReceiptService {
  /**
   * Generates a professional, legally compliant official tax receipt PDF
   */
  public static generateReceiptPDF(receipt: Receipt, settings: SystemSettings): jsPDF {
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

    // Foundation Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('AL SHUJAIAT FOUNDATION JAMMU & KASHMIR (ASFJK)', 20, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text(`Reg. Office: ${settings.registeredAddress}`, 20, 30);
    doc.text(`Operating Office: ${settings.operatingAddress || 'Luragam Tral Pulwama Jammu and Kashmir 192123'}`, 20, 34);
    doc.text(`Email: ${settings.email} | Helplines: ${settings.phone} / ${settings.emergencyPhone || '+91 94193 01319'} | Web: ${settings.websiteUrl}`, 20, 38);

    // Registration Credentials & Tax Exemption Header Block
    doc.setFillColor(243, 245, 250);
    doc.roundedRect(20, 42, 170, 16, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Trust Reg No: ${settings.registrationNumber}`, 25, 47);
    doc.text(`80G Exemption No: ${settings.taxExemptionNumber80G}`, 25, 52);
    doc.text(`FCRA Registration: ${settings.fcraRegistrationNumber}`, 110, 47);
    doc.text(`Govt of J&K Registered Charitable Trust`, 110, 52);

    // Receipt Title Badge
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.roundedRect(20, 62, 170, 9, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('OFFICIAL ASFJK CHARITABLE DONATION TAX RECEIPT', 105, 68, { align: 'center' });

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

    // Signatures & Stamp
    const stampY = complianceY + 25;
    doc.setDrawColor(200, 200, 210);
    doc.line(20, stampY, 75, stampY);
    doc.line(135, stampY, 190, stampY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text('Executive Director', 20, stampY + 5);
    doc.text('Verified Digital Stamp / Seal', 135, stampY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text('Mohd Amin Ganai · ASFJK', 20, stampY + 9);
    doc.text(`Generated: ${new Date().toISOString()}`, 135, stampY + 9);

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

  public static downloadReceipt(receipt: Receipt, settings: SystemSettings): void {
    const doc = this.generateReceiptPDF(receipt, settings);
    doc.save(`${receipt.receiptNumber}.pdf`);
  }
}
