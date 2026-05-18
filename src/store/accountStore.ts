import { create } from 'zustand';
import { db } from '../db';
import { nanoid } from 'nanoid';
import type { Account } from '../types';
import { useAuthStore } from './authStore';
import { useTransactionStore } from './transactionStore';

interface AccountStore {
  accounts: Account[];
  loading: boolean;
  loadAccounts: () => Promise<void>;
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => Promise<void>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  updateBalance: (id: string, amount: number) => Promise<void>;
  getTotalBalance: () => number;
}

export const useAccountStore = create<AccountStore>()((set, get) => ({
  accounts: [],
  loading: false,

  loadAccounts: async () => {
    set({ loading: true });
    const userId = useAuthStore.getState().user?.id;
    const accounts = userId
      ? await db.accounts.where('userId').equals(userId).toArray()
      : await db.accounts.toArray();
    set({ accounts, loading: false });
  },

  addAccount: async (data) => {
    const userId = useAuthStore.getState().user?.id;
    const account: Account = {
      ...data,
      id: nanoid(),
      createdAt: new Date(),
      userId,
    };
    await db.accounts.add(account);
    set((state) => ({ accounts: [...state.accounts, account] }));
  },

  updateAccount: async (id, data) => {
    await db.accounts.update(id, data);
    set((state) => ({
      accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }));
  },

  deleteAccount: async (id) => {
    const { transactions } = useTransactionStore.getState();
    const linked = transactions.filter(t => t.accountId === id || t.toAccountId === id);
    if (linked.length > 0) {
      const plural = linked.length === 1 ? 'transação vinculada' : `${linked.length} transações vinculadas`;
      throw new Error(`Esta conta possui ${plural}. Remova as transações antes de excluir a conta.`);
    }
    await db.accounts.delete(id);
    set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) }));
  },

  updateBalance: async (id, amount) => {
    const account = get().accounts.find((a) => a.id === id);
    if (!account) return;
    const newBalance = account.balance + amount;
    await db.accounts.update(id, { balance: newBalance });
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === id ? { ...a, balance: newBalance } : a
      ),
    }));
  },

  getTotalBalance: () => {
    return get().accounts.reduce((sum, a) => {
      // Credit cards have negative balance interpretation
      return sum + a.balance;
    }, 0);
  },
}));
