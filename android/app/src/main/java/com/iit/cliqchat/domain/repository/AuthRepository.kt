package com.iit.cliqchat.domain.repository

import com.iit.cliqchat.domain.model.User
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    suspend fun login(username: String, password: String): Result<User>
    fun getCurrentUser(): Flow<User?>
    suspend fun logout(): Result<Unit>
    suspend fun getCachedToken(): String?
}
