package com.iit.admin.service;

import com.iit.admin.dto.StatsResponse;
import com.iit.admin.repository.ComplaintRepository;
import com.iit.admin.repository.FacultyRepository;
import com.iit.admin.repository.LeaveRequestRepository;
import com.iit.admin.repository.NoticeRepository;
import com.iit.admin.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private com.iit.admin.repository.FeePaymentRepository feePaymentRepository;

    @Autowired
    private com.iit.admin.repository.ExpenseRepository expenseRepository;

    @Autowired
    private com.iit.admin.repository.BookRepository bookRepository;

    @Autowired
    private com.iit.admin.repository.BookIssueRepository bookIssueRepository;

    @Autowired
    private com.iit.admin.repository.HostelRoomRepository hostelRoomRepository;

    @Autowired
    private com.iit.admin.repository.InventoryItemRepository inventoryItemRepository;

    public StatsResponse getDashboardStats() {
        StatsResponse stats = new StatsResponse();
        stats.setTotalStudents(studentRepository.count());
        stats.setTotalFaculty(facultyRepository.count());
        stats.setPendingLeaves(leaveRequestRepository.countByStatus("PENDING"));
        stats.setOpenComplaints(complaintRepository.countByStatus("OPEN") + complaintRepository.countByStatus("IN_PROGRESS"));
        stats.setRecentNoticesCount(noticeRepository.count());
        stats.setRecentLogs(activityLogService.getRecentLogs());
        
        // Populate new stats
        stats.setTotalIncome(feePaymentRepository.sumTotalCollected());
        stats.setTotalExpenses(expenseRepository.sumTotalExpense());
        stats.setTotalBooks(bookRepository.sumTotalCopies());
        stats.setIssuedBooks(bookIssueRepository.countByStatus("ISSUED") + bookIssueRepository.countByStatus("OVERDUE"));
        stats.setOverdueBooks(bookIssueRepository.countByStatus("OVERDUE"));
        stats.setTotalBeds(hostelRoomRepository.sumTotalCapacity());
        stats.setOccupiedBeds(hostelRoomRepository.sumTotalOccupied());
        stats.setLowStockItems(inventoryItemRepository.countByAvailableQuantityLessThan(10));
        
        return stats;
    }
}
