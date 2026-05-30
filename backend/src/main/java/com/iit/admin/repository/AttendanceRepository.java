package com.iit.admin.repository;

import com.iit.admin.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByUserIdAndAttendanceDate(Long userId, LocalDate attendanceDate);

    List<Attendance> findByUserIdOrderByAttendanceDateDesc(Long userId);

    @Query("SELECT a FROM Attendance a WHERE " +
           "(:roleName IS NULL OR a.user.role.name = :roleName) AND " +
           "(:startDate IS NULL OR a.attendanceDate >= :startDate) AND " +
           "(:endDate IS NULL OR a.attendanceDate <= :endDate) " +
           "ORDER BY a.attendanceDate DESC, a.punchIn DESC")
    List<Attendance> searchAttendanceLogs(
        @Param("roleName") String roleName,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
