package com.iit.admin.service;

import com.iit.admin.dto.ActivityLogDTO;
import com.iit.admin.entity.ActivityLog;
import com.iit.admin.entity.User;
import com.iit.admin.repository.ActivityLogRepository;
import com.iit.admin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void log(String username, String action, String details, String ipAddress) {
        ActivityLog log = new ActivityLog();
        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            log.setUser(user);
        }
        log.setAction(action);
        log.setDetails(details);
        log.setIpAddress(ipAddress);
        activityLogRepository.save(log);
    }

    public List<ActivityLogDTO> getRecentLogs() {
        return activityLogRepository.findTop20ByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public Page<ActivityLogDTO> getLogs(String action, String username, Pageable pageable) {
        return activityLogRepository.searchLogs(action, username, pageable)
                .map(this::mapToDTO);
    }

    private ActivityLogDTO mapToDTO(ActivityLog log) {
        ActivityLogDTO dto = new ActivityLogDTO();
        dto.setId(log.getId());
        dto.setUsername(log.getUser() != null ? log.getUser().getUsername() : "SYSTEM");
        dto.setAction(log.getAction());
        dto.setDetails(log.getDetails());
        dto.setIpAddress(log.getIpAddress());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
}
