package com.iit.cliqchat.data.remote;

@javax.inject.Singleton()
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000,\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010!\n\u0002\u0018\u0002\n\u0002\u0010\u000e\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\n\b\u0007\u0018\u00002\u00020\u0001B\u000f\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004J\"\u0010\f\u001a\u00020\t2\u0006\u0010\r\u001a\u00020\b2\u0012\u0010\u000e\u001a\u000e\u0012\u0004\u0012\u00020\b\u0012\u0004\u0012\u00020\t0\u0007J\u0006\u0010\u000f\u001a\u00020\tJ\u0016\u0010\u0010\u001a\u00020\t2\u0006\u0010\u0011\u001a\u00020\b2\u0006\u0010\u0012\u001a\u00020\bJ\u0016\u0010\u0013\u001a\u00020\t2\u0006\u0010\u0011\u001a\u00020\b2\u0006\u0010\u0014\u001a\u00020\bR\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R \u0010\u0005\u001a\u0014\u0012\u0010\u0012\u000e\u0012\u0004\u0012\u00020\b\u0012\u0004\u0012\u00020\t0\u00070\u0006X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0010\u0010\n\u001a\u0004\u0018\u00010\u000bX\u0082\u000e\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0015"}, d2 = {"Lcom/iit/cliqchat/data/remote/ChatWebSocketManager;", "", "client", "Lokhttp3/OkHttpClient;", "(Lokhttp3/OkHttpClient;)V", "listeners", "", "Lkotlin/Function1;", "", "", "webSocket", "Lokhttp3/WebSocket;", "connect", "token", "onMessage", "disconnect", "sendMessage", "destination", "body", "subscribe", "id", "app_debug"})
public final class ChatWebSocketManager {
    @org.jetbrains.annotations.NotNull()
    private final okhttp3.OkHttpClient client = null;
    @org.jetbrains.annotations.Nullable()
    private okhttp3.WebSocket webSocket;
    @org.jetbrains.annotations.NotNull()
    private final java.util.List<kotlin.jvm.functions.Function1<java.lang.String, kotlin.Unit>> listeners = null;
    
    @javax.inject.Inject()
    public ChatWebSocketManager(@org.jetbrains.annotations.NotNull()
    okhttp3.OkHttpClient client) {
        super();
    }
    
    public final void connect(@org.jetbrains.annotations.NotNull()
    java.lang.String token, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function1<? super java.lang.String, kotlin.Unit> onMessage) {
    }
    
    public final void subscribe(@org.jetbrains.annotations.NotNull()
    java.lang.String destination, @org.jetbrains.annotations.NotNull()
    java.lang.String id) {
    }
    
    public final void sendMessage(@org.jetbrains.annotations.NotNull()
    java.lang.String destination, @org.jetbrains.annotations.NotNull()
    java.lang.String body) {
    }
    
    public final void disconnect() {
    }
}