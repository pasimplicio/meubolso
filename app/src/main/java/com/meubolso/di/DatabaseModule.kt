package com.meubolso.di

import android.content.Context
import androidx.room.Room
import com.meubolso.data.local.dao.CategoriaDao
import com.meubolso.data.local.dao.LembreteDao
import com.meubolso.data.local.dao.TransacaoDao
import com.meubolso.data.local.database.AppDatabase
import com.meubolso.util.Constants
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideAppDatabase(
        @ApplicationContext context: Context
    ): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            Constants.DATABASE_NAME
        ).build()
    }

    @Provides
    fun provideTransacaoDao(db: AppDatabase): TransacaoDao = db.transacaoDao()

    @Provides
    fun provideCategoriaDao(db: AppDatabase): CategoriaDao = db.categoriaDao()

    @Provides
    fun provideLembreteDao(db: AppDatabase): LembreteDao = db.lembreteDao()
}