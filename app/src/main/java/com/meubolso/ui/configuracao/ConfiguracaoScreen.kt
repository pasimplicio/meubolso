package com.meubolso.ui.configuracao

import androidx.compose.foundation.layout.Arrangement  // ADICIONADO
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.meubolso.domain.model.Moeda

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConfiguracaoScreen(
    viewModel: ConfiguracaoViewModel,
    onVoltar: () -> Unit
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var expanded by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Configurações") },
                navigationIcon = {
                    IconButton(onClick = onVoltar) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
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
            Text(
                text = "Preferências",
                style = MaterialTheme.typography.titleLarge
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Moeda Principal
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Moeda Principal",
                    modifier = Modifier.weight(1f)
                )
                OutlinedButton(onClick = { expanded = true }) {
                    Text(state.moedaPrincipal.codigo)
                }
                DropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false }
                ) {
                    Moeda.entries.forEach { moeda ->
                        DropdownMenuItem(
                            text = { Text("${moeda.codigo} - ${moeda.nome}") },
                            onClick = {
                                viewModel.atualizarMoeda(moeda)
                                expanded = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Usar Biometria
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Usar Biometria",
                    modifier = Modifier.weight(1f)
                )
                Switch(
                    checked = state.usarBiometria,
                    onCheckedChange = viewModel::atualizarBiometria
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Notificações
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Notificações",
                    modifier = Modifier.weight(1f)
                )
                Switch(
                    checked = state.notificacoesAtivas,
                    onCheckedChange = viewModel::atualizarNotificacoes
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Dados",
                style = MaterialTheme.typography.titleLarge
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)  // AGORA FUNCIONA
            ) {
                Button(
                    onClick = viewModel::exportarDados,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Exportar")
                }
                Button(
                    onClick = viewModel::importarDados,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Importar")
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)  // AGORA FUNCIONA
            ) {
                OutlinedButton(
                    onClick = viewModel::fazerBackup,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Backup")
                }
                OutlinedButton(
                    onClick = viewModel::restaurarBackup,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Restaurar")
                }
            }
        }
    }
}