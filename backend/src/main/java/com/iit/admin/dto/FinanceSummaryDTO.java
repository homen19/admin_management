package com.iit.admin.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class FinanceSummaryDTO {
    private BigDecimal totalFeesCollected;
    private BigDecimal totalFeesPending;
    private long paidFeeCount;
    private long unpaidFeeCount;
    private BigDecimal salaryPaidThisMonth;
    private BigDecimal expensesThisMonth;
    private BigDecimal totalBudgetAllocated;  // current academic year
    private BigDecimal totalBudgetSpent;      // current academic year
    private double budgetUtilizationPercent;
}
