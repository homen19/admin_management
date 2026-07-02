package com.iit.admin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_allocations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id", nullable = false)
    private InventoryItem item;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "allocated_to_id", nullable = false)
    private User allocatedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocated_by_id", nullable = false)
    private User allocatedBy;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(nullable = false)
    private LocalDate allocationDate;

    private LocalDate expectedReturnDate;
    private LocalDate actualReturnDate;

    @Column(nullable = false, length = 20)
    private String status = "ALLOCATED"; // ALLOCATED, RETURNED, DAMAGED

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
