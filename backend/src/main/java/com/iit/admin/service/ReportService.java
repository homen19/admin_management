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
                "SELECT department, COUNT(*) AS count FROM students GROUP BY department ORDER BY count DESC"
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

    public void exportStudentsToCSV(Writer writer) throws IOException {
        List<Student> students = studentRepository.findAll();
        writer.write("ID,Roll Number,Name,Department,Email,Phone,Semester,Created At\n");
        for (Student s : students) {
            writer.write(String.format("%d,%s,%s,%s,%s,%s,%d,%s\n",
                    s.getId(),
                    escapeCSV(s.getRollNumber()),
                    escapeCSV(s.getName()),
                    escapeCSV(s.getDepartment()),
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
                table.addCell(new PdfPCell(new Paragraph(s.getDepartment(), cellFont)));
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

    private String escapeCSV(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
