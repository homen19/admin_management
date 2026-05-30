package com.iit.attendance.domain.usecase

import com.iit.attendance.domain.model.AttendanceRecord
import com.iit.attendance.domain.repository.AttendanceRepository
import javax.inject.Inject

class PunchAttendanceUseCase @Inject constructor(
    private val attendanceRepository: AttendanceRepository
) {
    suspend operator fun invoke(latitude: Double, longitude: Double): Result<AttendanceRecord> {
        return attendanceRepository.punchAttendance(latitude, longitude)
    }
}
