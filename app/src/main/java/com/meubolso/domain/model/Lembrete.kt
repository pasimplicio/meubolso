package com.meubolso.domain.model

data class Lembrete(
    val id: Long = 0L,
    val descricao: String,
    val valor: Double,
    val categoriaId: Long,
    val dataProximo: Long,
    val periodicidade: String,
    val ativo: Boolean = true,
    val notificacaoAntecipada: Int = 0
)
