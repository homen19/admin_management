package com.iit.admin.dto;

import lombok.Data;

@Data
public class StudentDTO {
    private Long id;
    private Long userId;
    private String username;
    private String rollNumber;
    private String name;
    private String department;
    private String email;
    private String phone;
    private Integer semester;
}
