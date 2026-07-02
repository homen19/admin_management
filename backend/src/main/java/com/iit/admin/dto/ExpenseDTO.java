package com.iit.admin.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ExpenseDTO {
    private Long id;
    private Long departmentId;
    private String departmentName;
    private String category;
    private BigDecimal amount;
    private String description;
    private LocalDate expenseDate;
    private String loggedByUsername;
    private LocalDateTime createdAt;
}
