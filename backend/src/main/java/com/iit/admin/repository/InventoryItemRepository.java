package com.iit.admin.repository;

import com.iit.admin.entity.InventoryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findBySku(String sku);

    @Query("SELECT i FROM InventoryItem i WHERE LOWER(i.itemName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(i.sku) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(i.category) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<InventoryItem> searchItems(String query, Pageable pageable);

    long countByAvailableQuantityLessThan(int threshold);
}
