package com.meubolso.domain.repository

import com.meubolso.domain.model.Lembrete
import kotlinx.coroutines.flow.Flow

interface ILembreteRepository {
    fun listarTodos(): Flow<List<Lembrete>>
    fun listarAtivos(): Flow<List<Lembrete>>
    suspend fun buscarPorId(id: Long): Lembrete?
    suspend fun inserir(lembrete: Lembrete): Long
    suspend fun atualizar(lembrete: Lembrete)
    suspend fun deletar(lembrete: Lembrete)
}