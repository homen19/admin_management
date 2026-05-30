package com.iit.attendance.domain.usecase

import com.iit.attendance.domain.model.AttendanceRecord
import com.iit.attendance.domain.repository.AttendanceRepository
import javax.inject.Inject

class GetAttendanceHistoryUseCase @Inject constructor(
    private val attendanceRepository: AttendanceRepository
) {
    suspend operator fun invoke(): Result<List<AttendanceRecord>> {
        return attendanceRepository.getAttendanceHistory()
    }
}
