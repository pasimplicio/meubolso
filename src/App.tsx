import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import { useAccountStore } from './store/accountStore';
import { useCategoryStore } from './store/categoryStore';
import { useTransactionStore } from './store/transactionStore';
import { useBudgetStore } from './store/budgetStore';
import { useGoalStore } from './store/goalStore';
import { initializeDefaults } from './db';
import { ToastProvider } from './contexts/ToastContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import AccountsPage from './pages/AccountsPage';
import CategoriesPage from './pages/CategoriesPage';
import BudgetPage from './pages/BudgetPage';
import GoalsPage from './pages/GoalsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const { theme, sidebarOpen } = useAppStore();
  const { loadAccounts } = useAccountStore();
  const { loadCategories } = useCategoryStore();
  const { loadTransactions } = useTransactionStore();
  const { loadBudgets } = useBudgetStore();
  const { loadGoals } = useGoalStore();

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    async function init() {
      await initializeDefaults();
      await Promise.all([
        loadAccounts(),
        loadCategories(),
        loadTransactions(),
        loadBudgets(),
        loadGoals(),
      ]);
    }
    init();
  }, []);

  return (
    <div>
      <Header />
      <Sidebar />
      <main className={`main-content ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}
