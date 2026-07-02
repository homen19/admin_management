import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom bus icon
const busIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // A free bus icon url
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
});

// Component to dynamically center map
const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom(), { animate: true });
        }
    }, [center, map]);
    return null;
};

export default function LiveMap({ trips }) {
    // Default center: roughly IIT Bombay / general India if no trips
    const defaultCenter = [19.1334, 72.9133];
    const center = trips.length > 0 && trips[0].currentLat 
        ? [trips[0].currentLat, trips[0].currentLng] 
        : defaultCenter;

    return (
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%', borderRadius: '12px', zIndex: 1 }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* <MapUpdater center={center} /> Optional: auto follow first bus */}
            
            {trips.map(trip => (
                trip.currentLat && trip.currentLng && (
                    <Marker 
                        key={trip.id} 
                        position={[trip.currentLat, trip.currentLng]} 
                        icon={busIcon}
                    >
                        <Popup>
                            <div className="text-sm font-semibold">Vehicle: {trip.vehicle.plateNumber}</div>
                            <div className="text-xs text-slate-500">Route: {trip.route.name}</div>
                            <div className="text-xs text-slate-500">Driver: {trip.driverName}</div>
                            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Live Tracking
                            </div>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    );
}
