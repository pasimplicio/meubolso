import { create } from 'zustand';
import { db } from '../db';
import { nanoid } from 'nanoid';
import type { Budget } from '../types';

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
    const budgets = await db.budgets.toArray();
    set({ budgets, loading: false });
  },

  addBudget: async (data) => {
    const budget: Budget = { ...data, id: nanoid() };
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
        const newBudget: Budget = {
          id: nanoid(),
          categoryId: prev.categoryId,
          amount: prev.amount,
          month,
          year,
        };
        await db.budgets.add(newBudget);
        set((state) => ({ budgets: [...state.budgets, newBudget] }));
      }
    }
  },
}));
