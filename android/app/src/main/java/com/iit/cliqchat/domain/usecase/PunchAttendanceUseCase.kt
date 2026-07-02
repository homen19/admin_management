package com.iit.cliqchat.domain.usecase

import com.iit.cliqchat.domain.model.AttendanceRecord
import com.iit.cliqchat.domain.repository.AttendanceRepository
import javax.inject.Inject

class PunchAttendanceUseCase @Inject constructor(
    private val attendanceRepository: AttendanceRepository
) {
    suspend operator fun invoke(latitude: Double, longitude: Double): Result<AttendanceRecord> {
        return attendanceRepository.punchAttendance(latitude, longitude)
    }
}
