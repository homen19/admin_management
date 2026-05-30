package com.iit.admin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "punch_in")
    private LocalDateTime punchIn;

    @Column(name = "punch_out")
    private LocalDateTime punchOut;

    @Column(nullable = false)
    private String status = "PRESENT"; // PRESENT, LATE, HALF_DAY, ABSENT

    @Column(nullable = false)
    private String source; // BIOMETRIC, MOBILE

    private Double latitude;
    private Double longitude;

    @Column(name = "card_uid")
    private String cardUid;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
