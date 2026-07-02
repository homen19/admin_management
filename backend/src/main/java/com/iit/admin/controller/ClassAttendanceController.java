package com.iit.admin.controller;

import com.iit.admin.dto.ClassAttendanceDTO;
import com.iit.admin.dto.ClassAttendanceSubmitDTO;
import com.iit.admin.dto.ClassSessionDTO;
import com.iit.admin.service.ClassAttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/class-attendance")
public class ClassAttendanceController {

    @Autowired
    private ClassAttendanceService classAttendanceService;

    @PostMapping("/sessions")
    @PreAuthorize("hasRole('FACULTY') or hasRole('ADMIN')")
    public ResponseEntity<ClassSessionDTO> scheduleSession(
            @Valid @RequestBody ClassSessionDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(classAttendanceService.scheduleSession(dto, userDetails.getUsername()));
    }

    @GetMapping("/sessions/course/{courseId}")
    @PreAuthorize("hasRole('FACULTY') or hasRole('ADMIN')")
    public ResponseEntity<List<ClassSessionDTO>> getSessionsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(classAttendanceService.getSessionsByCourse(courseId));
    }

    @GetMapping("/sessions/faculty")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<ClassSessionDTO>> getSessionsByFaculty(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(classAttendanceService.getSessionsByFaculty(userDetails.getUsername()));
    }

    @GetMapping("/sheet/{classSessionId}")
    @PreAuthorize("hasRole('FACULTY') or hasRole('ADMIN')")
    public ResponseEntity<List<ClassAttendanceDTO>> getStudentsForAttendanceSheet(@PathVariable Long classSessionId) {
        return ResponseEntity.ok(classAttendanceService.getStudentsForAttendanceSheet(classSessionId));
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('FACULTY') or hasRole('ADMIN')")
    public ResponseEntity<?> submitAttendance(@Valid @RequestBody ClassAttendanceSubmitDTO submitDto) {
        classAttendanceService.submitAttendance(submitDto);
        return ResponseEntity.ok(Map.of("message", "Class attendance submitted successfully."));
    }

    @GetMapping("/student/summary")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getStudentAttendanceSummary(
            @RequestParam(required = false) Integer semester,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(classAttendanceService.getStudentAttendanceSummary(userDetails.getUsername(), semester));
    }

    @GetMapping("/student/course/{courseId}/logs")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ClassAttendanceDTO>> getStudentCourseAttendanceLogs(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(classAttendanceService.getStudentCourseAttendanceLogs(userDetails.getUsername(), courseId));
    }
}
