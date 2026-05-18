// ===== CORE TYPES =====

export type AccountType = 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'paid' | 'pending';
export type CategoryType = 'income' | 'expense';
export type Recurrence = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type GoalType = 'emergency' | 'travel' | 'purchase' | 'investment' | 'debt' | 'custom';
export type ThemeMode = 'dark' | 'light';

// ===== INTERFACES =====

export interface User {
  id: string;
  email: string;
  name: string;
  salt: string;
  passwordHash: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Account {
  id: string;
  userId?: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  icon: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  parentId?: string;
  order: number;
}

export interface Transaction {
  id: string;
  userId?: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  date: Date;
  status: TransactionStatus;
  recurrence?: Recurrence;
  recurrenceEndDate?: Date;
  tags?: string[];
  notes?: string;
  createdAt: Date;
}

export interface Budget {
  id: string;
  userId?: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export interface Goal {
  id: string;
  userId?: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  icon: string;
  color: string;
  type: GoalType;
  createdAt: Date;
}

export interface GoalContribution {
  id: string;
  userId?: string;
  goalId: string;
  amount: number;
  date: Date;
  notes?: string;
}

export interface AppSettings {
  currency: string;
  theme: ThemeMode;
  locale: string;
}

// ===== HELPER TYPES =====

export interface MonthlyOverview {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  percentChange: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
}
