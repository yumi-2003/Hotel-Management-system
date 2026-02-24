import { Request, Response } from 'express';
import Payment, { PaymentStatus } from '../models/Payment';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit-table';
import { format } from 'date-fns';

/**
 * Aggregates revenue data for a given year
 */
const getRevenueData = async (year: number) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

  const monthlyRevenue = await Payment.aggregate([
    {
      $match: {
        status: PaymentStatus.COMPLETED,
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$amount" },
        transactions: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  // Fill in missing months
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fullReport = months.map((month, index) => {
    const data = monthlyRevenue.find(r => r._id === index + 1);
    return {
      month,
      revenue: data?.revenue || 0,
      transactions: data?.transactions || 0
    };
  });

  return fullReport;
};

export const exportRevenueExcel = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const data = await getRevenueData(year);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Revenue ${year}`);

    // Add Styles
    worksheet.columns = [
      { header: 'Month', key: 'month', width: 20 },
      { header: 'Revenue ($)', key: 'revenue', width: 15 },
      { header: 'Transactions', key: 'transactions', width: 15 }
    ];

    // Header Styling
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F2F2F' }
    };

    // Add Data
    data.forEach(item => worksheet.addRow(item));

    // Summary Row
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalTransactions = data.reduce((sum, item) => sum + item.transactions, 0);
    
    const summaryRow = worksheet.addRow({ 
      month: 'TOTAL', 
      revenue: totalRevenue, 
      transactions: totalTransactions 
    });
    summaryRow.font = { bold: true };
    summaryRow.getCell(2).numFmt = '"$"#,##0.00';

    // Format currency column
    worksheet.getColumn(2).numFmt = '"$"#,##0.00';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Revenue_Report_${year}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Excel Export Error:', error);
    res.status(500).json({ message: 'Failed to generate Excel report' });
  }
};

export const exportRevenuePDF = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const data = await getRevenueData(year);
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Revenue_Report_${year}.pdf`);

    doc.pipe(res);

    // Header
    doc
      .fontSize(22)
      .fillColor('#0f2f2f')
      .text('COMFTAY RESORT HOTELS', { align: 'center' })
      .fontSize(14)
      .fillColor('#6b7280')
      .text('Revenue Analytics Report', { align: 'center' })
      .moveDown(1.5);

    doc
      .fontSize(10)
      .fillColor('#374151')
      .text(`Report Period: January ${year} - December ${year}`)
      .text(`Generated on: ${format(new Date(), 'PPpp')}`)
      .moveDown(2);

    // Stats Overview Box
    const boxTop = doc.y;
    doc
      .rect(30, boxTop, 535, 60)
      .fill('#f9fafb')
      .stroke('#e5e7eb');
    
    doc
      .fillColor('#111827')
      .fontSize(10)
      .text('TOTAL ANNUAL REVENUE', 50, boxTop + 15)
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 50, boxTop + 30)
      .font('Helvetica')
      .moveDown(4);

    // Table
    const table = {
      title: "Monthly Breakdown",
      headers: ["Month", "Transactions", "Revenue"],
      rows: data.map(item => [
        item.month,
        item.transactions.toString(),
        `$${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      ])
    };

    await doc.table(table, { 
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10).fillColor('#ffffff'),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font("Helvetica").fontSize(10).fillColor('#374151');
        return doc;
      },
      padding: [5],
      columnSpacing: 10,
    });

    doc.end();

  } catch (error) {
    console.error('PDF Export Error:', error);
    res.status(500).json({ message: 'Failed to generate PDF report' });
  }
};
