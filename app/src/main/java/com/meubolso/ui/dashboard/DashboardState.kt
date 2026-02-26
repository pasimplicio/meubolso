package com.meubolso.ui.dashboard

import com.meubolso.domain.model.Transacao

data class DashboardState(
    val saldo: Double = 0.0,
    val totalReceitas: Double = 0.0,
    val totalDespesas: Double = 0.0,
    val transacoesRecentes: List<Transacao> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)