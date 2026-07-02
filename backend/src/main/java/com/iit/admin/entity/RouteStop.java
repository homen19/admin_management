package com.iit.admin.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "route_stops")
@Data
public class RouteStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    @JsonIgnore // Prevent infinite recursion
    private TransportRoute route;

    @Column(nullable = false)
    private String stopName;

    @Column(nullable = false)
    private Integer stopOrder; // Sequence 1, 2, 3...

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;
}
