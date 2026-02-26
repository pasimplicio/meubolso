package com.meubolso.ui.lembretes

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.meubolso.domain.model.Lembrete
import com.meubolso.domain.repository.ILembreteRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LembreteUiState(
    val lembretes: List<Lembrete> = emptyList(),
    val isLoading: Boolean = false
)

@HiltViewModel
class LembreteViewModel @Inject constructor(
    private val repository: ILembreteRepository
) : ViewModel() {

    private val _state = MutableStateFlow(LembreteUiState(isLoading = true))
    val state: StateFlow<LembreteUiState> = _state

    init {
        carregarLembretes()
    }

    private fun carregarLembretes() {
        viewModelScope.launch {
            repository.listarTodos().collect { lista ->
                _state.update {
                    it.copy(
                        lembretes = lista,
                        isLoading = false
                    )
                }
            }
        }
    }

    fun toggleAtivo(lembrete: Lembrete) {
        viewModelScope.launch {
            val novoLembrete = lembrete.copy(ativo = !lembrete.ativo)
            repository.atualizar(novoLembrete)
        }
    }

    fun salvarLembrete(descricao: String, valor: Double, periodicidade: String, data: Long) {
        viewModelScope.launch {
            val lembrete = Lembrete(
                descricao = descricao,
                valor = valor,
                categoriaId = 0, // Idealmente selecionada pelo usuário
                dataProximo = data,
                periodicidade = periodicidade,
                ativo = true,
                notificacaoAntecipada = 1 // 1 dia antes
            )
            repository.inserir(lembrete)
        }
    }
}