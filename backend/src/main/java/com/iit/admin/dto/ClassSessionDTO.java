package com.iit.admin.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ClassSessionDTO {
    private Long id;
    private Long courseId;
    private String courseCode;
    private String courseTitle;
    private Integer semester;
    private Long facultyId;
    private String facultyName;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String topicCovered;
}
