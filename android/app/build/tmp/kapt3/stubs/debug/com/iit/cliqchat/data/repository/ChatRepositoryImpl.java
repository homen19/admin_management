package com.iit.cliqchat.data.repository;

@javax.inject.Singleton()
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000L\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\u000e\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\b\n\u0002\b\u0007\b\u0007\u0018\u00002\u00020\u0001B\u0017\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\u0002\u0010\u0006J$\u0010\u0007\u001a\u00020\b2\u0006\u0010\t\u001a\u00020\n2\u0012\u0010\u000b\u001a\u000e\u0012\u0004\u0012\u00020\n\u0012\u0004\u0012\u00020\b0\fH\u0016J\b\u0010\r\u001a\u00020\bH\u0016J\"\u0010\u000e\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u00110\u00100\u000fH\u0096@\u00f8\u0001\u0000\u00f8\u0001\u0001\u00a2\u0006\u0004\b\u0012\u0010\u0013J2\u0010\u0014\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u00150\u00100\u000f2\u0006\u0010\u0016\u001a\u00020\n2\u0006\u0010\u0017\u001a\u00020\u0018H\u0096@\u00f8\u0001\u0000\u00f8\u0001\u0001\u00a2\u0006\u0004\b\u0019\u0010\u001aJ\u0018\u0010\u001b\u001a\u00020\b2\u0006\u0010\u0016\u001a\u00020\n2\u0006\u0010\u001c\u001a\u00020\nH\u0016J\u0018\u0010\u001d\u001a\u00020\b2\u0006\u0010\u0016\u001a\u00020\n2\u0006\u0010\u001e\u001a\u00020\nH\u0016R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u0082\u0002\u000b\n\u0002\b!\n\u0005\b\u00a1\u001e0\u0001\u00a8\u0006\u001f"}, d2 = {"Lcom/iit/cliqchat/data/repository/ChatRepositoryImpl;", "Lcom/iit/cliqchat/domain/repository/ChatRepository;", "chatApi", "Lcom/iit/cliqchat/data/remote/ChatApi;", "webSocketManager", "Lcom/iit/cliqchat/data/remote/ChatWebSocketManager;", "(Lcom/iit/cliqchat/data/remote/ChatApi;Lcom/iit/cliqchat/data/remote/ChatWebSocketManager;)V", "connectWebSocket", "", "token", "", "onMessageReceived", "Lkotlin/Function1;", "disconnectWebSocket", "getChannels", "Lkotlin/Result;", "", "Lcom/iit/cliqchat/domain/model/Channel;", "getChannels-IoAF18A", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getMessages", "Lcom/iit/cliqchat/domain/model/Message;", "channelId", "page", "", "getMessages-0E7RQCE", "(Ljava/lang/String;ILkotlin/coroutines/Continuation;)Ljava/lang/Object;", "sendMessage", "content", "subscribeToChannel", "subscriptionId", "app_debug"})
public final class ChatRepositoryImpl implements com.iit.cliqchat.domain.repository.ChatRepository {
    @org.jetbrains.annotations.NotNull()
    private final com.iit.cliqchat.data.remote.ChatApi chatApi = null;
    @org.jetbrains.annotations.NotNull()
    private final com.iit.cliqchat.data.remote.ChatWebSocketManager webSocketManager = null;
    
    @javax.inject.Inject()
    public ChatRepositoryImpl(@org.jetbrains.annotations.NotNull()
    com.iit.cliqchat.data.remote.ChatApi chatApi, @org.jetbrains.annotations.NotNull()
    com.iit.cliqchat.data.remote.ChatWebSocketManager webSocketManager) {
        super();
    }
    
    @java.lang.Override()
    public void connectWebSocket(@org.jetbrains.annotations.NotNull()
    java.lang.String token, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function1<? super java.lang.String, kotlin.Unit> onMessageReceived) {
    }
    
    @java.lang.Override()
    public void subscribeToChannel(@org.jetbrains.annotations.NotNull()
    java.lang.String channelId, @org.jetbrains.annotations.NotNull()
    java.lang.String subscriptionId) {
    }
    
    @java.lang.Override()
    public void sendMessage(@org.jetbrains.annotations.NotNull()
    java.lang.String channelId, @org.jetbrains.annotations.NotNull()
    java.lang.String content) {
    }
    
    @java.lang.Override()
    public void disconnectWebSocket() {
    }
}