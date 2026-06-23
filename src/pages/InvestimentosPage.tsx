import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit3, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useInvestmentStore } from '../store/investmentStore';
import { useRatesStore } from '../store/ratesStore';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ui/ConfirmDialog';
import { formatCurrency, formatPercentage } from '../lib/utils';
import { investmentClassMeta } from '../db/seedData';
import { portfolioTotals, projectedValue, investmentReturn } from '../lib/investments';
import InvestmentModal from '../components/investments/InvestmentModal';
import type { InvestmentClass } from '../types';

export default function InvestimentosPage() {
  const { investments, loadInvestments, deleteInvestment } = useInvestmentStore();
  const rates = useRatesStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => { loadInvestments(); }, []);

  // Atualiza as taxas no BCB se nunca foram buscadas ou faz mais de 12h.
  useEffect(() => {
    const stale = !rates.updatedAt || (Date.now() - new Date(rates.updatedAt).getTime() > 12 * 3600_000);
    if (stale) rates.fetchFromBcb();
  }, []);

  const { invested, current, gain, gainPct } = portfolioTotals(investments, rates);

  const handleUpdateRates = async () => {
    const ok = await rates.fetchFromBcb();
    if (ok) toast.success('Taxas atualizadas pelo Banco Central');
    else toast.error('Não foi possível buscar no BCB. Ajuste manualmente.');
  };

  const allocation = useMemo(() => {
    const acc = {} as Record<InvestmentClass, number>;
    for (const inv of investments) {
      acc[inv.class] = (acc[inv.class] ?? 0) + projectedValue(inv, rates);
    }
    return (Object.keys(acc) as InvestmentClass[]).map((c) => ({
      name: investmentClassMeta[c].label,
      value: acc[c],
      color: investmentClassMeta[c].color,
    })).filter((d) => d.value > 0);
  }, [investments, rates.cdi, rates.selic, rates.ipca]);

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: 'Excluir investimento?', message: 'Os aportes registrados também serão removidos.', confirmLabel: 'Excluir', variant: 'danger' });
    if (!ok) return;
    await deleteInvestment(id);
    toast.success('Investimento excluído');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Investimentos</h1>
        <button className="btn-primary" onClick={() => { setEditId(null); setModalOpen(true); }}>
          <Plus size={16} /> Novo Investimento
        </button>
      </div>

      {/* Painel de taxas de referência */}
      <div className="glass-card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Taxas de referência</span>
        {([['CDI', 'cdi'], ['Selic', 'selic'], ['IPCA', 'ipca']] as const).map(([label, key]) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
            <input
              className="input-field"
              style={{ width: 70, padding: '4px 8px', fontSize: '0.82rem', textAlign: 'right' }}
              value={rates[key]}
              onChange={(e) => rates.setRates({ [key]: parseFloat(e.target.value.replace(',', '.')) || 0 })}
            />
            <span style={{ color: 'var(--text-muted)' }}>%</span>
          </label>
        ))}
        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={handleUpdateRates} disabled={rates.loading}>
          <RefreshCw size={14} style={rates.loading ? { animation: 'spin 1s linear infinite' } : undefined} /> Atualizar (BCB)
        </button>
        {rates.updatedAt && (
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            atualizado {new Date(rates.updatedAt).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>

      {/* Resumo — sempre 3 lado a lado */}
      <div className="stat-row" style={{ marginBottom: 20 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card stat-card">
          <div className="stat-box">
            <div className="stat-label">Total aplicado</div>
            <div className="stat-amount">{formatCurrency(invested)}</div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card stat-card">
          <div className="stat-box">
            <div className="stat-label">Valor atual</div>
            <div className="stat-amount" style={{ color: 'var(--accent-blue)' }}>{formatCurrency(current)}</div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card stat-card">
          <div className="stat-ico" style={{ background: gain >= 0 ? 'var(--accent-green-soft)' : 'var(--accent-red-soft)' }}>
            {gain >= 0 ? <TrendingUp style={{ color: 'var(--accent-green)' }} /> : <TrendingDown style={{ color: 'var(--accent-red)' }} />}
          </div>
          <div className="stat-box">
            <div className="stat-label">Rentabilidade</div>
            <div className="stat-amount" style={{ color: gain >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{formatCurrency(gain)}</div>
            <div className="stat-sub" style={{ color: gain >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{formatPercentage(gainPct)}</div>
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: allocation.length ? '320px 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
        {/* Alocação */}
        {allocation.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 20 }}>
            <div className="stat-label" style={{ marginBottom: 8 }}>Alocação por classe</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={allocation} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {allocation.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {allocation.map((d) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color }} /> {d.name}
                  </span>
                  <strong>{formatCurrency(d.value)}</strong>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Lista */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {investments.map((inv) => {
            const { current: cur, gain: g, gainPct: gp } = investmentReturn(inv, rates);
            const meta = investmentClassMeta[inv.class];
            const rateTag = inv.rateType && inv.rateType !== 'manual'
              ? (inv.rateType === 'cdi' ? `${inv.rate ?? 100}% CDI`
                : inv.rateType === 'selic' ? `${inv.rate ?? 100}% Selic`
                : inv.rateType === 'ipca' ? `IPCA+${inv.rate ?? 0}%`
                : `${inv.rate ?? 0}% a.a.`)
              : null;
            return (
              <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: `${meta.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{meta.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{inv.name}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                    {meta.label}{inv.institution ? ` · ${inv.institution}` : ''}{rateTag ? ` · ${rateTag}` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800 }}>{formatCurrency(cur)}</div>
                  <div style={{ fontSize: '0.73rem', color: g >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {g >= 0 ? '+' : ''}{formatCurrency(g)} ({formatPercentage(gp)})
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-icon" style={{ padding: 6 }} onClick={() => { setEditId(inv.id); setModalOpen(true); }}><Edit3 size={14} /></button>
                  <button className="btn-icon" style={{ padding: 6, color: 'var(--accent-red)' }} onClick={() => handleDelete(inv.id)}><Trash2 size={14} /></button>
                </div>
              </motion.div>
            );
          })}

          {investments.length === 0 && (
            <div className="glass-card-static">
              <div className="empty-state">
                <div className="empty-state-icon">📈</div>
                <div className="empty-state-title">Nenhum investimento cadastrado</div>
                <p className="empty-state-text">Cadastre seus investimentos para acompanhar a rentabilidade e a alocação da carteira.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <InvestmentModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditId(null); }} editId={editId} />
    </div>
  );
}
