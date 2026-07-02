package com.iit.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Role is required")
    private String role; // ROLE_ADMIN, ROLE_STAFF, ROLE_FACULTY, ROLE_STUDENT

    // General Profile specific
    @NotBlank(message = "Name is required")
    private String name;

    private String department;

    private String phone;

    // Student specific
    private String rollNumber;
    private Integer semester;

    // Faculty specific
    private String designation;

    // Librarian specific
    private String employeeId;
}
