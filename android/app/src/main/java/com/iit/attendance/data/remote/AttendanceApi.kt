package com.iit.attendance.data.remote

import com.iit.attendance.data.remote.dto.AttendanceDto
import com.iit.attendance.data.remote.dto.JwtResponse
import com.iit.attendance.data.remote.dto.LoginRequest
import com.iit.attendance.data.remote.dto.MobilePunchRequest
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface AttendanceApi {
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): JwtResponse

    @POST("api/attendance/mobile")
    suspend fun punchMobile(@Body request: MobilePunchRequest): AttendanceDto

    @GET("api/attendance/my-history")
    suspend fun getMyHistory(): List<AttendanceDto>
}
