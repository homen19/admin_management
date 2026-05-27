package com.iit.admin.repository;

import com.iit.admin.entity.HostelRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HostelRequestRepository extends JpaRepository<HostelRequest, Long> {
    Page<HostelRequest> findByStudentUserUsername(String username, Pageable pageable);
    List<HostelRequest> findByStudentUserUsernameAndStatus(String username, String status);
    Page<HostelRequest> findByStatus(String status, Pageable pageable);
}
