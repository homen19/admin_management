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
public final class GetMessagesUseCase_Factory implements Factory<GetMessagesUseCase> {
  private final Provider<ChatRepository> repositoryProvider;

  public GetMessagesUseCase_Factory(Provider<ChatRepository> repositoryProvider) {
    this.repositoryProvider = repositoryProvider;
  }

  @Override
  public GetMessagesUseCase get() {
    return newInstance(repositoryProvider.get());
  }

  public static GetMessagesUseCase_Factory create(Provider<ChatRepository> repositoryProvider) {
    return new GetMessagesUseCase_Factory(repositoryProvider);
  }

  public static GetMessagesUseCase newInstance(ChatRepository repository) {
    return new GetMessagesUseCase(repository);
  }
}
