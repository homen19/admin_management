package com.iit.attendance.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.iit.attendance.presentation.attendance.AttendanceScreen
import com.iit.attendance.presentation.attendance.AttendanceViewModel
import com.iit.attendance.presentation.login.LoginScreen
import com.iit.attendance.presentation.login.LoginViewModel

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Attendance : Screen("attendance")
}

@Composable
fun NavGraph(
    navController: NavHostController,
    attendanceViewModel: AttendanceViewModel = hiltViewModel()
) {
    val currentUser by attendanceViewModel.currentUser.collectAsState()
    val startDestination = if (currentUser != null) Screen.Attendance.route else Screen.Login.route

    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Login.route) {
            val loginViewModel: LoginViewModel = hiltViewModel()
            LoginScreen(
                viewModel = loginViewModel,
                onLoginSuccess = {
                    navController.navigate(Screen.Attendance.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }
        composable(Screen.Attendance.route) {
            AttendanceScreen(
                viewModel = attendanceViewModel,
                onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Attendance.route) { inclusive = true }
                    }
                }
            )
        }
    }
}
