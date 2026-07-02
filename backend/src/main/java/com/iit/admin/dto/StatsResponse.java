package com.iit.admin.dto;

import lombok.Data;
import java.util.List;
import java.math.BigDecimal;

@Data
public class StatsResponse {
    private long totalStudents;
    private long totalFaculty;
    private long pendingLeaves;
    private long openComplaints;
    private long recentNoticesCount;
    private List<ActivityLogDTO> recentLogs;
    
    // New Dashboard Stats
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private long totalBooks;
    private long issuedBooks;
    private long overdueBooks;
    private long totalBeds;
    private long occupiedBeds;
    private long lowStockItems;
}
