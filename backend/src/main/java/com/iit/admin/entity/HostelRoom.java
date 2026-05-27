package com.iit.admin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "hostel_rooms", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"hostel_id", "room_number"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HostelRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hostel_id", nullable = false)
    private Hostel hostel;

    @Column(name = "room_number", nullable = false, length = 20)
    private String roomNumber;

    @Column(name = "sharing_type", nullable = false, length = 50)
    private String sharingType; // SINGLE, DOUBLE, TRIPLE

    @Column(nullable = false)
    private Integer capacity; // 1, 2, 3

    @Column(nullable = false)
    private Double rent;

    @Column(name = "occupied_count")
    private Integer occupiedCount = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
