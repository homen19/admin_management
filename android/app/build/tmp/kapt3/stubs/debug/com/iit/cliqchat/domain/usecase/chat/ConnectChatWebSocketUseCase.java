package com.iit.cliqchat.domain.usecase.chat;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000$\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\u000e\n\u0000\n\u0002\u0018\u0002\n\u0000\u0018\u00002\u00020\u0001B\u000f\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004J%\u0010\u0005\u001a\u00020\u00062\u0006\u0010\u0007\u001a\u00020\b2\u0012\u0010\t\u001a\u000e\u0012\u0004\u0012\u00020\b\u0012\u0004\u0012\u00020\u00060\nH\u0086\u0002R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u000b"}, d2 = {"Lcom/iit/cliqchat/domain/usecase/chat/ConnectChatWebSocketUseCase;", "", "repository", "Lcom/iit/cliqchat/domain/repository/ChatRepository;", "(Lcom/iit/cliqchat/domain/repository/ChatRepository;)V", "invoke", "", "token", "", "onMessageReceived", "Lkotlin/Function1;", "app_debug"})
public final class ConnectChatWebSocketUseCase {
    @org.jetbrains.annotations.NotNull()
    private final com.iit.cliqchat.domain.repository.ChatRepository repository = null;
    
    @javax.inject.Inject()
    public ConnectChatWebSocketUseCase(@org.jetbrains.annotations.NotNull()
    com.iit.cliqchat.domain.repository.ChatRepository repository) {
        super();
    }
    
    public final void invoke(@org.jetbrains.annotations.NotNull()
    java.lang.String token, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function1<? super java.lang.String, kotlin.Unit> onMessageReceived) {
    }
}