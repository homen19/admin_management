package com.iit.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CalendarEventDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isPublic;
    private String type; // EVENT, TASK, ACADEMIC
    private Long createdById;
    private String createdByUsername;
}
