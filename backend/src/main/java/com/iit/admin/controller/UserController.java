package com.iit.admin.controller;

import com.iit.admin.dto.UserDTO;
import com.iit.admin.dto.UserProfileDTO;
import com.iit.admin.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserDTO> users = userService.getAllUsers(query, pageable);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> changeUserPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> requestBody,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String newPassword = requestBody.get("password");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Password cannot be empty");
        }
        String ipAddress = request.getRemoteAddr();
        userService.changeUserPassword(id, newPassword, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        userService.deleteUser(id, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        UserProfileDTO profile = userService.getUserProfile(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateMyProfile(
            @Valid @RequestBody UserProfileDTO profileDTO,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        UserProfileDTO updated = userService.updateUserProfile(userDetails.getUsername(), profileDTO, ipAddress);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/profile/password")
    public ResponseEntity<?> updateMyPassword(
            @RequestBody Map<String, String> requestBody,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String oldPassword = requestBody.get("oldPassword");
        String newPassword = requestBody.get("newPassword");
        if (oldPassword == null || oldPassword.trim().isEmpty() || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Current and new password are required");
        }
        String ipAddress = request.getRemoteAddr();
        userService.updateProfilePassword(userDetails.getUsername(), oldPassword, newPassword, ipAddress);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
