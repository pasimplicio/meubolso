import { create } from 'zustand';
import { db } from '../db';
import { nanoid } from 'nanoid';
import type { Goal, GoalContribution } from '../types';
import { useAuthStore } from './authStore';

interface GoalStore {
  goals: Goal[];
  contributions: GoalContribution[];
  loading: boolean;
  loadGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (goalId: string, amount: number, notes?: string) => Promise<void>;
  getContributionsByGoal: (goalId: string) => GoalContribution[];
}

export const useGoalStore = create<GoalStore>()((set, get) => ({
  goals: [],
  contributions: [],
  loading: false,

  loadGoals: async () => {
    set({ loading: true });
    const userId = useAuthStore.getState().user?.id;
    const [goals, contributions] = await Promise.all([
      userId ? db.goals.where('userId').equals(userId).toArray() : db.goals.toArray(),
      userId ? db.goalContributions.where('userId').equals(userId).toArray() : db.goalContributions.toArray(),
    ]);
    set({ goals, contributions, loading: false });
  },

  addGoal: async (data) => {
    const userId = useAuthStore.getState().user?.id;
    const goal: Goal = {
      ...data,
      id: nanoid(),
      currentAmount: 0,
      createdAt: new Date(),
      userId,
    };
    await db.goals.add(goal);
    set((state) => ({ goals: [...state.goals, goal] }));
  },

  updateGoal: async (id, data) => {
    await db.goals.update(id, data);
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
    }));
  },

  deleteGoal: async (id) => {
    await db.goals.delete(id);
    await db.goalContributions.where('goalId').equals(id).delete();
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
      contributions: state.contributions.filter((c) => c.goalId !== id),
    }));
  },

  addContribution: async (goalId, amount, notes) => {
    const userId = useAuthStore.getState().user?.id;
    const contribution: GoalContribution = {
      id: nanoid(),
      goalId,
      amount,
      date: new Date(),
      notes,
      userId,
    };
    await db.goalContributions.add(contribution);

    const goal = get().goals.find((g) => g.id === goalId);
    if (goal) {
      const newAmount = goal.currentAmount + amount;
      await db.goals.update(goalId, { currentAmount: newAmount });
      set((state) => ({
        contributions: [...state.contributions, contribution],
        goals: state.goals.map((g) =>
          g.id === goalId ? { ...g, currentAmount: newAmount } : g
        ),
      }));
    }
  },

  getContributionsByGoal: (goalId) => {
    return get().contributions.filter((c) => c.goalId === goalId);
  },
}));
