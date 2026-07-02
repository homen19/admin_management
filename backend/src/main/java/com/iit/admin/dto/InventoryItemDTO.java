package com.iit.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InventoryItemDTO {
    private Long id;
    private String itemName;
    private String sku;
    private String category;
    private String description;
    private String location;
    private Integer totalQuantity;
    private Integer availableQuantity;
    private LocalDateTime createdAt;
}
