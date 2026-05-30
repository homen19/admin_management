package com.iit.attendance.presentation.attendance;

import android.content.Context;
import com.iit.attendance.domain.usecase.GetAttendanceHistoryUseCase;
import com.iit.attendance.domain.usecase.GetCurrentUserUseCase;
import com.iit.attendance.domain.usecase.LogoutUseCase;
import com.iit.attendance.domain.usecase.PunchAttendanceUseCase;
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
public final class AttendanceViewModel_Factory implements Factory<AttendanceViewModel> {
  private final Provider<GetCurrentUserUseCase> getCurrentUserUseCaseProvider;

  private final Provider<LogoutUseCase> logoutUseCaseProvider;

  private final Provider<PunchAttendanceUseCase> punchAttendanceUseCaseProvider;

  private final Provider<GetAttendanceHistoryUseCase> getAttendanceHistoryUseCaseProvider;

  private final Provider<Context> contextProvider;

  public AttendanceViewModel_Factory(Provider<GetCurrentUserUseCase> getCurrentUserUseCaseProvider,
      Provider<LogoutUseCase> logoutUseCaseProvider,
      Provider<PunchAttendanceUseCase> punchAttendanceUseCaseProvider,
      Provider<GetAttendanceHistoryUseCase> getAttendanceHistoryUseCaseProvider,
      Provider<Context> contextProvider) {
    this.getCurrentUserUseCaseProvider = getCurrentUserUseCaseProvider;
    this.logoutUseCaseProvider = logoutUseCaseProvider;
    this.punchAttendanceUseCaseProvider = punchAttendanceUseCaseProvider;
    this.getAttendanceHistoryUseCaseProvider = getAttendanceHistoryUseCaseProvider;
    this.contextProvider = contextProvider;
  }

  @Override
  public AttendanceViewModel get() {
    return newInstance(getCurrentUserUseCaseProvider.get(), logoutUseCaseProvider.get(), punchAttendanceUseCaseProvider.get(), getAttendanceHistoryUseCaseProvider.get(), contextProvider.get());
  }

  public static AttendanceViewModel_Factory create(
      Provider<GetCurrentUserUseCase> getCurrentUserUseCaseProvider,
      Provider<LogoutUseCase> logoutUseCaseProvider,
      Provider<PunchAttendanceUseCase> punchAttendanceUseCaseProvider,
      Provider<GetAttendanceHistoryUseCase> getAttendanceHistoryUseCaseProvider,
      Provider<Context> contextProvider) {
    return new AttendanceViewModel_Factory(getCurrentUserUseCaseProvider, logoutUseCaseProvider, punchAttendanceUseCaseProvider, getAttendanceHistoryUseCaseProvider, contextProvider);
  }

  public static AttendanceViewModel newInstance(GetCurrentUserUseCase getCurrentUserUseCase,
      LogoutUseCase logoutUseCase, PunchAttendanceUseCase punchAttendanceUseCase,
      GetAttendanceHistoryUseCase getAttendanceHistoryUseCase, Context context) {
    return new AttendanceViewModel(getCurrentUserUseCase, logoutUseCase, punchAttendanceUseCase, getAttendanceHistoryUseCase, context);
  }
}
