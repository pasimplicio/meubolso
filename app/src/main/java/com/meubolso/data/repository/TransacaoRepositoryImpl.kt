package com.meubolso.data.repository

import com.meubolso.data.local.dao.TransacaoDao
import com.meubolso.data.local.entity.TransacaoEntity
import com.meubolso.domain.model.TipoTransacao
import com.meubolso.domain.model.Transacao
import com.meubolso.domain.repository.TransacaoRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

class TransacaoRepositoryImpl @Inject constructor(
    private val dao: TransacaoDao
) : TransacaoRepository {

    override suspend fun inserir(transacao: Transacao) {
        dao.inserir(
            TransacaoEntity(
                id = transacao.id,
                tipo = transacao.tipo.name,
                descricao = transacao.descricao,
                valor = transacao.valor,
                data = transacao.data
            )
        )
    }

    override fun listarTodas(): Flow<List<Transacao>> {
        return dao.listarTodas().map { lista ->
            lista.map {
                Transacao(
                    id = it.id,
                    tipo = TipoTransacao.valueOf(it.tipo),
                    descricao = it.descricao,
                    valor = it.valor,
                    data = it.data
                )
            }
        }
    }
}
