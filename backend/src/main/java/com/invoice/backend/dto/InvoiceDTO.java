package com.invoice.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Schema(description = "Invoice data transfer object")
public class InvoiceDTO {
    
    @Schema(description = "Invoice ID", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;
    
    @Schema(description = "Invoice number", example = "INV-2024001", accessMode = Schema.AccessMode.READ_ONLY)
    private String invoiceNumber;
    
    @Schema(description = "Customer ID", example = "1", required = true)
    @NotNull(message = "Customer ID is required")
    private Long customerId;
    
    @Schema(description = "Customer information")
    private Map<String, Object> customer;
    
    @Schema(description = "Invoice issue date", example = "2024-01-15", required = true)
    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;
    
    @Schema(description = "Invoice due date", example = "2024-02-15")
    private LocalDate dueDate;
    
    @Schema(description = "Invoice status", example = "PENDING")
    private String status;
    
    @Schema(description = "Additional notes", example = "Please include purchase order number")
    private String notes;
    
    @Schema(description = "Subtotal amount", example = "1000.00")
    private BigDecimal subtotal;
    
    @Schema(description = "GST amount", example = "180.00")
    private BigDecimal gstAmount;
    
    @Schema(description = "Total amount", example = "1180.00")
    private BigDecimal totalAmount;
    
    @Schema(description = "Invoice items")
    private List<InvoiceItemDTO> items;
}