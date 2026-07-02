package com.iit.cliqchat.domain.usecase.chat;

import com.iit.cliqchat.domain.repository.ChatRepository;
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
public final class ConnectChatWebSocketUseCase_Factory implements Factory<ConnectChatWebSocketUseCase> {
  private final Provider<ChatRepository> repositoryProvider;

  public ConnectChatWebSocketUseCase_Factory(Provider<ChatRepository> repositoryProvider) {
    this.repositoryProvider = repositoryProvider;
  }

  @Override
  public ConnectChatWebSocketUseCase get() {
    return newInstance(repositoryProvider.get());
  }

  public static ConnectChatWebSocketUseCase_Factory create(
      Provider<ChatRepository> repositoryProvider) {
    return new ConnectChatWebSocketUseCase_Factory(repositoryProvider);
  }

  public static ConnectChatWebSocketUseCase newInstance(ChatRepository repository) {
    return new ConnectChatWebSocketUseCase(repository);
  }
}
