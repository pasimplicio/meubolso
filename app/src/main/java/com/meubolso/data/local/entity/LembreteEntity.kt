package com.meubolso.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "lembretes")
data class LembreteEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val descricao: String,
    val valor: Double,
    val categoriaId: Long,
    val dataProximo: Long,
    val periodicidade: String,
    val ativo: Boolean = true,
    val notificacaoAntecipada: Int = 0
)