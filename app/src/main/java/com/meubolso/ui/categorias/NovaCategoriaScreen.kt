package com.meubolso.ui.categorias

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NovaCategoriaScreen(
    onSalvar: () -> Unit,
    onCancelar: () -> Unit
) {
    var nome by remember { mutableStateOf("") }
    var tipo by remember { mutableStateOf("DESPESA") }
    var corSelecionada by remember { mutableStateOf(Color(0xFFF44336)) }

    val cores = listOf(
        Color(0xFFF44336), // Vermelho
        Color(0xFFFF9800), // Laranja
        Color(0xFFFFEB3B), // Amarelo
        Color(0xFF4CAF50), // Verde
        Color(0xFF2196F3), // Azul
        Color(0xFF9C27B0), // Roxo
        Color(0xFF00BCD4), // Ciano
        Color(0xFF795548)  // Marrom
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Nova Categoria") },
                navigationIcon = {
                    IconButton(onClick = onCancelar) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Cancelar"
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
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Seletor de tipo (Receita/Despesa)
            SingleChoiceSegmentedButtonRow(
                modifier = Modifier.fillMaxWidth()
            ) {
                listOf("RECEITA", "DESPESA").forEachIndexed { index, tipoOpcao ->
                    SegmentedButton(
                        selected = tipo == tipoOpcao,
                        onClick = { tipo = tipoOpcao },
                        shape = SegmentedButtonDefaults.itemShape(
                            index = index,
                            count = 2
                        ),
                        label = {
                            Text(if (tipoOpcao == "RECEITA") "Receita" else "Despesa")
                        }
                    )
                }
            }

            // Campo nome
            OutlinedTextField(
                value = nome,
                onValueChange = { nome = it },
                label = { Text("Nome da categoria") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            // Seletor de cor
            Text(
                text = "Cor da categoria",
                style = MaterialTheme.typography.titleMedium
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                cores.forEach { cor ->
                    IconButton(
                        onClick = { corSelecionada = cor },
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(if (cor == corSelecionada) cor else cor.copy(alpha = 0.3f))
                    ) {
                        if (cor == corSelecionada) {
                            Icon(
                                Icons.Default.Check,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Botões
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = onCancelar,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Cancelar")
                }

                Button(
                    onClick = onSalvar,
                    modifier = Modifier.weight(1f),
                    enabled = nome.isNotBlank()
                ) {
                    Text("Salvar")
                }
            }
        }
    }
}