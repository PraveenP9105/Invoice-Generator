package com.invoice.backend.util;

import com.invoice.backend.entity.Invoice;
import com.invoice.backend.entity.InvoiceItem;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Component;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
public class PdfGenerator {

    private String formatDate(LocalDate date) {
        if (date == null)
            return "";
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            return date.format(formatter);
        } catch (Exception e) {
            return "";
        }
    }

    public byte[] generateInvoicePdf(Invoice invoice) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);

            document.open();

            // Add company header
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.BLUE);
            Paragraph title = new Paragraph("INVOICE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(Chunk.NEWLINE);

            // Invoice details
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingBefore(10f);

            Font infoFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // Left side - Company info
            PdfPCell companyCell = new PdfPCell();
            companyCell.setBorder(Rectangle.NO_BORDER);
            companyCell.addElement(new Paragraph(invoice.getUser().getName(),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            companyCell.addElement(new Paragraph(invoice.getUser().getEmail(), infoFont));
            infoTable.addCell(companyCell);

            // Right side - Invoice info
            PdfPCell invoiceInfoCell = new PdfPCell();
            invoiceInfoCell.setBorder(Rectangle.NO_BORDER);
            invoiceInfoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            invoiceInfoCell.addElement(new Paragraph("Invoice #: " + invoice.getInvoiceNumber(), infoFont));
            invoiceInfoCell.addElement(new Paragraph("Issue Date: " +
                    formatDate(invoice.getIssueDate()), infoFont));

            if (invoice.getDueDate() != null) {
                invoiceInfoCell.addElement(new Paragraph("Due Date: " +
                        formatDate(invoice.getDueDate()), infoFont));
            }
            infoTable.addCell(invoiceInfoCell);

            document.add(infoTable);

            document.add(Chunk.NEWLINE);

            // Customer details
            Font customerTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.GRAY);
            Paragraph customerTitle = new Paragraph("Bill To:", customerTitleFont);
            document.add(customerTitle);

            Font customerFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            document.add(new Paragraph(invoice.getCustomer().getName(), customerFont));
            if (invoice.getCustomer().getEmail() != null) {
                document.add(new Paragraph(invoice.getCustomer().getEmail(), customerFont));
            }
            if (invoice.getCustomer().getPhone() != null) {
                document.add(new Paragraph(invoice.getCustomer().getPhone(), customerFont));
            }
            if (invoice.getCustomer().getAddress() != null) {
                document.add(new Paragraph(invoice.getCustomer().getAddress(), customerFont));
            }
            if (invoice.getCustomer().getGstNumber() != null) {
                document.add(new Paragraph("GST: " + invoice.getCustomer().getGstNumber(), customerFont));
            }

            document.add(Chunk.NEWLINE);

            // Items table
            PdfPTable itemsTable = new PdfPTable(4);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[] { 3f, 1f, 1.5f, 1.5f });

            // Table headers
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            PdfPCell header1 = new PdfPCell(new Phrase("Description", headerFont));
            PdfPCell header2 = new PdfPCell(new Phrase("Quantity", headerFont));
            PdfPCell header3 = new PdfPCell(new Phrase("Unit Price", headerFont));
            PdfPCell header4 = new PdfPCell(new Phrase("Total", headerFont));

            header1.setBackgroundColor(Color.DARK_GRAY);
            header2.setBackgroundColor(Color.DARK_GRAY);
            header3.setBackgroundColor(Color.DARK_GRAY);
            header4.setBackgroundColor(Color.DARK_GRAY);

            itemsTable.addCell(header1);
            itemsTable.addCell(header2);
            itemsTable.addCell(header3);
            itemsTable.addCell(header4);

            // Table rows
            Font rowFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
            for (InvoiceItem item : invoice.getItems()) {
                itemsTable.addCell(new Phrase(item.getDescription(), rowFont));
                itemsTable.addCell(new Phrase(String.valueOf(item.getQuantity()), rowFont));
                itemsTable.addCell(new Phrase("$" + item.getUnitPrice().toString(), rowFont));
                itemsTable.addCell(new Phrase("$" + item.getTotalPrice().toString(), rowFont));
            }

            document.add(itemsTable);

            document.add(Chunk.NEWLINE);

            // Totals
            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(40);
            totalTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            totalTable.addCell(new PdfPCell(new Phrase("Subtotal:", totalFont)));
            totalTable.addCell(new PdfPCell(new Phrase("$" + invoice.getSubtotal().toString(), totalFont)));

            totalTable.addCell(new PdfPCell(new Phrase("GST (18%):", totalFont)));
            totalTable.addCell(new PdfPCell(new Phrase("$" + invoice.getGstAmount().toString(), totalFont)));

            Font grandTotalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            PdfPCell grandTotalLabel = new PdfPCell(new Phrase("Total:", grandTotalFont));
            PdfPCell grandTotalValue = new PdfPCell(
                    new Phrase("$" + invoice.getTotalAmount().toString(), grandTotalFont));
            grandTotalLabel.setBorder(Rectangle.TOP);
            grandTotalValue.setBorder(Rectangle.TOP);

            totalTable.addCell(grandTotalLabel);
            totalTable.addCell(grandTotalValue);

            document.add(totalTable);

            // Status
            if (invoice.getStatus() != null) {
                document.add(Chunk.NEWLINE);
                Font statusFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
                Color statusColor = invoice.getStatus() == Invoice.InvoiceStatus.PAID ? Color.GREEN : Color.RED;
                Paragraph status = new Paragraph("Status: " + invoice.getStatus().toString(),
                        FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, statusColor));
                status.setAlignment(Element.ALIGN_CENTER);
                document.add(status);
            }

            // Notes
            if (invoice.getNotes() != null && !invoice.getNotes().isEmpty()) {
                document.add(Chunk.NEWLINE);
                Font notesFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, Color.GRAY);
                document.add(new Paragraph("Notes: " + invoice.getNotes(), notesFont));
            }

            document.close();

            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage());
        }
    }
}