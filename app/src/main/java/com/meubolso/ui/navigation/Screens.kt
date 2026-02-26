package com.meubolso.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Dashboard : Screen("dashboard", "Resumo")
    object Transacoes : Screen("transacoes", "Transações")
    object Estatisticas : Screen("estatisticas", "Estatísticas")
    object Categorias : Screen("categorias", "Categorias")
    object Configuracao : Screen("configuracao", "Configurações")
    object NovaTransacao : Screen("nova_transacao", "Nova Transação")
    object NovaCategoria : Screen("nova_categoria", "Nova Categoria")
    object Lembretes : Screen("lembretes", "Lembretes")
    object NovoLembrete : Screen("novo_lembrete", "Novo Lembrete")
    object Relatorios : Screen("relatorios", "Relatórios")
}