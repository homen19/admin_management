package com.iit.cliqchat.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.iit.cliqchat.presentation.attendance.AttendanceScreen
import com.iit.cliqchat.presentation.attendance.AttendanceViewModel
import com.iit.cliqchat.presentation.login.LoginScreen
import com.iit.cliqchat.presentation.login.LoginViewModel
import com.iit.cliqchat.presentation.main.MainScreen

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Main : Screen("main")
    object ChatDetail : Screen("chat/{channelId}") {
        fun createRoute(channelId: String) = "chat/$channelId"
    }
}

@Composable
fun NavGraph(
    navController: NavHostController,
    attendanceViewModel: AttendanceViewModel = hiltViewModel()
) {
    val currentUser by attendanceViewModel.currentUser.collectAsState()
    val startDestination = if (currentUser != null) Screen.Main.route else Screen.Login.route

    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Login.route) {
            val loginViewModel: LoginViewModel = hiltViewModel()
            LoginScreen(
                viewModel = loginViewModel,
                onLoginSuccess = {
                    navController.navigate(Screen.Main.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }
        composable(Screen.Main.route) {
            MainScreen(
                attendanceViewModel = attendanceViewModel,
                onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Main.route) { inclusive = true }
                    }
                },
                onNavigateToChatDetail = { channelId ->
                    navController.navigate(Screen.ChatDetail.createRoute(channelId))
                }
            )
        }
        composable(Screen.ChatDetail.route) { backStackEntry ->
            val channelId = backStackEntry.arguments?.getString("channelId") ?: ""
            val chatViewModel: com.iit.cliqchat.presentation.chat.ChatViewModel = hiltViewModel()
            com.iit.cliqchat.presentation.chat.ChatDetailScreen(
                channelId = channelId,
                viewModel = chatViewModel,
                onBack = { navController.popBackStack() }
            )
        }
    }
}
