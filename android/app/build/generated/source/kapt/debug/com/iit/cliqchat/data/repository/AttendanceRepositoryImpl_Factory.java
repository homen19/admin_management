package com.iit.cliqchat.data.repository;

import com.iit.cliqchat.data.remote.AttendanceApi;
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
public final class AttendanceRepositoryImpl_Factory implements Factory<AttendanceRepositoryImpl> {
  private final Provider<AttendanceApi> apiProvider;

  public AttendanceRepositoryImpl_Factory(Provider<AttendanceApi> apiProvider) {
    this.apiProvider = apiProvider;
  }

  @Override
  public AttendanceRepositoryImpl get() {
    return newInstance(apiProvider.get());
  }

  public static AttendanceRepositoryImpl_Factory create(Provider<AttendanceApi> apiProvider) {
    return new AttendanceRepositoryImpl_Factory(apiProvider);
  }

  public static AttendanceRepositoryImpl newInstance(AttendanceApi api) {
    return new AttendanceRepositoryImpl(api);
  }
}
