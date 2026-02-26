package com.meubolso.ui.transaction

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.meubolso.domain.model.Transacao
import com.meubolso.domain.repository.TransacaoRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TransactionState(
    val transacoes: List<Transacao> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

@HiltViewModel
class TransactionViewModel @Inject constructor(
    private val repository: TransacaoRepository
) : ViewModel() {

    private val _state = MutableStateFlow(TransactionState(isLoading = true))
    val state: StateFlow<TransactionState> = _state

    init {
        carregarTransacoes()
    }

    private fun carregarTransacoes() {
        viewModelScope.launch {
            repository.listarTodas().collect { lista ->
                _state.update {
                    it.copy(
                        transacoes = lista,
                        isLoading = false
                    )
                }
            }
        }
    }
}