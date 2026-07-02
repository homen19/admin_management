package com.iit.admin.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LibraryCardDTO {
    private Long id;
    private String cardNumber;
    private Long userId;
    private String username;
    private String userFullName;
    private String userRole;
    private LocalDate issueDate;
    private LocalDate validUntil;
    private String status;
    private String issuedByUsername;
    private LocalDateTime createdAt;
}
