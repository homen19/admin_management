package com.iit.admin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "hostel_allotments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HostelAllotment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private HostelRoom room;

    @Column(name = "allotment_date", nullable = false)
    private LocalDate allotmentDate = LocalDate.now();

    @Column(name = "vacate_date")
    private LocalDate vacateDate;

    @Column(nullable = false, length = 50)
    private String status = "ACTIVE"; // ACTIVE, VACATED

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
