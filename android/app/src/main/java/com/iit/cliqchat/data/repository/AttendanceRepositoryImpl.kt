package com.iit.cliqchat.data.repository

import com.iit.cliqchat.data.remote.AttendanceApi
import com.iit.cliqchat.data.remote.dto.AttendanceDto
import com.iit.cliqchat.data.remote.dto.MobilePunchRequest
import com.iit.cliqchat.domain.model.AttendanceRecord
import com.iit.cliqchat.domain.repository.AttendanceRepository
import javax.inject.Inject

class AttendanceRepositoryImpl @Inject constructor(
    private val api: AttendanceApi
) : AttendanceRepository {

    override suspend fun punchAttendance(latitude: Double, longitude: Double): Result<AttendanceRecord> {
        return try {
            val dto = api.punchMobile(MobilePunchRequest(latitude, longitude))
            Result.success(dto.toDomain())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getAttendanceHistory(): Result<List<AttendanceRecord>> {
        return try {
            val list = api.getMyHistory()
            Result.success(list.map { it.toDomain() })
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun AttendanceDto.toDomain(): AttendanceRecord {
        return AttendanceRecord(
            id = id,
            userId = userId,
            username = username,
            userEmail = userEmail,
            roleName = roleName,
            name = name,
            attendanceDate = attendanceDate,
            punchIn = punchIn,
            punchOut = punchOut,
            status = status,
            source = source,
            latitude = latitude,
            longitude = longitude,
            cardUid = cardUid
        )
    }
}
