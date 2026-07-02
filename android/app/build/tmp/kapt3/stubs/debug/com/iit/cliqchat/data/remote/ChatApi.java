package com.iit.cliqchat.data.remote;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000*\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0000\n\u0002\u0010\b\n\u0002\b\u0003\bf\u0018\u00002\u00020\u0001J\u0014\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003H\u00a7@\u00a2\u0006\u0002\u0010\u0005J2\u0010\u0006\u001a\b\u0012\u0004\u0012\u00020\u00070\u00032\b\b\u0001\u0010\b\u001a\u00020\t2\b\b\u0003\u0010\n\u001a\u00020\u000b2\b\b\u0003\u0010\f\u001a\u00020\u000bH\u00a7@\u00a2\u0006\u0002\u0010\r\u00a8\u0006\u000e"}, d2 = {"Lcom/iit/cliqchat/data/remote/ChatApi;", "", "getChannels", "", "Lcom/iit/cliqchat/data/remote/dto/ChannelDto;", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getMessages", "Lcom/iit/cliqchat/data/remote/dto/MessageDto;", "channelId", "", "page", "", "size", "(Ljava/lang/String;IILkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_debug"})
public abstract interface ChatApi {
    
    @retrofit2.http.GET(value = "/api/chat/channels")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getChannels(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super java.util.List<com.iit.cliqchat.data.remote.dto.ChannelDto>> $completion);
    
    @retrofit2.http.GET(value = "/api/chat/messages/{channelId}")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getMessages(@retrofit2.http.Path(value = "channelId")
    @org.jetbrains.annotations.NotNull()
    java.lang.String channelId, @retrofit2.http.Query(value = "page")
    int page, @retrofit2.http.Query(value = "size")
    int size, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super java.util.List<com.iit.cliqchat.data.remote.dto.MessageDto>> $completion);
    
    @kotlin.Metadata(mv = {1, 9, 0}, k = 3, xi = 48)
    public static final class DefaultImpls {
    }
}