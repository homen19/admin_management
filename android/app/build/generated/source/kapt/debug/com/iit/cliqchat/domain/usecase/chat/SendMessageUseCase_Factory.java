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
public final class SendMessageUseCase_Factory implements Factory<SendMessageUseCase> {
  private final Provider<ChatRepository> repositoryProvider;

  public SendMessageUseCase_Factory(Provider<ChatRepository> repositoryProvider) {
    this.repositoryProvider = repositoryProvider;
  }

  @Override
  public SendMessageUseCase get() {
    return newInstance(repositoryProvider.get());
  }

  public static SendMessageUseCase_Factory create(Provider<ChatRepository> repositoryProvider) {
    return new SendMessageUseCase_Factory(repositoryProvider);
  }

  public static SendMessageUseCase newInstance(ChatRepository repository) {
    return new SendMessageUseCase(repository);
  }
}
