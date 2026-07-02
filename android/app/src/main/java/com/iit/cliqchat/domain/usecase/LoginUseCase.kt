package com.iit.cliqchat.domain.usecase

import com.iit.cliqchat.domain.model.User
import com.iit.cliqchat.domain.repository.AuthRepository
import javax.inject.Inject

class LoginUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(username: String, password: String): Result<User> {
        return authRepository.login(username, password)
    }
}
