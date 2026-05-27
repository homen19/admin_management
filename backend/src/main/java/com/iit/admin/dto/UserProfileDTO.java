package com.iit.admin.dto;

import lombok.Data;

@Data
public class UserProfileDTO {
    private String username;
    private String email;
    private String role;
    private String name;
    private String phone;
    private String department;
    
    // Student specific
    private String rollNumber;
    private Integer semester;
    
    // Faculty specific
    private String designation;
}
