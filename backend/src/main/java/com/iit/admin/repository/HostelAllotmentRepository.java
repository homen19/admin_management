package com.iit.admin.repository;

import com.iit.admin.entity.HostelAllotment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HostelAllotmentRepository extends JpaRepository<HostelAllotment, Long> {
    Optional<HostelAllotment> findByStudentIdAndStatus(Long studentId, String status);
    Optional<HostelAllotment> findByStudentUserUsernameAndStatus(String username, String status);
    Page<HostelAllotment> findByStatus(String status, Pageable pageable);
}
