package com.iit.admin.controller;

import com.iit.admin.dto.*;
import com.iit.admin.service.HostelService;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hostels")
public class HostelController {

    @Autowired
    private HostelService hostelService;

    // --- Hostels ---

    @GetMapping
    public ResponseEntity<List<HostelDTO>> getAllHostels() {
        return ResponseEntity.ok(hostelService.getAllHostels());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<HostelDTO> createHostel(
            @Valid @RequestBody HostelDTO dto,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        return ResponseEntity.ok(hostelService.createHostel(dto, userDetails.getUsername(), ip));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<HostelDTO> updateHostel(
            @PathVariable Long id,
            @Valid @RequestBody HostelDTO dto,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        return ResponseEntity.ok(hostelService.updateHostel(id, dto, userDetails.getUsername(), ip));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> deleteHostel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        hostelService.deleteHostel(id, userDetails.getUsername(), ip);
        return ResponseEntity.ok(Map.of("message", "Hostel deleted successfully"));
    }

    // --- Rooms ---

    @GetMapping("/{id}/rooms")
    public ResponseEntity<List<HostelRoomDTO>> getRoomsInHostel(@PathVariable Long id) {
        return ResponseEntity.ok(hostelService.getRoomsInHostel(id));
    }

    @GetMapping("/{id}/rooms/available")
    public ResponseEntity<List<HostelRoomDTO>> getAvailableRoomsInHostel(@PathVariable Long id) {
        return ResponseEntity.ok(hostelService.getAvailableRoomsInHostel(id));
    }

    @PostMapping("/{id}/rooms")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<HostelRoomDTO> addRoom(
            @PathVariable Long id,
            @Valid @RequestBody HostelRoomDTO dto,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        return ResponseEntity.ok(hostelService.addRoom(id, dto, userDetails.getUsername(), ip));
    }

    @PutMapping("/rooms/{roomId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<HostelRoomDTO> updateRoom(
            @PathVariable Long roomId,
            @Valid @RequestBody HostelRoomDTO dto,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        return ResponseEntity.ok(hostelService.updateRoom(roomId, dto, userDetails.getUsername(), ip));
    }

    @DeleteMapping("/rooms/{roomId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> deleteRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        hostelService.deleteRoom(roomId, userDetails.getUsername(), ip);
        return ResponseEntity.ok(Map.of("message", "Room deleted successfully"));
    }

    // --- Allotments ---

    @GetMapping("/allotments")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Page<HostelAllotmentDTO>> getActiveAllotments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return ResponseEntity.ok(hostelService.getActiveAllotments(pageable));
    }

    @GetMapping("/allotments/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<HostelAllotmentDTO> getMyAllotment(@AuthenticationPrincipal UserDetails userDetails) {
        HostelAllotmentDTO dto = hostelService.getStudentAllotment(userDetails.getUsername());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/allotments")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<HostelAllotmentDTO> manualAllot(
            @RequestBody Map<String, Long> payload,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        Long studentId = payload.get("studentId");
        Long roomId = payload.get("roomId");
        String ip = request.getRemoteAddr();
        return ResponseEntity.ok(hostelService.manualAllotRoom(studentId, roomId, userDetails.getUsername(), ip));
    }

    @PutMapping("/allotments/{id}/vacate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> vacateRoom(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        hostelService.vacateRoom(id, userDetails.getUsername(), ip);
        return ResponseEntity.ok(Map.of("message", "Student vacated from room successfully"));
    }

    // --- Requests ---

    @GetMapping("/requests")
    public ResponseEntity<Page<HostelRequestDTO>> getRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        
        boolean isAdminOrStaff = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"));

        if (!isAdminOrStaff) {
            return ResponseEntity.ok(hostelService.getStudentRequests(userDetails.getUsername(), pageable));
        }
        return ResponseEntity.ok(hostelService.getPendingRequests(pageable));
    }

    @PostMapping("/requests")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<HostelRequestDTO> submitRequest(
            @Valid @RequestBody HostelRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        return ResponseEntity.ok(hostelService.submitRequest(userDetails.getUsername(), dto, ip));
    }

    @PutMapping("/requests/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<HostelRequestDTO> processRequest(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false, defaultValue = "") String remarks,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        return ResponseEntity.ok(hostelService.processRequest(id, status, roomId, remarks, userDetails.getUsername(), ip));
    }
}
