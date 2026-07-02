package com.iit.admin.repository;

import com.iit.admin.entity.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    Optional<Syllabus> findByCourseId(Long courseId);
}
