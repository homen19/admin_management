package com.iit.admin.service;

import com.iit.admin.dto.NoticeDTO;
import com.iit.admin.entity.Faculty;
import com.iit.admin.entity.Notice;
import com.iit.admin.entity.Student;
import com.iit.admin.entity.User;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.repository.FacultyRepository;
import com.iit.admin.repository.NoticeRepository;
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
public class NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public Page<NoticeDTO> getActiveNotices(String query, Pageable pageable) {
        return noticeRepository.findActiveNotices(LocalDate.now(), query, pageable)
                .map(this::mapToDTO);
    }

    public Page<NoticeDTO> getAllNotices(String query, Pageable pageable) {
        return noticeRepository.findAllNotices(query, pageable)
                .map(this::mapToDTO);
    }

    @Transactional
    public NoticeDTO createNotice(String username, NoticeDTO dto, String ipAddress) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Notice notice = new Notice();
        notice.setTitle(dto.getTitle());
        notice.setContent(dto.getContent());
        notice.setCreatedBy(user);
        notice.setAttachmentPath(dto.getAttachmentPath());
        notice.setIsPinned(dto.getIsPinned() != null && dto.getIsPinned());
        notice.setExpiryDate(dto.getExpiryDate());

        Notice saved = noticeRepository.save(notice);
        // Note: activity_logs insert is handled by trigger `after_notice_insert`! 
        // This is a beautiful way to show SQL triggers in production!
        
        return mapToDTO(saved);
    }

    @Transactional
    public void deleteNotice(Long id, String username, String ipAddress) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice not found with ID: " + id));

        noticeRepository.delete(notice);
        activityLogService.log(username, "DELETE_NOTICE", "Deleted notice: " + notice.getTitle(), ipAddress);
    }

    private NoticeDTO mapToDTO(Notice notice) {
        NoticeDTO dto = new NoticeDTO();
        dto.setId(notice.getId());
        dto.setTitle(notice.getTitle());
        dto.setContent(notice.getContent());
        dto.setCreatedById(notice.getCreatedBy().getId());
        dto.setCreatedByUsername(notice.getCreatedBy().getUsername());
        dto.setAttachmentPath(notice.getAttachmentPath());
        dto.setIsPinned(notice.getIsPinned());
        dto.setExpiryDate(notice.getExpiryDate());
        dto.setCreatedAt(notice.getCreatedAt());

        // Resolve display name of creator
        String role = notice.getCreatedBy().getRole().getName();
        if ("ROLE_STUDENT".equals(role)) {
            Optional<Student> s = studentRepository.findByUserUsername(dto.getCreatedByUsername());
            s.ifPresent(student -> dto.setCreatedByName(student.getName()));
        } else if ("ROLE_FACULTY".equals(role)) {
            Optional<Faculty> f = facultyRepository.findByUserUsername(dto.getCreatedByUsername());
            f.ifPresent(faculty -> dto.setCreatedByName(faculty.getName()));
        } else {
            dto.setCreatedByName(notice.getCreatedBy().getUsername() + " (Admin/Staff)");
        }

        return dto;
    }
}
