package com.iit.admin.service;

import com.iit.admin.dto.CalendarEventDTO;
import com.iit.admin.entity.CalendarEvent;
import com.iit.admin.entity.User;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.repository.CalendarEventRepository;
import com.iit.admin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CalendarEventService {

    @Autowired
    private CalendarEventRepository calendarEventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public List<CalendarEventDTO> getVisibleEventsInRange(String username, LocalDateTime start, LocalDateTime end) {
        return calendarEventRepository.findVisibleEventsInRange(username, start, end).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CalendarEventDTO createEvent(String username, CalendarEventDTO dto, String ipAddress) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        CalendarEvent event = new CalendarEvent();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setStartDate(dto.getStartDate());
        event.setEndDate(dto.getEndDate());
        event.setType(dto.getType());
        event.setCreatedBy(user);

        // Security check: Students cannot create public events
        boolean isStudent = user.getRole().getName().equals("ROLE_STUDENT");
        if (isStudent) {
            event.setIsPublic(false);
            event.setType("TASK"); // Force TASK for students
        } else {
            event.setIsPublic(dto.getIsPublic() != null && dto.getIsPublic());
        }

        CalendarEvent saved = calendarEventRepository.save(event);
        activityLogService.log(username, "CREATE_EVENT", "Created calendar event/task: " + saved.getTitle(), ipAddress);
        return mapToDTO(saved);
    }

    @Transactional
    public CalendarEventDTO updateEvent(Long id, String username, CalendarEventDTO dto, String ipAddress) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar event not found with ID: " + id));

        // Authorization check: Only creator, Admin, or Staff can modify the event
        boolean isAdminOrStaff = user.getRole().getName().equals("ROLE_ADMIN") || user.getRole().getName().equals("ROLE_STAFF");
        boolean isOwner = event.getCreatedBy().getId().equals(user.getId());

        if (!isAdminOrStaff && !isOwner) {
            throw new AccessDeniedException("You do not have permission to modify this event.");
        }

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setStartDate(dto.getStartDate());
        event.setEndDate(dto.getEndDate());
        
        if (user.getRole().getName().equals("ROLE_STUDENT")) {
            event.setIsPublic(false);
            event.setType("TASK");
        } else {
            event.setIsPublic(dto.getIsPublic() != null && dto.getIsPublic());
            event.setType(dto.getType());
        }

        CalendarEvent updated = calendarEventRepository.save(event);
        activityLogService.log(username, "UPDATE_EVENT", "Updated calendar event/task: " + updated.getTitle(), ipAddress);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteEvent(Long id, String username, String ipAddress) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar event not found with ID: " + id));

        // Authorization check
        boolean isAdminOrStaff = user.getRole().getName().equals("ROLE_ADMIN") || user.getRole().getName().equals("ROLE_STAFF");
        boolean isOwner = event.getCreatedBy().getId().equals(user.getId());

        if (!isAdminOrStaff && !isOwner) {
            throw new AccessDeniedException("You do not have permission to delete this event.");
        }

        calendarEventRepository.delete(event);
        activityLogService.log(username, "DELETE_EVENT", "Deleted calendar event/task: " + event.getTitle(), ipAddress);
    }

    private CalendarEventDTO mapToDTO(CalendarEvent event) {
        CalendarEventDTO dto = new CalendarEventDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setStartDate(event.getStartDate());
        dto.setEndDate(event.getEndDate());
        dto.setIsPublic(event.getIsPublic());
        dto.setType(event.getType());
        dto.setCreatedById(event.getCreatedBy().getId());
        dto.setCreatedByUsername(event.getCreatedBy().getUsername());
        return dto;
    }
}
