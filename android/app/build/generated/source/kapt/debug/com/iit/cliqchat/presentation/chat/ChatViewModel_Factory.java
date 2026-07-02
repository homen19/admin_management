package com.iit.cliqchat.presentation.chat;

import com.iit.cliqchat.domain.usecase.chat.ConnectChatWebSocketUseCase;
import com.iit.cliqchat.domain.usecase.chat.DisconnectChatWebSocketUseCase;
import com.iit.cliqchat.domain.usecase.chat.GetChannelsUseCase;
import com.iit.cliqchat.domain.usecase.chat.GetMessagesUseCase;
import com.iit.cliqchat.domain.usecase.chat.SendMessageUseCase;
import com.iit.cliqchat.domain.usecase.chat.SubscribeToChannelUseCase;
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
public final class ChatViewModel_Factory implements Factory<ChatViewModel> {
  private final Provider<GetChannelsUseCase> getChannelsUseCaseProvider;

  private final Provider<GetMessagesUseCase> getMessagesUseCaseProvider;

  private final Provider<SendMessageUseCase> sendMessageUseCaseProvider;

  private final Provider<ConnectChatWebSocketUseCase> connectWebSocketUseCaseProvider;

  private final Provider<SubscribeToChannelUseCase> subscribeToChannelUseCaseProvider;

  private final Provider<DisconnectChatWebSocketUseCase> disconnectWebSocketUseCaseProvider;

  public ChatViewModel_Factory(Provider<GetChannelsUseCase> getChannelsUseCaseProvider,
      Provider<GetMessagesUseCase> getMessagesUseCaseProvider,
      Provider<SendMessageUseCase> sendMessageUseCaseProvider,
      Provider<ConnectChatWebSocketUseCase> connectWebSocketUseCaseProvider,
      Provider<SubscribeToChannelUseCase> subscribeToChannelUseCaseProvider,
      Provider<DisconnectChatWebSocketUseCase> disconnectWebSocketUseCaseProvider) {
    this.getChannelsUseCaseProvider = getChannelsUseCaseProvider;
    this.getMessagesUseCaseProvider = getMessagesUseCaseProvider;
    this.sendMessageUseCaseProvider = sendMessageUseCaseProvider;
    this.connectWebSocketUseCaseProvider = connectWebSocketUseCaseProvider;
    this.subscribeToChannelUseCaseProvider = subscribeToChannelUseCaseProvider;
    this.disconnectWebSocketUseCaseProvider = disconnectWebSocketUseCaseProvider;
  }

  @Override
  public ChatViewModel get() {
    return newInstance(getChannelsUseCaseProvider.get(), getMessagesUseCaseProvider.get(), sendMessageUseCaseProvider.get(), connectWebSocketUseCaseProvider.get(), subscribeToChannelUseCaseProvider.get(), disconnectWebSocketUseCaseProvider.get());
  }

  public static ChatViewModel_Factory create(
      Provider<GetChannelsUseCase> getChannelsUseCaseProvider,
      Provider<GetMessagesUseCase> getMessagesUseCaseProvider,
      Provider<SendMessageUseCase> sendMessageUseCaseProvider,
      Provider<ConnectChatWebSocketUseCase> connectWebSocketUseCaseProvider,
      Provider<SubscribeToChannelUseCase> subscribeToChannelUseCaseProvider,
      Provider<DisconnectChatWebSocketUseCase> disconnectWebSocketUseCaseProvider) {
    return new ChatViewModel_Factory(getChannelsUseCaseProvider, getMessagesUseCaseProvider, sendMessageUseCaseProvider, connectWebSocketUseCaseProvider, subscribeToChannelUseCaseProvider, disconnectWebSocketUseCaseProvider);
  }

  public static ChatViewModel newInstance(GetChannelsUseCase getChannelsUseCase,
      GetMessagesUseCase getMessagesUseCase, SendMessageUseCase sendMessageUseCase,
      ConnectChatWebSocketUseCase connectWebSocketUseCase,
      SubscribeToChannelUseCase subscribeToChannelUseCase,
      DisconnectChatWebSocketUseCase disconnectWebSocketUseCase) {
    return new ChatViewModel(getChannelsUseCase, getMessagesUseCase, sendMessageUseCase, connectWebSocketUseCase, subscribeToChannelUseCase, disconnectWebSocketUseCase);
  }
}
