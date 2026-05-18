import { create } from 'zustand';
import { db } from '../db';
import { nanoid } from 'nanoid';
import type { Category } from '../types';

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  loadCategories: () => Promise<void>;
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
    await db.categories.delete(id);
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
  },

  getCategoryById: (id) => get().categories.find((c) => c.id === id),

  getIncomeCategories: () => get().categories.filter((c) => c.type === 'income'),

  getExpenseCategories: () => get().categories.filter((c) => c.type === 'expense'),
}));
