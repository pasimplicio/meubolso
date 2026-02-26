package com.meubolso.domain.usecase

import com.meubolso.domain.model.TipoTransacao
import com.meubolso.domain.model.Transacao

class CalcularSaldoUseCase {

    fun execute(transacoes: List<Transacao>): Double {
        return transacoes.fold(0.0) { acc, transacao ->
            when (transacao.tipo) {
                TipoTransacao.RECEITA -> acc + transacao.valor
                TipoTransacao.DESPESA -> acc - transacao.valor
            }
        }
    }
}