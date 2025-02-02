import invoiceTemplate from "../utils/invoiceTemplate.js";
import fs from "fs"

const createInvoicePDF = async(req, res) => {
    const pdfDoc = await invoiceTemplate(req.body); // Ensure invoiceTemplate generates a PDF
    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.send(Buffer.from(pdfBytes)); // Send PDF as binary
};

export default createInvoicePDF;
