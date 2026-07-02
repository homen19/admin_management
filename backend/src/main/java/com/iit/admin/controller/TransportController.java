package com.iit.admin.controller;

import com.iit.admin.entity.TransportRoute;
import com.iit.admin.entity.Vehicle;
import com.iit.admin.entity.VehicleTrip;
import com.iit.admin.service.TransportService;
import com.iit.admin.repository.UserRepository;
import com.iit.admin.entity.User;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transport")
@RequiredArgsConstructor
public class TransportController {

    private final TransportService transportService;
    private final UserRepository userRepository;

    @GetMapping("/drivers")
    public ResponseEntity<List<User>> getDrivers() {
        // Find users by role "ROLE_DRIVER"
        List<User> drivers = userRepository.findAll().stream()
                .filter(u -> "ROLE_DRIVER".equals(u.getRole().getName()))
                .toList();
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/vehicles")
    public ResponseEntity<List<Vehicle>> getVehicles() {
        return ResponseEntity.ok(transportService.getAllVehicles());
    }

    @PostMapping("/vehicles")
    public ResponseEntity<Vehicle> createVehicle(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(transportService.createVehicle(vehicle));
    }

    @GetMapping("/routes")
    public ResponseEntity<List<TransportRoute>> getRoutes() {
        return ResponseEntity.ok(transportService.getAllRoutes());
    }

    @PostMapping("/routes")
    public ResponseEntity<TransportRoute> createRoute(@RequestBody TransportRoute route) {
        return ResponseEntity.ok(transportService.createRoute(route));
    }

    @GetMapping("/trips/active")
    public ResponseEntity<List<VehicleTrip>> getActiveTrips() {
        return ResponseEntity.ok(transportService.getActiveTrips());
    }

    @PostMapping("/trips/start")
    public ResponseEntity<VehicleTrip> startTrip(@RequestBody TripStartRequest req) {
        return ResponseEntity.ok(transportService.startTrip(req.getVehicleId(), req.getRouteId(), req.getDriverId()));
    }
    
    @PostMapping("/trips/{tripId}/complete")
    public ResponseEntity<VehicleTrip> completeTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(transportService.completeTrip(tripId));
    }

    @Data
    public static class TripStartRequest {
        private Long vehicleId;
        private Long routeId;
        private Long driverId;
    }
}
