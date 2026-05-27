package com.iit.admin.service;

import com.iit.admin.dto.LeaveRequestDTO;
import com.iit.admin.entity.Faculty;
import com.iit.admin.entity.LeaveRequest;
import com.iit.admin.entity.Student;
import com.iit.admin.entity.User;
import com.iit.admin.exception.BadRequestException;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.repository.FacultyRepository;
import com.iit.admin.repository.LeaveRequestRepository;
import com.iit.admin.repository.StudentRepository;
import com.iit.admin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class LeaveRequestService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public Page<LeaveRequestDTO> getLeaveRequests(String status, String username, Pageable pageable) {
        return leaveRequestRepository.searchLeaves(status, username, pageable)
                .map(this::mapToDTO);
    }

    public Page<LeaveRequestDTO> getMyLeaveRequests(String username, Pageable pageable) {
        return leaveRequestRepository.findByUserUsername(username, pageable)
                .map(this::mapToDTO);
    }

    @Transactional
    public LeaveRequestDTO createLeaveRequest(String username, LeaveRequestDTO dto, String ipAddress) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date!");
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setUser(user);
        leaveRequest.setStartDate(dto.getStartDate());
        leaveRequest.setEndDate(dto.getEndDate());
        leaveRequest.setReason(dto.getReason());
        leaveRequest.setStatus("PENDING");
        leaveRequest.setAttachmentPath(dto.getAttachmentPath());

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        activityLogService.log(username, "APPLY_LEAVE", "Applied for leave starting: " + dto.getStartDate(), ipAddress);

        return mapToDTO(saved);
    }

    @Transactional
    public LeaveRequestDTO actionLeaveRequest(Long id, String status, String remarks, String actionedByUsername, String ipAddress) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + id));

        if (!"PENDING".equals(leaveRequest.getStatus())) {
            throw new BadRequestException("Leave request has already been processed!");
        }

        if (!"APPROVED".equals(status) && !"REJECTED".equals(status)) {
            throw new BadRequestException("Invalid status update! Use APPROVED or REJECTED.");
        }

        User actionedBy = userRepository.findByUsername(actionedByUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + actionedByUsername));

        leaveRequest.setStatus(status);
        leaveRequest.setRemarks(remarks);
        leaveRequest.setActionedBy(actionedBy);

        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        
        activityLogService.log(actionedByUsername, "LEAVE_DECISION", 
                "Marked leave request #" + id + " as " + status + " for user: " + leaveRequest.getUser().getUsername(), ipAddress);

        return mapToDTO(updated);
    }

    private LeaveRequestDTO mapToDTO(LeaveRequest request) {
        LeaveRequestDTO dto = new LeaveRequestDTO();
        dto.setId(request.getId());
        dto.setUserId(request.getUser().getId());
        dto.setUsername(request.getUser().getUsername());
        dto.setRole(request.getUser().getRole().getName());
        dto.setStartDate(request.getStartDate());
        dto.setEndDate(request.getEndDate());
        dto.setReason(request.getReason());
        dto.setStatus(request.getStatus());
        dto.setAttachmentPath(request.getAttachmentPath());
        dto.setRemarks(request.getRemarks());
        dto.setActionedByUsername(request.getActionedBy() != null ? request.getActionedBy().getUsername() : null);
        dto.setCreatedAt(request.getCreatedAt());

        // Resolve user's actual display name
        if ("ROLE_STUDENT".equals(dto.getRole())) {
            Optional<Student> student = studentRepository.findByUserUsername(dto.getUsername());
            student.ifPresent(s -> dto.setName(s.getName()));
        } else if ("ROLE_FACULTY".equals(dto.getRole())) {
            Optional<Faculty> faculty = facultyRepository.findByUserUsername(dto.getUsername());
            faculty.ifPresent(f -> dto.setName(f.getName()));
        } else {
            dto.setName(request.getUser().getUsername());
        }

        return dto;
    }
}
