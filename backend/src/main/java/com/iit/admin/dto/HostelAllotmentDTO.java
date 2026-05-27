package com.iit.admin.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class HostelAllotmentDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private String department;
    private Long roomId;
    private String roomNumber;
    private String hostelName;
    private String sharingType;
    private Double rent;
    private LocalDate allotmentDate;
    private LocalDate vacateDate;
    private String status;
}
