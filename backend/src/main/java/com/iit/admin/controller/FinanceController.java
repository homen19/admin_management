package com.iit.admin.controller;

import com.iit.admin.dto.*;
import com.iit.admin.service.FinanceService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/finance")
@PreAuthorize("hasRole('ADMIN') or hasRole('FINANCE')")
public class FinanceController {

    @Autowired
    private FinanceService financeService;

    // ── Summary ──────────────────────────────────────────────
    @GetMapping("/summary")
    public ResponseEntity<FinanceSummaryDTO> getSummary() {
        return ResponseEntity.ok(financeService.getFinanceSummary());
    }

    // ── Fee Payments ─────────────────────────────────────────
    @GetMapping("/fees")
    public ResponseEntity<List<FeePaymentDTO>> getAllFees() {
        return ResponseEntity.ok(financeService.getAllFeePayments());
    }

    @GetMapping("/fees/student/{studentId}")
    public ResponseEntity<List<FeePaymentDTO>> getFeesByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(financeService.getFeesByStudent(studentId));
    }

    @GetMapping("/fees/{id}")
    public ResponseEntity<FeePaymentDTO> getFeeById(@PathVariable Long id) {
        return ResponseEntity.ok(financeService.getFeeById(id));
    }

    @PostMapping("/fees")
    public ResponseEntity<FeePaymentDTO> createFee(@RequestBody FeePaymentDTO dto) {
        return ResponseEntity.ok(financeService.createFeePayment(dto));
    }

    @PutMapping("/fees/{id}")
    public ResponseEntity<FeePaymentDTO> updateFee(@PathVariable Long id, @RequestBody FeePaymentDTO dto) {
        return ResponseEntity.ok(financeService.updateFeePayment(id, dto));
    }

    @DeleteMapping("/fees/{id}")
    public ResponseEntity<?> deleteFee(@PathVariable Long id) {
        financeService.deleteFeePayment(id);
        return ResponseEntity.ok("Fee payment deleted.");
    }

    @GetMapping(value = "/fees/{id}/receipt", produces = MediaType.APPLICATION_PDF_VALUE)
    public void downloadReceipt(@PathVariable Long id, HttpServletResponse response) throws IOException {
        FeePaymentDTO fee = financeService.getFeeById(id);
        String filename = "receipt_" + (fee.getReceiptNumber() != null ? fee.getReceiptNumber() : id) + ".pdf";
        response.setContentType("application/pdf");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
        financeService.generateFeeReceiptPDF(id, response.getOutputStream());
    }

    // ── Salary Records ───────────────────────────────────────
    @GetMapping("/salaries")
    public ResponseEntity<List<SalaryRecordDTO>> getAllSalaries() {
        return ResponseEntity.ok(financeService.getAllSalaryRecords());
    }

    @GetMapping("/salaries/period")
    public ResponseEntity<List<SalaryRecordDTO>> getSalariesByPeriod(
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(financeService.getSalaryByMonthYear(month, year));
    }

    @PostMapping("/salaries")
    public ResponseEntity<SalaryRecordDTO> createSalary(@RequestBody SalaryRecordDTO dto) {
        return ResponseEntity.ok(financeService.createSalaryRecord(dto));
    }

    @PutMapping("/salaries/{id}")
    public ResponseEntity<SalaryRecordDTO> updateSalary(@PathVariable Long id, @RequestBody SalaryRecordDTO dto) {
        return ResponseEntity.ok(financeService.updateSalaryRecord(id, dto));
    }

    @DeleteMapping("/salaries/{id}")
    public ResponseEntity<?> deleteSalary(@PathVariable Long id) {
        financeService.deleteSalaryRecord(id);
        return ResponseEntity.ok("Salary record deleted.");
    }

    // ── Budgets ───────────────────────────────────────────────
    @GetMapping("/budgets")
    public ResponseEntity<List<DepartmentBudgetDTO>> getBudgets(@RequestParam String academicYear) {
        return ResponseEntity.ok(financeService.getBudgets(academicYear));
    }

    @PostMapping("/budgets")
    public ResponseEntity<DepartmentBudgetDTO> createOrUpdateBudget(@RequestBody DepartmentBudgetDTO dto) {
        return ResponseEntity.ok(financeService.createOrUpdateBudget(dto));
    }

    // ── Expenses ──────────────────────────────────────────────
    @GetMapping("/expenses")
    public ResponseEntity<List<ExpenseDTO>> getAllExpenses() {
        return ResponseEntity.ok(financeService.getAllExpenses());
    }

    @PostMapping("/expenses")
    public ResponseEntity<ExpenseDTO> createExpense(
            @RequestBody ExpenseDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(financeService.createExpense(dto, userDetails.getUsername()));
    }

    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        financeService.deleteExpense(id);
        return ResponseEntity.ok("Expense deleted.");
    }
}
