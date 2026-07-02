package com.iit.admin.repository;

import com.iit.admin.entity.ClassAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ClassAttendanceRepository extends JpaRepository<ClassAttendance, Long> {
    List<ClassAttendance> findByClassSessionId(Long classSessionId);
    List<ClassAttendance> findByStudentId(Long studentId);
    List<ClassAttendance> findByStudentIdAndClassSessionCourseId(Long studentId, Long courseId);
    Optional<ClassAttendance> findByClassSessionIdAndStudentId(Long classSessionId, Long studentId);
}
