package com.meubolso.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Index

@Entity(
    tableName = "transacoes",
    indices = [Index("data")]
)
data class TransacaoEntity(
    @PrimaryKey val id: String,
    val categoriaId: Long = 0,
    val tipo: String,
    val descricao: String,
    val valor: Double,
    val data: Long,
    val moeda: String = "BRL",
    val observacao: String? = null,
    val isRecorrente: Boolean = false,
    val recorrenciaId: String? = null
)