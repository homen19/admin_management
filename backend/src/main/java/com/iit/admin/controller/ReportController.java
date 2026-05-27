package com.iit.admin.controller;

import com.iit.admin.service.ReportService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/department-students")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentStudents() {
        return ResponseEntity.ok(reportService.getDepartmentStudentStats());
    }

    @GetMapping("/monthly-leaves")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyLeaves() {
        return ResponseEntity.ok(reportService.getMonthlyLeaveStats());
    }

    @GetMapping("/complaint-categories")
    public ResponseEntity<List<Map<String, Object>>> getComplaintCategories() {
        return ResponseEntity.ok(reportService.getComplaintCategoryStats());
    }

    @GetMapping("/export/students/csv")
    public void exportStudentsCSV(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=students_report.csv");
        reportService.exportStudentsToCSV(response.getWriter());
    }

    @GetMapping("/export/students/pdf")
    public void exportStudentsPDF(HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=students_report.pdf");
        reportService.exportStudentsToPDF(response.getOutputStream());
    }
}
