package com.iit.attendance.data.repository;

import android.content.Context;
import com.iit.attendance.data.remote.AttendanceApi;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata("javax.inject.Singleton")
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
public final class AuthRepositoryImpl_Factory implements Factory<AuthRepositoryImpl> {
  private final Provider<AttendanceApi> apiProvider;

  private final Provider<Context> contextProvider;

  public AuthRepositoryImpl_Factory(Provider<AttendanceApi> apiProvider,
      Provider<Context> contextProvider) {
    this.apiProvider = apiProvider;
    this.contextProvider = contextProvider;
  }

  @Override
  public AuthRepositoryImpl get() {
    return newInstance(apiProvider.get(), contextProvider.get());
  }

  public static AuthRepositoryImpl_Factory create(Provider<AttendanceApi> apiProvider,
      Provider<Context> contextProvider) {
    return new AuthRepositoryImpl_Factory(apiProvider, contextProvider);
  }

  public static AuthRepositoryImpl newInstance(AttendanceApi api, Context context) {
    return new AuthRepositoryImpl(api, context);
  }
}
