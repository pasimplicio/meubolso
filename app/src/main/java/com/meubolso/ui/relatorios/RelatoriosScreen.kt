package com.meubolso.ui.relatorios

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width  // Import correto
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.meubolso.domain.model.TipoTransacao
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class PeriodoRelatorio { DIA, SEMANA, MES, ANO }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RelatoriosScreen(
    viewModel: RelatorioViewModel = hiltViewModel(),
    onVoltar: () -> Unit
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var periodoSelecionado by remember { mutableStateOf(PeriodoRelatorio.MES) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Relatórios") },
                navigationIcon = {
                    IconButton(onClick = onVoltar) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Voltar"
                        )
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
        ) {
            // Seletor de período
            SingleChoiceSegmentedButtonRow(
                modifier = Modifier.fillMaxWidth()
            ) {
                PeriodoRelatorio.entries.forEachIndexed { index, periodo ->
                    SegmentedButton(
                        shape = SegmentedButtonDefaults.itemShape(
                            index = index,
                            count = PeriodoRelatorio.entries.size
                        ),
                        onClick = {
                            periodoSelecionado = periodo
                            viewModel.carregarPorPeriodo(periodo)
                        },
                        selected = periodoSelecionado == periodo,
                        label = { Text(periodo.name) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Cards de resumo
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ResumoCardRelatorio(
                    titulo = "Receitas",
                    valor = state.totalReceitas,
                    cor = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.weight(1f)
                )
                ResumoCardRelatorio(
                    titulo = "Despesas",
                    valor = state.totalDespesas,
                    cor = MaterialTheme.colorScheme.error,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Text(
                        text = "Saldo do período",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = "R$ ${String.format("%.2f", state.saldoPeriodo)}",
                        style = MaterialTheme.typography.headlineSmall,
                        color = if (state.saldoPeriodo >= 0)
                            MaterialTheme.colorScheme.primary
                        else
                            MaterialTheme.colorScheme.error
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Transações do período",
                style = MaterialTheme.typography.titleLarge
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Lista de transações
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                items(state.transacoes) { transacao ->
                    RelatorioTransacaoItem(
                        descricao = transacao.descricao,
                        valor = transacao.valor,
                        tipo = transacao.tipo,
                        data = transacao.data
                    )
                }
            }
        }
    }
}

@Composable
fun ResumoCardRelatorio(
    titulo: String,
    valor: Double,
    cor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = cor.copy(alpha = 0.1f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = titulo,
                style = MaterialTheme.typography.labelLarge,
                color = cor
            )
            Text(
                text = "R$ ${String.format("%.2f", valor)}",
                style = MaterialTheme.typography.titleMedium,
                color = cor
            )
        }
    }
}

@Composable
fun RelatorioTransacaoItem(
    descricao: String,
    valor: Double,
    tipo: TipoTransacao,
    data: Long
) {
    val cor = if (tipo == TipoTransacao.RECEITA)
        MaterialTheme.colorScheme.primary
    else
        MaterialTheme.colorScheme.error

    val sinal = if (tipo == TipoTransacao.RECEITA) "+" else "-"
    val dateFormat = SimpleDateFormat("dd/MM", Locale.getDefault())
    val dataStr = dateFormat.format(Date(data))

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = dataStr,
            style = MaterialTheme.typography.bodySmall,
            modifier = Modifier.width(40.dp)
        )
        Text(
            text = descricao,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = "$sinal R$ ${String.format("%.2f", valor)}",
            style = MaterialTheme.typography.bodyMedium,
            color = cor
        )
    }
}