package com.iit.attendance.domain.model

data class User(
    val id: Long,
    val username: String,
    val email: String,
    val role: String,
    val token: String
)
