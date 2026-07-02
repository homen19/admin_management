package com.iit.admin.controller;

import com.iit.admin.dto.StudentDTO;
import com.iit.admin.service.StudentService;
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

import com.iit.admin.service.ReportService;
import com.iit.admin.service.EmailService;
import jakarta.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private EmailService emailService;

    @GetMapping
    public ResponseEntity<Page<StudentDTO>> getAllStudents(
            @RequestParam(required = false) String department,
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<StudentDTO> students = studentService.searchStudents(department, query, pageable);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping("/profile")
    public ResponseEntity<StudentDTO> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(studentService.getStudentByUsername(userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<StudentDTO> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentDTO studentDTO,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        StudentDTO updated = studentService.updateStudent(id, studentDTO, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteStudent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        studentService.deleteStudent(id, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok("Student deleted successfully.");
    }

    @GetMapping("/{id}/admission-pdf")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public void downloadAdmissionPDF(@PathVariable Long id, HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=student_admission_" + id + ".pdf");
        reportService.exportStudentAdmissionPDF(id, response.getOutputStream());
    }

    @PostMapping("/{id}/send-admission-email")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> sendAdmissionEmail(@PathVariable Long id) {
        StudentDTO student = studentService.getStudentById(id);
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        reportService.exportStudentAdmissionPDF(id, baos);
        
        emailService.sendAdmissionEmailWithAttachment(
                student.getEmail(),
                student.getName(),
                student.getRollNumber(),
                baos.toByteArray()
        );
        
        return ResponseEntity.ok(Map.of("message", "Admission confirmation email sent to student successfully."));
    }
}
