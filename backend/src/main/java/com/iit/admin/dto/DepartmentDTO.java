package com.iit.admin.dto;

import lombok.Data;

@Data
public class DepartmentDTO {
    private Long id;
    private Long schoolId;
    private String schoolName;
    private String name;
    private String code;
}
