package com.meubolso.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import com.meubolso.data.local.entity.CategoriaEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface CategoriaDao {
    @Query("SELECT * FROM categorias ORDER BY nome ASC")
    fun listarTodas(): Flow<List<CategoriaEntity>>

    @Query("SELECT * FROM categorias WHERE tipo = :tipo ORDER BY nome ASC")
    fun listarPorTipo(tipo: String): Flow<List<CategoriaEntity>>

    @Query("SELECT * FROM categorias WHERE id = :id")
    suspend fun buscarPorId(id: Long): CategoriaEntity?

    @Insert
    suspend fun inserir(categoria: CategoriaEntity): Long

    @Update
    suspend fun atualizar(categoria: CategoriaEntity)

    @Delete
    suspend fun deletar(categoria: CategoriaEntity)
}