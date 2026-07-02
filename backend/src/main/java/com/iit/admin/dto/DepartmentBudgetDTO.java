package com.iit.admin.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DepartmentBudgetDTO {
    private Long id;
    private Long departmentId;
    private String departmentName;
    private String academicYear;
    private BigDecimal allocatedAmount;
    private BigDecimal spentAmount;    // computed: sum of expenses for that dept+year
    private BigDecimal remainingAmount; // computed: allocated - spent
    private String remarks;
    private LocalDateTime createdAt;
}
