package com.iit.cliqchat.data.remote;

import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
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
public final class ChatWebSocketManager_Factory implements Factory<ChatWebSocketManager> {
  private final Provider<OkHttpClient> clientProvider;

  public ChatWebSocketManager_Factory(Provider<OkHttpClient> clientProvider) {
    this.clientProvider = clientProvider;
  }

  @Override
  public ChatWebSocketManager get() {
    return newInstance(clientProvider.get());
  }

  public static ChatWebSocketManager_Factory create(Provider<OkHttpClient> clientProvider) {
    return new ChatWebSocketManager_Factory(clientProvider);
  }

  public static ChatWebSocketManager newInstance(OkHttpClient client) {
    return new ChatWebSocketManager(client);
  }
}
