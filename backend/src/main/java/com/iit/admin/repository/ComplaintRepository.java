package com.iit.admin.repository;

import com.iit.admin.entity.Complaint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    
    Page<Complaint> findByStudentUserUsername(String username, Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE " +
           "(:status IS NULL OR :status = '' OR c.status = :status) AND " +
           "(:category IS NULL OR :category = '' OR c.category = :category) AND " +
           "(:username IS NULL OR :username = '' OR c.student.user.username = :username)")
    Page<Complaint> searchComplaints(@Param("status") String status, 
                                     @Param("category") String category, 
                                     @Param("username") String username, 
                                     Pageable pageable);

    long countByStatus(String status);
}
