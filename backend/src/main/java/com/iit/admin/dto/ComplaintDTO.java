package com.iit.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ComplaintDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private String department;
    private String title;
    private String description;
    private String category;
    private String status;
    private Long assignedToId;
    private String assignedToUsername;
    private LocalDateTime createdAt;
}
