package com.meubolso.domain.repository

import com.meubolso.domain.model.Transacao
import kotlinx.coroutines.flow.Flow

interface ITransacaoRepository {
    fun listarTodas(): Flow<List<Transacao>>
    fun listarPorPeriodo(inicio: Long, fim: Long): Flow<List<Transacao>>
    suspend fun inserir(transacao: Transacao)
    suspend fun atualizar(transacao: Transacao)
    suspend fun deletar(transacao: Transacao)
    suspend fun getSaldoPorPeriodo(inicio: Long, fim: Long): Double
}