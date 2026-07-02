package com.iit.admin.controller;

import com.iit.admin.dto.CourseDTO;
import com.iit.admin.dto.SyllabusDTO;
import com.iit.admin.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<CourseDTO>> getAssignedCourses(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(courseService.getCoursesByFacultyUsername(userDetails.getUsername()));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<CourseDTO>> getCoursesByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(courseService.getCoursesByDepartment(departmentId));
    }

    @GetMapping("/department/{departmentId}/semester/{semester}")
    public ResponseEntity<List<CourseDTO>> getCoursesByDepartmentAndSemester(
            @PathVariable Long departmentId,
            @PathVariable Integer semester) {
        return ResponseEntity.ok(courseService.getCoursesByDepartmentAndSemester(departmentId, semester));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseDTO> createCourse(@Valid @RequestBody CourseDTO dto) {
        return ResponseEntity.ok(courseService.createCourse(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseDTO dto) {
        return ResponseEntity.ok(courseService.updateCourse(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok("Course deleted successfully.");
    }

    // Syllabus Endpoints
    @GetMapping("/{id}/syllabus")
    public ResponseEntity<SyllabusDTO> getSyllabusByCourseId(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getSyllabusByCourseId(id));
    }

    @PostMapping("/{id}/syllabus")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY')")
    public ResponseEntity<SyllabusDTO> saveSyllabus(@PathVariable Long id, @RequestBody SyllabusDTO dto) {
        return ResponseEntity.ok(courseService.saveSyllabus(id, dto));
    }
}
