package com.iit.admin.controller;

import com.iit.admin.dto.CalendarEventDTO;
import com.iit.admin.service.CalendarEventService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class CalendarEventController {

    @Autowired
    private CalendarEventService calendarEventService;

    @GetMapping
    public ResponseEntity<List<CalendarEventDTO>> getEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        LocalDateTime queryStart = start != null ? start : LocalDateTime.now().minusYears(1);
        LocalDateTime queryEnd = end != null ? end : LocalDateTime.now().plusYears(1);

        List<CalendarEventDTO> events = calendarEventService.getVisibleEventsInRange(
                userDetails.getUsername(), queryStart, queryEnd);
        return ResponseEntity.ok(events);
    }

    @PostMapping
    public ResponseEntity<CalendarEventDTO> createEvent(
            @Valid @RequestBody CalendarEventDTO calendarEventDTO,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        CalendarEventDTO created = calendarEventService.createEvent(
                userDetails.getUsername(), calendarEventDTO, ipAddress);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CalendarEventDTO> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody CalendarEventDTO calendarEventDTO,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        CalendarEventDTO updated = calendarEventService.updateEvent(
                id, userDetails.getUsername(), calendarEventDTO, ipAddress);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        calendarEventService.deleteEvent(id, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok("Event deleted successfully.");
    }
}
