package com.invoice.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

@Data
@Schema(description = "Customer data transfer object")
public class CustomerDTO {
    
    @Schema(description = "Customer ID", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;
    
    @Schema(description = "Customer name", example = "Acme Corporation", required = true)
    @NotBlank(message = "Customer name is required")
    private String name;
    
    @Schema(description = "Customer email", example = "contact@acme.com")
    @Email(message = "Invalid email format")
    private String email;
    
    @Schema(description = "Customer phone number", example = "+1-555-123-4567")
    private String phone;
    
    @Schema(description = "Customer address", example = "123 Business Ave, Suite 100, New York, NY 10001")
    private String address;
    
    @Schema(description = "Customer GST number", example = "22AAAAA0000A1Z5")
    private String gstNumber;
}