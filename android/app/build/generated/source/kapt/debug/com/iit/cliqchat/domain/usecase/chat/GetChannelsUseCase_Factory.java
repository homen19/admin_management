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
public final class GetChannelsUseCase_Factory implements Factory<GetChannelsUseCase> {
  private final Provider<ChatRepository> repositoryProvider;

  public GetChannelsUseCase_Factory(Provider<ChatRepository> repositoryProvider) {
    this.repositoryProvider = repositoryProvider;
  }

  @Override
  public GetChannelsUseCase get() {
    return newInstance(repositoryProvider.get());
  }

  public static GetChannelsUseCase_Factory create(Provider<ChatRepository> repositoryProvider) {
    return new GetChannelsUseCase_Factory(repositoryProvider);
  }

  public static GetChannelsUseCase newInstance(ChatRepository repository) {
    return new GetChannelsUseCase(repository);
  }
}
