package com.iit.admin.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookIssueDTO {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookIsbn;
    private String bookAuthor;
    private Long userId;
    private String username;
    private String userEmail;
    private String borrowerName;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private String status;
    private Double fineAmount;
    private Boolean finePaid;
    private Double currentFine;
    private String issuedByUsername;
    private LocalDateTime createdAt;
}
