package com.iit.admin.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class InventoryAllocationDTO {
    private Long id;
    private Long itemId;
    private String itemName;
    private String itemSku;
    private String category;
    
    private Long allocatedToId;
    private String allocatedToUsername;
    private String allocatedToName; // Could be Student/Faculty name
    
    private String allocatedByUsername;
    private Integer quantity;
    private LocalDate allocationDate;
    private LocalDate expectedReturnDate;
    private LocalDate actualReturnDate;
    private String status;
    private String remarks;
    private LocalDateTime createdAt;
}
