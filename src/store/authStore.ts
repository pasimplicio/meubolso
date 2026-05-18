import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../db';
import { nanoid } from 'nanoid';
import type { User } from '../types';

async function generateSalt(): Promise<string> {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function pbkdf2Hash(password: string, saltHex: string): Promise<string> {
  const salt = Uint8Array.from(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    key, 256
  );
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface AuthSession {
  id: string;
  email: string;
  name: string;
}

interface AuthStore {
  user: AuthSession | null;
  isAuthenticated: boolean;
  register: (email: string, password: string, name: string) => Promise<string>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      register: async (email, password, name) => {
        const lowerEmail = email.toLowerCase().trim();
        const existing = await db.users.where('email').equals(lowerEmail).first();
        if (existing) throw new Error('E-mail já cadastrado. Faça login.');

        const isFirstUser = (await db.users.count()) === 0;
        const salt = await generateSalt();
        const passwordHash = await pbkdf2Hash(password, salt);
        const id = nanoid();
        const now = new Date();

        const user: User = {
          id, email: lowerEmail, name: name.trim(),
          salt, passwordHash, createdAt: now, lastLogin: now,
        };
        await db.users.add(user);

        if (isFirstUser) {
          await db.accounts.toCollection().modify({ userId: id });
          await db.transactions.toCollection().modify({ userId: id });
          await db.budgets.toCollection().modify({ userId: id });
          await db.goals.toCollection().modify({ userId: id });
          await db.goalContributions.toCollection().modify({ userId: id });
        }

        set({ user: { id, email: lowerEmail, name: name.trim() }, isAuthenticated: true });
        return id;
      },

      login: async (email, password) => {
        const lowerEmail = email.toLowerCase().trim();
        const dbUser = await db.users.where('email').equals(lowerEmail).first();
        if (!dbUser) throw new Error('E-mail não encontrado');

        const hash = await pbkdf2Hash(password, dbUser.salt);
        if (hash !== dbUser.passwordHash) throw new Error('Senha incorreta');

        await db.users.update(dbUser.id, { lastLogin: new Date() });
        set({ user: { id: dbUser.id, email: dbUser.email, name: dbUser.name }, isAuthenticated: true });
      },

      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'meubolso-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
