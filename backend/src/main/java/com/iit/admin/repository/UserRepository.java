package com.iit.admin.repository;

import com.iit.admin.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE " +
           "(:query IS NULL OR :query = '' OR u.username LIKE %:query% OR u.email LIKE %:query% OR u.role.name LIKE %:query%)")
    Page<User> searchUsers(@Param("query") String query, Pageable pageable);
}

