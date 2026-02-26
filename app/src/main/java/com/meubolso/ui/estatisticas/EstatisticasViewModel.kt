package com.meubolso.ui.estatisticas

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.meubolso.domain.model.TipoTransacao
import com.meubolso.domain.repository.TransacaoRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.Calendar
import javax.inject.Inject

enum class Periodo { SEMANA, MES, ANO }

data class PontoGrafico(val x: Float, val y: Float)
data class DadosCategoria(val categoria: String, val total: Float)

data class EstatisticasState(
    val periodo: Periodo = Periodo.MES,
    val serieSaldo: List<PontoGrafico> = emptyList(),
    val dadosCategoria: List<DadosCategoria> = emptyList(),
    val isLoading: Boolean = false
)

@HiltViewModel
class EstatisticasViewModel @Inject constructor(
    private val repository: TransacaoRepository
) : ViewModel() {

    private val _state = MutableStateFlow(EstatisticasState(isLoading = true))
    val state: StateFlow<EstatisticasState> = _state

    init {
        carregarDados()
    }

    fun selecionarPeriodo(novoPeriodo: Periodo) {
        _state.update { it.copy(periodo = novoPeriodo, isLoading = true) }
        carregarDados()
    }

    private fun carregarDados() {
        viewModelScope.launch {
            // Calcular timestamps do período
            val (inicio, fim) = when (state.value.periodo) {
                Periodo.SEMANA -> getWeekRange()
                Periodo.MES -> getMonthRange()
                Periodo.ANO -> getYearRange()
            }

            // Buscar transações do período
            repository.listarTodas().collect { transacoes ->
                val transacoesNoPeriodo = transacoes.filter { it.data in inicio..fim }

                // Agrupar por categoria (simplificado - sem nome da categoria)
                val gastosPorCategoria = transacoesNoPeriodo
                    .filter { it.tipo == TipoTransacao.DESPESA }
                    .groupBy { it.categoriaId.toString() } // Usando ID como nome
                    .map { (categoriaId, lista) ->
                        DadosCategoria("Cat $categoriaId", lista.sumOf { it.valor }.toFloat())
                    }

                // Dados de exemplo para saldo ao longo do tempo (seria melhor com data)
                val pontos = listOf(
                    PontoGrafico(0f, 1000f),
                    PontoGrafico(1f, 1200f),
                    PontoGrafico(2f, 900f),
                )

                _state.update {
                    it.copy(
                        dadosCategoria = gastosPorCategoria,
                        serieSaldo = pontos,
                        isLoading = false
                    )
                }
            }
        }
    }

    private fun getWeekRange(): Pair<Long, Long> {
        val cal = Calendar.getInstance()
        cal.set(Calendar.DAY_OF_WEEK, cal.firstDayOfWeek)
        val inicio = cal.timeInMillis
        cal.add(Calendar.DAY_OF_WEEK, 6)
        val fim = cal.timeInMillis
        return inicio to fim
    }

    private fun getMonthRange(): Pair<Long, Long> {
        val cal = Calendar.getInstance()
        cal.set(Calendar.DAY_OF_MONTH, 1)
        val inicio = cal.timeInMillis
        cal.add(Calendar.MONTH, 1)
        cal.add(Calendar.DAY_OF_MONTH, -1)
        val fim = cal.timeInMillis
        return inicio to fim
    }

    private fun getYearRange(): Pair<Long, Long> {
        val cal = Calendar.getInstance()
        cal.set(Calendar.DAY_OF_YEAR, 1)
        val inicio = cal.timeInMillis
        cal.add(Calendar.YEAR, 1)
        cal.add(Calendar.DAY_OF_YEAR, -1)
        val fim = cal.timeInMillis
        return inicio to fim
    }
}