package com.iit.cliqchat.di

import com.iit.cliqchat.data.repository.AttendanceRepositoryImpl
import com.iit.cliqchat.data.repository.AuthRepositoryImpl
import com.iit.cliqchat.domain.repository.AttendanceRepository
import com.iit.cliqchat.domain.repository.AuthRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindAuthRepository(
        authRepositoryImpl: AuthRepositoryImpl
    ): AuthRepository

    @Binds
    @Singleton
    abstract fun bindChatRepository(
        chatRepositoryImpl: com.iit.cliqchat.data.repository.ChatRepositoryImpl
    ): com.iit.cliqchat.domain.repository.ChatRepository

    @Binds
    @Singleton
    abstract fun bindAttendanceRepository(
        attendanceRepositoryImpl: AttendanceRepositoryImpl
    ): AttendanceRepository
}
