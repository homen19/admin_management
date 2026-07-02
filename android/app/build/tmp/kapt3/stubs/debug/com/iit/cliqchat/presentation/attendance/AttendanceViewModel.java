package com.iit.cliqchat.presentation.attendance;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000p\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000b\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0006\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u000b\n\u0002\u0018\u0002\n\u0002\b\u000f\n\u0002\u0010\u000e\n\u0002\b\u0012\n\u0002\u0010\u0002\n\u0002\b\b\b\u0007\u0018\u00002\u00020\u0001B/\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u0012\u0006\u0010\u0006\u001a\u00020\u0007\u0012\u0006\u0010\b\u001a\u00020\t\u0012\u0006\u0010\n\u001a\u00020\u000b\u00a2\u0006\u0002\u0010\fJ(\u0010D\u001a\u00020\u00162\u0006\u0010E\u001a\u00020\u00162\u0006\u0010F\u001a\u00020\u00162\u0006\u0010G\u001a\u00020\u00162\u0006\u0010H\u001a\u00020\u0016H\u0002J\u0006\u0010I\u001a\u00020JJ\u0006\u0010K\u001a\u00020JJ\u0006\u0010L\u001a\u00020JJ\b\u0010M\u001a\u00020JH\u0007J\u0006\u0010N\u001a\u00020JJ\u0018\u0010O\u001a\u00020J2\u0006\u0010P\u001a\u00020\u00162\u0006\u0010Q\u001a\u00020\u0016H\u0002R\u001a\u0010\r\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u00100\u000f0\u000eX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0014\u0010\u0011\u001a\b\u0012\u0004\u0012\u00020\u00120\u000eX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0014\u0010\u0013\u001a\b\u0012\u0004\u0012\u00020\u00140\u000eX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0015\u001a\u00020\u0016X\u0082D\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0017\u001a\u00020\u0016X\u0082D\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0018\u001a\u00020\u0016X\u0082D\u00a2\u0006\u0002\n\u0000R\u000e\u0010\n\u001a\u00020\u000bX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0019\u0010\u0019\u001a\n\u0012\u0006\u0012\u0004\u0018\u00010\u001b0\u001a\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001c\u0010\u001dR/\u0010\u001f\u001a\u0004\u0018\u00010\u00162\b\u0010\u001e\u001a\u0004\u0018\u00010\u00168F@BX\u0086\u008e\u0002\u00a2\u0006\u0012\n\u0004\b$\u0010%\u001a\u0004\b \u0010!\"\u0004\b\"\u0010#R\u000e\u0010&\u001a\u00020\'X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\b\u001a\u00020\tX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u001d\u0010(\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u00100\u000f0\u001a\u00a2\u0006\b\n\u0000\u001a\u0004\b)\u0010\u001dR+\u0010*\u001a\u00020\u00122\u0006\u0010\u001e\u001a\u00020\u00128F@BX\u0086\u008e\u0002\u00a2\u0006\u0012\n\u0004\b.\u0010%\u001a\u0004\b*\u0010+\"\u0004\b,\u0010-R\u0017\u0010/\u001a\b\u0012\u0004\u0012\u00020\u00120\u001a\u00a2\u0006\b\n\u0000\u001a\u0004\b/\u0010\u001dR+\u00100\u001a\u00020\u00122\u0006\u0010\u001e\u001a\u00020\u00128F@BX\u0086\u008e\u0002\u00a2\u0006\u0012\n\u0004\b2\u0010%\u001a\u0004\b0\u0010+\"\u0004\b1\u0010-R/\u00103\u001a\u0004\u0018\u00010\u00162\b\u0010\u001e\u001a\u0004\u0018\u00010\u00168F@BX\u0086\u008e\u0002\u00a2\u0006\u0012\n\u0004\b6\u0010%\u001a\u0004\b4\u0010!\"\u0004\b5\u0010#R/\u00108\u001a\u0004\u0018\u0001072\b\u0010\u001e\u001a\u0004\u0018\u0001078F@BX\u0086\u008e\u0002\u00a2\u0006\u0012\n\u0004\b=\u0010%\u001a\u0004\b9\u0010:\"\u0004\b;\u0010<R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R/\u0010>\u001a\u0004\u0018\u00010\u00162\b\u0010\u001e\u001a\u0004\u0018\u00010\u00168F@BX\u0086\u008e\u0002\u00a2\u0006\u0012\n\u0004\bA\u0010%\u001a\u0004\b?\u0010!\"\u0004\b@\u0010#R\u000e\u0010\u0006\u001a\u00020\u0007X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0017\u0010B\u001a\b\u0012\u0004\u0012\u00020\u00140\u001a\u00a2\u0006\b\n\u0000\u001a\u0004\bC\u0010\u001d\u00a8\u0006R"}, d2 = {"Lcom/iit/cliqchat/presentation/attendance/AttendanceViewModel;", "Landroidx/lifecycle/ViewModel;", "getCurrentUserUseCase", "Lcom/iit/cliqchat/domain/usecase/GetCurrentUserUseCase;", "logoutUseCase", "Lcom/iit/cliqchat/domain/usecase/LogoutUseCase;", "punchAttendanceUseCase", "Lcom/iit/cliqchat/domain/usecase/PunchAttendanceUseCase;", "getAttendanceHistoryUseCase", "Lcom/iit/cliqchat/domain/usecase/GetAttendanceHistoryUseCase;", "context", "Landroid/content/Context;", "(Lcom/iit/cliqchat/domain/usecase/GetCurrentUserUseCase;Lcom/iit/cliqchat/domain/usecase/LogoutUseCase;Lcom/iit/cliqchat/domain/usecase/PunchAttendanceUseCase;Lcom/iit/cliqchat/domain/usecase/GetAttendanceHistoryUseCase;Landroid/content/Context;)V", "_history", "Lkotlinx/coroutines/flow/MutableStateFlow;", "", "Lcom/iit/cliqchat/domain/model/AttendanceRecord;", "_isRefreshingHistory", "", "_punchState", "Lcom/iit/cliqchat/presentation/attendance/PunchUiState;", "campusGeofenceRadius", "", "campusLatitude", "campusLongitude", "currentUser", "Lkotlinx/coroutines/flow/StateFlow;", "Lcom/iit/cliqchat/domain/model/User;", "getCurrentUser", "()Lkotlinx/coroutines/flow/StateFlow;", "<set-?>", "distance", "getDistance", "()Ljava/lang/Double;", "setDistance", "(Ljava/lang/Double;)V", "distance$delegate", "Landroidx/compose/runtime/MutableState;", "fusedLocationClient", "Lcom/google/android/gms/location/FusedLocationProviderClient;", "history", "getHistory", "isLocating", "()Z", "setLocating", "(Z)V", "isLocating$delegate", "isRefreshingHistory", "isWithinGeofence", "setWithinGeofence", "isWithinGeofence$delegate", "latitude", "getLatitude", "setLatitude", "latitude$delegate", "", "locationError", "getLocationError", "()Ljava/lang/String;", "setLocationError", "(Ljava/lang/String;)V", "locationError$delegate", "longitude", "getLongitude", "setLongitude", "longitude$delegate", "punchState", "getPunchState", "calculateDistance", "lat1", "lon1", "lat2", "lon2", "loadHistory", "", "logout", "punch", "refreshLocation", "resetPunchState", "updateLocationData", "lat", "lon", "app_debug"})
@dagger.hilt.android.lifecycle.HiltViewModel()
public final class AttendanceViewModel extends androidx.lifecycle.ViewModel {
    @org.jetbrains.annotations.NotNull()
    private final com.iit.cliqchat.domain.usecase.GetCurrentUserUseCase getCurrentUserUseCase = null;
    @org.jetbrains.annotations.NotNull()
    private final com.iit.cliqchat.domain.usecase.LogoutUseCase logoutUseCase = null;
    @org.jetbrains.annotations.NotNull()
    private final com.iit.cliqchat.domain.usecase.PunchAttendanceUseCase punchAttendanceUseCase = null;
    @org.jetbrains.annotations.NotNull()
    private final com.iit.cliqchat.domain.usecase.GetAttendanceHistoryUseCase getAttendanceHistoryUseCase = null;
    @org.jetbrains.annotations.NotNull()
    private final android.content.Context context = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<com.iit.cliqchat.domain.model.User> currentUser = null;
    @org.jetbrains.annotations.NotNull()
    private final com.google.android.gms.location.FusedLocationProviderClient fusedLocationClient = null;
    private final double campusLatitude = 25.4299;
    private final double campusLongitude = 81.7712;
    private final double campusGeofenceRadius = 300.0;
    @org.jetbrains.annotations.NotNull()
    private final androidx.compose.runtime.MutableState latitude$delegate = null;
    @org.jetbrains.annotations.NotNull()
    private final androidx.compose.runtime.MutableState longitude$delegate = null;
    @org.jetbrains.annotations.NotNull()
    private final androidx.compose.runtime.MutableState distance$delegate = null;
    @org.jetbrains.annotations.NotNull()
    private final androidx.compose.runtime.MutableState isWithinGeofence$delegate = null;
    @org.jetbrains.annotations.NotNull()
    private final androidx.compose.runtime.MutableState isLocating$delegate = null;
    @org.jetbrains.annotations.NotNull()
    private final androidx.compose.runtime.MutableState locationError$delegate = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<java.util.List<com.iit.cliqchat.domain.model.AttendanceRecord>> _history = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<java.util.List<com.iit.cliqchat.domain.model.AttendanceRecord>> history = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<java.lang.Boolean> _isRefreshingHistory = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<java.lang.Boolean> isRefreshingHistory = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<com.iit.cliqchat.presentation.attendance.PunchUiState> _punchState = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<com.iit.cliqchat.presentation.attendance.PunchUiState> punchState = null;
    
    @javax.inject.Inject()
    public AttendanceViewModel(@org.jetbrains.annotations.NotNull()
    com.iit.cliqchat.domain.usecase.GetCurrentUserUseCase getCurrentUserUseCase, @org.jetbrains.annotations.NotNull()
    com.iit.cliqchat.domain.usecase.LogoutUseCase logoutUseCase, @org.jetbrains.annotations.NotNull()
    com.iit.cliqchat.domain.usecase.PunchAttendanceUseCase punchAttendanceUseCase, @org.jetbrains.annotations.NotNull()
    com.iit.cliqchat.domain.usecase.GetAttendanceHistoryUseCase getAttendanceHistoryUseCase, @org.jetbrains.annotations.NotNull()
    android.content.Context context) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<com.iit.cliqchat.domain.model.User> getCurrentUser() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Double getLatitude() {
        return null;
    }
    
    private final void setLatitude(java.lang.Double p0) {
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Double getLongitude() {
        return null;
    }
    
    private final void setLongitude(java.lang.Double p0) {
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Double getDistance() {
        return null;
    }
    
    private final void setDistance(java.lang.Double p0) {
    }
    
    public final boolean isWithinGeofence() {
        return false;
    }
    
    private final void setWithinGeofence(boolean p0) {
    }
    
    public final boolean isLocating() {
        return false;
    }
    
    private final void setLocating(boolean p0) {
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getLocationError() {
        return null;
    }
    
    private final void setLocationError(java.lang.String p0) {
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<java.util.List<com.iit.cliqchat.domain.model.AttendanceRecord>> getHistory() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<java.lang.Boolean> isRefreshingHistory() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<com.iit.cliqchat.presentation.attendance.PunchUiState> getPunchState() {
        return null;
    }
    
    public final void loadHistory() {
    }
    
    @android.annotation.SuppressLint(value = {"MissingPermission"})
    public final void refreshLocation() {
    }
    
    private final void updateLocationData(double lat, double lon) {
    }
    
    public final void punch() {
    }
    
    public final void logout() {
    }
    
    public final void resetPunchState() {
    }
    
    private final double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        return 0.0;
    }
}