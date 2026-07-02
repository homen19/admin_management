import React, { useState, useEffect, useRef } from 'react';
import { Bus, Navigation, Plus, Play, CheckCircle2, UserPlus, Settings, Users } from 'lucide-react';
import { transportAPI, subscribeToLocations } from '../services/transportService';
import { connectWebSocket } from '../services/chatService';
import LiveMap from '../components/transport/LiveMap';

export default function TransportManagement() {
    const [activeTab, setActiveTab] = useState('live'); // 'live', 'fleet', 'staff'
    const [vehicles, setVehicles] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [trips, setTrips] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const stompClientRef = useRef(null);
    const subRef = useRef(null);

    // Form States
    const [newDriver, setNewDriver] = useState({ username: '', email: '', password: '' });
    const [newVehicle, setNewVehicle] = useState({ plateNumber: '', type: 'BUS', capacity: 40 });
    const [startTripData, setStartTripData] = useState({}); // { [vehicleId]: { routeId, driverId } }

    const loadData = async () => {
        try {
            const [vRes, rRes, tRes, dRes] = await Promise.all([
                transportAPI.getVehicles(),
                transportAPI.getRoutes(),
                transportAPI.getActiveTrips(),
                transportAPI.getDrivers()
            ]);
            setVehicles(vRes.data);
            setRoutes(rRes.data);
            setTrips(tRes.data);
            setDrivers(dRes.data);
        } catch (error) {
            console.error("Failed to load transport data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        connectWebSocket(null, (client) => {
            stompClientRef.current = client;
            subRef.current = subscribeToLocations(client, (update) => {
                setTrips(prev => prev.map(trip => 
                    trip.id === update.tripId 
                        ? { ...trip, currentLat: update.lat, currentLng: update.lng } 
                        : trip
                ));
            });
        }, () => {});

        return () => {
            if (subRef.current) subRef.current.unsubscribe();
        };
    }, []);

    const handleStartTrip = async (vehicleId) => {
        const data = startTripData[vehicleId];
        if (!data || !data.routeId || !data.driverId) {
            alert("Please select both a Route and a Driver");
            return;
        }
        try {
            await transportAPI.startTrip({ vehicleId, routeId: data.routeId, driverId: data.driverId });
            loadData();
        } catch (error) {
            console.error("Error starting trip", error);
            alert("Failed to start trip. Ensure the driver exists.");
        }
    };

    const handleCompleteTrip = async (tripId) => {
        try {
            await transportAPI.completeTrip(tripId);
            loadData();
        } catch (error) {
            console.error("Error completing trip", error);
        }
    };

    const handleRegisterDriver = async (e) => {
        e.preventDefault();
        try {
            await transportAPI.registerDriver(newDriver);
            alert("Driver registered successfully!");
            setNewDriver({ username: '', email: '', password: '' });
            loadData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to register driver");
        }
    };

    const handleRegisterVehicle = async (e) => {
        e.preventDefault();
        try {
            await transportAPI.createVehicle({ ...newVehicle, status: 'ACTIVE' });
            alert("Vehicle registered successfully!");
            setNewVehicle({ plateNumber: '', type: 'BUS', capacity: 40 });
            loadData();
        } catch (error) {
            alert("Failed to register vehicle");
        }
    };

    if (loading) return <div className="p-8 text-slate-500">Loading transport data...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden gap-6 animate-fade-in">
            {/* Header & Tabs */}
            <div className="flex justify-between items-end shrink-0 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Transport & Fleet Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage vehicles, assign drivers, and monitor routes live.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('live')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'live' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Navigation size={18} /> Live Map
                    </button>
                    <button 
                        onClick={() => setActiveTab('fleet')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'fleet' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Bus size={18} /> Fleet Info
                    </button>
                    <button 
                        onClick={() => setActiveTab('staff')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'staff' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Users size={18} /> Transport Staff
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 gap-6 min-h-0">
                {activeTab === 'live' && (
                    <>
                        {/* Left Panel: Active Trips & Controls */}
                        <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                            
                            {/* Active Trips Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                                <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                                    <Navigation size={16} className="text-emerald-500" />
                                    Live Trips ({trips.length})
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {trips.length === 0 && <p className="text-sm text-slate-500 italic">No trips currently active.</p>}
                                    {trips.map(trip => (
                                        <div key={trip.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 relative group overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                            <div className="flex justify-between items-start pl-2">
                                                <div>
                                                    <div className="font-semibold text-slate-800 text-sm">{trip.vehicle.plateNumber}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{trip.route.name}</div>
                                                    <div className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded inline-block mt-1">Driver: {trip.driver?.username || 'Unknown'}</div>
                                                </div>
                                                <button 
                                                    onClick={() => handleCompleteTrip(trip.id)}
                                                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                                    title="End Trip"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            </div>
                                            <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-600 font-medium pl-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                {trip.currentLat ? 'GPS Broadcasting' : 'Waiting for GPS signal...'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Available Vehicles to Start Trip */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                                <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                                    <Bus size={16} className="text-primary-600" />
                                    Start New Trip
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {vehicles.filter(v => !trips.some(t => t.vehicle.id === v.id)).map(v => (
                                        <div key={v.id} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-slate-800 text-sm">{v.plateNumber}</span>
                                                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{v.type}</span>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <select 
                                                    onChange={e => setStartTripData(prev => ({...prev, [v.id]: {...prev[v.id], routeId: e.target.value}}))}
                                                    className="text-[11px] p-1.5 border border-slate-200 rounded outline-none w-full"
                                                >
                                                    <option value="">Select Route</option>
                                                    {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                </select>
                                                <div className="flex gap-1.5">
                                                    <select 
                                                        onChange={e => setStartTripData(prev => ({...prev, [v.id]: {...prev[v.id], driverId: e.target.value}}))}
                                                        className="flex-1 text-[11px] p-1.5 border border-slate-200 rounded outline-none"
                                                    >
                                                        <option value="">Assign Driver</option>
                                                        {drivers.map(d => <option key={d.id} value={d.id}>{d.username}</option>)}
                                                    </select>
                                                    <button 
                                                        onClick={() => handleStartTrip(v.id)}
                                                        className="bg-primary-600 hover:bg-primary-700 text-white p-1.5 rounded transition-colors flex items-center justify-center shrink-0 w-8"
                                                        title="Start Trip"
                                                    >
                                                        <Play size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Panel: Map */}
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                            <LiveMap trips={trips} />
                        </div>
                    </>
                )}

                {activeTab === 'fleet' && (
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Bus className="text-primary-600" /> Register New Vehicle
                            </h2>
                            <form onSubmit={handleRegisterVehicle} className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Plate Number</label>
                                        <input required type="text" placeholder="e.g. MH-01-AB-1234" value={newVehicle.plateNumber} onChange={e => setNewVehicle({...newVehicle, plateNumber: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
                                        <select value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg">
                                            <option value="BUS">Campus Bus</option>
                                            <option value="SHUTTLE">Mini Shuttle</option>
                                            <option value="VAN">Staff Van</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Seating Capacity</label>
                                    <input required type="number" min="1" max="100" value={newVehicle.capacity} onChange={e => setNewVehicle({...newVehicle, capacity: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
                                </div>
                                <div className="flex justify-end mt-2">
                                    <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">
                                        Register Vehicle
                                    </button>
                                </div>
                            </form>

                            <h2 className="text-lg font-bold text-slate-800 mb-4 mt-10">Registered Fleet</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {vehicles.map(v => (
                                    <div key={v.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:shadow-sm transition-shadow">
                                        <div className="bg-primary-50 p-3 rounded-lg text-primary-600"><Bus size={24} /></div>
                                        <div>
                                            <div className="font-bold text-slate-800">{v.plateNumber}</div>
                                            <div className="text-sm text-slate-500">{v.type} • Capacity: {v.capacity}</div>
                                        </div>
                                        <div className="ml-auto text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded">ACTIVE</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'staff' && (
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <UserPlus className="text-primary-600" /> Add Driver Account
                            </h2>
                            <form onSubmit={handleRegisterDriver} className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Username (Driver ID)</label>
                                        <input required type="text" placeholder="e.g. driver_john" value={newDriver.username} onChange={e => setNewDriver({...newDriver, username: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                        <input required type="password" placeholder="••••••••" value={newDriver.password} onChange={e => setNewDriver({...newDriver, password: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <input required type="email" placeholder="driver@iit.edu" value={newDriver.email} onChange={e => setNewDriver({...newDriver, email: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
                                </div>
                                <div className="flex justify-end mt-2">
                                    <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">
                                        Create Driver Account
                                    </button>
                                </div>
                            </form>

                            <h2 className="text-lg font-bold text-slate-800 mb-4 mt-10">Registered Drivers</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {drivers.map(d => (
                                    <div key={d.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:shadow-sm transition-shadow">
                                        <div className="bg-amber-50 p-3 rounded-lg text-amber-600"><Settings size={24} /></div>
                                        <div>
                                            <div className="font-bold text-slate-800">{d.username}</div>
                                            <div className="text-sm text-slate-500">{d.email}</div>
                                        </div>
                                        <div className="ml-auto text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded">ROLE_DRIVER</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
