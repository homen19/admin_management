package com.iit.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ActivityLogDTO {
    private Long id;
    private String username;
    private String action;
    private String details;
    private String ipAddress;
    private LocalDateTime createdAt;
}
