package com.iit.cliqchat.data.repository;

import com.iit.cliqchat.data.remote.ChatApi;
import com.iit.cliqchat.data.remote.ChatWebSocketManager;
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
public final class ChatRepositoryImpl_Factory implements Factory<ChatRepositoryImpl> {
  private final Provider<ChatApi> chatApiProvider;

  private final Provider<ChatWebSocketManager> webSocketManagerProvider;

  public ChatRepositoryImpl_Factory(Provider<ChatApi> chatApiProvider,
      Provider<ChatWebSocketManager> webSocketManagerProvider) {
    this.chatApiProvider = chatApiProvider;
    this.webSocketManagerProvider = webSocketManagerProvider;
  }

  @Override
  public ChatRepositoryImpl get() {
    return newInstance(chatApiProvider.get(), webSocketManagerProvider.get());
  }

  public static ChatRepositoryImpl_Factory create(Provider<ChatApi> chatApiProvider,
      Provider<ChatWebSocketManager> webSocketManagerProvider) {
    return new ChatRepositoryImpl_Factory(chatApiProvider, webSocketManagerProvider);
  }

  public static ChatRepositoryImpl newInstance(ChatApi chatApi,
      ChatWebSocketManager webSocketManager) {
    return new ChatRepositoryImpl(chatApi, webSocketManager);
  }
}
