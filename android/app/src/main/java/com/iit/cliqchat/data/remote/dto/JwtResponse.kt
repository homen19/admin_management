package com.iit.cliqchat.data.remote.dto

data class JwtResponse(
    val token: String,
    val id: Long,
    val username: String,
    val email: String,
    val role: String
)
