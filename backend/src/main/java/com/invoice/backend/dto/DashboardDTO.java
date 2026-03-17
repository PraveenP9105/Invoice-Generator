package com.invoice.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.util.List;
import com.invoice.backend.dto.InvoiceDTO;

@Data
@Schema(description = "Dashboard statistics data")
public class DashboardDTO {
    
    @Schema(description = "Total number of invoices", example = "150")
    private long totalInvoices;
    
    @Schema(description = "Number of pending invoices", example = "25")
    private long pendingInvoices;
    
    @Schema(description = "Number of paid invoices", example = "120")
    private long paidInvoices;
    
    @Schema(description = "Total revenue from paid invoices", example = "45000.50")
    private double totalRevenue;
    
    @Schema(description = "List of recent invoices")
    private List<InvoiceDTO> recentInvoices;
}