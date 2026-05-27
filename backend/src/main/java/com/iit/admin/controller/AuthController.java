package com.iit.admin.controller;

import com.iit.admin.dto.JwtResponse;
import com.iit.admin.dto.LoginRequest;
import com.iit.admin.dto.RegisterRequest;
import com.iit.admin.entity.User;
import com.iit.admin.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        JwtResponse jwtResponse = userService.authenticateUser(loginRequest, ipAddress);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        User user = userService.registerUser(registerRequest, ipAddress);
        return ResponseEntity.ok("User registered successfully with username: " + user.getUsername());
    }
}
