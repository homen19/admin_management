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
public final class DisconnectChatWebSocketUseCase_Factory implements Factory<DisconnectChatWebSocketUseCase> {
  private final Provider<ChatRepository> repositoryProvider;

  public DisconnectChatWebSocketUseCase_Factory(Provider<ChatRepository> repositoryProvider) {
    this.repositoryProvider = repositoryProvider;
  }

  @Override
  public DisconnectChatWebSocketUseCase get() {
    return newInstance(repositoryProvider.get());
  }

  public static DisconnectChatWebSocketUseCase_Factory create(
      Provider<ChatRepository> repositoryProvider) {
    return new DisconnectChatWebSocketUseCase_Factory(repositoryProvider);
  }

  public static DisconnectChatWebSocketUseCase newInstance(ChatRepository repository) {
    return new DisconnectChatWebSocketUseCase(repository);
  }
}
