package com.iit.admin.repository;

import com.iit.admin.entity.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    List<ClassSession> findByCourseId(Long courseId);
    List<ClassSession> findByFacultyId(Long facultyId);
    List<ClassSession> findByCourseIdOrderBySessionDateDescStartTimeDesc(Long courseId);
    List<ClassSession> findByFacultyIdOrderBySessionDateDescStartTimeDesc(Long facultyId);
}
