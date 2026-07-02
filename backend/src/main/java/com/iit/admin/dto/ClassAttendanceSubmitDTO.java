package com.iit.admin.dto;

import lombok.Data;
import java.util.List;

@Data
public class ClassAttendanceSubmitDTO {
    private Long classSessionId;
    private List<StudentAttendanceInput> attendanceList;

    @Data
    public static class StudentAttendanceInput {
        private Long studentId;
        private String status; // PRESENT, ABSENT, LATE
        private String remarks;
    }
}
