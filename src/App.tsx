import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import { useAuthStore } from './store/authStore';
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
import QuickAddFAB from './components/layout/QuickAddFAB';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import AccountsPage from './pages/AccountsPage';
import CategoriesPage from './pages/CategoriesPage';
import BudgetPage from './pages/BudgetPage';
import GoalsPage from './pages/GoalsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppContent() {
  const { theme, sidebarOpen, setSidebarOpen } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const { loadAccounts } = useAccountStore();
  const { loadCategories } = useCategoryStore();
  const { loadTransactions } = useTransactionStore();
  const { loadBudgets } = useBudgetStore();
  const { loadGoals } = useGoalStore();

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    if (!isAuthenticated) return;
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
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="*"         element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div>
      <Header />
      <Sidebar />
      {/* Fecha a sidebar ao tocar fora no mobile */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}
      <main className={`main-content ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
          <Route path="/accounts"     element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
          <Route path="/categories"   element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
          <Route path="/budget"       element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
          <Route path="/goals"        element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
          <Route path="/reports"      element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/settings"     element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <MobileNav />
      <QuickAddFAB />
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
