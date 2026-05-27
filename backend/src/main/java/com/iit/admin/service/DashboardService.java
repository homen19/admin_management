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

    public StatsResponse getDashboardStats() {
        StatsResponse stats = new StatsResponse();
        stats.setTotalStudents(studentRepository.count());
        stats.setTotalFaculty(facultyRepository.count());
        stats.setPendingLeaves(leaveRequestRepository.countByStatus("PENDING"));
        stats.setOpenComplaints(complaintRepository.countByStatus("OPEN") + complaintRepository.countByStatus("IN_PROGRESS"));
        stats.setRecentNoticesCount(noticeRepository.count());
        stats.setRecentLogs(activityLogService.getRecentLogs());
        return stats;
    }
}
