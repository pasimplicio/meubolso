package com.meubolso.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.meubolso.data.local.entity.TransacaoEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TransacaoDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun inserir(transacao: TransacaoEntity)

    @Query("SELECT * FROM transacoes ORDER BY data DESC")
    fun listarTodas(): Flow<List<TransacaoEntity>>

    @Query("SELECT SUM(valor) FROM transacoes WHERE tipo = :tipo AND data BETWEEN :inicio AND :fim")
    fun somaPorPeriodoETipo(tipo: String, inicio: Long, fim: Long): Flow<Double?>
}