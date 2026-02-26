package com.meubolso.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.meubolso.domain.model.TipoTransacao
import com.meubolso.domain.model.Transacao
import com.meubolso.domain.repository.TransacaoRepository
import com.meubolso.domain.usecase.CalcularSaldoUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val repository: TransacaoRepository
) : ViewModel() {

    private val calcularSaldoUseCase = CalcularSaldoUseCase()

    private val _state = MutableStateFlow(DashboardState(isLoading = true))
    val state: StateFlow<DashboardState> = _state

    init {
        viewModelScope.launch {
            repository.listarTodas().collect { lista ->
                val saldo = calcularSaldoUseCase.execute(lista)
                val receitas = lista.filter { it.tipo == TipoTransacao.RECEITA }.sumOf { it.valor }
                val despesas = lista.filter { it.tipo == TipoTransacao.DESPESA }.sumOf { it.valor }
                _state.update {
                    it.copy(
                        saldo = saldo,
                        totalReceitas = receitas,
                        totalDespesas = despesas,
                        transacoesRecentes = lista.take(10), // Pega as 10 mais recentes
                        isLoading = false,
                        errorMessage = null
                    )
                }
            }
        }
    }
}