package com.iit.admin.service;

import com.iit.admin.entity.RouteStop;
import com.iit.admin.entity.VehicleTrip;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TransportSimulationService {

    private final TransportService transportService;
    private final SimpMessagingTemplate messagingTemplate;
    private final Random random = new Random();

    // Runs every 3 seconds to simulate bus movement
    @Scheduled(fixedRate = 3000)
    @Transactional
    public void simulateVehicleMovement() {
        List<VehicleTrip> activeTrips = transportService.getActiveTrips();
        if (activeTrips.isEmpty()) return;

        for (VehicleTrip trip : activeTrips) {
            List<RouteStop> stops = trip.getRoute().getStops();
            if (stops.isEmpty()) continue;

            // Simple simulation: move slightly towards a random direction or next stop
            // In a real app, this would be actual GPS data from a tracking device.
            // For demo, we just add a small random offset to lat/lng.
            Double lat = trip.getCurrentLat();
            Double lng = trip.getCurrentLng();

            if (lat != null && lng != null) {
                // Move by approx 10-50 meters
                double latOffset = (random.nextDouble() - 0.5) * 0.0005;
                double lngOffset = (random.nextDouble() - 0.5) * 0.0005;

                lat += latOffset;
                lng += lngOffset;

                transportService.updateTripLocation(trip.getId(), lat, lng);
                
                // Broadcast to websocket clients
                LocationUpdate payload = new LocationUpdate(trip.getId(), trip.getVehicle().getPlateNumber(), lat, lng);
                messagingTemplate.convertAndSend("/topic/transport/locations", payload);
            }
        }
    }

    public static class LocationUpdate {
        public Long tripId;
        public String plateNumber;
        public Double lat;
        public Double lng;

        public LocationUpdate(Long tripId, String plateNumber, Double lat, Double lng) {
            this.tripId = tripId;
            this.plateNumber = plateNumber;
            this.lat = lat;
            this.lng = lng;
        }
    }
}
