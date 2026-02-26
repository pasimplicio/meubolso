package com.meubolso.data.repository

import com.meubolso.data.local.dao.LembreteDao
import com.meubolso.data.local.entity.LembreteEntity
import com.meubolso.domain.model.Lembrete
import com.meubolso.domain.repository.ILembreteRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LembreteRepository @Inject constructor(
    private val dao: LembreteDao
) : ILembreteRepository {

    override fun listarTodos(): Flow<List<Lembrete>> =
        dao.listarTodos().map { itens -> itens.map { it.toDomain() } }

    override fun listarAtivos(): Flow<List<Lembrete>> =
        dao.listarAtivos().map { itens -> itens.map { it.toDomain() } }

    override suspend fun buscarPorId(id: Long): Lembrete? {
        // Implementar se necessário
        return null
    }

    override suspend fun inserir(lembrete: Lembrete): Long =
        dao.inserir(lembrete.toEntity())

    override suspend fun atualizar(lembrete: Lembrete) =
        dao.atualizar(lembrete.toEntity())

    override suspend fun deletar(lembrete: Lembrete) =
        dao.deletar(lembrete.toEntity())

    private fun LembreteEntity.toDomain() = Lembrete(
        id = id,
        descricao = descricao,
        valor = valor,
        categoriaId = categoriaId,
        dataProximo = dataProximo,
        periodicidade = periodicidade,
        ativo = ativo,
        notificacaoAntecipada = notificacaoAntecipada
    )

    private fun Lembrete.toEntity() = LembreteEntity(
        id = id,
        descricao = descricao,
        valor = valor,
        categoriaId = categoriaId,
        dataProximo = dataProximo,
        periodicidade = periodicidade,
        ativo = ativo,
        notificacaoAntecipada = notificacaoAntecipada
    )
}