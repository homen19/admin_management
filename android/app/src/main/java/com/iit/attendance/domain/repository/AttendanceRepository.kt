package com.iit.attendance.domain.repository

import com.iit.attendance.domain.model.AttendanceRecord

interface AttendanceRepository {
    suspend fun punchAttendance(latitude: Double, longitude: Double): Result<AttendanceRecord>
    suspend fun getAttendanceHistory(): Result<List<AttendanceRecord>>
}
