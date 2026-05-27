package com.iit.admin.service;

import com.iit.admin.dto.ComplaintDTO;
import com.iit.admin.entity.Complaint;
import com.iit.admin.entity.Student;
import com.iit.admin.entity.User;
import com.iit.admin.exception.BadRequestException;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.repository.ComplaintRepository;
import com.iit.admin.repository.StudentRepository;
import com.iit.admin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public Page<ComplaintDTO> searchComplaints(String status, String category, String studentUsername, Pageable pageable) {
        return complaintRepository.searchComplaints(status, category, studentUsername, pageable)
                .map(this::mapToDTO);
    }

    public Page<ComplaintDTO> getMyComplaints(String studentUsername, Pageable pageable) {
        return complaintRepository.findByStudentUserUsername(studentUsername, pageable)
                .map(this::mapToDTO);
    }

    @Transactional
    public ComplaintDTO createComplaint(String studentUsername, ComplaintDTO dto, String ipAddress) {
        Student student = studentRepository.findByUserUsername(studentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + studentUsername));

        Complaint complaint = new Complaint();
        complaint.setStudent(student);
        complaint.setTitle(dto.getTitle());
        complaint.setDescription(dto.getDescription());
        complaint.setCategory(dto.getCategory());
        complaint.setStatus("OPEN");

        Complaint saved = complaintRepository.save(complaint);
        // Note: activity_logs insert is handled by trigger `after_complaint_insert`!

        return mapToDTO(saved);
    }

    @Transactional
    public ComplaintDTO assignComplaint(Long id, Long staffUserId, String adminUsername, String ipAddress) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        User staff = userRepository.findById(staffUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found with ID: " + staffUserId));

        if (!"ROLE_STAFF".equals(staff.getRole().getName()) && !"ROLE_ADMIN".equals(staff.getRole().getName())) {
            throw new BadRequestException("Complaints can only be assigned to ADMIN or STAFF members!");
        }

        complaint.setAssignedTo(staff);
        complaint.setStatus("IN_PROGRESS");

        Complaint updated = complaintRepository.save(complaint);
        activityLogService.log(adminUsername, "ASSIGN_COMPLAINT", 
                "Assigned complaint #" + id + " to staff member: " + staff.getUsername(), ipAddress);

        return mapToDTO(updated);
    }

    @Transactional
    public ComplaintDTO updateStatus(Long id, String status, String userUsername, String ipAddress) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (!"OPEN".equals(status) && !"IN_PROGRESS".equals(status) && !"RESOLVED".equals(status) && !"CLOSED".equals(status)) {
            throw new BadRequestException("Invalid status value: " + status);
        }

        complaint.setStatus(status);
        Complaint updated = complaintRepository.save(complaint);

        activityLogService.log(userUsername, "COMPLAINT_STATUS_UPDATE", 
                "Updated complaint #" + id + " status to " + status, ipAddress);

        return mapToDTO(updated);
    }

    private ComplaintDTO mapToDTO(Complaint complaint) {
        ComplaintDTO dto = new ComplaintDTO();
        dto.setId(complaint.getId());
        dto.setStudentId(complaint.getStudent().getId());
        dto.setStudentName(complaint.getStudent().getName());
        dto.setRollNumber(complaint.getStudent().getRollNumber());
        dto.setDepartment(complaint.getStudent().getDepartment());
        dto.setTitle(complaint.getTitle());
        dto.setDescription(complaint.getDescription());
        dto.setCategory(complaint.getCategory());
        dto.setStatus(complaint.getStatus());
        dto.setAssignedToId(complaint.getAssignedTo() != null ? complaint.getAssignedTo().getId() : null);
        dto.setAssignedToUsername(complaint.getAssignedTo() != null ? complaint.getAssignedTo().getUsername() : null);
        dto.setCreatedAt(complaint.getCreatedAt());
        return dto;
    }
}
