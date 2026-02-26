package com.meubolso.domain.repository

import com.meubolso.domain.model.Transacao
import kotlinx.coroutines.flow.Flow

interface TransacaoRepository {
    suspend fun inserir(transacao: Transacao)
    fun listarTodas(): Flow<List<Transacao>>
}
