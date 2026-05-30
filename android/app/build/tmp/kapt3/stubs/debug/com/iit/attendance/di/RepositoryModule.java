package com.iit.attendance.di;

@dagger.Module()
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000$\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\b\'\u0018\u00002\u00020\u0001B\u0005\u00a2\u0006\u0002\u0010\u0002J\u0010\u0010\u0003\u001a\u00020\u00042\u0006\u0010\u0005\u001a\u00020\u0006H\'J\u0010\u0010\u0007\u001a\u00020\b2\u0006\u0010\t\u001a\u00020\nH\'\u00a8\u0006\u000b"}, d2 = {"Lcom/iit/attendance/di/RepositoryModule;", "", "()V", "bindAttendanceRepository", "Lcom/iit/attendance/domain/repository/AttendanceRepository;", "attendanceRepositoryImpl", "Lcom/iit/attendance/data/repository/AttendanceRepositoryImpl;", "bindAuthRepository", "Lcom/iit/attendance/domain/repository/AuthRepository;", "authRepositoryImpl", "Lcom/iit/attendance/data/repository/AuthRepositoryImpl;", "app_debug"})
@dagger.hilt.InstallIn(value = {dagger.hilt.components.SingletonComponent.class})
public abstract class RepositoryModule {
    
    public RepositoryModule() {
        super();
    }
    
    @dagger.Binds()
    @javax.inject.Singleton()
    @org.jetbrains.annotations.NotNull()
    public abstract com.iit.attendance.domain.repository.AuthRepository bindAuthRepository(@org.jetbrains.annotations.NotNull()
    com.iit.attendance.data.repository.AuthRepositoryImpl authRepositoryImpl);
    
    @dagger.Binds()
    @javax.inject.Singleton()
    @org.jetbrains.annotations.NotNull()
    public abstract com.iit.attendance.domain.repository.AttendanceRepository bindAttendanceRepository(@org.jetbrains.annotations.NotNull()
    com.iit.attendance.data.repository.AttendanceRepositoryImpl attendanceRepositoryImpl);
}