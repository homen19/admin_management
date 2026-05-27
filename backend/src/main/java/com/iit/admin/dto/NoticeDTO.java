package com.iit.admin.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class NoticeDTO {
    private Long id;
    private String title;
    private String content;
    private Long createdById;
    private String createdByUsername;
    private String createdByName;
    private String attachmentPath;
    private Boolean isPinned;
    private LocalDate expiryDate;
    private LocalDateTime createdAt;
}
