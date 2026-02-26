package com.meubolso.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import com.meubolso.data.local.entity.LembreteEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface LembreteDao {
    @Query("SELECT * FROM lembretes ORDER BY dataProximo ASC")
    fun listarTodos(): Flow<List<LembreteEntity>>

    @Query("SELECT * FROM lembretes WHERE ativo = 1 ORDER BY dataProximo ASC")
    fun listarAtivos(): Flow<List<LembreteEntity>>

    @Insert
    suspend fun inserir(lembrete: LembreteEntity): Long

    @Update
    suspend fun atualizar(lembrete: LembreteEntity)

    @Delete
    suspend fun deletar(lembrete: LembreteEntity)
}
