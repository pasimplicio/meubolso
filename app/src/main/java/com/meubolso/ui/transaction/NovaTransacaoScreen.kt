package com.meubolso.ui.transaction

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.meubolso.domain.model.TipoTransacao
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NovaTransacaoScreen(
    viewModel: NovaTransacaoViewModel,
    onNavigateBack: () -> Unit
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var showDatePicker by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Nova Transação") },
                navigationIcon = {
                    OutlinedButton(onClick = onNavigateBack) {
                        Text("Cancelar")
                    }
                }
            )
        }
    ) { innerPadding ->
        if (state.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Segmented buttons para tipo
                SingleChoiceSegmentedButtonRow(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    TipoTransacao.entries.forEachIndexed { index, tipo ->
                        SegmentedButton(
                            shape = SegmentedButtonDefaults.itemShape(
                                index = index,
                                count = TipoTransacao.entries.size
                            ),
                            onClick = { viewModel.onTipoChange(tipo) },
                            selected = state.tipo == tipo,
                            label = { Text(if (tipo == TipoTransacao.RECEITA) "Receita" else "Despesa") }
                        )
                    }
                }

                // Campo descrição
                OutlinedTextField(
                    value = state.descricao,
                    onValueChange = viewModel::onDescricaoChange,
                    label = { Text("Descrição") },
                    modifier = Modifier.fillMaxWidth(),
                    isError = state.descricao.isBlank()
                )

                // Campo valor
                OutlinedTextField(
                    value = state.valor,
                    onValueChange = viewModel::onValorChange,
                    label = { Text("Valor") },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    isError = state.valor.isBlank()
                )

                // Dropdown categoria
                CategoriaDropdown(
                    categorias = state.categorias,
                    selectedCategoriaId = state.categoriaId,
                    onCategoriaChange = viewModel::onCategoriaChange
                )

                // Campo data (read-only com botão)
                OutlinedTextField(
                    value = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault()).format(Date(state.data)),
                    onValueChange = {},
                    label = { Text("Data") },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = false,
                    trailingIcon = {
                        OutlinedButton(onClick = { showDatePicker = true }) {
                            Text("Selecionar")
                        }
                    }
                )

                // Date picker dialog
                if (showDatePicker) {
                    DatePickerModal(
                        onDateSelected = { novaData ->
                            viewModel.onDataChange(novaData ?: System.currentTimeMillis())
                            showDatePicker = false
                        },
                        onDismiss = { showDatePicker = false }
                    )
                }

                // Campo observação
                OutlinedTextField(
                    value = state.observacao,
                    onValueChange = viewModel::onObservacaoChange,
                    label = { Text("Observação (opcional)") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.weight(1f))

                // Botão salvar
                Button(
                    onClick = {
                        viewModel.salvarTransacao(onNavigateBack)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !state.isSaving && state.descricao.isNotBlank() && state.valor.isNotBlank()
                ) {
                    if (state.isSaving) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    } else {
                        Text("Salvar")
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoriaDropdown(
    categorias: List<Pair<Long, String>>,
    selectedCategoriaId: Long,
    onCategoriaChange: (Long) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    val selectedCategoria = categorias.find { it.first == selectedCategoriaId }?.second ?: "Selecione uma categoria"

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = !expanded }
    ) {
        OutlinedTextField(
            value = selectedCategoria,
            onValueChange = {},
            readOnly = true,
            label = { Text("Categoria") },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
            modifier = Modifier
                .fillMaxWidth()
                .menuAnchor()
        )
        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            categorias.forEach { (id, nome) ->
                DropdownMenuItem(
                    text = { Text(nome) },
                    onClick = {
                        onCategoriaChange(id)
                        expanded = false
                    }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DatePickerModal(
    onDateSelected: (Long?) -> Unit,
    onDismiss: () -> Unit
) {
    val datePickerState = rememberDatePickerState()
    DatePickerDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(onClick = {
                onDateSelected(datePickerState.selectedDateMillis)
            }) {
                Text("OK")
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    ) {
        DatePicker(state = datePickerState)
    }
}