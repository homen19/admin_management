package com.iit.admin.repository;

import com.iit.admin.entity.Hostel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HostelRepository extends JpaRepository<Hostel, Long> {
    Optional<Hostel> findByName(String name);
}
