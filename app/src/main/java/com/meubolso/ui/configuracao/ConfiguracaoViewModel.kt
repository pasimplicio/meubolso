package com.meubolso.ui.configuracao

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.meubolso.domain.model.Moeda
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ConfiguracaoState(
    val moedaPrincipal: Moeda = Moeda.BRL,
    val usarBiometria: Boolean = false,
    val notificacoesAtivas: Boolean = true,
    val formatoData: String = "dd/MM/yyyy",
    val primeiraSegundaDoMes: Boolean = false,
    val isLoading: Boolean = false
)

@HiltViewModel
class ConfiguracaoViewModel @Inject constructor(
) : ViewModel() {

    private val _state = MutableStateFlow(ConfiguracaoState())
    val state: StateFlow<ConfiguracaoState> = _state.asStateFlow()

    private val _evento = MutableSharedFlow<ConfiguracaoEvento>()
    val evento = _evento.asSharedFlow()

    init {
        carregarConfiguracoes()
    }

    private fun carregarConfiguracoes() {
        // TODO: Carregar do DataStore
    }

    fun atualizarMoeda(moeda: Moeda) {
        _state.update { it.copy(moedaPrincipal = moeda) }
        salvarConfiguracao()
    }

    fun atualizarBiometria(usar: Boolean) {
        _state.update { it.copy(usarBiometria = usar) }
        salvarConfiguracao()
    }

    fun atualizarNotificacoes(ativas: Boolean) {
        _state.update { it.copy(notificacoesAtivas = ativas) }
        salvarConfiguracao()
    }

    fun atualizarFormatoData(formato: String) {
        _state.update { it.copy(formatoData = formato) }
        salvarConfiguracao()
    }

    fun atualizarPrimeiraSegundaDoMes(valor: Boolean) {
        _state.update { it.copy(primeiraSegundaDoMes = valor) }
        salvarConfiguracao()
    }

    fun exportarDados() {
        viewModelScope.launch {
            _evento.emit(ConfiguracaoEvento.MostrarMensagem("Exportando dados..."))
        }
    }

    fun importarDados() {
        viewModelScope.launch {
            _evento.emit(ConfiguracaoEvento.MostrarMensagem("Importando dados..."))
        }
    }

    fun fazerBackup() {
        viewModelScope.launch {
            _evento.emit(ConfiguracaoEvento.MostrarMensagem("Backup realizado com sucesso"))
        }
    }

    fun restaurarBackup() {
        viewModelScope.launch {
            _evento.emit(ConfiguracaoEvento.MostrarMensagem("Restaurando backup..."))
        }
    }

    private fun salvarConfiguracao() {
        // TODO: Salvar no DataStore
    }

    sealed class ConfiguracaoEvento {
        data class MostrarMensagem(val mensagem: String) : ConfiguracaoEvento()
    }
}