const PDFDocument = require("pdfkit");

function generateInvoicePDF(invoice, lines, res) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice_${invoice._id}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text("INVOICE", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Invoice ID: ${invoice._id}`);
  doc.text(`Issue Date: ${invoice.issueDate.toISOString().split("T")[0]}`);
  doc.text(`Due Date: ${invoice.dueDate.toISOString().split("T")[0]}`);
  doc.text(`Status: ${invoice.status}`);
  doc.text(`Total: ₹${invoice.totalAmount.toFixed(2)}`);

  doc.moveDown();
  doc.text("Items:");
  lines.forEach((ln, idx) => {
    doc
      .text(
        `${idx + 1}. ${ln.description} — ${ln.qty} × ₹${ln.unitPrice} = ₹${ln.totalPrice}`
      )
      .moveDown(0.2);
  });

  doc.end();
}

module.exports = generateInvoicePDF;
