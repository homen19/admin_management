package com.iit.admin.service;

import com.iit.admin.entity.RouteStop;
import com.iit.admin.entity.TransportRoute;
import com.iit.admin.entity.Vehicle;
import com.iit.admin.entity.VehicleTrip;
import com.iit.admin.repository.RouteStopRepository;
import com.iit.admin.repository.TransportRouteRepository;
import com.iit.admin.repository.UserRepository;
import com.iit.admin.repository.VehicleRepository;
import com.iit.admin.repository.VehicleTripRepository;
import com.iit.admin.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransportService {

    private final VehicleRepository vehicleRepository;
    private final TransportRouteRepository routeRepository;
    private final VehicleTripRepository tripRepository;
    private final UserRepository userRepository;

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public List<TransportRoute> getAllRoutes() {
        return routeRepository.findAll();
    }

    @Transactional
    public TransportRoute createRoute(TransportRoute route) {
        if (route.getStops() != null) {
            for (RouteStop stop : route.getStops()) {
                stop.setRoute(route);
            }
        }
        return routeRepository.save(route);
    }

    public List<VehicleTrip> getActiveTrips() {
        return tripRepository.findByStatus("IN_PROGRESS");
    }

    @Transactional
    public VehicleTrip startTrip(Long vehicleId, Long routeId, Long driverId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        TransportRoute route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Route not found"));
        
        User driver = null;
        if (driverId != null) {
            driver = userRepository.findById(driverId)
                    .orElseThrow(() -> new RuntimeException("Driver not found"));
        }

        VehicleTrip trip = new VehicleTrip();
        trip.setVehicle(vehicle);
        trip.setRoute(route);
        trip.setDriver(driver);
        trip.setStatus("IN_PROGRESS");
        trip.setStartTime(LocalDateTime.now());
        
        // Initialize at start location if stops exist
        if (!route.getStops().isEmpty()) {
            RouteStop firstStop = route.getStops().get(0);
            trip.setCurrentLat(firstStop.getLatitude());
            trip.setCurrentLng(firstStop.getLongitude());
        }

        return tripRepository.save(trip);
    }

    @Transactional
    public void updateTripLocation(Long tripId, Double lat, Double lng) {
        VehicleTrip trip = tripRepository.findById(tripId).orElse(null);
        if (trip != null && "IN_PROGRESS".equals(trip.getStatus())) {
            trip.setCurrentLat(lat);
            trip.setCurrentLng(lng);
            trip.setLastUpdatedAt(LocalDateTime.now());
            tripRepository.save(trip);
        }
    }
    
    @Transactional
    public VehicleTrip completeTrip(Long tripId) {
        VehicleTrip trip = tripRepository.findById(tripId).orElseThrow();
        trip.setStatus("COMPLETED");
        trip.setEndTime(LocalDateTime.now());
        return tripRepository.save(trip);
    }
}
