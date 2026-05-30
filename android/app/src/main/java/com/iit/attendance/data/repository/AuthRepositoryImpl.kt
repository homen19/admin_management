package com.iit.attendance.data.repository

import android.content.Context
import com.iit.attendance.data.remote.AttendanceApi
import com.iit.attendance.data.remote.dto.LoginRequest
import com.iit.attendance.domain.model.User
import com.iit.attendance.domain.repository.AuthRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val api: AttendanceApi,
    private val context: Context
) : AuthRepository {

    private val prefs = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
    private val _currentUser = MutableStateFlow<User?>(null)

    init {
        val token = prefs.getString("token", null)
        val id = prefs.getLong("id", -1L)
        val username = prefs.getString("username", null)
        val email = prefs.getString("email", null)
        val role = prefs.getString("role", null)

        if (token != null && id != -1L && username != null && email != null && role != null) {
            _currentUser.value = User(id, username, email, role, token)
        }
    }

    override suspend fun login(username: String, password: String): Result<User> {
        return try {
            val response = api.login(LoginRequest(username, password))
            val user = User(
                id = response.id,
                username = response.username,
                email = response.email,
                role = response.role,
                token = response.token
            )
            prefs.edit().apply {
                putString("token", user.token)
                putLong("id", user.id)
                putString("username", user.username)
                putString("email", user.email)
                putString("role", user.role)
                apply()
            }
            _currentUser.value = user
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun getCurrentUser(): Flow<User?> {
        return _currentUser.asStateFlow()
    }

    override suspend fun logout(): Result<Unit> {
        prefs.edit().clear().apply()
        _currentUser.value = null
        return Result.success(Unit)
    }

    override suspend fun getCachedToken(): String? {
        return prefs.getString("token", null)
    }
}
