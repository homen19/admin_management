package com.iit.admin.repository;

import com.iit.admin.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SchoolRepository extends JpaRepository<School, Long> {
    Optional<School> findByCode(String code);
    Optional<School> findByName(String name);
}
