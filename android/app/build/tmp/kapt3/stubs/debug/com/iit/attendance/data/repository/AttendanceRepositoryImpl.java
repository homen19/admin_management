package com.iit.attendance.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00000\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0010\u0006\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0000\u0018\u00002\u00020\u0001B\u000f\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004J\"\u0010\u0005\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\b0\u00070\u0006H\u0096@\u00f8\u0001\u0000\u00f8\u0001\u0001\u00a2\u0006\u0004\b\t\u0010\nJ,\u0010\u000b\u001a\b\u0012\u0004\u0012\u00020\b0\u00062\u0006\u0010\f\u001a\u00020\r2\u0006\u0010\u000e\u001a\u00020\rH\u0096@\u00f8\u0001\u0000\u00f8\u0001\u0001\u00a2\u0006\u0004\b\u000f\u0010\u0010J\f\u0010\u0011\u001a\u00020\b*\u00020\u0012H\u0002R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u0082\u0002\u000b\n\u0002\b!\n\u0005\b\u00a1\u001e0\u0001\u00a8\u0006\u0013"}, d2 = {"Lcom/iit/attendance/data/repository/AttendanceRepositoryImpl;", "Lcom/iit/attendance/domain/repository/AttendanceRepository;", "api", "Lcom/iit/attendance/data/remote/AttendanceApi;", "(Lcom/iit/attendance/data/remote/AttendanceApi;)V", "getAttendanceHistory", "Lkotlin/Result;", "", "Lcom/iit/attendance/domain/model/AttendanceRecord;", "getAttendanceHistory-IoAF18A", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "punchAttendance", "latitude", "", "longitude", "punchAttendance-0E7RQCE", "(DDLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "toDomain", "Lcom/iit/attendance/data/remote/dto/AttendanceDto;", "app_debug"})
public final class AttendanceRepositoryImpl implements com.iit.attendance.domain.repository.AttendanceRepository {
    @org.jetbrains.annotations.NotNull()
    private final com.iit.attendance.data.remote.AttendanceApi api = null;
    
    @javax.inject.Inject()
    public AttendanceRepositoryImpl(@org.jetbrains.annotations.NotNull()
    com.iit.attendance.data.remote.AttendanceApi api) {
        super();
    }
    
    private final com.iit.attendance.domain.model.AttendanceRecord toDomain(com.iit.attendance.data.remote.dto.AttendanceDto $this$toDomain) {
        return null;
    }
}