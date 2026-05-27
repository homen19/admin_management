package com.iit.admin.repository;

import com.iit.admin.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    
    @Query("SELECT n FROM Notice n WHERE (n.expiryDate IS NULL OR n.expiryDate >= :today) AND " +
           "(:query IS NULL OR :query = '' OR LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Notice> findActiveNotices(@Param("today") LocalDate today, @Param("query") String query, Pageable pageable);

    @Query("SELECT n FROM Notice n WHERE (:query IS NULL OR :query = '' OR LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Notice> findAllNotices(@Param("query") String query, Pageable pageable);
}
