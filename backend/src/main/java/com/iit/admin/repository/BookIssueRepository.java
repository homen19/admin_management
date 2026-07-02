package com.iit.admin.repository;

import com.iit.admin.entity.BookIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface BookIssueRepository extends JpaRepository<BookIssue, Long> {
    List<BookIssue> findByUserIdOrderByIssueDateDesc(Long userId);
    List<BookIssue> findByBookId(Long bookId);
    
    @Query("SELECT bi FROM BookIssue bi WHERE " +
           "(:userId IS NULL OR bi.user.id = :userId) " +
           "ORDER BY bi.issueDate DESC, bi.createdAt DESC")
    List<BookIssue> searchIssues(@Param("userId") Long userId);

    long countByStatus(String status);
}
