package com.meubolso.domain.repository

import com.meubolso.domain.model.Categoria
import com.meubolso.domain.model.TipoCategoria
import kotlinx.coroutines.flow.Flow

interface ICategoriaRepository {
    fun listarPorTipo(tipo: TipoCategoria): Flow<List<Categoria>>
    suspend fun buscarPorId(id: Long): Categoria?
    suspend fun inserir(categoria: Categoria): Long
    suspend fun atualizar(categoria: Categoria)
    suspend fun deletar(categoria: Categoria)
}