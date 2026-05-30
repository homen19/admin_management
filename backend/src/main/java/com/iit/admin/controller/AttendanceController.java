package com.iit.admin.controller;

import com.iit.admin.dto.AttendanceDTO;
import com.iit.admin.dto.BiometricPunchRequest;
import com.iit.admin.dto.MobilePunchRequest;
import com.iit.admin.service.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/biometric")
    public ResponseEntity<AttendanceDTO> punchBiometric(
            @Valid @RequestBody BiometricPunchRequest punchRequest,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        AttendanceDTO response = attendanceService.punchWithBiometric(punchRequest.getCardUid(), ipAddress);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mobile")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('FACULTY')")
    public ResponseEntity<AttendanceDTO> punchMobile(
            @Valid @RequestBody MobilePunchRequest punchRequest,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        AttendanceDTO response = attendanceService.punchWithMobile(
                userDetails.getUsername(), 
                punchRequest.getLatitude(), 
                punchRequest.getLongitude(), 
                ipAddress
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-history")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('FACULTY')")
    public ResponseEntity<List<AttendanceDTO>> getMyHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<AttendanceDTO> history = attendanceService.getMyAttendanceHistory(userDetails.getUsername());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<AttendanceDTO>> getAllLogs(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        List<AttendanceDTO> logs = attendanceService.getAllAttendanceLogs(role, start, end);
        return ResponseEntity.ok(logs);
    }

    @PutMapping("/register-card")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> registerCard(
            @RequestParam Long userId,
            @RequestParam String cardUid,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        attendanceService.registerUserCard(userId, cardUid, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok("Card UID registered successfully for user.");
    }
}
