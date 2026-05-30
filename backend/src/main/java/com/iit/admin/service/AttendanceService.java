package com.iit.admin.service;

import com.iit.admin.dto.AttendanceDTO;
import com.iit.admin.entity.Attendance;
import com.iit.admin.entity.Faculty;
import com.iit.admin.entity.User;
import com.iit.admin.exception.BadRequestException;
import com.iit.admin.exception.ResourceNotFoundException;
import com.iit.admin.repository.AttendanceRepository;
import com.iit.admin.repository.FacultyRepository;
import com.iit.admin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private ActivityLogService activityLogService;

    // Campus geofencing constants (IIIT Campus center)
    private static final double CAMPUS_LAT = 25.4299;
    private static final double CAMPUS_LON = 81.7712;
    private static final double ALLOWED_RADIUS_METERS = 300.0;

    @Transactional
    public AttendanceDTO punchWithBiometric(String cardUid, String ipAddress) {
        User user = userRepository.findByCardUid(cardUid)
                .orElseThrow(() -> new ResourceNotFoundException("No user associated with Card UID: " + cardUid));

        // Authorization: Only Staff and Faculty attendance is tracked
        String role = user.getRole().getName();
        if (!"ROLE_STAFF".equals(role) && !"ROLE_FACULTY".equals(role) && !"ROLE_ADMIN".equals(role)) {
            throw new BadRequestException("Attendance tracking is only applicable to Staff, Faculty, and Admins.");
        }

        LocalDate today = LocalDate.now();
        Optional<Attendance> attendanceOpt = attendanceRepository.findByUserIdAndAttendanceDate(user.getId(), today);

        Attendance attendance;
        String action;
        if (attendanceOpt.isEmpty()) {
            // First punch of the day -> Punch In
            attendance = new Attendance();
            attendance.setUser(user);
            attendance.setAttendanceDate(today);
            attendance.setPunchIn(LocalDateTime.now());
            attendance.setSource("BIOMETRIC");
            attendance.setCardUid(cardUid);
            attendance.setStatus(determineStatus(attendance.getPunchIn()));
            action = "PUNCH_IN";
        } else {
            // Second punch -> Punch Out
            attendance = attendanceOpt.get();
            if (attendance.getPunchOut() != null) {
                throw new BadRequestException("You have already checked in and checked out for today.");
            }
            attendance.setPunchOut(LocalDateTime.now());
            action = "PUNCH_OUT";
        }

        Attendance saved = attendanceRepository.save(attendance);
        activityLogService.log(user.getUsername(), action, 
                String.format("Biometric %s registered using Card %s. Status: %s", action, cardUid, saved.getStatus()), 
                ipAddress);

        return mapToDTO(saved);
    }

    @Transactional
    public AttendanceDTO punchWithMobile(String username, Double latitude, Double longitude, String ipAddress) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        String role = user.getRole().getName();
        if (!"ROLE_STAFF".equals(role) && !"ROLE_FACULTY".equals(role) && !"ROLE_ADMIN".equals(role)) {
            throw new BadRequestException("Attendance tracking is only applicable to Staff, Faculty, and Admins.");
        }

        // Verify GPS Geofence
        double distance = calculateDistance(latitude, longitude, CAMPUS_LAT, CAMPUS_LON);
        // Bypassed for development/testing:
        // if (distance > ALLOWED_RADIUS_METERS) {
        //     throw new BadRequestException(String.format("Punch Rejected: You are outside the authorized campus area. Distance: %.1f meters", distance));
        // }

        LocalDate today = LocalDate.now();
        Optional<Attendance> attendanceOpt = attendanceRepository.findByUserIdAndAttendanceDate(user.getId(), today);

        Attendance attendance;
        String action;
        if (attendanceOpt.isEmpty()) {
            attendance = new Attendance();
            attendance.setUser(user);
            attendance.setAttendanceDate(today);
            attendance.setPunchIn(LocalDateTime.now());
            attendance.setSource("MOBILE");
            attendance.setLatitude(latitude);
            attendance.setLongitude(longitude);
            attendance.setStatus(determineStatus(attendance.getPunchIn()));
            action = "PUNCH_IN";
        } else {
            attendance = attendanceOpt.get();
            if (attendance.getPunchOut() != null) {
                throw new BadRequestException("You have already checked in and checked out for today.");
            }
            attendance.setPunchOut(LocalDateTime.now());
            action = "PUNCH_OUT";
        }

        Attendance saved = attendanceRepository.save(attendance);
        activityLogService.log(user.getUsername(), action, 
                String.format("Mobile GPS %s registered (Lat: %.4f, Lon: %.4f). Status: %s", action, latitude, longitude, saved.getStatus()), 
                ipAddress);

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO> getMyAttendanceHistory(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return attendanceRepository.findByUserIdOrderByAttendanceDateDesc(user.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAllAttendanceLogs(String role, LocalDate start, LocalDate end) {
        return attendanceRepository.searchAttendanceLogs(role, start, end).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void registerUserCard(Long userId, String cardUid, String adminUsername, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setCardUid(cardUid);
        userRepository.save(user);

        activityLogService.log(adminUsername, "REGISTER_CARD", 
                String.format("Registered Card UID: %s for user %s", cardUid, user.getUsername()), 
                ipAddress);
    }

    private String determineStatus(LocalDateTime punchInTime) {
        // Late if punched in after 9:15 AM
        if (punchInTime.toLocalTime().isAfter(LocalTime.of(9, 15))) {
            return "LATE";
        }
        return "PRESENT";
    }

    // Haversine formula calculation in meters
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Earth's Radius in meters
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private AttendanceDTO mapToDTO(Attendance attendance) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setUserId(attendance.getUser().getId());
        dto.setUsername(attendance.getUser().getUsername());
        dto.setUserEmail(attendance.getUser().getEmail());
        dto.setRoleName(attendance.getUser().getRole().getName().replace("ROLE_", ""));
        dto.setAttendanceDate(attendance.getAttendanceDate());
        dto.setPunchIn(attendance.getPunchIn());
        dto.setPunchOut(attendance.getPunchOut());
        dto.setStatus(attendance.getStatus());
        dto.setSource(attendance.getSource());
        dto.setLatitude(attendance.getLatitude());
        dto.setLongitude(attendance.getLongitude());
        dto.setCardUid(attendance.getCardUid());

        // Resolve display name via Faculty details if available
        Optional<Faculty> facultyOpt = facultyRepository.findByUserUsername(attendance.getUser().getUsername());
        if (facultyOpt.isPresent()) {
            dto.setName(facultyOpt.get().getName());
        } else {
            dto.setName(attendance.getUser().getUsername() + " (Staff)");
        }

        return dto;
    }
}
