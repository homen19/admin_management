package com.iit.admin.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SalaryRecordDTO {
    private Long id;
    private Long userId;
    private String username;
    private String employeeName;
    private String roleName;
    private Integer month;
    private Integer year;
    private BigDecimal netAmount;
    private String status;
    private LocalDateTime paidAt;
    private String remarks;
    private LocalDateTime createdAt;
}
