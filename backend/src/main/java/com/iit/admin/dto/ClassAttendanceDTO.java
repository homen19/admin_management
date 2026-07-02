package com.iit.admin.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ClassAttendanceDTO {
    private Long id;
    private Long classSessionId;
    private LocalDate sessionDate;
    private String topicCovered;
    private Long studentId;
    private String studentRollNumber;
    private String studentName;
    private String status; // PRESENT, ABSENT, LATE
    private String remarks;
}
