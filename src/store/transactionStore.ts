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
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
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
    const transaction: Transaction = {
      ...data,
      id: nanoid(),
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
