package com.iit.admin.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "vehicles")
@Data
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String plateNumber;

    @Column(nullable = false)
    private String type; // BUS, SHUTTLE, VAN

    private Integer capacity;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, MAINTENANCE, INACTIVE
}
