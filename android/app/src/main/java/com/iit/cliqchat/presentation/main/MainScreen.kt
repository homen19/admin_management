package com.iit.cliqchat.presentation.main

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.iit.cliqchat.presentation.attendance.AttendanceScreen
import com.iit.cliqchat.presentation.attendance.AttendanceViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    attendanceViewModel: AttendanceViewModel = hiltViewModel(),
    onLogout: () -> Unit,
    onNavigateToChatDetail: (String) -> Unit // For when we build ChatListScreen
) {
    var selectedItem by remember { mutableStateOf(0) }
    val items = listOf("Chat", "Attendance", "Profile")
    val icons = listOf(Icons.Filled.Chat, Icons.Filled.DateRange, Icons.Filled.Person)

    Scaffold(
        bottomBar = {
            NavigationBar {
                items.forEachIndexed { index, item ->
                    NavigationBarItem(
                        icon = { Icon(icons[index], contentDescription = item) },
                        label = { Text(item) },
                        selected = selectedItem == index,
                        onClick = { selectedItem = index }
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues)) {
            when (selectedItem) {
                0 -> {
                    val chatViewModel: com.iit.cliqchat.presentation.chat.ChatViewModel = hiltViewModel()
                    com.iit.cliqchat.presentation.chat.ChatListScreen(
                        viewModel = chatViewModel,
                        onNavigateToChatDetail = onNavigateToChatDetail
                    )
                }
                1 -> {
                    AttendanceScreen(
                        viewModel = attendanceViewModel,
                        onLogout = onLogout // In future we might only have logout in Profile
                    )
                }
                2 -> {
                    // ProfileScreen placeholder
                    Box(modifier = Modifier.padding(16.dp)) {
                        Button(onClick = onLogout) {
                            Text("Log Out")
                        }
                    }
                }
            }
        }
    }
}
