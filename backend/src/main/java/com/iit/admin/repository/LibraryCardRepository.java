package com.iit.admin.repository;

import com.iit.admin.entity.LibraryCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LibraryCardRepository extends JpaRepository<LibraryCard, Long> {
    Optional<LibraryCard> findByUserIdAndStatus(Long userId, String status);
    
    @Query("SELECT lc FROM LibraryCard lc WHERE LOWER(lc.cardNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(lc.user.username) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<LibraryCard> searchCards(String query);
}
