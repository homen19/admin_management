package com.iit.admin.repository;

import com.iit.admin.entity.Librarian;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LibrarianRepository extends JpaRepository<Librarian, Long> {
    Optional<Librarian> findByUserUsername(String username);
    Optional<Librarian> findByEmployeeId(String employeeId);
}
