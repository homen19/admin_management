package com.iit.admin.repository;

import com.iit.admin.entity.Faculty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByUserUsername(String username);
    Optional<Faculty> findByEmail(String email);

    @Query("SELECT f FROM Faculty f WHERE " +
           "(:dept IS NULL OR :dept = '' OR f.department = :dept) AND " +
           "(:query IS NULL OR :query = '' OR LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(f.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Faculty> searchFaculty(@Param("dept") String department, @Param("query") String query, Pageable pageable);
}
