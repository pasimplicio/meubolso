package com.meubolso.data.repository

import com.meubolso.data.local.dao.CategoriaDao
import com.meubolso.data.local.entity.CategoriaEntity
import com.meubolso.domain.model.Categoria
import com.meubolso.domain.model.TipoCategoria
import com.meubolso.domain.repository.ICategoriaRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CategoriaRepository @Inject constructor(
    private val dao: CategoriaDao
) : ICategoriaRepository {

    override fun listarPorTipo(tipo: TipoCategoria): Flow<List<Categoria>> =
        dao.listarPorTipo(tipo.name).map { itens ->
            itens.map { it.toDomain() }
        }

    override suspend fun buscarPorId(id: Long): Categoria? =
        dao.buscarPorId(id)?.toDomain()

    override suspend fun inserir(categoria: Categoria): Long =
        dao.inserir(categoria.toEntity())

    override suspend fun atualizar(categoria: Categoria) =
        dao.atualizar(categoria.toEntity())

    override suspend fun deletar(categoria: Categoria) =
        dao.deletar(categoria.toEntity())

    private fun CategoriaEntity.toDomain() = Categoria(
        id = id,
        nome = nome,
        tipo = tipo,
        cor = cor,
        icone = icone,
        isPadrao = isPadrao
    )

    private fun Categoria.toEntity() = CategoriaEntity(
        id = id,
        nome = nome,
        tipo = tipo,
        cor = cor,
        icone = icone,
        isPadrao = isPadrao
    )
}