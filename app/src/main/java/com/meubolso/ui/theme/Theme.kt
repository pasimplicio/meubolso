package com.meubolso.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = VerdePrincipal,
    onPrimary = Color.White,
    primaryContainer = VerdeMedio,
    onPrimaryContainer = Color.White,
    secondary = DouradoPrincipal,
    onSecondary = VerdeEscuro,
    secondaryContainer = DouradoEscuro,
    onSecondaryContainer = Color.White,
    tertiary = AzulMedio,
    onTertiary = Color.White,
    tertiaryContainer = AzulClaro,
    onTertiaryContainer = VerdeEscuro,
    background = VerdeEscuro,
    onBackground = BrancoSuave,
    surface = AzulEscuro,
    onSurface = BrancoSuave,
    surfaceVariant = VerdeMedio,
    onSurfaceVariant = CinzaClaro,
    error = Despesa,
    onError = Color.White
)

private val LightColorScheme = lightColorScheme(
    primary = VerdePrincipal,
    onPrimary = Color.White,
    primaryContainer = VerdeClaro,
    onPrimaryContainer = VerdeEscuro,
    secondary = DouradoPrincipal,
    onSecondary = VerdeEscuro,
    secondaryContainer = AmareloClaro,
    onSecondaryContainer = VerdeEscuro,
    tertiary = AzulMedio,
    onTertiary = Color.White,
    tertiaryContainer = AzulClaro,
    onTertiaryContainer = VerdeEscuro,
    background = BrancoSuave,
    onBackground = VerdeEscuro,
    surface = Color.White,
    onSurface = VerdeEscuro,
    surfaceVariant = CinzaClaro,
    onSurfaceVariant = CinzaEscuro,
    error = Despesa,
    onError = Color.White
)

@Composable
fun MeubolsoTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}