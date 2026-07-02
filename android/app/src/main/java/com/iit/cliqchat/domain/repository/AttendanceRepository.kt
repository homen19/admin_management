package com.iit.cliqchat.domain.repository

import com.iit.cliqchat.domain.model.AttendanceRecord

interface AttendanceRepository {
    suspend fun punchAttendance(latitude: Double, longitude: Double): Result<AttendanceRecord>
    suspend fun getAttendanceHistory(): Result<List<AttendanceRecord>>
}
