package com.meubolso.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.currentBackStackEntryAsState

@Composable
fun MeubolsoApp(
    navController: NavHostController
) {
    Scaffold(
        bottomBar = {
            val currentDestination = navController.currentBackStackEntryAsState().value?.destination
            val showBottomNav = currentDestination?.route in listOf(
                Screen.Dashboard.route,
                Screen.Transacoes.route,
                Screen.Estatisticas.route,
                Screen.Categorias.route,
                Screen.Configuracao.route
            )

            if (showBottomNav) {
                BottomNavigationBar(navController = navController)
            }
        }
    ) { innerPadding ->
        NavGraph(
            navController = navController,
            modifier = Modifier.padding(innerPadding)
        )
    }
}