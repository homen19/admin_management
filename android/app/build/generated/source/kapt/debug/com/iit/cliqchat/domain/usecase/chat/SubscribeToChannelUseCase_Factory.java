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
public final class SubscribeToChannelUseCase_Factory implements Factory<SubscribeToChannelUseCase> {
  private final Provider<ChatRepository> repositoryProvider;

  public SubscribeToChannelUseCase_Factory(Provider<ChatRepository> repositoryProvider) {
    this.repositoryProvider = repositoryProvider;
  }

  @Override
  public SubscribeToChannelUseCase get() {
    return newInstance(repositoryProvider.get());
  }

  public static SubscribeToChannelUseCase_Factory create(
      Provider<ChatRepository> repositoryProvider) {
    return new SubscribeToChannelUseCase_Factory(repositoryProvider);
  }

  public static SubscribeToChannelUseCase newInstance(ChatRepository repository) {
    return new SubscribeToChannelUseCase(repository);
  }
}
