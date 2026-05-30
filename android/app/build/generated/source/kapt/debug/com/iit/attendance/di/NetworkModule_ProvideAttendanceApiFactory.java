package com.iit.attendance.di;

import com.iit.attendance.data.remote.AttendanceApi;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;
import okhttp3.OkHttpClient;

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
public final class NetworkModule_ProvideAttendanceApiFactory implements Factory<AttendanceApi> {
  private final Provider<OkHttpClient> okHttpClientProvider;

  public NetworkModule_ProvideAttendanceApiFactory(Provider<OkHttpClient> okHttpClientProvider) {
    this.okHttpClientProvider = okHttpClientProvider;
  }

  @Override
  public AttendanceApi get() {
    return provideAttendanceApi(okHttpClientProvider.get());
  }

  public static NetworkModule_ProvideAttendanceApiFactory create(
      Provider<OkHttpClient> okHttpClientProvider) {
    return new NetworkModule_ProvideAttendanceApiFactory(okHttpClientProvider);
  }

  public static AttendanceApi provideAttendanceApi(OkHttpClient okHttpClient) {
    return Preconditions.checkNotNullFromProvides(NetworkModule.INSTANCE.provideAttendanceApi(okHttpClient));
  }
}
