package com.invoice.backend.service;

import com.invoice.backend.dto.*;
import com.invoice.backend.entity.*;
import com.invoice.backend.repository.*;
import com.invoice.backend.util.PdfGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private InvoiceItemRepository invoiceItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PdfGenerator pdfGenerator;

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private InvoiceDTO convertToDTO(Invoice invoice) {
        InvoiceDTO dto = new InvoiceDTO();
        dto.setId(invoice.getId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setCustomerId(invoice.getCustomer().getId());
        dto.setIssueDate(invoice.getIssueDate());
        dto.setDueDate(invoice.getDueDate());
        dto.setStatus(invoice.getStatus().toString());
        dto.setNotes(invoice.getNotes());
        dto.setSubtotal(invoice.getSubtotal());
        dto.setGstAmount(invoice.getGstAmount());
        dto.setTotalAmount(invoice.getTotalAmount());

        // Include customer name in the response
        Map<String, Object> customerInfo = new HashMap<>();
        customerInfo.put("id", invoice.getCustomer().getId());
        customerInfo.put("name", invoice.getCustomer().getName());
        customerInfo.put("email", invoice.getCustomer().getEmail());
        dto.setCustomer(customerInfo);

        List<InvoiceItemDTO> itemDTOs = invoice.getItems().stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList());
        dto.setItems(itemDTOs);

        return dto;
    }

    private InvoiceItemDTO convertItemToDTO(InvoiceItem item) {
        InvoiceItemDTO dto = new InvoiceItemDTO();
        dto.setId(item.getId());
        dto.setDescription(item.getDescription());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalPrice(item.getTotalPrice());
        return dto;
    }

    private BigDecimal calculateGST(BigDecimal amount, double gstRate) {
        return amount.multiply(BigDecimal.valueOf(gstRate / 100))
                .setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public InvoiceDTO createInvoice(InvoiceDTO invoiceDTO) {
        User currentUser = getCurrentUser();

        Customer customer = customerRepository.findById(invoiceDTO.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Verify customer ownership
        if (!customer.getUser().getEmail().equals(currentUser.getEmail())) {
            throw new RuntimeException("Access denied");
        }

        Invoice invoice = new Invoice();
        invoice.setUser(currentUser);
        invoice.setCustomer(customer);
        invoice.setIssueDate(invoiceDTO.getIssueDate() != null ? invoiceDTO.getIssueDate() : LocalDate.now());
        invoice.setDueDate(invoiceDTO.getDueDate());
        invoice.setNotes(invoiceDTO.getNotes());
        invoice.setStatus(Invoice.InvoiceStatus.PENDING); // Default status

        // Save invoice first to get ID
        invoice = invoiceRepository.save(invoice);

        // Add items if provided
        BigDecimal subtotal = BigDecimal.ZERO;
        List<InvoiceItem> items = new ArrayList<>();

        if (invoiceDTO.getItems() != null && !invoiceDTO.getItems().isEmpty()) {
            for (InvoiceItemDTO itemDTO : invoiceDTO.getItems()) {
                InvoiceItem item = new InvoiceItem();
                item.setDescription(itemDTO.getDescription());
                item.setQuantity(itemDTO.getQuantity());
                item.setUnitPrice(itemDTO.getUnitPrice());
                item.setInvoice(invoice);

                // Calculate item total
                BigDecimal itemTotal = itemDTO.getUnitPrice()
                        .multiply(BigDecimal.valueOf(itemDTO.getQuantity()));
                item.setTotalPrice(itemTotal);

                item = invoiceItemRepository.save(item);
                items.add(item);
                subtotal = subtotal.add(itemTotal);
            }
        }

        // Set items to invoice
        invoice.setItems(items);
        invoice.setSubtotal(subtotal);

        // Calculate GST (18%)
        BigDecimal gstAmount = calculateGST(subtotal, 18.0);
        invoice.setGstAmount(gstAmount);
        invoice.setTotalAmount(subtotal.add(gstAmount));

        // Save invoice with all calculations
        invoice = invoiceRepository.save(invoice);

        return convertToDTO(invoice);
    }

    public List<InvoiceDTO> getAllInvoices() {
        User currentUser = getCurrentUser();
        return invoiceRepository.findByUser(currentUser)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public InvoiceDTO getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Verify ownership
        if (!invoice.getUser().getEmail().equals(getCurrentUser().getEmail())) {
            throw new RuntimeException("Access denied");
        }

        return convertToDTO(invoice);
    }

    @Transactional
    public InvoiceDTO updateInvoiceStatus(Long id, String status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Verify ownership
        if (!invoice.getUser().getEmail().equals(getCurrentUser().getEmail())) {
            throw new RuntimeException("Access denied");
        }

        invoice.setStatus(Invoice.InvoiceStatus.valueOf(status));
        invoice = invoiceRepository.save(invoice);

        return convertToDTO(invoice);
    }

    @Transactional
    public void deleteInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Verify ownership
        if (!invoice.getUser().getEmail().equals(getCurrentUser().getEmail())) {
            throw new RuntimeException("Access denied");
        }

        invoiceRepository.delete(invoice);
    }

    public byte[] generateInvoicePdf(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Verify ownership
        if (!invoice.getUser().getEmail().equals(getCurrentUser().getEmail())) {
            throw new RuntimeException("Access denied");
        }

        return pdfGenerator.generateInvoicePdf(invoice);
    }

    @Transactional
    public void sendInvoiceByEmail(Long id, String recipientEmail) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Verify ownership
        if (!invoice.getUser().getEmail().equals(getCurrentUser().getEmail())) {
            throw new RuntimeException("Access denied");
        }

        byte[] pdfContent = generateInvoicePdf(id);
        String subject = "Invoice " + invoice.getInvoiceNumber() + " from " + invoice.getUser().getName();
        String body = "Please find attached invoice " + invoice.getInvoiceNumber() + ".";

        emailService.sendEmailWithAttachment(recipientEmail, subject, body, pdfContent,
                "invoice_" + invoice.getInvoiceNumber() + ".pdf");
    }

    public DashboardDTO getDashboardStats() {
        User currentUser = getCurrentUser();
        DashboardDTO stats = new DashboardDTO();

        List<Invoice> allInvoices = invoiceRepository.findByUser(currentUser);

        stats.setTotalInvoices(allInvoices.size());
        stats.setPendingInvoices(
                allInvoices.stream()
                        .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PENDING)
                        .count());
        stats.setPaidInvoices(
                allInvoices.stream()
                        .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PAID)
                        .count());

        Double totalPaid = invoiceRepository.getTotalPaidAmount(currentUser);
        stats.setTotalRevenue(totalPaid != null ? totalPaid : 0.0);

        stats.setRecentInvoices(
                allInvoices.stream()
                        .limit(5)
                        .map(this::convertToDTO)
                        .collect(Collectors.toList()));

        return stats;
    }
}