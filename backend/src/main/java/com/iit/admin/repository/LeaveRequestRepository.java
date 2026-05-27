package com.iit.admin.repository;

import com.iit.admin.entity.LeaveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    
    Page<LeaveRequest> findByUserUsername(String username, Pageable pageable);
    
    Page<LeaveRequest> findByStatus(String status, Pageable pageable);

    @Query("SELECT lr FROM LeaveRequest lr WHERE " +
           "(:status IS NULL OR :status = '' OR lr.status = :status) AND " +
           "(:username IS NULL OR :username = '' OR lr.user.username = :username)")
    Page<LeaveRequest> searchLeaves(@Param("status") String status, @Param("username") String username, Pageable pageable);

    long countByStatus(String status);
}
