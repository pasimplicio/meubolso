import { create } from 'zustand';
import { db } from '../db';
import { nanoid } from 'nanoid';
import type { Investment, InvestmentMove, InvestmentMoveType, InvestmentClass } from '../types';
import { useAuthStore } from './authStore';

interface InvestmentStore {
  investments: Investment[];
  moves: InvestmentMove[];
  loading: boolean;
  loadInvestments: () => Promise<void>;
  addInvestment: (data: Omit<Investment, 'id' | 'createdAt'>) => Promise<void>;
  updateInvestment: (id: string, data: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  addMove: (investmentId: string, type: InvestmentMoveType, amount: number, date: Date, notes?: string) => Promise<void>;
  getMoves: (investmentId: string) => InvestmentMove[];
  getTotalInvested: () => number;
  getTotalCurrent: () => number;
  getByClass: () => Record<InvestmentClass, { invested: number; current: number }>;
}

export const useInvestmentStore = create<InvestmentStore>()((set, get) => ({
  investments: [],
  moves: [],
  loading: false,

  loadInvestments: async () => {
    set({ loading: true });
    const userId = useAuthStore.getState().user?.id;
    const [investments, moves] = await Promise.all([
      userId
        ? db.investments.where('userId').equals(userId).toArray()
        : db.investments.toArray(),
      userId
        ? db.investmentMoves.where('userId').equals(userId).toArray()
        : db.investmentMoves.toArray(),
    ]);
    investments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    set({ investments, moves, loading: false });
  },

  addInvestment: async (data) => {
    const userId = useAuthStore.getState().user?.id;
    const investment: Investment = { ...data, id: nanoid(), createdAt: new Date(), userId };
    await db.investments.add(investment);
    set((state) => ({ investments: [investment, ...state.investments] }));
  },

  updateInvestment: async (id, data) => {
    await db.investments.update(id, data);
    set((state) => ({
      investments: state.investments.map((i) => (i.id === id ? { ...i, ...data } : i)),
    }));
  },

  deleteInvestment: async (id) => {
    const moveIds = get().moves.filter((m) => m.investmentId === id).map((m) => m.id);
    if (moveIds.length > 0) await db.investmentMoves.bulkDelete(moveIds);
    await db.investments.delete(id);
    set((state) => ({
      investments: state.investments.filter((i) => i.id !== id),
      moves: state.moves.filter((m) => m.investmentId !== id),
    }));
  },

  addMove: async (investmentId, type, amount, date, notes) => {
    const userId = useAuthStore.getState().user?.id;
    const move: InvestmentMove = { id: nanoid(), userId, investmentId, type, amount, date, notes };
    await db.investmentMoves.add(move);

    const inv = get().investments.find((i) => i.id === investmentId);
    if (inv) {
      let invested = inv.investedAmount;
      let current = inv.currentValue;
      if (type === 'aporte') { invested += amount; current += amount; }
      else if (type === 'resgate') { invested = Math.max(0, invested - amount); current = Math.max(0, current - amount); }
      else if (type === 'rendimento') { current += amount; }
      await db.investments.update(investmentId, { investedAmount: invested, currentValue: current });
      set((state) => ({
        moves: [...state.moves, move],
        investments: state.investments.map((i) =>
          i.id === investmentId ? { ...i, investedAmount: invested, currentValue: current } : i
        ),
      }));
    } else {
      set((state) => ({ moves: [...state.moves, move] }));
    }
  },

  getMoves: (investmentId) =>
    get().moves
      .filter((m) => m.investmentId === investmentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),

  getTotalInvested: () => get().investments.reduce((s, i) => s + i.investedAmount, 0),
  getTotalCurrent: () => get().investments.reduce((s, i) => s + i.currentValue, 0),

  getByClass: () => {
    const acc = {} as Record<InvestmentClass, { invested: number; current: number }>;
    for (const i of get().investments) {
      if (!acc[i.class]) acc[i.class] = { invested: 0, current: 0 };
      acc[i.class].invested += i.investedAmount;
      acc[i.class].current += i.currentValue;
    }
    return acc;
  },
}));
