package com.iit.cliqchat.data.remote.dto

data class AttendanceDto(
    val id: Long?,
    val userId: Long,
    val username: String,
    val userEmail: String,
    val roleName: String,
    val name: String?,
    val attendanceDate: String,
    val punchIn: String?,
    val punchOut: String?,
    val status: String,
    val source: String,
    val latitude: Double?,
    val longitude: Double?,
    val cardUid: String?
)
