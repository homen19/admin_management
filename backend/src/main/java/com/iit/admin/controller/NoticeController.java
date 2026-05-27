package com.iit.admin.controller;

import com.iit.admin.dto.NoticeDTO;
import com.iit.admin.service.NoticeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    @GetMapping
    public ResponseEntity<Page<NoticeDTO>> getNotices(
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserDetails userDetails) {

        Sort sort = Sort.by(Sort.Order.desc("isPinned"), Sort.Order.desc("createdAt"));
        Pageable pageable = PageRequest.of(page, size, sort);

        boolean isAdminOrStaffOrFaculty = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") 
                        || a.getAuthority().equals("ROLE_STAFF") 
                        || a.getAuthority().equals("ROLE_FACULTY"));

        Page<NoticeDTO> notices;
        if (isAdminOrStaffOrFaculty) {
            notices = noticeService.getAllNotices(query, pageable);
        } else {
            notices = noticeService.getActiveNotices(query, pageable);
        }
        return ResponseEntity.ok(notices);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY') or hasRole('STAFF')")
    public ResponseEntity<NoticeDTO> createNotice(
            @Valid @RequestBody NoticeDTO noticeDTO,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        NoticeDTO created = noticeService.createNotice(userDetails.getUsername(), noticeDTO, ipAddress);
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY')")
    public ResponseEntity<?> deleteNotice(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        noticeService.deleteNotice(id, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok("Notice deleted successfully.");
    }
}
