package com.meubolso.di

import com.meubolso.data.repository.CategoriaRepository
import com.meubolso.data.repository.LembreteRepository
import com.meubolso.data.repository.TransacaoRepositoryImpl
import com.meubolso.domain.repository.ICategoriaRepository
import com.meubolso.domain.repository.ILembreteRepository
import com.meubolso.domain.repository.TransacaoRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindTransacaoRepository(
        impl: TransacaoRepositoryImpl
    ): TransacaoRepository

    @Binds
    @Singleton
    abstract fun bindCategoriaRepository(
        impl: CategoriaRepository
    ): ICategoriaRepository

    @Binds
    @Singleton
    abstract fun bindLembreteRepository(
        impl: LembreteRepository
    ): ILembreteRepository
}