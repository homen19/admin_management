package com.iit.cliqchat.domain.usecase

import com.iit.cliqchat.domain.model.AttendanceRecord
import com.iit.cliqchat.domain.repository.AttendanceRepository
import javax.inject.Inject

class GetAttendanceHistoryUseCase @Inject constructor(
    private val attendanceRepository: AttendanceRepository
) {
    suspend operator fun invoke(): Result<List<AttendanceRecord>> {
        return attendanceRepository.getAttendanceHistory()
    }
}
