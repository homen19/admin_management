package com.iit.cliqchat.presentation.chat;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000b\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000b\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u000e\n\u0002\b\u0004\n\u0002\u0010\u0002\n\u0002\b\t\b\u0007\u0018\u00002\u00020\u0001B7\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u0012\u0006\u0010\u0006\u001a\u00020\u0007\u0012\u0006\u0010\b\u001a\u00020\t\u0012\u0006\u0010\n\u001a\u00020\u000b\u0012\u0006\u0010\f\u001a\u00020\r\u00a2\u0006\u0002\u0010\u000eJ\u000e\u0010 \u001a\u00020!2\u0006\u0010\"\u001a\u00020\u001cJ\u0006\u0010#\u001a\u00020!J\u000e\u0010$\u001a\u00020!2\u0006\u0010%\u001a\u00020\u001cJ\b\u0010&\u001a\u00020!H\u0014J\u000e\u0010\'\u001a\u00020!2\u0006\u0010(\u001a\u00020\u001cJ\u0006\u0010)\u001a\u00020!R\u001a\u0010\u000f\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u00120\u00110\u0010X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0014\u0010\u0013\u001a\b\u0012\u0004\u0012\u00020\u00140\u0010X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u001a\u0010\u0015\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u00160\u00110\u0010X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u001d\u0010\u0017\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u00120\u00110\u0018\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0019\u0010\u001aR\u000e\u0010\b\u001a\u00020\tX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0010\u0010\u001b\u001a\u0004\u0018\u00010\u001cX\u0082\u000e\u00a2\u0006\u0002\n\u0000R\u000e\u0010\f\u001a\u00020\rX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0017\u0010\u001d\u001a\b\u0012\u0004\u0012\u00020\u00140\u0018\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001d\u0010\u001aR\u001d\u0010\u001e\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u00160\u00110\u0018\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001f\u0010\u001aR\u000e\u0010\u0006\u001a\u00020\u0007X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\n\u001a\u00020\u000bX\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006*"}, d2 = {"Lcom/iit/cliqchat/presentation/chat/ChatViewModel;", "Landroidx/lifecycle/ViewModel;", "getChannelsUseCase", "Lcom/iit/cliqchat/domain/usecase/chat/GetChannelsUseCase;", "getMessagesUseCase", "Lcom/iit/cliqchat/domain/usecase/chat/GetMessagesUseCase;", "sendMessageUseCase", "Lcom/iit/cliqchat/domain/usecase/chat/SendMessageUseCase;", "connectWebSocketUseCase", "Lcom/iit/cliqchat/domain/usecase/chat/ConnectChatWebSocketUseCase;", "subscribeToChannelUseCase", "Lcom/iit/cliqchat/domain/usecase/chat/SubscribeToChannelUseCase;", "disconnectWebSocketUseCase", "Lcom/iit/cliqchat/domain/usecase/chat/DisconnectChatWebSocketUseCase;", "(Lcom/iit/cliqchat/domain/usecase/chat/GetChannelsUseCase;Lcom/iit/cliqchat/domain/usecase/chat/GetMessagesUseCase;Lcom/iit/cliqchat/domain/usecase/chat/SendMessageUseCase;Lcom/iit/cliqchat/domain/usecase/chat/ConnectChatWebSocketUseCase;Lcom/iit/cliqchat/domain/usecase/chat/SubscribeToChannelUseCase;Lcom/iit/cliqchat/domain/usecase/chat/DisconnectChatWebSocketUseCase;)V", "_channels", "Lkotlinx/coroutines/flow/MutableStateFlow;", "", "Lcom/iit/cliqchat/domain/model/Channel;", "_isLoading", "", "_messages", "Lcom/iit/cliqchat/domain/model/Message;", "channels", "Lkotlinx/coroutines/flow/StateFlow;", "getChannels", "()Lkotlinx/coroutines/flow/StateFlow;", "currentChannelId", "", "isLoading", "messages", "getMessages", "connectWebSocket", "", "token", "loadChannels", "loadMessages", "channelId", "onCleared", "sendMessage", "content", "subscribeToCurrentChannel", "app_debug"})
@dagger.hilt.android.lifecycle.HiltViewModel()
public final class ChatViewModel extends androidx.lifecycle.ViewModel {
    @org.jetbrains.annotations.NotNull()
    private final com.iit.cliqchat.domain.usecase.chat.GetChannelsUseCase getChannelsUseCase = null;
    @org.jetbrains.annotations.NotNull()
    private final com.iit.cliqchat.domain.usecase.chat.GetMessagesUseCase getMessagesUseCase = null;
    @org.jetbrains.annotations.NotNull()
    private final com.iit.cliqchat.domain.usecase.chat.SendMessageUseCase sendMessageUseCase = null;
    @org.jetbrains.annotations.NotNull()
    private final com.iit.cliqchat.domain.usecase.chat.ConnectChatWebSocketUseCase connectWebSocketUseCase = null;
    @org.jetbrains.annotations.NotNull()
    private final com.iit.cliqchat.domain.usecase.chat.SubscribeToChannelUseCase subscribeToChannelUseCase = null;
    @org.jetbrains.annotations.NotNull()
    private final com.iit.cliqchat.domain.usecase.chat.DisconnectChatWebSocketUseCase disconnectWebSocketUseCase = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<java.util.List<com.iit.cliqchat.domain.model.Channel>> _channels = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<java.util.List<com.iit.cliqchat.domain.model.Channel>> channels = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<java.util.List<com.iit.cliqchat.domain.model.Message>> _messages = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<java.util.List<com.iit.cliqchat.domain.model.Message>> messages = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<java.lang.Boolean> _isLoading = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<java.lang.Boolean> isLoading = null;
    @org.jetbrains.annotations.Nullable()
    private java.lang.String currentChannelId;
    
    @javax.inject.Inject()
    public ChatViewModel(@org.jetbrains.annotations.NotNull()
    com.iit.cliqchat.domain.usecase.chat.GetChannelsUseCase getChannelsUseCase, @org.jetbrains.annotations.NotNull()
    com.iit.cliqchat.domain.usecase.chat.GetMessagesUseCase getMessagesUseCase, @org.jetbrains.annotations.NotNull()
    com.iit.cliqchat.domain.usecase.chat.SendMessageUseCase sendMessageUseCase, @org.jetbrains.annotations.NotNull()
    com.iit.cliqchat.domain.usecase.chat.ConnectChatWebSocketUseCase connectWebSocketUseCase, @org.jetbrains.annotations.NotNull()
    com.iit.cliqchat.domain.usecase.chat.SubscribeToChannelUseCase subscribeToChannelUseCase, @org.jetbrains.annotations.NotNull()
    com.iit.cliqchat.domain.usecase.chat.DisconnectChatWebSocketUseCase disconnectWebSocketUseCase) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<java.util.List<com.iit.cliqchat.domain.model.Channel>> getChannels() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<java.util.List<com.iit.cliqchat.domain.model.Message>> getMessages() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<java.lang.Boolean> isLoading() {
        return null;
    }
    
    public final void loadChannels() {
    }
    
    public final void loadMessages(@org.jetbrains.annotations.NotNull()
    java.lang.String channelId) {
    }
    
    public final void connectWebSocket(@org.jetbrains.annotations.NotNull()
    java.lang.String token) {
    }
    
    public final void subscribeToCurrentChannel() {
    }
    
    public final void sendMessage(@org.jetbrains.annotations.NotNull()
    java.lang.String content) {
    }
    
    @java.lang.Override()
    protected void onCleared() {
    }
}