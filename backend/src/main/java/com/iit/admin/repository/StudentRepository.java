package com.iit.admin.repository;

import com.iit.admin.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserUsername(String username);
    Optional<Student> findByRollNumber(String rollNumber);
    Optional<Student> findByEmail(String email);
    
    @Query("SELECT s FROM Student s WHERE " +
           "(:dept IS NULL OR :dept = '' OR s.department = :dept) AND " +
           "(:query IS NULL OR :query = '' OR LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(s.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Student> searchStudents(@Param("dept") String department, @Param("query") String query, Pageable pageable);
}
