import { create } from 'zustand';
import { db } from '../db';
import { nanoid } from 'nanoid';
import type { Account } from '../types';

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
    const accounts = await db.accounts.toArray();
    set({ accounts, loading: false });
  },

  addAccount: async (data) => {
    const account: Account = {
      ...data,
      id: nanoid(),
      createdAt: new Date(),
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
