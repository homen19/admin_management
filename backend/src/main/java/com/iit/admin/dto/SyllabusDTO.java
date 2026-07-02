package com.iit.admin.dto;

import lombok.Data;

@Data
public class SyllabusDTO {
    private Long id;
    private Long courseId;
    private String courseCode;
    private String courseTitle;
    private String description;
    private String objectives;
    private String units; // Raw JSON string
    private String textbooks;
}
