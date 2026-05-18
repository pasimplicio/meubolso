import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { useAccountStore } from '../store/accountStore';
import { formatCurrency, accountTypeLabels, accountTypeIcons } from '../lib/utils';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ui/ConfirmDialog';
import AccountModal from '../components/accounts/AccountModal';

export default function AccountsPage() {
  const { accounts, deleteAccount, getTotalBalance } = useAccountStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const total = getTotalBalance();

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Excluir conta?',
      message: 'Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await deleteAccount(id);
      toast.success('Conta excluída');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Contas</h1>
        <button className="btn-primary" onClick={() => { setEditId(null); setModalOpen(true); }}>
          <Plus size={16} /> Nova Conta
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 24, marginBottom: 20, textAlign: 'center' }}>
        <div className="stat-label">Patrimônio Total</div>
        <div className="stat-value gradient-text" style={{ fontSize: '2rem' }}>{formatCurrency(total)}</div>
      </motion.div>

      <div className="grid-cols-3">
        {accounts.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${a.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  {accountTypeIcons[a.type] || '🏦'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{a.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{accountTypeLabels[a.type]}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn-icon" style={{ padding: 6 }} onClick={() => { setEditId(a.id); setModalOpen(true); }}><Edit3 size={14} /></button>
                <button className="btn-icon" style={{ padding: 6, color: 'var(--accent-red)' }} onClick={() => handleDelete(a.id)}><Trash2 size={14} /></button>
              </div>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: a.balance >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{formatCurrency(a.balance)}</div>
            <div style={{ width: '100%', height: 3, borderRadius: 2, marginTop: 12, background: `linear-gradient(90deg, ${a.color}, transparent)`, opacity: 0.5 }} />
          </motion.div>
        ))}
        {accounts.length === 0 && (
          <div className="glass-card-static" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state">
              <div className="empty-state-icon">🏦</div>
              <div className="empty-state-title">Nenhuma conta cadastrada</div>
              <p className="empty-state-text">Adicione suas contas bancárias, cartões e dinheiro.</p>
            </div>
          </div>
        )}
      </div>

      <AccountModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditId(null); }} editId={editId} />
    </div>
  );
}
