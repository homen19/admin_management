package com.iit.admin.controller;

import com.iit.admin.dto.ComplaintDTO;
import com.iit.admin.service.ComplaintService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @GetMapping
    public ResponseEntity<Page<ComplaintDTO>> getComplaints(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String studentUsername,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserDetails userDetails) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        boolean isAdminOrStaff = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"));

        if (!isAdminOrStaff) {
            Page<ComplaintDTO> complaints = complaintService.getMyComplaints(userDetails.getUsername(), pageable);
            return ResponseEntity.ok(complaints);
        }

        Page<ComplaintDTO> complaints = complaintService.searchComplaints(status, category, studentUsername, pageable);
        return ResponseEntity.ok(complaints);
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ComplaintDTO> createComplaint(
            @Valid @RequestBody ComplaintDTO complaintDTO,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        ComplaintDTO created = complaintService.createComplaint(userDetails.getUsername(), complaintDTO, ipAddress);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ComplaintDTO> assignComplaint(
            @PathVariable Long id,
            @RequestParam Long staffUserId,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        ComplaintDTO updated = complaintService.assignComplaint(id, staffUserId, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ComplaintDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        ComplaintDTO updated = complaintService.updateStatus(id, status, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok(updated);
    }
}
