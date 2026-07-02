package com.iit.admin.repository;

import com.iit.admin.entity.VehicleTrip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleTripRepository extends JpaRepository<VehicleTrip, Long> {
    List<VehicleTrip> findByStatus(String status);
}
