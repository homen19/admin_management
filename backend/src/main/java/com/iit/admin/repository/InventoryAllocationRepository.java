package com.iit.admin.repository;

import com.iit.admin.entity.InventoryAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryAllocationRepository extends JpaRepository<InventoryAllocation, Long> {

    @Query("SELECT a FROM InventoryAllocation a WHERE a.allocatedTo.id = :userId")
    List<InventoryAllocation> findByUserId(Long userId);

    @Query("SELECT a FROM InventoryAllocation a WHERE a.status = :status")
    List<InventoryAllocation> findByStatus(String status);
    
    @Query("SELECT a FROM InventoryAllocation a WHERE LOWER(a.item.itemName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.allocatedTo.username) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<InventoryAllocation> searchAllocations(String query);
}
