import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export class ReportService {
  /**
   * Export any JSON dataset to CSV file
   */
  public static exportToCSV(data: any[], filename: string): void {
    if (!data || !data.length) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export dataset to Microsoft Excel (.xlsx)
   */
  public static exportToExcel(data: any[], filename: string, sheetName: string = 'Report'): void {
    if (!data || !data.length) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  /**
   * Export financial summary or transaction table to formatted PDF
   */
  public static exportTableToPDF(title: string, headers: string[], rows: any[][], filename: string): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Top Header Banner
    doc.setFillColor(57, 49, 134);
    doc.rect(0, 0, 297, 18, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('AL SHUJAIAT FOUNDATION JAMMU & KASHMIR (ASFJK)', 14, 11);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Official Executive Statement: ${title}`, 14, 25);
    doc.setTextColor(100, 100, 120);
    doc.setFontSize(8);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 230, 25);

    (doc as any).autoTable({
      startY: 30,
      head: [headers],
      body: rows,
      theme: 'striped',
      headStyles: {
        fillColor: [57, 49, 134],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
    });

    doc.save(`${filename}.pdf`);
  }
}
