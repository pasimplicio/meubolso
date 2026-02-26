package com.meubolso.ui.relatorios

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.meubolso.domain.model.TipoTransacao
import com.meubolso.domain.model.Transacao
import com.meubolso.domain.repository.TransacaoRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.Calendar
import javax.inject.Inject

data class RelatorioUiState(
    val transacoes: List<Transacao> = emptyList(),
    val totalReceitas: Double = 0.0,
    val totalDespesas: Double = 0.0,
    val saldoPeriodo: Double = 0.0,
    val isLoading: Boolean = false
)

@HiltViewModel
class RelatorioViewModel @Inject constructor(
    private val repository: TransacaoRepository
) : ViewModel() {

    private val _state = MutableStateFlow(RelatorioUiState(isLoading = true))
    val state: StateFlow<RelatorioUiState> = _state

    init {
        carregarPorPeriodo(PeriodoRelatorio.MES)
    }

    fun carregarPorPeriodo(periodo: PeriodoRelatorio) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }

            val (inicio, fim) = when (periodo) {
                PeriodoRelatorio.DIA -> getDiaRange()
                PeriodoRelatorio.SEMANA -> getSemanaRange()
                PeriodoRelatorio.MES -> getMesRange()
                PeriodoRelatorio.ANO -> getAnoRange()
            }

            repository.listarTodas().collect { todas ->
                val transacoes = todas.filter { it.data in inicio..fim }
                val receitas = transacoes.filter { it.tipo == TipoTransacao.RECEITA }
                val despesas = transacoes.filter { it.tipo == TipoTransacao.DESPESA }

                val totalReceitas = receitas.sumOf { it.valor }
                val totalDespesas = despesas.sumOf { it.valor }
                val saldo = totalReceitas - totalDespesas

                _state.update {
                    it.copy(
                        transacoes = transacoes,
                        totalReceitas = totalReceitas,
                        totalDespesas = totalDespesas,
                        saldoPeriodo = saldo,
                        isLoading = false
                    )
                }
            }
        }
    }

    private fun getDiaRange(): Pair<Long, Long> {
        val cal = Calendar.getInstance()
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        cal.set(Calendar.MILLISECOND, 0)
        val inicio = cal.timeInMillis
        cal.set(Calendar.HOUR_OF_DAY, 23)
        cal.set(Calendar.MINUTE, 59)
        cal.set(Calendar.SECOND, 59)
        val fim = cal.timeInMillis
        return inicio to fim
    }

    private fun getSemanaRange(): Pair<Long, Long> {
        val cal = Calendar.getInstance()
        cal.set(Calendar.DAY_OF_WEEK, cal.firstDayOfWeek)
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        val inicio = cal.timeInMillis
        cal.add(Calendar.DAY_OF_WEEK, 6)
        cal.set(Calendar.HOUR_OF_DAY, 23)
        cal.set(Calendar.MINUTE, 59)
        cal.set(Calendar.SECOND, 59)
        val fim = cal.timeInMillis
        return inicio to fim
    }

    private fun getMesRange(): Pair<Long, Long> {
        val cal = Calendar.getInstance()
        cal.set(Calendar.DAY_OF_MONTH, 1)
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        val inicio = cal.timeInMillis
        cal.add(Calendar.MONTH, 1)
        cal.add(Calendar.DAY_OF_MONTH, -1)
        cal.set(Calendar.HOUR_OF_DAY, 23)
        cal.set(Calendar.MINUTE, 59)
        cal.set(Calendar.SECOND, 59)
        val fim = cal.timeInMillis
        return inicio to fim
    }

    private fun getAnoRange(): Pair<Long, Long> {
        val cal = Calendar.getInstance()
        cal.set(Calendar.DAY_OF_YEAR, 1)
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        val inicio = cal.timeInMillis
        cal.add(Calendar.YEAR, 1)
        cal.add(Calendar.DAY_OF_YEAR, -1)
        cal.set(Calendar.HOUR_OF_DAY, 23)
        cal.set(Calendar.MINUTE, 59)
        cal.set(Calendar.SECOND, 59)
        val fim = cal.timeInMillis
        return inicio to fim
    }
}