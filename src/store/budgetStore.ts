import { create } from 'zustand';
import { db } from '../db';
import { nanoid } from 'nanoid';
import type { Budget } from '../types';
import { useAuthStore } from './authStore';

interface BudgetStore {
  budgets: Budget[];
  loading: boolean;
  loadBudgets: () => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, data: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetsByMonth: (year: number, month: number) => Budget[];
  copyBudgetsFromPreviousMonth: (year: number, month: number) => Promise<void>;
}

export const useBudgetStore = create<BudgetStore>()((set, get) => ({
  budgets: [],
  loading: false,

  loadBudgets: async () => {
    set({ loading: true });
    const userId = useAuthStore.getState().user?.id;
    const budgets = userId
      ? await db.budgets.where('userId').equals(userId).toArray()
      : await db.budgets.toArray();
    set({ budgets, loading: false });
  },

  addBudget: async (data) => {
    const userId = useAuthStore.getState().user?.id;
    const budget: Budget = { ...data, id: nanoid(), userId };
    await db.budgets.add(budget);
    set((state) => ({ budgets: [...state.budgets, budget] }));
  },

  updateBudget: async (id, data) => {
    await db.budgets.update(id, data);
    set((state) => ({
      budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...data } : b)),
    }));
  },

  deleteBudget: async (id) => {
    await db.budgets.delete(id);
    set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) }));
  },

  getBudgetsByMonth: (year, month) => {
    return get().budgets.filter((b) => b.year === year && b.month === month);
  },

  copyBudgetsFromPreviousMonth: async (year, month) => {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevBudgets = get().getBudgetsByMonth(prevYear, prevMonth);

    for (const prev of prevBudgets) {
      const existing = get().budgets.find(
        (b) => b.categoryId === prev.categoryId && b.month === month && b.year === year
      );
      if (!existing) {
        const userId = useAuthStore.getState().user?.id;
        const newBudget: Budget = {
          id: nanoid(),
          categoryId: prev.categoryId,
          amount: prev.amount,
          month,
          year,
          userId,
        };
        await db.budgets.add(newBudget);
        set((state) => ({ budgets: [...state.budgets, newBudget] }));
      }
    }
  },
}));
