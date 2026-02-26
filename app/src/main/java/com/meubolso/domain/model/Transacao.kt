package com.meubolso.domain.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import java.util.*

@Parcelize
data class Transacao(
    val id: String = UUID.randomUUID().toString(),
    val categoriaId: Long = 0,  // Valor padrão temporário
    val tipo: TipoTransacao,
    val descricao: String,
    val valor: Double,
    val data: Long,
    val moeda: String = "BRL",
    val observacao: String? = null,
    val isRecorrente: Boolean = false,
    val recorrenciaId: String? = null
) : Parcelable