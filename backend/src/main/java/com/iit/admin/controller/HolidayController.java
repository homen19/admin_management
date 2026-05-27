package com.iit.admin.controller;

import com.iit.admin.dto.HolidayDTO;
import com.iit.admin.service.HolidayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/holidays")
public class HolidayController {

    @Autowired
    private HolidayService holidayService;

    @GetMapping
    public ResponseEntity<List<HolidayDTO>> getHolidays(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        
        List<HolidayDTO> holidays;
        if (start != null && end != null) {
            holidays = holidayService.getHolidaysInRange(start, end);
        } else {
            holidays = holidayService.getAllHolidays();
        }
        return ResponseEntity.ok(holidays);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<HolidayDTO> createHoliday(
            @Valid @RequestBody HolidayDTO holidayDTO,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        HolidayDTO created = holidayService.createHoliday(holidayDTO, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<HolidayDTO> updateHoliday(
            @PathVariable Long id,
            @Valid @RequestBody HolidayDTO holidayDTO,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        HolidayDTO updated = holidayService.updateHoliday(id, holidayDTO, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> deleteHoliday(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        holidayService.deleteHoliday(id, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok("Holiday deleted successfully.");
    }
}
