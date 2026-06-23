import { create } from 'zustand';
import { db } from '../db';
import { nanoid } from 'nanoid';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import type { Transaction, Recurrence } from '../types';
import { useAuthStore } from './authStore';

const MAX_RECURRING = 60;

function advanceDate(date: Date, recurrence: Recurrence): Date {
  switch (recurrence) {
    case 'daily':   return addDays(date, 1);
    case 'weekly':  return addWeeks(date, 1);
    case 'monthly': return addMonths(date, 1);
    case 'yearly':  return addYears(date, 1);
  }
}

interface TransactionStore {
  transactions: Transaction[];
  loading: boolean;
  loadTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  /** Importa vários lançamentos de uma vez, ignorando externalId já existente. */
  importMany: (drafts: Omit<Transaction, 'id' | 'createdAt'>[]) => Promise<{ added: number; skipped: number }>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteSeries: (id: string) => Promise<number>;
  getTransactionsByMonth: (year: number, month: number) => Transaction[];
  getTransactionsByAccount: (accountId: string) => Transaction[];
  getTransactionsByCategory: (categoryId: string) => Transaction[];
}

export const useTransactionStore = create<TransactionStore>()((set, get) => ({
  transactions: [],
  loading: false,

  loadTransactions: async () => {
    set({ loading: true });
    const userId = useAuthStore.getState().user?.id;
    let transactions: Transaction[];
    if (userId) {
      transactions = await db.transactions.where('userId').equals(userId).toArray();
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      transactions = await db.transactions.orderBy('date').reverse().toArray();
    }
    set({ transactions, loading: false });
  },

  addTransaction: async (data) => {
    const userId = useAuthStore.getState().user?.id;
    const groupId = data.recurrence && data.recurrenceEndDate ? nanoid() : undefined;
    const transaction: Transaction = {
      ...data,
      id: nanoid(),
      recurrenceGroupId: groupId,
      createdAt: new Date(),
      userId,
    };
    await db.transactions.add(transaction);
    set((state) => ({ transactions: [transaction, ...state.transactions] }));

    if (data.recurrence && data.recurrenceEndDate) {
      const endDate = new Date(data.recurrenceEndDate);
      const instances: Transaction[] = [];
      let current = advanceDate(new Date(data.date), data.recurrence);
      let count = 0;

      while (current <= endDate && count < MAX_RECURRING) {
        instances.push({
          ...data,
          id: nanoid(),
          date: new Date(current),
          status: 'pending',
          recurrence: undefined,
          recurrenceEndDate: undefined,
          recurrenceGroupId: groupId,
          createdAt: new Date(),
          userId,
        });
        current = advanceDate(current, data.recurrence);
        count++;
      }

      if (instances.length > 0) {
        await db.transactions.bulkAdd(instances);
        set((state) => ({ transactions: [...instances, ...state.transactions] }));
      }
    }
  },

  importMany: async (drafts) => {
    const userId = useAuthStore.getState().user?.id;
    // Chave de duplicidade = ID da operação + tipo + valor. O Mercado Pago reusa
    // o mesmo ID em pares (ex.: Pix −200 e Reembolso +200); por isso o ID sozinho
    // não basta. Reimportar o mesmo extrato continua deduplicando corretamente.
    const keyOf = (t: { externalId?: string; type: string; amount: number }) =>
      t.externalId ? `${t.externalId}|${t.type}|${t.amount}` : null;
    const existing = new Set(get().transactions.map(keyOf).filter(Boolean) as string[]);
    const seen = new Set<string>();
    const fresh = drafts.filter((d) => {
      const k = keyOf(d);
      if (!k) return true;
      if (existing.has(k) || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    const txs: Transaction[] = fresh.map((d) => ({ ...d, id: nanoid(), createdAt: new Date(), userId }));
    if (txs.length > 0) {
      await db.transactions.bulkAdd(txs);
      set((state) => {
        const all = [...txs, ...state.transactions];
        all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return { transactions: all };
      });
    }
    return { added: txs.length, skipped: drafts.length - txs.length };
  },

  updateTransaction: async (id, data) => {
    await db.transactions.update(id, data);
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...data } : t
      ),
    }));
  },

  deleteTransaction: async (id) => {
    await db.transactions.delete(id);
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
  },

  /** Exclui todos os lançamentos da mesma série recorrente. */
  deleteSeries: async (id) => {
    const tx = get().transactions.find((t) => t.id === id);
    if (!tx) return 0;
    const sig = (t: Transaction) =>
      t.description === tx.description && t.amount === tx.amount &&
      t.accountId === tx.accountId && t.categoryId === tx.categoryId && t.type === tx.type;
    const ids = get().transactions
      .filter((t) => (tx.recurrenceGroupId ? t.recurrenceGroupId === tx.recurrenceGroupId : sig(t)))
      .map((t) => t.id);
    await db.transactions.bulkDelete(ids);
    set((state) => ({ transactions: state.transactions.filter((t) => !ids.includes(t.id)) }));
    return ids.length;
  },

  getTransactionsByMonth: (year, month) => {
    return get().transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  },

  getTransactionsByAccount: (accountId) => {
    return get().transactions.filter(
      (t) => t.accountId === accountId || t.toAccountId === accountId
    );
  },

  getTransactionsByCategory: (categoryId) => {
    return get().transactions.filter((t) => t.categoryId === categoryId);
  },
}));
