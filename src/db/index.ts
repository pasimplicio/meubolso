import Dexie, { type Table } from 'dexie';
import type { Account, Category, Transaction, Budget, Goal, GoalContribution } from '../types';

export class MeuBolsoDB extends Dexie {
  accounts!: Table<Account>;
  categories!: Table<Category>;
  transactions!: Table<Transaction>;
  budgets!: Table<Budget>;
  goals!: Table<Goal>;
  goalContributions!: Table<GoalContribution>;

  constructor() {
    super('meubolso');

    this.version(1).stores({
      accounts: 'id, type, createdAt',
      categories: 'id, type, parentId, order',
      transactions: 'id, type, categoryId, accountId, date, status, createdAt',
      budgets: 'id, categoryId, [month+year]',
      goals: 'id, type, createdAt',
      goalContributions: 'id, goalId, date',
    });
  }
}

export const db = new MeuBolsoDB();

// ===== DEFAULT CATEGORIES =====
export const defaultCategories: Omit<Category, 'id'>[] = [
  // Receitas
  { name: 'Salário', type: 'income', icon: '💰', color: '#00d4aa', order: 1 },
  { name: 'Freelance', type: 'income', icon: '💼', color: '#6366f1', order: 2 },
  { name: 'Investimentos', type: 'income', icon: '📈', color: '#a855f7', order: 3 },
  { name: 'Outros (Receita)', type: 'income', icon: '🎁', color: '#f59e0b', order: 4 },
  // Despesas
  { name: 'Moradia', type: 'expense', icon: '🏠', color: '#6366f1', order: 5 },
  { name: 'Alimentação', type: 'expense', icon: '🍔', color: '#f97316', order: 6 },
  { name: 'Transporte', type: 'expense', icon: '🚗', color: '#3b82f6', order: 7 },
  { name: 'Saúde', type: 'expense', icon: '💊', color: '#ef4444', order: 8 },
  { name: 'Educação', type: 'expense', icon: '📚', color: '#8b5cf6', order: 9 },
  { name: 'Lazer', type: 'expense', icon: '🎮', color: '#ec4899', order: 10 },
  { name: 'Vestuário', type: 'expense', icon: '👕', color: '#14b8a6', order: 11 },
  { name: 'Contas', type: 'expense', icon: '💡', color: '#eab308', order: 12 },
  { name: 'Tecnologia', type: 'expense', icon: '📱', color: '#6366f1', order: 13 },
  { name: 'Pets', type: 'expense', icon: '🐕', color: '#f59e0b', order: 14 },
  { name: 'Pessoal', type: 'expense', icon: '✂️', color: '#a855f7', order: 15 },
  { name: 'Outros (Despesa)', type: 'expense', icon: '📦', color: '#64748b', order: 16 },
];

// Initialize default categories if empty
export async function initializeDefaults() {
  const count = await db.categories.count();
  if (count === 0) {
    const { nanoid } = await import('nanoid');
    const cats = defaultCategories.map((cat) => ({
      ...cat,
      id: nanoid(),
    }));
    await db.categories.bulkAdd(cats);
  }
}
