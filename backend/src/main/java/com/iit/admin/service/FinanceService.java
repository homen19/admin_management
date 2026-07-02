package com.iit.admin.service;

import com.iit.admin.dto.*;
import com.iit.admin.entity.*;
import com.iit.admin.exception.BadRequestException;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.repository.*;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.OutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FinanceService {

    @Autowired private FeePaymentRepository feePaymentRepository;
    @Autowired private SalaryRecordRepository salaryRecordRepository;
    @Autowired private DepartmentBudgetRepository departmentBudgetRepository;
    @Autowired private ExpenseRepository expenseRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private DepartmentRepository departmentRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────────────────────

    public FinanceSummaryDTO getFinanceSummary() {
        FinanceSummaryDTO dto = new FinanceSummaryDTO();

        dto.setTotalFeesCollected(feePaymentRepository.sumTotalCollected());
        dto.setTotalFeesPending(feePaymentRepository.sumTotalPending());
        dto.setPaidFeeCount(feePaymentRepository.countByStatus("PAID"));
        dto.setUnpaidFeeCount(feePaymentRepository.countByStatus("UNPAID") +
                              feePaymentRepository.countByStatus("PARTIAL"));

        LocalDate now = LocalDate.now();
        dto.setSalaryPaidThisMonth(salaryRecordRepository.sumPaidByMonthYear(now.getMonthValue(), now.getYear()));
        dto.setExpensesThisMonth(expenseRepository.sumByMonthYear(now.getMonthValue(), now.getYear()));

        // Budget for current academic year (e.g. "2024-25")
        String currentYear = resolveAcademicYear(now);
        List<DepartmentBudget> budgets = departmentBudgetRepository.findByAcademicYear(currentYear);
        BigDecimal totalAllocated = budgets.stream()
                .map(DepartmentBudget::getAllocatedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalSpent = budgets.stream()
                .map(b -> expenseRepository.sumByDepartmentAndYearInt(b.getDepartment().getId(), now.getYear()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        dto.setTotalBudgetAllocated(totalAllocated);
        dto.setTotalBudgetSpent(totalSpent);
        if (totalAllocated.compareTo(BigDecimal.ZERO) > 0) {
            dto.setBudgetUtilizationPercent(
                totalSpent.divide(totalAllocated, 4, RoundingMode.HALF_UP)
                          .multiply(BigDecimal.valueOf(100))
                          .doubleValue()
            );
        } else {
            dto.setBudgetUtilizationPercent(0.0);
        }

        return dto;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FEE PAYMENTS
    // ─────────────────────────────────────────────────────────────────────────

    public List<FeePaymentDTO> getAllFeePayments() {
        return feePaymentRepository.findAll().stream().map(this::mapFeeToDTO).collect(Collectors.toList());
    }

    public List<FeePaymentDTO> getFeesByStudent(Long studentId) {
        return feePaymentRepository.findByStudentId(studentId).stream().map(this::mapFeeToDTO).collect(Collectors.toList());
    }

    public FeePaymentDTO getFeeById(Long id) {
        return mapFeeToDTO(feePaymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee payment not found: " + id)));
    }

    @Transactional
    public FeePaymentDTO createFeePayment(FeePaymentDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + dto.getStudentId()));

        FeePayment fee = new FeePayment();
        fee.setStudent(student);
        fee.setFeeType(dto.getFeeType());
        fee.setAcademicYear(dto.getAcademicYear());
        fee.setSemester(dto.getSemester());
        fee.setAmount(dto.getAmount());
        fee.setStatus(dto.getStatus() != null ? dto.getStatus() : "UNPAID");
        fee.setRemarks(dto.getRemarks());

        if ("PAID".equalsIgnoreCase(fee.getStatus())) {
            fee.setPaidAt(LocalDateTime.now());
            fee.setReceiptNumber(generateReceiptNumber());
        }

        return mapFeeToDTO(feePaymentRepository.save(fee));
    }

    @Transactional
    public FeePaymentDTO updateFeePayment(Long id, FeePaymentDTO dto) {
        FeePayment fee = feePaymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee payment not found: " + id));

        fee.setFeeType(dto.getFeeType());
        fee.setAcademicYear(dto.getAcademicYear());
        fee.setSemester(dto.getSemester());
        fee.setAmount(dto.getAmount());
        fee.setRemarks(dto.getRemarks());

        // Handle status change to PAID
        String oldStatus = fee.getStatus();
        fee.setStatus(dto.getStatus());
        if ("PAID".equalsIgnoreCase(dto.getStatus()) && !"PAID".equalsIgnoreCase(oldStatus)) {
            fee.setPaidAt(LocalDateTime.now());
            if (fee.getReceiptNumber() == null) {
                fee.setReceiptNumber(generateReceiptNumber());
            }
        } else if (!"PAID".equalsIgnoreCase(dto.getStatus())) {
            fee.setPaidAt(null);
        }

        return mapFeeToDTO(feePaymentRepository.save(fee));
    }

    @Transactional
    public void deleteFeePayment(Long id) {
        if (!feePaymentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Fee payment not found: " + id);
        }
        feePaymentRepository.deleteById(id);
    }

    public String generateReceiptNumber() {
        return "RCP-" + System.currentTimeMillis();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SALARY RECORDS
    // ─────────────────────────────────────────────────────────────────────────

    public List<SalaryRecordDTO> getAllSalaryRecords() {
        return salaryRecordRepository.findAll().stream().map(this::mapSalaryToDTO).collect(Collectors.toList());
    }

    public List<SalaryRecordDTO> getSalaryByMonthYear(int month, int year) {
        return salaryRecordRepository.findByMonthAndYear(month, year).stream().map(this::mapSalaryToDTO).collect(Collectors.toList());
    }

    @Transactional
    public SalaryRecordDTO createSalaryRecord(SalaryRecordDTO dto) {
        if (salaryRecordRepository.findByUserIdAndMonthAndYear(dto.getUserId(), dto.getMonth(), dto.getYear()).isPresent()) {
            throw new BadRequestException("Salary record already exists for this user for " + dto.getMonth() + "/" + dto.getYear());
        }
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + dto.getUserId()));

        SalaryRecord record = new SalaryRecord();
        record.setUser(user);
        record.setMonth(dto.getMonth());
        record.setYear(dto.getYear());
        record.setNetAmount(dto.getNetAmount());
        record.setStatus(dto.getStatus() != null ? dto.getStatus() : "PENDING");
        record.setRemarks(dto.getRemarks());
        if ("PAID".equalsIgnoreCase(record.getStatus())) {
            record.setPaidAt(LocalDateTime.now());
        }
        return mapSalaryToDTO(salaryRecordRepository.save(record));
    }

    @Transactional
    public SalaryRecordDTO updateSalaryRecord(Long id, SalaryRecordDTO dto) {
        SalaryRecord record = salaryRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salary record not found: " + id));

        record.setNetAmount(dto.getNetAmount());
        record.setRemarks(dto.getRemarks());
        String oldStatus = record.getStatus();
        record.setStatus(dto.getStatus());
        if ("PAID".equalsIgnoreCase(dto.getStatus()) && !"PAID".equalsIgnoreCase(oldStatus)) {
            record.setPaidAt(LocalDateTime.now());
        } else if (!"PAID".equalsIgnoreCase(dto.getStatus())) {
            record.setPaidAt(null);
        }
        return mapSalaryToDTO(salaryRecordRepository.save(record));
    }

    @Transactional
    public void deleteSalaryRecord(Long id) {
        if (!salaryRecordRepository.existsById(id)) {
            throw new ResourceNotFoundException("Salary record not found: " + id);
        }
        salaryRecordRepository.deleteById(id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BUDGETS
    // ─────────────────────────────────────────────────────────────────────────

    public List<DepartmentBudgetDTO> getBudgets(String academicYear) {
        List<DepartmentBudget> budgets = departmentBudgetRepository.findByAcademicYear(academicYear);
        int year = extractYear(academicYear);
        return budgets.stream().map(b -> mapBudgetToDTO(b, year)).collect(Collectors.toList());
    }

    @Transactional
    public DepartmentBudgetDTO createOrUpdateBudget(DepartmentBudgetDTO dto) {
        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + dto.getDepartmentId()));

        DepartmentBudget budget = departmentBudgetRepository
                .findByDepartmentIdAndAcademicYear(dto.getDepartmentId(), dto.getAcademicYear())
                .orElse(new DepartmentBudget());

        budget.setDepartment(dept);
        budget.setAcademicYear(dto.getAcademicYear());
        budget.setAllocatedAmount(dto.getAllocatedAmount());
        budget.setRemarks(dto.getRemarks());

        int year = extractYear(dto.getAcademicYear());
        return mapBudgetToDTO(departmentBudgetRepository.save(budget), year);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EXPENSES
    // ─────────────────────────────────────────────────────────────────────────

    public List<ExpenseDTO> getAllExpenses() {
        return expenseRepository.findAll().stream().map(this::mapExpenseToDTO).collect(Collectors.toList());
    }

    @Transactional
    public ExpenseDTO createExpense(ExpenseDTO dto, String loggedByUsername) {
        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + dto.getDepartmentId()));

        Expense expense = new Expense();
        expense.setDepartment(dept);
        expense.setCategory(dto.getCategory());
        expense.setAmount(dto.getAmount());
        expense.setDescription(dto.getDescription());
        expense.setExpenseDate(dto.getExpenseDate() != null ? dto.getExpenseDate() : LocalDate.now());

        userRepository.findByUsername(loggedByUsername).ifPresent(expense::setLoggedBy);

        return mapExpenseToDTO(expenseRepository.save(expense));
    }

    @Transactional
    public void deleteExpense(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Expense not found: " + id);
        }
        expenseRepository.deleteById(id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PDF RECEIPT GENERATION
    // ─────────────────────────────────────────────────────────────────────────

    public void generateFeeReceiptPDF(Long feeId, OutputStream out) {
        FeePayment fee = feePaymentRepository.findById(feeId)
                .orElseThrow(() -> new ResourceNotFoundException("Fee payment not found: " + feeId));

        Document document = new Document();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Paragraph title = new Paragraph("IIT Admin Office – Fee Payment Receipt", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(5f);
            document.add(title);

            Font subFont = new Font(Font.HELVETICA, 10, Font.ITALIC);
            Paragraph sub = new Paragraph("Official Acknowledgement of Fee Payment", subFont);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(20f);
            document.add(sub);

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(90f);
            table.setWidths(new float[]{2f, 3f});

            Font labelFont = new Font(Font.HELVETICA, 10, Font.BOLD);
            Font valueFont = new Font(Font.HELVETICA, 10);

            String paidAtStr = fee.getPaidAt() != null
                    ? fee.getPaidAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"))
                    : "—";

            String[][] rows = {
                {"Receipt Number",     fee.getReceiptNumber() != null ? fee.getReceiptNumber() : "PENDING"},
                {"Student Name",       fee.getStudent().getName()},
                {"Roll Number",        fee.getStudent().getRollNumber()},
                {"Department",         fee.getStudent().getDepartment().getName()},
                {"Fee Type",           fee.getFeeType()},
                {"Academic Year",      fee.getAcademicYear()},
                {"Semester",           "Semester " + fee.getSemester()},
                {"Amount",             "₹ " + fee.getAmount().toPlainString()},
                {"Payment Status",     fee.getStatus()},
                {"Paid On",            paidAtStr},
                {"Remarks",            fee.getRemarks() != null ? fee.getRemarks() : "—"}
            };

            for (String[] row : rows) {
                PdfPCell c1 = new PdfPCell(new Paragraph(row[0], labelFont));
                c1.setPadding(8f);
                table.addCell(c1);
                PdfPCell c2 = new PdfPCell(new Paragraph(row[1], valueFont));
                c2.setPadding(8f);
                table.addCell(c2);
            }
            document.add(table);

            Font footerFont = new Font(Font.HELVETICA, 9, Font.ITALIC);
            Paragraph footer = new Paragraph("\n\nThis is a computer-generated receipt and is valid without signature.", footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MAPPERS
    // ─────────────────────────────────────────────────────────────────────────

    private FeePaymentDTO mapFeeToDTO(FeePayment f) {
        FeePaymentDTO dto = new FeePaymentDTO();
        dto.setId(f.getId());
        dto.setStudentId(f.getStudent().getId());
        dto.setStudentName(f.getStudent().getName());
        dto.setStudentRollNumber(f.getStudent().getRollNumber());
        dto.setFeeType(f.getFeeType());
        dto.setAcademicYear(f.getAcademicYear());
        dto.setSemester(f.getSemester());
        dto.setAmount(f.getAmount());
        dto.setStatus(f.getStatus());
        dto.setPaidAt(f.getPaidAt());
        dto.setReceiptNumber(f.getReceiptNumber());
        dto.setRemarks(f.getRemarks());
        dto.setCreatedAt(f.getCreatedAt());
        return dto;
    }

    private SalaryRecordDTO mapSalaryToDTO(SalaryRecord s) {
        SalaryRecordDTO dto = new SalaryRecordDTO();
        dto.setId(s.getId());
        dto.setUserId(s.getUser().getId());
        dto.setUsername(s.getUser().getUsername());
        dto.setRoleName(s.getUser().getRole().getName());
        dto.setMonth(s.getMonth());
        dto.setYear(s.getYear());
        dto.setNetAmount(s.getNetAmount());
        dto.setStatus(s.getStatus());
        dto.setPaidAt(s.getPaidAt());
        dto.setRemarks(s.getRemarks());
        dto.setCreatedAt(s.getCreatedAt());

        // Resolve employee name from profile
        String name = resolveEmployeeName(s.getUser());
        dto.setEmployeeName(name);

        return dto;
    }

    private DepartmentBudgetDTO mapBudgetToDTO(DepartmentBudget b, int year) {
        DepartmentBudgetDTO dto = new DepartmentBudgetDTO();
        dto.setId(b.getId());
        dto.setDepartmentId(b.getDepartment().getId());
        dto.setDepartmentName(b.getDepartment().getName());
        dto.setAcademicYear(b.getAcademicYear());
        dto.setAllocatedAmount(b.getAllocatedAmount());
        dto.setRemarks(b.getRemarks());
        dto.setCreatedAt(b.getCreatedAt());

        BigDecimal spent = expenseRepository.sumByDepartmentAndYearInt(b.getDepartment().getId(), year);
        dto.setSpentAmount(spent);
        dto.setRemainingAmount(b.getAllocatedAmount().subtract(spent));
        return dto;
    }

    private ExpenseDTO mapExpenseToDTO(Expense e) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(e.getId());
        dto.setDepartmentId(e.getDepartment().getId());
        dto.setDepartmentName(e.getDepartment().getName());
        dto.setCategory(e.getCategory());
        dto.setAmount(e.getAmount());
        dto.setDescription(e.getDescription());
        dto.setExpenseDate(e.getExpenseDate());
        dto.setLoggedByUsername(e.getLoggedBy() != null ? e.getLoggedBy().getUsername() : null);
        dto.setCreatedAt(e.getCreatedAt());
        return dto;
    }

    private String resolveEmployeeName(User user) {
        String role = user.getRole().getName();
        if ("ROLE_FACULTY".equals(role)) {
            return userRepository.findByUsername(user.getUsername())
                    .map(u -> u.getUsername()).orElse(user.getUsername());
        }
        return user.getUsername();
    }

    private String resolveAcademicYear(LocalDate date) {
        int month = date.getMonthValue();
        int year = date.getYear();
        if (month >= 7) {
            return year + "-" + String.valueOf(year + 1).substring(2);
        } else {
            return (year - 1) + "-" + String.valueOf(year).substring(2);
        }
    }

    private int extractYear(String academicYear) {
        try {
            return Integer.parseInt(academicYear.split("-")[0]);
        } catch (Exception e) {
            return LocalDate.now().getYear();
        }
    }
}
