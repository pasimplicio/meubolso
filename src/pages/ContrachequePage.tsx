import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, ChevronDown, Wallet } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { usePaystubStore } from '../store/paystubStore';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ui/ConfirmDialog';
import { formatCurrency, getMonthName } from '../lib/utils';
import PaystubImportModal from '../components/paystubs/PaystubImportModal';

export default function ContrachequePage() {
  const { paystubs, loadPaystubs, deletePaystub } = usePaystubStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [importOpen, setImportOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { loadPaystubs(); }, []);

  const totals = useMemo(() => {
    const gross = paystubs.reduce((s, p) => s + p.grossTotal, 0);
    const deductions = paystubs.reduce((s, p) => s + p.deductionsTotal, 0);
    const net = paystubs.reduce((s, p) => s + p.netTotal, 0);
    const fgts = paystubs.reduce((s, p) => s + (p.fgts ?? 0), 0);
    return { gross, deductions, net, fgts };
  }, [paystubs]);

  const chartData = useMemo(
    () =>
      [...paystubs]
        .sort((a, b) => (a.year - b.year) || (a.month - b.month))
        .map((p) => ({
          label: `${getMonthName(p.month).slice(0, 3)}/${String(p.year).slice(2)}`,
          liquido: p.netTotal,
          bruto: p.grossTotal,
        })),
    [paystubs]
  );

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Excluir contracheque?',
      message: 'As transações geradas (receita do bruto e despesas dos descontos) também serão removidas e o saldo ajustado.',
      confirmLabel: 'Excluir', variant: 'danger',
    });
    if (!ok) return;
    try { await deletePaystub(id); toast.success('Contracheque excluído'); }
    catch (e: any) { toast.error(e.message ?? 'Erro ao excluir'); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Contracheque</h1>
        <button className="btn-primary" onClick={() => setImportOpen(true)}>
          <Upload size={16} /> Importar PDF
        </button>
      </div>

      {/* Resumo */}
      <div className="stat-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <StatCard label="Bruto" value={totals.gross} color="var(--accent-green)" />
        <StatCard label="Descontos" value={totals.deductions} color="var(--accent-red)" />
        <StatCard label="Líquido" value={totals.net} color="var(--accent-blue)" />
        <StatCard label="FGTS" value={totals.fgts} color="#a855f7" />
      </div>

      {/* Gráfico de evolução */}
      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
          <div className="stat-label" style={{ marginBottom: 12 }}>Evolução do salário líquido</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v) => formatCurrency(Number(v))}
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, fontSize: 12 }}
              />
              <Bar dataKey="liquido" name="Líquido" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill="var(--accent-blue)" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {paystubs.map((p) => {
          const isOpen = expanded === p.id;
          return (
            <motion.div key={p.id} layout className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                onClick={() => setExpanded(isOpen ? null : p.id)}
              >
                <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--accent-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={18} style={{ color: 'var(--accent-blue)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                    {getMonthName(p.month)} / {p.year}{p.sequence ? ` · ${p.sequence}ª via` : ''}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.employer || 'Contracheque'} · {p.items.length} rubricas
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--accent-blue)' }}>{formatCurrency(p.netTotal)}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>líquido</div>
                </div>
                <button className="btn-icon" style={{ padding: 6, color: 'var(--accent-red)' }} onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}>
                  <Trash2 size={14} />
                </button>
                <ChevronDown size={16} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>

              {isOpen && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, paddingTop: 14 }}>
                    <ItemColumn title="Proventos" color="var(--accent-green)" items={p.items.filter((i) => i.kind === 'provento')} />
                    <ItemColumn title="Descontos" color="var(--accent-red)" items={p.items.filter((i) => i.kind === 'desconto')} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Bruto <strong style={{ color: 'var(--accent-green)' }}>{formatCurrency(p.grossTotal)}</strong></span>
                    <span style={{ color: 'var(--text-muted)' }}>Descontos <strong style={{ color: 'var(--accent-red)' }}>{formatCurrency(p.deductionsTotal)}</strong></span>
                    <span style={{ color: 'var(--text-muted)' }}>Líquido <strong style={{ color: 'var(--accent-blue)' }}>{formatCurrency(p.netTotal)}</strong></span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}

        {paystubs.length === 0 && (
          <div className="glass-card-static">
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <div className="empty-state-title">Nenhum contracheque importado</div>
              <p className="empty-state-text">Importe o PDF do seu holerite para acompanhar salário, descontos e líquido.</p>
            </div>
          </div>
        )}
      </div>

      <PaystubImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card stat-card">
      <div className="stat-box">
        <div className="stat-label">{label}</div>
        <div className="stat-amount" style={{ color }}>{formatCurrency(value)}</div>
      </div>
    </motion.div>
  );
}

function ItemColumn({ title, color, items }: { title: string; color: string; items: { description: string; amount: number }[] }) {
  return (
    <div>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', gap: 10 }}>
            <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.description}</span>
            <span style={{ fontWeight: 600 }}>{formatCurrency(it.amount)}</span>
          </div>
        ))}
        {items.length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>}
      </div>
    </div>
  );
}
