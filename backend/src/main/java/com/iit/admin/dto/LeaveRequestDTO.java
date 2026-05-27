package com.iit.admin.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LeaveRequestDTO {
    private Long id;
    private Long userId;
    private String username;
    private String name;
    private String role;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status;
    private String attachmentPath;
    private String remarks;
    private String actionedByUsername;
    private LocalDateTime createdAt;
}
