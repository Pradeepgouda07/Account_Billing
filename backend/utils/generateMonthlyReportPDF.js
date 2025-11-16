const PDFDocument = require("pdfkit");

function generateMonthlyReportPDF(report, month, year, res) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=monthly_report_${month}_${year}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(22).text("Monthly Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`Month: ${month} / ${year}`);
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Total Invoices: ${report.totalInvoices}`);
  doc.text(`Total Payments: ₹${report.totalPayments}`);
  doc.text(`Total Expenses: ₹${report.totalExpenses}`);
  doc.text(`Net Income: ₹${report.netIncome}`);

  doc.end();
}

module.exports = generateMonthlyReportPDF;
