package com.meubolso.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.meubolso.ui.categorias.CategoriaScreen
import com.meubolso.ui.categorias.NovaCategoriaScreen
import com.meubolso.ui.categoria.CategoriaViewModel
import com.meubolso.ui.configuracao.ConfiguracaoScreen
import com.meubolso.ui.configuracao.ConfiguracaoViewModel
import com.meubolso.ui.dashboard.DashboardScreen
import com.meubolso.ui.dashboard.DashboardViewModel
import com.meubolso.ui.estatisticas.EstatisticasScreen
import com.meubolso.ui.estatisticas.EstatisticasViewModel
import com.meubolso.ui.lembretes.LembretesScreen
import com.meubolso.ui.lembretes.NovoLembreteScreen
import com.meubolso.ui.lembretes.LembreteViewModel
import com.meubolso.ui.relatorios.RelatoriosScreen
import com.meubolso.ui.relatorios.RelatorioViewModel
import com.meubolso.ui.transaction.NovaTransacaoScreen
import com.meubolso.ui.transaction.NovaTransacaoViewModel
import com.meubolso.ui.transaction.TransactionScreen
import com.meubolso.ui.transaction.TransactionViewModel

@Composable
fun NavGraph(
    navController: NavHostController,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Dashboard.route,
        modifier = modifier
    ) {
        // Dashboard com menu lateral
        composable(Screen.Dashboard.route) {
            val viewModel = hiltViewModel<DashboardViewModel>()
            DashboardScreen(
                viewModel = viewModel,
                onNavigateToNovaTransacao = {
                    navController.navigate(Screen.NovaTransacao.route)
                },
                onNavigateToTransacoes = {
                    navController.navigate(Screen.Transacoes.route)
                },
                onNavigateToCategorias = {
                    navController.navigate(Screen.Categorias.route)
                },
                onNavigateToEstatisticas = {
                    navController.navigate(Screen.Estatisticas.route)
                },
                onNavigateToConfiguracao = {
                    navController.navigate(Screen.Configuracao.route)
                },
                onNavigateToLembretes = {
                    navController.navigate(Screen.Lembretes.route)
                },
                onNavigateToRelatorios = {
                    navController.navigate(Screen.Relatorios.route)
                },
                onNavigateToDashboard = {
                    // Já está no dashboard
                }
            )
        }

        // Transações
        composable(Screen.Transacoes.route) {
            val viewModel = hiltViewModel<TransactionViewModel>()
            TransactionScreen(
                viewModel = viewModel,
                onVoltar = { navController.popBackStack() }
            )
        }

        // Nova Transação
        composable(Screen.NovaTransacao.route) {
            val viewModel = hiltViewModel<NovaTransacaoViewModel>()
            NovaTransacaoScreen(
                viewModel = viewModel,
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        // Categorias
        composable(Screen.Categorias.route) {
            val viewModel = hiltViewModel<CategoriaViewModel>()
            CategoriaScreen(
                viewModel = viewModel,
                onNavigateToNovaCategoria = {
                    navController.navigate(Screen.NovaCategoria.route)
                }
            )
        }

        // Nova Categoria
        composable(Screen.NovaCategoria.route) {
            NovaCategoriaScreen(
                onSalvar = {
                    navController.popBackStack()
                },
                onCancelar = {
                    navController.popBackStack()
                }
            )
        }

        // Estatísticas
        composable(Screen.Estatisticas.route) {
            val viewModel = hiltViewModel<EstatisticasViewModel>()
            EstatisticasScreen(
                viewModel = viewModel
            )
        }

        // Configurações
        composable(Screen.Configuracao.route) {
            val viewModel = hiltViewModel<ConfiguracaoViewModel>()
            ConfiguracaoScreen(
                viewModel = viewModel,
                onVoltar = { navController.popBackStack() }
            )
        }

        // Lembretes
        composable(Screen.Lembretes.route) {
            val viewModel = hiltViewModel<LembreteViewModel>()
            LembretesScreen(
                viewModel = viewModel,
                onVoltar = { navController.popBackStack() },
                onNovoLembrete = {
                    navController.navigate(Screen.NovoLembrete.route)
                }
            )
        }

        // Novo Lembrete
        composable(Screen.NovoLembrete.route) {
            val viewModel = hiltViewModel<LembreteViewModel>()
            NovoLembreteScreen(
                onSalvar = { descricao, valor, periodicidade, data ->
                    viewModel.salvarLembrete(descricao, valor, periodicidade, data)
                    navController.popBackStack()
                },
                onCancelar = {
                    navController.popBackStack()
                }
            )
        }

        // Relatórios
        composable(Screen.Relatorios.route) {
            val viewModel = hiltViewModel<RelatorioViewModel>()
            RelatoriosScreen(
                viewModel = viewModel,
                onVoltar = { navController.popBackStack() }
            )
        }
    }
}