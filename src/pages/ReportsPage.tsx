import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  CartesianGrid, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { useTransactionStore } from '../store/transactionStore';
import { useCategoryStore } from '../store/categoryStore';
import { useAppStore } from '../store/appStore';
import { formatCurrency, getMonthName } from '../lib/utils';

// Tooltip customizado reutilizável
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
      borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-card-hover)',
      fontSize: '0.8rem',
    }}>
      {label && <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>{label}</div>}
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.fill || p.stroke || p.color }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(Number(p.value))}</span>
        </div>
      ))}
    </div>
  );
}

const CHART_COLORS = {
  income:  '#10b981',
  expense: '#f43f5e',
  balance: '#6366f1',
  accent:  '#3b82f6',
};

const tabs = [
  { label: 'Receitas vs Despesas', icon: BarChart3 },
  { label: 'Gastos por Categoria', icon: PieIcon },
  { label: 'Evolução do Saldo',    icon: TrendingUp },
  { label: 'Tendência',            icon: TrendingDown },
];

export default function ReportsPage() {
  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { currentYear } = useAppStore();
  const [tab, setTab] = useState(0);

  const monthlyData = useMemo(() => {
    const data = [];
    for (let m = 1; m <= 12; m++) {
      const mt = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === currentYear && d.getMonth() + 1 === m && t.status === 'paid';
      });
      const inc = mt.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = mt.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      data.push({ month: getMonthName(m).substring(0, 3), Receitas: inc, Despesas: exp, Saldo: inc - exp });
    }
    return data;
  }, [transactions, currentYear]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => new Date(t.date).getFullYear() === currentYear && t.type === 'expense' && t.status === 'paid')
      .forEach((t) => { map[t.categoryId] = (map[t.categoryId] || 0) + t.amount; });
    return Object.entries(map)
      .map(([id, value]) => {
        const cat = categories.find((c) => c.id === id);
        return { name: cat?.name || 'Outros', value, color: cat?.color || '#64748b', icon: cat?.icon || '📦' };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [transactions, categories, currentYear]);

  const balanceEvolution = useMemo(() => {
    let cumulative = 0;
    return monthlyData.map((d) => { cumulative += d.Saldo; return { ...d, Acumulado: cumulative }; });
  }, [monthlyData]);

  // Resumo do ano
  const yearSummary = useMemo(() => {
    const paid = transactions.filter((t) => new Date(t.date).getFullYear() === currentYear && t.status === 'paid');
    const income  = paid.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = paid.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions, currentYear]);

  const axisStyle = { fill: 'var(--text-muted)', fontSize: 11 };
  const gridStyle = { strokeDasharray: '3 3', stroke: 'var(--border-subtle)' };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Relatórios — {currentYear}</h1>
      </div>

      {/* Resumo anual */}
      <div className="grid-cols-3" style={{ marginBottom: 20 }}>
        {[
          { label: 'Receitas no Ano',  value: yearSummary.income,  color: CHART_COLORS.income,  icon: TrendingUp },
          { label: 'Despesas no Ano',  value: yearSummary.expense, color: CHART_COLORS.expense, icon: TrendingDown },
          { label: 'Resultado Anual',  value: yearSummary.balance, color: yearSummary.balance >= 0 ? CHART_COLORS.income : CHART_COLORS.expense, icon: BarChart3 },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{ padding: 0, overflow: 'hidden' }}
          >
            <div style={{ height: 3, background: s.color }} />
            <div style={{ padding: '14px 18px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
                {s.label}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {formatCurrency(s.value)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map((t, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.18s ease',
              background: tab === i ? CHART_COLORS.accent : 'var(--bg-surface)',
              color: tab === i ? '#fff' : 'var(--text-secondary)',
              boxShadow: tab === i ? '0 2px 8px rgba(59,130,246,0.3)' : 'var(--shadow-card)',
            }}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart Card */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="glass-card"
        style={{ padding: 24 }}
      >
        {/* ── Tab 0: Receitas vs Despesas ── */}
        {tab === 0 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Receitas vs Despesas Mensal</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Comparativo mensal de entradas e saídas em {currentYear}</p>
            </div>
            <div style={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={4} margin={{ left: -10 }}>
                  <CartesianGrid {...gridStyle} vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisStyle} />
                  <YAxis axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{value}</span>}
                  />
                  <Bar dataKey="Receitas" fill={CHART_COLORS.income}  radius={[5, 5, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="Despesas" fill={CHART_COLORS.expense} radius={[5, 5, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* ── Tab 1: Gastos por Categoria ── */}
        {tab === 1 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Gastos por Categoria</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Distribuição anual de despesas em {currentYear}</p>
            </div>
            {categoryData.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData} cx="50%" cy="50%"
                        innerRadius={65} outerRadius={110}
                        dataKey="value" stroke="none" paddingAngle={2}
                      >
                        {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 10, fontSize: '0.8rem' }}
                        formatter={(v: any) => [formatCurrency(Number(v)), '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {categoryData.map((c, i) => {
                    const total = categoryData.reduce((s, x) => s + x.value, 0);
                    const pct = total > 0 ? (c.value / total) * 100 : 0;
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{c.icon} {c.name}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(c.value)}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: 34, textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--border-subtle)', borderRadius: 2 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: c.color, borderRadius: 2, transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">📊</div><p className="empty-state-text">Sem gastos registrados em {currentYear}</p></div>
            )}
          </>
        )}

        {/* ── Tab 2: Evolução do Saldo ── */}
        {tab === 2 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Evolução do Saldo Acumulado</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Crescimento do patrimônio ao longo de {currentYear}</p>
            </div>
            <div style={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={balanceEvolution} margin={{ left: -10 }}>
                  <defs>
                    <linearGradient id="gBal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={CHART_COLORS.balance} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={CHART_COLORS.balance} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridStyle} vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisStyle} />
                  <YAxis axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone" dataKey="Acumulado" name="Saldo Acumulado"
                    stroke={CHART_COLORS.balance} strokeWidth={2.5}
                    fill="url(#gBal)"
                    dot={{ fill: CHART_COLORS.balance, r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* ── Tab 3: Tendência ── */}
        {tab === 3 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Tendência de Receitas e Despesas</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Linha de tendência mês a mês em {currentYear}</p>
            </div>
            <div style={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ left: -10 }}>
                  <CartesianGrid {...gridStyle} vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisStyle} />
                  <YAxis axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{value}</span>}
                  />
                  <Line
                    type="monotone" dataKey="Receitas"
                    stroke={CHART_COLORS.income} strokeWidth={2.5}
                    dot={{ fill: CHART_COLORS.income, r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone" dataKey="Despesas"
                    stroke={CHART_COLORS.expense} strokeWidth={2.5}
                    dot={{ fill: CHART_COLORS.expense, r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
