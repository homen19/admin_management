package com.iit.cliqchat.domain.usecase;

import com.iit.cliqchat.domain.repository.AttendanceRepository;
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
public final class GetAttendanceHistoryUseCase_Factory implements Factory<GetAttendanceHistoryUseCase> {
  private final Provider<AttendanceRepository> attendanceRepositoryProvider;

  public GetAttendanceHistoryUseCase_Factory(
      Provider<AttendanceRepository> attendanceRepositoryProvider) {
    this.attendanceRepositoryProvider = attendanceRepositoryProvider;
  }

  @Override
  public GetAttendanceHistoryUseCase get() {
    return newInstance(attendanceRepositoryProvider.get());
  }

  public static GetAttendanceHistoryUseCase_Factory create(
      Provider<AttendanceRepository> attendanceRepositoryProvider) {
    return new GetAttendanceHistoryUseCase_Factory(attendanceRepositoryProvider);
  }

  public static GetAttendanceHistoryUseCase newInstance(AttendanceRepository attendanceRepository) {
    return new GetAttendanceHistoryUseCase(attendanceRepository);
  }
}
