package com.iit.attendance.presentation.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = BrandBlueLight,
    onPrimary = Slate900,
    secondary = TealAccent,
    background = Slate900,
    surface = Slate800,
    onBackground = Slate50,
    onSurface = Slate50,
    error = ErrorRed
)

private val LightColorScheme = lightColorScheme(
    primary = BrandBlue,
    onPrimary = Slate50,
    secondary = TealAccent,
    background = Slate50,
    surface = androidx.compose.ui.graphics.Color.White,
    onBackground = Slate900,
    onSurface = Slate900,
    error = ErrorRed
)

@Composable
fun IITAttendanceTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
