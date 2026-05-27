package com.iit.admin.dto;

import lombok.Data;

@Data
public class FacultyDTO {
    private Long id;
    private Long userId;
    private String username;
    private String name;
    private String department;
    private String email;
    private String phone;
    private String designation;
}
