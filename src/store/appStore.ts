import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '../types';

interface AppState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  currentMonth: number;
  currentYear: number;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMonth: (month: number, year: number) => void;
  nextMonth: () => void;
  prevMonth: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      currentMonth: new Date().getMonth() + 1,
      currentYear: new Date().getFullYear(),

      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setMonth: (month, year) => set({ currentMonth: month, currentYear: year }),
      nextMonth: () =>
        set((state) => {
          if (state.currentMonth === 12) {
            return { currentMonth: 1, currentYear: state.currentYear + 1 };
          }
          return { currentMonth: state.currentMonth + 1 };
        }),
      prevMonth: () =>
        set((state) => {
          if (state.currentMonth === 1) {
            return { currentMonth: 12, currentYear: state.currentYear - 1 };
          }
          return { currentMonth: state.currentMonth - 1 };
        }),
    }),
    { name: 'meubolso-app' }
  )
);
