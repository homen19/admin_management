package com.iit.admin.repository;

import com.iit.admin.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findTop20ByOrderByCreatedAtDesc();
    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT a FROM ActivityLog a LEFT JOIN a.user u WHERE " +
           "(:action IS NULL OR :action = '' OR a.action = :action) AND " +
           "(:username IS NULL OR :username = '' OR u.username LIKE %:username%) " +
           "ORDER BY a.createdAt DESC")
    Page<ActivityLog> searchLogs(@Param("action") String action, @Param("username") String username, Pageable pageable);
}

