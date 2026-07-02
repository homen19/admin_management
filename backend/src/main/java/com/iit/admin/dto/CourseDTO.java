package com.iit.admin.dto;

import lombok.Data;

@Data
public class CourseDTO {
    private Long id;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private String courseCode;
    private String title;
    private Integer semester;
    private Integer credits;
    private Long facultyId;
    private String facultyName;
}
