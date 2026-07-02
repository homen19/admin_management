package com.iit.cliqchat.presentation.attendance

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.iit.cliqchat.R
import com.iit.cliqchat.domain.model.AttendanceRecord
import com.iit.cliqchat.presentation.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AttendanceScreen(
    viewModel: AttendanceViewModel,
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val currentUser by viewModel.currentUser.collectAsState()
    val history by viewModel.history.collectAsState()
    val isRefreshingHistory by viewModel.isRefreshingHistory.collectAsState()
    val punchState by viewModel.punchState.collectAsState()

    var hasLocationPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        hasLocationPermission = granted
        if (granted) {
            viewModel.refreshLocation()
        }
    }

    LaunchedEffect(hasLocationPermission) {
        if (!hasLocationPermission) {
            permissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        } else {
            viewModel.refreshLocation()
        }
    }

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(punchState) {
        when (punchState) {
            is PunchUiState.Success -> {
                snackbarHostState.showSnackbar((punchState as PunchUiState.Success).message)
                viewModel.resetPunchState()
            }
            is PunchUiState.Error -> {
                snackbarHostState.showSnackbar((punchState as PunchUiState.Error).message)
                viewModel.resetPunchState()
            }
            else -> {}
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = stringResource(id = R.string.attendance_title),
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                },
                actions = {
                    IconButton(onClick = { viewModel.refreshLocation() }) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Refresh location",
                            tint = BrandBlue
                        )
                    }
                    IconButton(onClick = {
                        viewModel.logout()
                        onLogout()
                    }) {
                        Icon(
                            imageVector = Icons.Default.ExitToApp,
                            contentDescription = stringResource(id = R.string.logout),
                            tint = ErrorRed
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                )
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Slate50)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Welcome Section
            currentUser?.let { user ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = stringResource(id = R.string.welcome_back, user.username),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate900
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = stringResource(id = R.string.user_role, user.role.removePrefix("ROLE_")),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate700
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Location & Distance Status Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = if (viewModel.isWithinGeofence) SuccessGreen else ErrorRed,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = stringResource(id = R.string.campus_center),
                                fontWeight = FontWeight.Bold,
                                color = Slate900,
                                fontSize = 16.sp
                            )
                            Text(
                                text = stringResource(id = R.string.college_location_label),
                                color = Slate600,
                                fontSize = 12.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    HorizontalDivider(color = Slate50, thickness = 1.dp)

                    Spacer(modifier = Modifier.height(12.dp))

                    if (viewModel.isLocating) {
                        CircularProgressIndicator(
                            color = BrandBlue,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = stringResource(id = R.string.fetching_location),
                            fontSize = 14.sp,
                            color = Slate600
                        )
                    } else if (viewModel.locationError != null) {
                        Text(
                            text = viewModel.locationError ?: "",
                            color = ErrorRed,
                            fontSize = 14.sp,
                            textAlign = TextAlign.Center,
                            fontWeight = FontWeight.Medium
                        )
                    } else {
                        val dist = viewModel.distance
                        if (dist != null) {
                            Text(
                                text = stringResource(id = R.string.current_distance, dist),
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Slate900
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            if (viewModel.latitude != null && viewModel.longitude != null) {
                                Text(
                                    text = stringResource(
                                        id = R.string.current_location_label,
                                        viewModel.latitude!!,
                                        viewModel.longitude!!
                                    ),
                                    fontSize = 12.sp,
                                    color = Slate700
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                            }
                            Text(
                                text = if (viewModel.isWithinGeofence) {
                                    stringResource(id = R.string.within_campus)
                                } else {
                                    stringResource(id = R.string.outside_campus)
                                },
                                color = if (viewModel.isWithinGeofence) SuccessGreen else ErrorRed,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium,
                                textAlign = TextAlign.Center
                            )
                        } else {
                            Text(
                                text = stringResource(id = R.string.distance_unknown),
                                fontSize = 14.sp,
                                color = Slate600
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Large Punch Button
            Button(
                onClick = { viewModel.punch() },
                modifier = Modifier
                    .size(160.dp)
                    .clip(CircleShape),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (viewModel.isWithinGeofence) BrandBlue else Slate600
                ),
                enabled = viewModel.isWithinGeofence && !viewModel.isLocating && punchState !is PunchUiState.Loading,
                shape = CircleShape,
                elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp)
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    if (punchState is PunchUiState.Loading) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(32.dp))
                    } else {
                        Text(
                            text = stringResource(id = R.string.punch_in),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "/ " + stringResource(id = R.string.punch_out),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White.copy(alpha = 0.8f),
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // History Label
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = stringResource(id = R.string.attendance_history),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                if (isRefreshingHistory) {
                    CircularProgressIndicator(color = BrandBlue, modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                } else {
                    IconButton(
                        onClick = { viewModel.loadHistory() },
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Refresh history",
                            tint = Slate700,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // History List
            if (history.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = stringResource(id = R.string.no_history),
                        color = Slate700,
                        fontSize = 14.sp
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(history) { record ->
                        HistoryItem(record = record)
                    }
                }
            }
        }
    }
}

@Composable
fun HistoryItem(record: AttendanceRecord) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = record.attendanceDate,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    record.punchIn?.let {
                        Text(
                            text = stringResource(id = R.string.check_in_at, formatDateTime(it)),
                            fontSize = 12.sp,
                            color = Slate700
                        )
                    }
                    record.punchOut?.let {
                        Text(
                            text = stringResource(id = R.string.check_out_at, formatDateTime(it)),
                            fontSize = 12.sp,
                            color = Slate700
                        )
                    }
                }
                if (record.latitude != null && record.longitude != null) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "GPS: (${String.format("%.4f", record.latitude)}, ${String.format("%.4f", record.longitude)})",
                        fontSize = 10.sp,
                        color = Slate600
                    )
                }
            }

            val statusColor = when (record.status.uppercase()) {
                "PRESENT" -> SuccessGreen
                "ABSENT" -> ErrorRed
                else -> WarningOrange
            }

            Surface(
                color = statusColor.copy(alpha = 0.15f),
                shape = RoundedCornerShape(4.dp),
                modifier = Modifier.padding(start = 8.dp)
            ) {
                Text(
                    text = record.status,
                    color = statusColor,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }
    }
}

private fun formatDateTime(dateTimeStr: String): String {
    return try {
        if (dateTimeStr.contains("T")) {
            val timePart = dateTimeStr.split("T")[1]
            if (timePart.contains(".")) {
                timePart.split(".")[0]
            } else {
                timePart
            }
        } else {
            dateTimeStr
        }
    } catch (e: Exception) {
        dateTimeStr
    }
}
