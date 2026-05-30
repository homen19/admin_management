package com.iit.attendance.di

import com.iit.attendance.data.repository.AttendanceRepositoryImpl
import com.iit.attendance.data.repository.AuthRepositoryImpl
import com.iit.attendance.domain.repository.AttendanceRepository
import com.iit.attendance.domain.repository.AuthRepository
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
    abstract fun bindAttendanceRepository(
        attendanceRepositoryImpl: AttendanceRepositoryImpl
    ): AttendanceRepository
}
