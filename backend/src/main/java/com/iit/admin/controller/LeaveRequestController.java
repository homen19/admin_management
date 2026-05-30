package com.iit.admin.controller;

import com.iit.admin.dto.LeaveRequestDTO;
import com.iit.admin.service.LeaveRequestService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestService leaveRequestService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<Page<LeaveRequestDTO>> getLeaveRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserDetails userDetails) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Role-Based data filtering
        boolean isAdminOrStaff = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"));

        if (!isAdminOrStaff) {
            // Students/Faculty can only view their own leave requests
            Page<LeaveRequestDTO> leaves = leaveRequestService.getMyLeaveRequests(userDetails.getUsername(), pageable);
            return ResponseEntity.ok(leaves);
        }

        Page<LeaveRequestDTO> leaves = leaveRequestService.getLeaveRequests(status, username, pageable);
        return ResponseEntity.ok(leaves);
    }

    @GetMapping("/pending-count")
    public ResponseEntity<Map<String, Long>> getPendingCount(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            System.out.println("[DEBUG] getPendingCount called, but userDetails principal is NULL");
            Map<String, Long> errResponse = new HashMap<>();
            errResponse.put("count", 0L);
            return ResponseEntity.ok(errResponse);
        }
        
        boolean isAdminOrStaff = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"));
        
        long count = leaveRequestService.getPendingLeaveCount(userDetails.getUsername(), isAdminOrStaff);
        System.out.println("[DEBUG] getPendingCount called by user '" + userDetails.getUsername() 
                           + "' (isAdminOrStaff: " + isAdminOrStaff + "). Result count: " + count);
        
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<LeaveRequestDTO> applyLeave(
            @RequestBody LeaveRequestDTO leaveRequestDTO,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        LeaveRequestDTO created = leaveRequestService.createLeaveRequest(userDetails.getUsername(), leaveRequestDTO, ipAddress);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<LeaveRequestDTO> processLeave(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false, defaultValue = "") String remarks,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        LeaveRequestDTO processed = leaveRequestService.actionLeaveRequest(id, status, remarks, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok(processed);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty!");
        }
        try {
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("\\s+", "_");
            File dest = new File(dir, filename);
            file.transferTo(dest);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", "/uploads/" + filename);
            response.put("fileName", file.getOriginalFilename());
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload file: " + e.getMessage());
        }
    }
}
