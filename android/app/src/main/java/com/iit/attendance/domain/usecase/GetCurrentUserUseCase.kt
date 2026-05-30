package com.iit.attendance.domain.usecase

import com.iit.attendance.domain.model.User
import com.iit.attendance.domain.repository.AuthRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetCurrentUserUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    operator fun invoke(): Flow<User?> {
        return authRepository.getCurrentUser()
    }
}
