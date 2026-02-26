package com.meubolso.ui.transaction

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.meubolso.domain.model.TipoTransacao
import com.meubolso.domain.model.Transacao
import com.meubolso.domain.model.TipoCategoria  // ADICIONADO: Import do TipoCategoria
import com.meubolso.domain.repository.ICategoriaRepository
import com.meubolso.domain.repository.TransacaoRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class NovaTransacaoUiState(
    val tipo: TipoTransacao = TipoTransacao.DESPESA,
    val descricao: String = "",
    val valor: String = "",
    val categoriaId: Long = 0,
    val data: Long = System.currentTimeMillis(),
    val observacao: String = "",
    val categorias: List<Pair<Long, String>> = emptyList(),
    val isLoading: Boolean = false,
    val isSaving: Boolean = false
)

@HiltViewModel
class NovaTransacaoViewModel @Inject constructor(
    private val transacaoRepository: TransacaoRepository,
    private val categoriaRepository: ICategoriaRepository
) : ViewModel() {

    private val _state = MutableStateFlow(NovaTransacaoUiState(isLoading = true))
    val state: StateFlow<NovaTransacaoUiState> = _state

    init {
        carregarCategorias()
    }

    private fun carregarCategorias() {
        viewModelScope.launch {
            // CORRIGIDO: Convertendo TipoTransacao para TipoCategoria
            val tipoCategoria = when (state.value.tipo) {
                TipoTransacao.RECEITA -> TipoCategoria.RECEITA
                TipoTransacao.DESPESA -> TipoCategoria.DESPESA
            }

            categoriaRepository.listarPorTipo(tipoCategoria).collect { categorias ->
                val pares = categorias.map { it.id to it.nome }
                _state.update {
                    it.copy(
                        categorias = pares,
                        isLoading = false
                    )
                }
            }
        }
    }

    fun onTipoChange(novoTipo: TipoTransacao) {
        _state.update { it.copy(tipo = novoTipo) }
        // Recarrega categorias do tipo selecionado
        viewModelScope.launch {
            // CORRIGIDO: Convertendo TipoTransacao para TipoCategoria
            val tipoCategoria = when (novoTipo) {
                TipoTransacao.RECEITA -> TipoCategoria.RECEITA
                TipoTransacao.DESPESA -> TipoCategoria.DESPESA
            }

            categoriaRepository.listarPorTipo(tipoCategoria).collect { categorias ->
                val pares = categorias.map { it.id to it.nome }
                _state.update { it.copy(categorias = pares) }
            }
        }
    }

    fun onDescricaoChange(novaDescricao: String) {
        _state.update { it.copy(descricao = novaDescricao) }
    }

    fun onValorChange(novoValor: String) {
        // Aceita apenas números e uma vírgula/ponto
        if (novoValor.isEmpty() || novoValor.matches(Regex("^\\d*[.,]?\\d*$"))) {
            _state.update { it.copy(valor = novoValor) }
        }
    }

    fun onCategoriaChange(novaCategoriaId: Long) {
        _state.update { it.copy(categoriaId = novaCategoriaId) }
    }

    fun onDataChange(novaData: Long) {
        _state.update { it.copy(data = novaData) }
    }

    fun onObservacaoChange(novaObservacao: String) {
        _state.update { it.copy(observacao = novaObservacao) }
    }

    fun salvarTransacao(onSuccess: () -> Unit) {
        viewModelScope.launch {
            _state.update { it.copy(isSaving = true) }

            val valorNumerico = state.value.valor.replace(',', '.').toDoubleOrNull() ?: 0.0
            if (state.value.descricao.isNotBlank() && valorNumerico > 0) {
                val transacao = Transacao(
                    tipo = state.value.tipo,
                    descricao = state.value.descricao,
                    valor = valorNumerico,
                    data = state.value.data,
                    categoriaId = state.value.categoriaId,
                    observacao = state.value.observacao.ifBlank { null }
                )
                try {
                    transacaoRepository.inserir(transacao)
                    onSuccess()
                } catch (e: Exception) {
                    e.printStackTrace()
                } finally {
                    _state.update { it.copy(isSaving = false) }
                }
            } else {
                _state.update { it.copy(isSaving = false) }
            }
        }
    }
}