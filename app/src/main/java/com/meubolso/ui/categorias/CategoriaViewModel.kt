package com.meubolso.ui.categoria

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.meubolso.domain.model.Categoria
import com.meubolso.domain.model.TipoCategoria
import com.meubolso.domain.repository.ICategoriaRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CategoriaUiState(
    val tipoSelecionado: TipoCategoria = TipoCategoria.DESPESA,
    val categorias: List<Categoria> = emptyList(),
    val isLoading: Boolean = false
)

@HiltViewModel
class CategoriaViewModel @Inject constructor(
    private val repository: ICategoriaRepository
) : ViewModel() {

    private val _state = MutableStateFlow(CategoriaUiState(isLoading = true))
    val state: StateFlow<CategoriaUiState> = _state

    init {
        carregar(TipoCategoria.DESPESA)
    }

    fun carregar(tipo: TipoCategoria) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            try {
                val categorias = repository.listarPorTipo(tipo).first()
                _state.update {
                    it.copy(
                        tipoSelecionado = tipo,
                        categorias = categorias,
                        isLoading = false
                    )
                }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false) }
            }
        }
    }
}