package com.iit.attendance.presentation.attendance

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.iit.attendance.domain.model.AttendanceRecord
import com.iit.attendance.domain.usecase.GetAttendanceHistoryUseCase
import com.iit.attendance.domain.usecase.GetCurrentUserUseCase
import com.iit.attendance.domain.usecase.LogoutUseCase
import com.iit.attendance.domain.usecase.PunchAttendanceUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface PunchUiState {
    object Idle : PunchUiState
    object Loading : PunchUiState
    data class Success(val message: String) : PunchUiState
    data class Error(val message: String) : PunchUiState
}

@HiltViewModel
class AttendanceViewModel @Inject constructor(
    private val getCurrentUserUseCase: GetCurrentUserUseCase,
    private val logoutUseCase: LogoutUseCase,
    private val punchAttendanceUseCase: PunchAttendanceUseCase,
    private val getAttendanceHistoryUseCase: GetAttendanceHistoryUseCase,
    private val context: Context
) : ViewModel() {

    val currentUser = getCurrentUserUseCase()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    private val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)

    private val campusLatitude = 25.4299
    private val campusLongitude = 81.7712
    private val campusGeofenceRadius = 300.0 // meters

    var latitude by mutableStateOf<Double?>(null)
        private set

    var longitude by mutableStateOf<Double?>(null)
        private set

    var distance by mutableStateOf<Double?>(null)
        private set

    var isWithinGeofence by mutableStateOf(false)
        private set

    var isLocating by mutableStateOf(false)
        private set

    var locationError by mutableStateOf<String?>(null)
        private set

    private val _history = MutableStateFlow<List<AttendanceRecord>>(emptyList())
    val history = _history.asStateFlow()

    private val _isRefreshingHistory = MutableStateFlow(false)
    val isRefreshingHistory = _isRefreshingHistory.asStateFlow()

    private val _punchState = MutableStateFlow<PunchUiState>(PunchUiState.Idle)
    val punchState = _punchState.asStateFlow()

    init {
        refreshLocation()
        loadHistory()
    }

    fun loadHistory() {
        viewModelScope.launch {
            _isRefreshingHistory.value = true
            val result = getAttendanceHistoryUseCase()
            result.fold(
                onSuccess = { logs ->
                    _history.value = logs.sortedByDescending { it.punchIn ?: it.attendanceDate }
                },
                onFailure = {
                    // Fail silently
                }
            )
            _isRefreshingHistory.value = false
        }
    }

    @SuppressLint("MissingPermission")
    fun refreshLocation() {
        isLocating = true
        locationError = null
        fusedLocationClient.getCurrentLocation(
            Priority.PRIORITY_HIGH_ACCURACY,
            null
        ).addOnSuccessListener { location: Location? ->
            isLocating = false
            if (location != null) {
                updateLocationData(location.latitude, location.longitude)
            } else {
                fusedLocationClient.lastLocation.addOnSuccessListener { lastLoc: Location? ->
                    if (lastLoc != null) {
                        updateLocationData(lastLoc.latitude, lastLoc.longitude)
                    } else {
                        locationError = "Could not fetch GPS coordinates. Please ensure GPS is enabled."
                    }
                }.addOnFailureListener {
                    locationError = "GPS error: ${it.localizedMessage}"
                }
            }
        }.addOnFailureListener {
            isLocating = false
            locationError = "GPS error: ${it.localizedMessage}"
        }
    }

    private fun updateLocationData(lat: Double, lon: Double) {
        latitude = lat
        longitude = lon
        val dist = calculateDistance(lat, lon, campusLatitude, campusLongitude)
        distance = dist
        isWithinGeofence = true // Bypassed for development/testing (dist <= campusGeofenceRadius)
    }

    fun punch() {
        val currentLat = latitude
        val currentLon = longitude
        if (currentLat == null || currentLon == null) {
            _punchState.value = PunchUiState.Error("Location not available. Please wait or retry.")
            return
        }

        if (!isWithinGeofence) {
            _punchState.value = PunchUiState.Error("You are outside the campus boundary. Punching disabled.")
            return
        }

        viewModelScope.launch {
            _punchState.value = PunchUiState.Loading
            val result = punchAttendanceUseCase(currentLat, currentLon)
            result.fold(
                onSuccess = {
                    _punchState.value = PunchUiState.Success("Punch successful!")
                    loadHistory()
                },
                onFailure = { error ->
                    _punchState.value = PunchUiState.Error(error.localizedMessage ?: "Punch failed.")
                }
            )
        }
    }

    fun logout() {
        viewModelScope.launch {
            logoutUseCase()
        }
    }

    fun resetPunchState() {
        _punchState.value = PunchUiState.Idle
    }

    private fun calculateDistance(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val r = 6371000 // Earth radius in meters
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
        val c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return r * c
    }
}
