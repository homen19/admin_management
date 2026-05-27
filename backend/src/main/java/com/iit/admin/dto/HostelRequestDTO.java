package com.iit.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HostelRequestDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private String department;
    private Long hostelId;
    private String hostelName;
    private String sharingType;
    private String status;
    private String remarks;
    private String actionedByName;
    private LocalDateTime createdAt;
}
