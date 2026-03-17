package com.invoice.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
@Schema(description = "Invoice item data transfer object")
public class InvoiceItemDTO {
    
    @Schema(description = "Item ID", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;
    
    @Schema(description = "Item description", example = "Web Development Services", required = true)
    @NotBlank(message = "Description is required")
    private String description;
    
    @Schema(description = "Quantity", example = "10", required = true)
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;
    
    @Schema(description = "Unit price", example = "150.00", required = true)
    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be positive")
    private BigDecimal unitPrice;
    
    @Schema(description = "Total price", example = "1500.00", accessMode = Schema.AccessMode.READ_ONLY)
    private BigDecimal totalPrice;
}