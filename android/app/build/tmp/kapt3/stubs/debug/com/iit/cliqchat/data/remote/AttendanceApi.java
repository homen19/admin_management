package com.iit.cliqchat.data.remote;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000,\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\bf\u0018\u00002\u00020\u0001J\u0014\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003H\u00a7@\u00a2\u0006\u0002\u0010\u0005J\u0018\u0010\u0006\u001a\u00020\u00072\b\b\u0001\u0010\b\u001a\u00020\tH\u00a7@\u00a2\u0006\u0002\u0010\nJ\u0018\u0010\u000b\u001a\u00020\u00042\b\b\u0001\u0010\b\u001a\u00020\fH\u00a7@\u00a2\u0006\u0002\u0010\r\u00a8\u0006\u000e"}, d2 = {"Lcom/iit/cliqchat/data/remote/AttendanceApi;", "", "getMyHistory", "", "Lcom/iit/cliqchat/data/remote/dto/AttendanceDto;", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "login", "Lcom/iit/cliqchat/data/remote/dto/JwtResponse;", "request", "Lcom/iit/cliqchat/data/remote/dto/LoginRequest;", "(Lcom/iit/cliqchat/data/remote/dto/LoginRequest;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "punchMobile", "Lcom/iit/cliqchat/data/remote/dto/MobilePunchRequest;", "(Lcom/iit/cliqchat/data/remote/dto/MobilePunchRequest;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_debug"})
public abstract interface AttendanceApi {
    
    @retrofit2.http.POST(value = "api/auth/login")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object login(@retrofit2.http.Body()
    @org.jetbrains.annotations.NotNull()
    com.iit.cliqchat.data.remote.dto.LoginRequest request, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.iit.cliqchat.data.remote.dto.JwtResponse> $completion);
    
    @retrofit2.http.POST(value = "api/attendance/mobile")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object punchMobile(@retrofit2.http.Body()
    @org.jetbrains.annotations.NotNull()
    com.iit.cliqchat.data.remote.dto.MobilePunchRequest request, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.iit.cliqchat.data.remote.dto.AttendanceDto> $completion);
    
    @retrofit2.http.GET(value = "api/attendance/my-history")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getMyHistory(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super java.util.List<com.iit.cliqchat.data.remote.dto.AttendanceDto>> $completion);
}