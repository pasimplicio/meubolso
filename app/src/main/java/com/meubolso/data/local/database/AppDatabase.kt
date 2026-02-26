package com.meubolso.data.local.database

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.meubolso.data.local.dao.CategoriaDao
import com.meubolso.data.local.dao.LembreteDao
import com.meubolso.data.local.dao.TransacaoDao
import com.meubolso.data.local.entity.CategoriaEntity
import com.meubolso.data.local.entity.LembreteEntity
import com.meubolso.data.local.entity.TransacaoEntity

@Database(
    entities = [TransacaoEntity::class, CategoriaEntity::class, LembreteEntity::class],
    version = 1,
    exportSchema = false  // ALTERADO DE true PARA false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun transacaoDao(): TransacaoDao
    abstract fun categoriaDao(): CategoriaDao
    abstract fun lembreteDao(): LembreteDao
}