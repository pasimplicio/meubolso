import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { useGoalStore } from '../store/goalStore';
import { formatCurrency, formatDate, goalTypeLabels } from '../lib/utils';
import { useToast } from '../contexts/ToastContext';
import ProgressBar from '../components/ui/ProgressBar';
import GoalModal from '../components/goals/GoalModal';
import ContributionModal from '../components/goals/ContributionModal';

export default function GoalsPage() {
  const { goals, deleteGoal } = useGoalStore();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [contribGoalId, setContribGoalId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Excluir esta meta?')) {
      await deleteGoal(id);
      toast.success('Meta excluída');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Metas Financeiras</h1>
        <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> Nova Meta</button>
      </div>

      <div className="grid-cols-2">
        {goals.map((g, i) => {
          const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
          const isComplete = pct >= 100;
          return (
            <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
              {isComplete && (
                <div style={{ position: 'absolute', top: 10, right: 10, fontSize: '1.5rem' }}>🎉</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${g.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{g.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{g.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{goalTypeLabels[g.type]} • até {formatDate(g.deadline)}</div>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: 700, color: isComplete ? 'var(--accent-green)' : 'var(--text-primary)' }}>{formatCurrency(g.currentAmount)}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(g.targetAmount)}</span>
                </div>
                <ProgressBar value={g.currentAmount} max={g.targetAmount} gradient={`linear-gradient(90deg, ${g.color}, ${g.color}dd)`} height={10} />
                <div style={{ textAlign: 'right', marginTop: 4, fontSize: '0.75rem', fontWeight: 600, color: isComplete ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                  {isComplete ? '✅ Meta atingida!' : `${pct.toFixed(1)}%`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {!isComplete && (
                  <button className="btn-primary" style={{ flex: 1, padding: '8px 12px', fontSize: '0.75rem' }} onClick={() => setContribGoalId(g.id)}>
                    <DollarSign size={14} /> Contribuir
                  </button>
                )}
                <button className="btn-icon" style={{ color: 'var(--accent-red)' }} onClick={() => handleDelete(g.id)}>
                  <Trash2 size={14} />
                </button>
              </div>

              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${g.color}, transparent)`, opacity: 0.5 }} />
            </motion.div>
          );
        })}
        {goals.length === 0 && (
          <div className="glass-card-static" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state">
              <div className="empty-state-icon">🎯</div>
              <div className="empty-state-title">Sem metas</div>
              <p className="empty-state-text">Crie metas para viagem, reserva de emergência, compras e mais!</p>
            </div>
          </div>
        )}
      </div>

      <GoalModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <ContributionModal goalId={contribGoalId} onClose={() => setContribGoalId(null)} />
    </div>
  );
}
