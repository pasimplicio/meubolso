import { create } from 'zustand';
import { db } from '../db';
import { nanoid } from 'nanoid';
import type { Paystub } from '../types';
import { useAuthStore } from './authStore';
import { useTransactionStore } from './transactionStore';
import { useAccountStore } from './accountStore';
import { useCategoryStore } from './categoryStore';
import { firstBusinessDayOfNextMonth } from '../lib/utils';

interface PaystubStore {
  paystubs: Paystub[];
  loading: boolean;
  loadPaystubs: () => Promise<void>;
  /**
   * Salva um contracheque. Se `register` e houver conta, lança na data escolhida
   * (`data.date`): o Bruto como receita (categoria "Salário") e cada desconto
   * como despesa na categoria indicada em `item.categoryId`. O efeito no saldo
   * é o líquido (bruto − descontos).
   */
  addPaystub: (data: Omit<Paystub, 'id' | 'createdAt'>, register: boolean) => Promise<void>;
  deletePaystub: (id: string) => Promise<void>;
  getByYear: (year: number) => Paystub[];
  getNetTotalYear: (year: number) => number;
}

export const usePaystubStore = create<PaystubStore>()((set, get) => ({
  paystubs: [],
  loading: false,

  loadPaystubs: async () => {
    set({ loading: true });
    const userId = useAuthStore.getState().user?.id;
    const paystubs = userId
      ? await db.paystubs.where('userId').equals(userId).toArray()
      : await db.paystubs.toArray();
    paystubs.sort((a, b) => (b.year - a.year) || (b.month - a.month) || ((b.sequence ?? 0) - (a.sequence ?? 0)));
    set({ paystubs, loading: false });
  },

  addPaystub: async (data, register) => {
    const userId = useAuthStore.getState().user?.id;
    const id = nanoid();
    let transactionId: string | undefined;

    if (register && data.accountId) {
      const { addTransaction } = useTransactionStore.getState();
      const { updateBalance } = useAccountStore.getState();
      const date = data.date ?? firstBusinessDayOfNextMonth(data.year, data.month);
      const ref = `${String(data.month).padStart(2, '0')}/${data.year}`;
      const salaryCat = useCategoryStore
        .getState()
        .categories.find((c) => c.type === 'income' && c.name === 'Salário');

      // 1) Bruto como receita (Salário).
      if (salaryCat && data.grossTotal > 0) {
        await addTransaction({
          type: 'income',
          amount: data.grossTotal,
          description: `Salário Bruto ${ref}${data.sequence ? ` (${data.sequence}ª via)` : ''}`,
          categoryId: salaryCat.id,
          accountId: data.accountId,
          date,
          status: 'paid',
          paymentMethod: 'transferencia',
          reconciled: true,
          sourceId: id,
        });
        await updateBalance(data.accountId, data.grossTotal);
        transactionId = useTransactionStore.getState().transactions.find((t) => t.sourceId === id)?.id;
      }

      // 2) Cada desconto como despesa na sua categoria.
      for (const item of data.items) {
        if (item.kind !== 'desconto' || !item.categoryId || item.amount <= 0) continue;
        await addTransaction({
          type: 'expense',
          amount: item.amount,
          description: `${item.description} — Folha ${ref}`,
          categoryId: item.categoryId,
          accountId: data.accountId,
          date,
          status: 'paid',
          paymentMethod: 'debito',
          reconciled: true,
          sourceId: id,
        });
        await updateBalance(data.accountId, -item.amount);
      }
    }

    const paystub: Paystub = { ...data, id, transactionId, createdAt: new Date(), userId };
    await db.paystubs.add(paystub);
    set((state) => {
      const list = [paystub, ...state.paystubs];
      list.sort((a, b) => (b.year - a.year) || (b.month - a.month) || ((b.sequence ?? 0) - (a.sequence ?? 0)));
      return { paystubs: list };
    });
  },

  deletePaystub: async (id) => {
    const { transactions, deleteTransaction } = useTransactionStore.getState();
    const { updateBalance } = useAccountStore.getState();
    // Remove todas as transações geradas por este contracheque e reverte o saldo.
    const linked = transactions.filter((t) => t.sourceId === id);
    for (const tx of linked) {
      if (tx.status === 'paid') {
        const delta = tx.type === 'income' ? -tx.amount : tx.amount;
        await updateBalance(tx.accountId, delta);
      }
      await deleteTransaction(tx.id);
    }
    await db.paystubs.delete(id);
    set((state) => ({ paystubs: state.paystubs.filter((p) => p.id !== id) }));
  },

  getByYear: (year) => get().paystubs.filter((p) => p.year === year),
  getNetTotalYear: (year) =>
    get().paystubs.filter((p) => p.year === year).reduce((s, p) => s + p.netTotal, 0),
}));
