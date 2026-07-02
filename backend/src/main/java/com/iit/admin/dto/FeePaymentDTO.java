package com.iit.admin.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FeePaymentDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentRollNumber;
    private String feeType;
    private String academicYear;
    private Integer semester;
    private BigDecimal amount;
    private String status;
    private LocalDateTime paidAt;
    private String receiptNumber;
    private String remarks;
    private LocalDateTime createdAt;
}
