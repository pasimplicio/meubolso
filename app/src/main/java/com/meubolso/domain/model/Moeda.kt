package com.meubolso.domain.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
enum class Moeda(
    val codigo: String,
    val simbolo: String,
    val nome: String
) : Parcelable {
    BRL("BRL", "R$", "Real Brasileiro"),
    USD("USD", "$", "Dólar Americano"),
    EUR("EUR", "€", "Euro"),
    GBP("GBP", "£", "Libra Esterlina"),
    ARS("ARS", "$", "Peso Argentino"),
    JPY("JPY", "¥", "Iene Japonês")
}