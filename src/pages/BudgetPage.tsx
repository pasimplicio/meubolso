import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Copy } from 'lucide-react';
import { useBudgetStore } from '../store/budgetStore';
import { useTransactionStore } from '../store/transactionStore';
import { useCategoryStore } from '../store/categoryStore';
import { useAppStore } from '../store/appStore';
import { formatCurrency, getMonthName } from '../lib/utils';
import { useToast } from '../contexts/ToastContext';
import ProgressBar from '../components/ui/ProgressBar';
import BudgetModal from '../components/budget/BudgetModal';

export default function BudgetPage() {
  const { currentMonth, currentYear } = useAppStore();
  const { budgets, copyBudgetsFromPreviousMonth } = useBudgetStore();
  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const monthBudgets = useMemo(() => budgets.filter((b) => b.month === currentMonth && b.year === currentYear), [budgets, currentMonth, currentYear]);

  const spending = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => { const d = new Date(t.date); return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth && t.type === 'expense' && t.status === 'paid'; })
      .forEach((t) => { map[t.categoryId] = (map[t.categoryId] || 0) + t.amount; });
    return map;
  }, [transactions, currentMonth, currentYear]);

  const totalBudgeted = monthBudgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = monthBudgets.reduce((s, b) => s + (spending[b.categoryId] || 0), 0);

  const handleCopy = async () => {
    await copyBudgetsFromPreviousMonth(currentYear, currentMonth);
    toast.success('Orçamento copiado do mês anterior');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Orçamento — {getMonthName(currentMonth)}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={handleCopy}><Copy size={14} /> Copiar Anterior</button>
          <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> Novo</button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid-cols-3" style={{ marginBottom: 20 }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
          <div className="stat-label">Orçado</div>
          <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{formatCurrency(totalBudgeted)}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
          <div className="stat-label">Gasto</div>
          <div className="stat-value" style={{ color: 'var(--accent-red)' }}>{formatCurrency(totalSpent)}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
          <div className="stat-label">Disponível</div>
          <div className="stat-value" style={{ color: totalBudgeted - totalSpent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{formatCurrency(totalBudgeted - totalSpent)}</div>
        </motion.div>
      </div>

      {totalBudgeted > 0 && (
        <div className="glass-card-static" style={{ padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8rem', fontWeight: 600 }}>
            <span>Progresso Geral</span>
            <span>{((totalSpent / totalBudgeted) * 100).toFixed(0)}%</span>
          </div>
          <ProgressBar value={totalSpent} max={totalBudgeted} height={10} />
        </div>
      )}

      {/* Budget Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {monthBudgets.map((b, i) => {
          const cat = categories.find((c) => c.id === b.categoryId);
          const spent = spending[b.categoryId] || 0;
          const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
          return (
            <motion.div key={b.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="glass-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.1rem' }}>{cat?.icon || '📦'}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat?.name || 'Categoria'}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, color: pct >= 100 ? 'var(--accent-red)' : pct >= 80 ? 'var(--accent-amber)' : 'var(--text-primary)' }}>{formatCurrency(spent)}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> / {formatCurrency(b.amount)}</span>
                </div>
              </div>
              <ProgressBar value={spent} max={b.amount} />
              {pct >= 80 && pct < 100 && <div style={{ marginTop: 6, fontSize: '0.7rem', color: 'var(--accent-amber)', fontWeight: 600 }}>⚠️ Atenção: {pct.toFixed(0)}% do orçamento utilizado</div>}
              {pct >= 100 && <div style={{ marginTop: 6, fontSize: '0.7rem', color: 'var(--accent-red)', fontWeight: 600 }}>🚨 Orçamento excedido em {formatCurrency(spent - b.amount)}</div>}
            </motion.div>
          );
        })}
        {monthBudgets.length === 0 && (
          <div className="glass-card-static">
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">Sem orçamento definido</div>
              <p className="empty-state-text">Defina limites de gastos por categoria para este mês.</p>
            </div>
          </div>
        )}
      </div>
      <BudgetModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
