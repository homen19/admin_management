package com.iit.admin.service;

import com.iit.admin.entity.Student;
import com.iit.admin.repository.StudentRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.io.OutputStream;
import java.io.Writer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private StudentRepository studentRepository;

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getDepartmentStudentStats() {
        Query query = entityManager.createNativeQuery(
                "SELECT d.name AS department, COUNT(s.id) AS count " +
                "FROM students s " +
                "JOIN departments d ON s.department_id = d.id " +
                "GROUP BY d.id, d.name " +
                "ORDER BY count DESC"
        );
        List<Object[]> results = query.getResultList();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("department", row[0]);
            map.put("count", row[1]);
            list.add(map);
        }
        return list;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getMonthlyLeaveStats() {
        Query query = entityManager.createNativeQuery(
                "SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, " +
                "SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approved, " +
                "SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected, " +
                "SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending, " +
                "COUNT(*) AS total " +
                "FROM leave_requests " +
                "GROUP BY DATE_FORMAT(created_at, '%Y-%m') " +
                "ORDER BY month DESC"
        );
        List<Object[]> results = query.getResultList();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("month", row[0]);
            map.put("approved", row[1]);
            map.put("rejected", row[2]);
            map.put("pending", row[3]);
            map.put("total", row[4]);
            list.add(map);
        }
        return list;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getComplaintCategoryStats() {
        Query query = entityManager.createNativeQuery(
                "SELECT category, COUNT(*) AS total, " +
                "SUM(CASE WHEN status = 'RESOLVED' OR status = 'CLOSED' THEN 1 ELSE 0 END) AS resolved, " +
                "ROUND((SUM(CASE WHEN status = 'RESOLVED' OR status = 'CLOSED' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS resolution_rate " +
                "FROM complaints " +
                "GROUP BY category " +
                "ORDER BY total DESC"
        );
        List<Object[]> results = query.getResultList();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("category", row[0]);
            map.put("total", row[1]);
            map.put("resolved", row[2]);
            map.put("resolutionRate", row[3]);
            list.add(map);
        }
        return list;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getInventoryStatusStats() {
        Query query = entityManager.createNativeQuery(
                "SELECT category, SUM(total_quantity) AS total_qty, SUM(available_quantity) AS available_qty " +
                "FROM inventory_items " +
                "GROUP BY category"
        );
        List<Object[]> results = query.getResultList();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("category", row[0]);
            map.put("totalQty", row[1] != null ? row[1] : 0);
            map.put("availableQty", row[2] != null ? row[2] : 0);
            list.add(map);
        }
        return list;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getLibraryStatusStats() {
        Query query = entityManager.createNativeQuery(
                "SELECT COALESCE(SUM(copies_total), 0) AS total, " +
                "COALESCE(SUM(copies_available), 0) AS available, " +
                "COALESCE(SUM(copies_total - copies_available), 0) AS issued " +
                "FROM books"
        );
        List<Object[]> results = query.getResultList();
        List<Map<String, Object>> list = new ArrayList<>();
        if (!results.isEmpty()) {
            Object[] row = results.get(0);
            Map<String, Object> map = new HashMap<>();
            map.put("total", row[0] != null ? row[0] : 0);
            map.put("available", row[1] != null ? row[1] : 0);
            map.put("issued", row[2] != null ? row[2] : 0);
            list.add(map);
        }
        return list;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getFinanceIncomeExpenseStats() {
        Query query = entityManager.createNativeQuery(
                "SELECT m.month, COALESCE(inc.income, 0) AS income, COALESCE(exp.expense, 0) AS expense " +
                "FROM (" +
                "    SELECT DISTINCT DATE_FORMAT(paid_at, '%Y-%m') AS month FROM fee_payments WHERE status = 'PAID' AND paid_at IS NOT NULL " +
                "    UNION " +
                "    SELECT DISTINCT DATE_FORMAT(expense_date, '%Y-%m') AS month FROM expenses" +
                ") m " +
                "LEFT JOIN (" +
                "    SELECT DATE_FORMAT(paid_at, '%Y-%m') AS month, SUM(amount) AS income " +
                "    FROM fee_payments " +
                "    WHERE status = 'PAID' AND paid_at IS NOT NULL " +
                "    GROUP BY month " +
                ") inc ON m.month = inc.month " +
                "LEFT JOIN (" +
                "    SELECT DATE_FORMAT(expense_date, '%Y-%m') AS month, SUM(amount) AS expense " +
                "    FROM expenses " +
                "    GROUP BY month " +
                ") exp ON m.month = exp.month " +
                "ORDER BY m.month DESC " +
                "LIMIT 6"
        );
        List<Object[]> results = query.getResultList();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("month", row[0]);
            map.put("income", row[1] != null ? row[1] : 0);
            map.put("expense", row[2] != null ? row[2] : 0);
            list.add(map);
        }
        return list;
    }

    public void exportStudentsToCSV(Writer writer) throws IOException {
        List<Student> students = studentRepository.findAll();
        writer.write("ID,Roll Number,Name,Department,Email,Phone,Semester,Created At\n");
        for (Student s : students) {
            writer.write(String.format("%d,%s,%s,%s,%s,%s,%d,%s\n",
                    s.getId(),
                    escapeCSV(s.getRollNumber()),
                    escapeCSV(s.getName()),
                    escapeCSV(s.getDepartment().getName()),
                    escapeCSV(s.getEmail()),
                    escapeCSV(s.getPhone()),
                    s.getSemester(),
                    s.getCreatedAt().toString()
            ));
        }
    }

    public void exportStudentsToPDF(OutputStream outputStream) {
        List<Student> students = studentRepository.findAll();
        Document document = new Document();
        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();

            // Set Title Font
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Paragraph title = new Paragraph("IIT Admin Office - Student Directory Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20f);
            document.add(title);

            // Table Creation
            PdfPTable table = new PdfPTable(6); // Roll Number, Name, Department, Email, Phone, Semester
            table.setWidthPercentage(100f);
            table.setWidths(new float[] {1.5f, 2.5f, 2.5f, 2.5f, 1.5f, 1.0f});

            // Headers
            Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD);
            String[] headers = {"Roll No", "Name", "Department", "Email", "Phone", "Sem"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(header, headerFont));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6f);
                table.addCell(cell);
            }

            // Rows
            Font cellFont = new Font(Font.HELVETICA, 9);
            for (Student s : students) {
                table.addCell(new PdfPCell(new Paragraph(s.getRollNumber(), cellFont)));
                table.addCell(new PdfPCell(new Paragraph(s.getName(), cellFont)));
                table.addCell(new PdfPCell(new Paragraph(s.getDepartment().getName(), cellFont)));
                table.addCell(new PdfPCell(new Paragraph(s.getEmail(), cellFont)));
                table.addCell(new PdfPCell(new Paragraph(s.getPhone() != null ? s.getPhone() : "", cellFont)));
                PdfPCell semCell = new PdfPCell(new Paragraph(String.valueOf(s.getSemester()), cellFont));
                semCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(semCell);
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void exportStudentAdmissionPDF(Long studentId, OutputStream outputStream) {
        Student s = studentRepository.findById(studentId)
                .orElseThrow(() -> new com.iit.admin.exception.ResourceNotFoundException("Student not found with ID: " + studentId));
        Document document = new Document();
        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();

            // Set Title Font
            Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD);
            Paragraph title = new Paragraph("IIT Allahabad - Student Admission Slip", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(15f);
            document.add(title);

            // Subtitle
            Font subFont = new Font(Font.HELVETICA, 11, Font.ITALIC);
            Paragraph subtitle = new Paragraph("Official Admission Confirmation & Registry Record", subFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(25f);
            document.add(subtitle);

            // Information Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(90f);
            table.setWidths(new float[] {1.8f, 2.5f});
            
            Font labelFont = new Font(Font.HELVETICA, 10, Font.BOLD);
            Font valueFont = new Font(Font.HELVETICA, 10);

            String[][] rows = {
                {"Student Database ID", String.valueOf(s.getId())},
                {"Roll Number", s.getRollNumber()},
                {"Full Name", s.getName()},
                {"Department", s.getDepartment().getName()},
                {"Email Address", s.getEmail()},
                {"Phone Number", s.getPhone() != null && !s.getPhone().isEmpty() ? s.getPhone() : "N/A"},
                {"Initial Semester", "Semester " + s.getSemester()},
                {"Admission Date", s.getCreatedAt() != null ? s.getCreatedAt().toString() : java.time.LocalDateTime.now().toString()}
            };

            for (String[] row : rows) {
                PdfPCell cell1 = new PdfPCell(new Paragraph(row[0], labelFont));
                cell1.setPadding(8f);
                cell1.setHorizontalAlignment(Element.ALIGN_LEFT);
                table.addCell(cell1);

                PdfPCell cell2 = new PdfPCell(new Paragraph(row[1], valueFont));
                cell2.setPadding(8f);
                cell2.setHorizontalAlignment(Element.ALIGN_LEFT);
                table.addCell(cell2);
            }

            document.add(table);

            // Footer / Signatures
            Paragraph signatureArea = new Paragraph("\n\n\n\n\n_______________________________\nAuthorized Registrar Signature\nIIT Office Administration", valueFont);
            signatureArea.setAlignment(Element.ALIGN_RIGHT);
            document.add(signatureArea);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String escapeCSV(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
