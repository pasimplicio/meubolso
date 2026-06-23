import { create } from 'zustand';
import { db } from '../db';
import { nanoid } from 'nanoid';
import type { Category } from '../types';
import { useTransactionStore } from './transactionStore';
import { useBudgetStore } from './budgetStore';

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  loadCategories: () => Promise<void>;
  /** Garante (cria se faltar) categorias por tipo+grupo+nome. Idempotente. */
  ensureCategories: (defs: Omit<Category, 'id'>[]) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  getIncomeCategories: () => Category[];
  getExpenseCategories: () => Category[];
}

export const useCategoryStore = create<CategoryStore>()((set, get) => ({
  categories: [],
  loading: false,

  loadCategories: async () => {
    set({ loading: true });
    const categories = await db.categories.orderBy('order').toArray();
    set({ categories, loading: false });
  },

  ensureCategories: async (defs) => {
    const existing = get().categories;
    const key = (c: { type: string; group: string; name: string }) =>
      `${c.type}|${c.group}|${c.name.trim().toLowerCase()}`;
    const have = new Set(existing.map(key));
    const missing = defs.filter((d) => !have.has(key(d))).map((d) => ({ ...d, id: nanoid() }));
    if (missing.length === 0) return;
    await db.categories.bulkAdd(missing);
    set((state) => ({ categories: [...state.categories, ...missing] }));
  },

  addCategory: async (data) => {
    const category: Category = { ...data, id: nanoid() };
    await db.categories.add(category);
    set((state) => ({ categories: [...state.categories, category] }));
  },

  updateCategory: async (id, data) => {
    await db.categories.update(id, data);
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
  },

  deleteCategory: async (id) => {
    const { categories } = get();
    const subcatIds = categories.filter(c => c.parentId === id).map(c => c.id);
    const allIds = [id, ...subcatIds];

    const { transactions } = useTransactionStore.getState();
    const linkedTx = transactions.filter(t => allIds.includes(t.categoryId));
    if (linkedTx.length > 0) {
      const plural = linkedTx.length === 1 ? 'transação vinculada' : `${linkedTx.length} transações vinculadas`;
      throw new Error(`Esta categoria possui ${plural}. Remova as transações antes de excluir a categoria.`);
    }

    const { budgets } = useBudgetStore.getState();
    const linkedBudgets = budgets.filter(b => allIds.includes(b.categoryId));
    if (linkedBudgets.length > 0) {
      const plural = linkedBudgets.length === 1 ? '1 orçamento vinculado' : `${linkedBudgets.length} orçamentos vinculados`;
      throw new Error(`Esta categoria possui ${plural}. Exclua os orçamentos antes de remover a categoria.`);
    }

    // Cascade: remove subcategorias sem vínculos
    if (subcatIds.length > 0) {
      await db.categories.bulkDelete(subcatIds);
    }
    await db.categories.delete(id);
    set((state) => ({ categories: state.categories.filter(c => !allIds.includes(c.id)) }));
  },

  getCategoryById: (id) => get().categories.find((c) => c.id === id),

  getIncomeCategories: () => get().categories.filter((c) => c.type === 'income'),

  getExpenseCategories: () => get().categories.filter((c) => c.type === 'expense'),
}));
