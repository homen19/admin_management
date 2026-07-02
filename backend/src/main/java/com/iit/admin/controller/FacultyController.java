package com.iit.admin.controller;

import com.iit.admin.dto.FacultyDTO;
import com.iit.admin.dto.RegisterRequest;
import com.iit.admin.entity.User;
import com.iit.admin.service.FacultyService;
import com.iit.admin.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
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
@RequestMapping("/api/faculty")
public class FacultyController {

    @Autowired
    private FacultyService facultyService;

    @Autowired
    private UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FacultyDTO> createFaculty(
            @Valid @RequestBody RegisterRequest registerRequest,
            HttpServletRequest request) {
        registerRequest.setRole("ROLE_FACULTY");
        String ipAddress = request.getRemoteAddr();
        User user = userService.registerUser(registerRequest, ipAddress);
        FacultyDTO created = facultyService.getFacultyByUsername(user.getUsername());
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<Page<FacultyDTO>> getAllFaculty(
            @RequestParam(required = false) String department,
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<FacultyDTO> faculty = facultyService.searchFaculty(department, query, pageable);
        return ResponseEntity.ok(faculty);
    }

    @GetMapping("/list")
    public ResponseEntity<List<FacultyDTO>> getAllFacultyList() {
        return ResponseEntity.ok(facultyService.getAllFacultyList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacultyDTO> getFacultyById(@PathVariable Long id) {
        return ResponseEntity.ok(facultyService.getFacultyById(id));
    }

    @GetMapping("/profile")
    public ResponseEntity<FacultyDTO> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(facultyService.getFacultyByUsername(userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FacultyDTO> updateFaculty(
            @PathVariable Long id,
            @Valid @RequestBody FacultyDTO facultyDTO,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        FacultyDTO updated = facultyService.updateFaculty(id, facultyDTO, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFaculty(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        facultyService.deleteFaculty(id, userDetails.getUsername(), ipAddress);
        return ResponseEntity.ok("Faculty deleted successfully.");
    }
}
