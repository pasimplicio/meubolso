package com.meubolso.domain.model

data class Categoria(
    val id: Long = 0L,
    val nome: String,
    val tipo: String,
    val cor: String,
    val icone: String,
    val isPadrao: Boolean = false
)
