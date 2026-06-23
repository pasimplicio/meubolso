import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Edit3, ArrowUpRight, ArrowDownRight, ArrowRightLeft, RefreshCw, Upload } from 'lucide-react';
import { useTransactionStore } from '../store/transactionStore';
import { useAccountStore } from '../store/accountStore';
import { useCategoryStore } from '../store/categoryStore';
import { useAppStore } from '../store/appStore';
import { formatCurrency, formatDate } from '../lib/utils';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ui/ConfirmDialog';
import TransactionModal from '../components/transactions/TransactionModal';
import StatementImportModal from '../components/statements/StatementImportModal';

export default function TransactionsPage() {
  const { currentMonth, currentYear } = useAppStore();
  const { transactions, deleteTransaction, deleteSeries } = useTransactionStore();
  const { accounts } = useAccountStore();
  const { categories } = useCategoryStore();
  const toast = useToast();
  const confirm = useConfirm();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterRecurring, setFilterRecurring] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);

  const recurrenceLabel: Record<string, string> = { daily: 'Diária', weekly: 'Semanal', monthly: 'Mensal', yearly: 'Anual' };

  const baseFiltered = useMemo(() => {
    let result = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
    });

    if (filterType !== 'all') result = result.filter((t) => t.type === filterType);

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(s) ||
          categories.find((c) => c.id === t.categoryId)?.name.toLowerCase().includes(s)
      );
    }

    if (filterRecurring) result = result.filter((t) => !!t.recurrence);

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentMonth, currentYear, filterType, search, filterRecurring, categories]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    baseFiltered.forEach((t) => t.tags?.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [baseFiltered]);

  const filtered = useMemo(() => {
    if (!filterTag) return baseFiltered;
    return baseFiltered.filter((t) => t.tags?.includes(filterTag));
  }, [baseFiltered, filterTag]);

  const handleDelete = async (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    // Detecta série recorrente (mesmo grupo, ou legado com mesma assinatura + recorrência).
    const sig = (t: typeof tx) => !!tx && !!t &&
      t.description === tx.description && t.amount === tx.amount &&
      t.accountId === tx.accountId && t.categoryId === tx.categoryId && t.type === tx.type;
    const seriesIds = tx
      ? transactions.filter((t) => (tx.recurrenceGroupId ? t.recurrenceGroupId === tx.recurrenceGroupId : sig(t))).map((t) => t.id)
      : [id];
    const isSeries = seriesIds.length > 1 &&
      (!!tx?.recurrenceGroupId || transactions.some((t) => seriesIds.includes(t.id) && !!t.recurrence));

    const ok = await confirm({
      title: isSeries ? 'Excluir série recorrente?' : 'Excluir transação?',
      message: isSeries
        ? `Isso vai excluir os ${seriesIds.length} lançamentos desta recorrência (inclusive os futuros).`
        : 'Esta ação não pode ser desfeita.',
      confirmLabel: isSeries ? 'Excluir série' : 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      if (isSeries) {
        const n = await deleteSeries(id);
        toast.success(`${n} lançamentos excluídos`);
      } else {
        await deleteTransaction(id);
        toast.success('Transação excluída');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEdit = (id: string) => {
    setEditingTransaction(id);
    setModalOpen(true);
  };

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Transações</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => setImportOpen(true)}>
            <Upload size={16} /> Importar Extrato
          </button>
          <button className="btn-primary" onClick={() => { setEditingTransaction(null); setModalOpen(true); }}>
            <Plus size={16} /> Nova Transação
          </button>
        </div>
      </div>

      {/* Summary — sempre 3 cards lado a lado */}
      <div className="stat-row" style={{ marginBottom: 20 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card stat-card">
          <div className="stat-ico" style={{ background: 'var(--accent-green-soft)' }}>
            <ArrowUpRight style={{ color: 'var(--accent-green)' }} />
          </div>
          <div className="stat-box">
            <div className="stat-label">Receitas</div>
            <div className="stat-amount" style={{ color: 'var(--accent-green)' }}>{formatCurrency(totalIncome)}</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card stat-card">
          <div className="stat-ico" style={{ background: 'var(--accent-red-soft)' }}>
            <ArrowDownRight style={{ color: 'var(--accent-red)' }} />
          </div>
          <div className="stat-box">
            <div className="stat-label">Despesas</div>
            <div className="stat-amount" style={{ color: 'var(--accent-red)' }}>{formatCurrency(totalExpense)}</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card stat-card">
          <div className="stat-ico" style={{ background: 'var(--accent-blue-soft)' }}>
            <ArrowRightLeft style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div className="stat-box">
            <div className="stat-label">Saldo</div>
            <div className="stat-amount" style={{ color: totalIncome - totalExpense >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {formatCurrency(totalIncome - totalExpense)}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="glass-card-static" style={{ padding: 14, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-field"
            placeholder="Buscar transações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <div className="tabs">
          {[{ key: 'all', label: 'Todas' }, { key: 'income', label: 'Receitas' }, { key: 'expense', label: 'Despesas' }, { key: 'transfer', label: 'Transferências' }].map((f) => (
            <button
              key={f.key}
              className={`tab-item ${filterType === f.key ? 'active' : ''}`}
              onClick={() => setFilterType(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          className="btn-icon"
          title="Apenas recorrentes"
          onClick={() => setFilterRecurring((v) => !v)}
          style={{
            padding: 8, borderRadius: 8,
            background: filterRecurring ? 'rgba(59,130,246,0.15)' : undefined,
            color: filterRecurring ? 'var(--accent-blue)' : undefined,
            border: filterRecurring ? '1px solid var(--accent-blue)' : '1px solid transparent',
          }}
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Tag filter bar */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 4, alignItems: 'center' }}>
          <button
            onClick={() => setFilterTag(null)}
            style={{
              background: filterTag === null ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: filterTag === null ? 'var(--accent-blue)' : 'var(--text-muted)',
              border: `1px solid ${filterTag === null ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
              borderRadius: 20, padding: '3px 12px', fontSize: '0.75rem', fontWeight: 500,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            Todas
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(filterTag === tag ? null : tag)}
              style={{
                background: filterTag === tag ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: filterTag === tag ? 'var(--accent-blue)' : 'var(--text-secondary)',
                border: `1px solid ${filterTag === tag ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                borderRadius: 20, padding: '3px 12px', fontSize: '0.75rem', fontWeight: 500,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="glass-card-static" style={{ overflow: 'auto' }}>
        {filtered.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Conta</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const cat = categories.find((c) => c.id === t.categoryId);
                const acc = accounts.find((a) => a.id === t.accountId);
                return (
                  <tr key={t.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{formatDate(t.date)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1rem' }}>{cat?.icon || '📦'}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 500 }}>{t.description}</span>
                            {t.recurrence && (
                              <span title={`Recorrência: ${recurrenceLabel[t.recurrence]}`} style={{ display: 'flex', flexShrink: 0 }}>
                                <RefreshCw size={11} style={{ color: 'var(--accent-blue)' }} />
                              </span>
                            )}
                          </div>
                          {t.tags && t.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                              {t.tags.map((tag) => (
                                <span
                                  key={tag}
                                  style={{
                                    background: 'rgba(59,130,246,0.12)',
                                    color: 'var(--accent-blue)',
                                    borderRadius: 20, padding: '1px 7px',
                                    fontSize: '0.65rem', fontWeight: 500,
                                  }}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cat?.name || '-'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{acc?.name || '-'}</td>
                    <td>
                      <span className={`badge ${t.status === 'paid' ? 'badge-green' : 'badge-amber'}`}>
                        {t.status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: t.type === 'income' ? 'var(--accent-green)' : t.type === 'expense' ? 'var(--accent-red)' : 'var(--accent-blue)' }}>
                      {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{formatCurrency(t.amount)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-icon" onClick={() => handleEdit(t.id)} style={{ padding: 6 }}>
                          <Edit3 size={14} />
                        </button>
                        <button className="btn-icon" onClick={() => handleDelete(t.id)} style={{ padding: 6, color: 'var(--accent-red)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">💸</div>
            <div className="empty-state-title">Sem transações</div>
            <p className="empty-state-text">Adicione sua primeira transação para começar a controlar suas finanças.</p>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTransaction(null); }}
        editId={editingTransaction}
      />
      <StatementImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
