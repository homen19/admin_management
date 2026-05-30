package com.iit.attendance.domain.usecase;

import com.iit.attendance.domain.repository.AttendanceRepository;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata
@QualifierMetadata
@DaggerGenerated
@Generated(
    value = "dagger.internal.codegen.ComponentProcessor",
    comments = "https://dagger.dev"
)
@SuppressWarnings({
    "unchecked",
    "rawtypes",
    "KotlinInternal",
    "KotlinInternalInJava"
})
public final class PunchAttendanceUseCase_Factory implements Factory<PunchAttendanceUseCase> {
  private final Provider<AttendanceRepository> attendanceRepositoryProvider;

  public PunchAttendanceUseCase_Factory(
      Provider<AttendanceRepository> attendanceRepositoryProvider) {
    this.attendanceRepositoryProvider = attendanceRepositoryProvider;
  }

  @Override
  public PunchAttendanceUseCase get() {
    return newInstance(attendanceRepositoryProvider.get());
  }

  public static PunchAttendanceUseCase_Factory create(
      Provider<AttendanceRepository> attendanceRepositoryProvider) {
    return new PunchAttendanceUseCase_Factory(attendanceRepositoryProvider);
  }

  public static PunchAttendanceUseCase newInstance(AttendanceRepository attendanceRepository) {
    return new PunchAttendanceUseCase(attendanceRepository);
  }
}
