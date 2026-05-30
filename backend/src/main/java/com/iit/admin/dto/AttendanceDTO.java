package com.iit.admin.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AttendanceDTO {
    private Long id;
    private Long userId;
    private String username;
    private String userEmail;
    private String roleName;
    private String name;
    private LocalDate attendanceDate;
    private LocalDateTime punchIn;
    private LocalDateTime punchOut;
    private String status;
    private String source;
    private Double latitude;
    private Double longitude;
    private String cardUid;
}
