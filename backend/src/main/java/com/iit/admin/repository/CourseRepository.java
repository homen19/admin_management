package com.iit.admin.repository;

import com.iit.admin.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseCode(String courseCode);
    List<Course> findByDepartmentId(Long departmentId);
    List<Course> findByDepartmentIdAndSemester(Long departmentId, Integer semester);
    List<Course> findByFacultyId(Long facultyId);
}
