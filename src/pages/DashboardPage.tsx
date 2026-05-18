import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Wallet, Calendar, Target, ArrowRightLeft, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';
import { useTransactionStore } from '../store/transactionStore';
import { useAccountStore } from '../store/accountStore';
import { useGoalStore } from '../store/goalStore';
import { useCategoryStore } from '../store/categoryStore';
import { useAppStore } from '../store/appStore';
import { formatCurrency, formatDateRelative, getMonthName } from '../lib/utils';
import ProgressBar from '../components/ui/ProgressBar';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 22, stiffness: 200 } },
};

// Tooltip customizado dos gráficos
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
      borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-card-hover)',
      fontSize: '0.8rem',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Card KPI com barra colorida superior
function KpiCard({ label, value, icon: Icon, color, sub, subUp }: {
  label: string; value: string; icon: any; color: string;
  sub?: string; subUp?: boolean;
}) {
  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Barra colorida no topo */}
      <div style={{ height: 4, background: color }} />
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
            {label}
          </span>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} style={{ color }} />
          </div>
        </div>
        <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value}
        </div>
        {sub && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            {subUp !== undefined && (
              subUp
                ? <ArrowUpRight size={13} style={{ color: 'var(--accent-green)' }} />
                : <ArrowDownRight size={13} style={{ color: 'var(--accent-red)' }} />
            )}
            <span style={{ fontSize: '0.72rem', color: subUp ? 'var(--accent-green)' : subUp === false ? 'var(--accent-red)' : 'var(--text-muted)', fontWeight: 600 }}>
              {sub}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { currentMonth, currentYear } = useAppStore();
  const { transactions } = useTransactionStore();
  const { getTotalBalance, accounts } = useAccountStore();
  const { goals } = useGoalStore();
  const { categories } = useCategoryStore();

  const monthTransactions = useMemo(() => transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
  }), [transactions, currentMonth, currentYear]);

  const totalIncome = useMemo(() =>
    monthTransactions.filter((t) => t.type === 'income' && t.status === 'paid').reduce((s, t) => s + t.amount, 0),
    [monthTransactions]);

  const totalExpense = useMemo(() =>
    monthTransactions.filter((t) => t.type === 'expense' && t.status === 'paid').reduce((s, t) => s + t.amount, 0),
    [monthTransactions]);

  const balance = totalIncome - totalExpense;
  const totalBalance = getTotalBalance();

  const prevMonthTransactions = useMemo(() => {
    const pm = currentMonth === 1 ? 12 : currentMonth - 1;
    const py = currentMonth === 1 ? currentYear - 1 : currentYear;
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === py && d.getMonth() + 1 === pm;
    });
  }, [transactions, currentMonth, currentYear]);

  const prevBalance = useMemo(() => {
    const inc = prevMonthTransactions.filter((t) => t.type === 'income' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);
    const exp = prevMonthTransactions.filter((t) => t.type === 'expense' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);
    return inc - exp;
  }, [prevMonthTransactions]);

  const percentChange = prevBalance !== 0 ? ((balance - prevBalance) / Math.abs(prevBalance)) * 100 : 0;

  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {};
    monthTransactions.filter((t) => t.type === 'expense' && t.status === 'paid')
      .forEach((t) => { spending[t.categoryId] = (spending[t.categoryId] || 0) + t.amount; });
    return Object.entries(spending)
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        return { name: cat?.name || 'Outros', value: amount, color: cat?.color || '#64748b', icon: cat?.icon || '📦' };
      })
      .sort((a, b) => b.value - a.value).slice(0, 6);
  }, [monthTransactions, categories]);

  const cashFlowData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      while (m <= 0) { m += 12; y--; }
      const mt = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === y && d.getMonth() + 1 === m && t.status === 'paid';
      });
      data.push({
        month: getMonthName(m).substring(0, 3),
        Receitas: mt.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        Despesas: mt.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return data;
  }, [transactions, currentMonth, currentYear]);

  const recentTransactions = useMemo(() =>
    [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6),
    [transactions]);

  const pendingBills = useMemo(() =>
    monthTransactions.filter((t) => t.type === 'expense' && t.status === 'pending')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5),
    [monthTransactions]);

  const activeGoals = useMemo(() =>
    goals.filter((g) => g.currentAmount < g.targetAmount).slice(0, 3),
    [goals]);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  return (
    <motion.div className="page-container" variants={container} initial="hidden" animate="show">

      {/* ── KPI Cards ── */}
      <div className="grid-cols-4" style={{ marginBottom: 20 }}>
        <motion.div variants={item}>
          <KpiCard
            label="Saldo Total"
            value={formatCurrency(totalBalance)}
            icon={Wallet}
            color="#3b82f6"
            sub={accounts.length > 0 ? `${accounts.length} conta${accounts.length > 1 ? 's' : ''}` : undefined}
          />
        </motion.div>
        <motion.div variants={item}>
          <KpiCard
            label="Receitas do Mês"
            value={formatCurrency(totalIncome)}
            icon={TrendingUp}
            color="#10b981"
          />
        </motion.div>
        <motion.div variants={item}>
          <KpiCard
            label="Despesas do Mês"
            value={formatCurrency(totalExpense)}
            icon={TrendingDown}
            color="#f43f5e"
          />
        </motion.div>
        <motion.div variants={item}>
          <KpiCard
            label="Saldo do Mês"
            value={formatCurrency(balance)}
            icon={ArrowRightLeft}
            color={balance >= 0 ? '#10b981' : '#f43f5e'}
            sub={
              percentChange !== 0
                ? `${Math.abs(percentChange).toFixed(1)}% vs mês anterior`
                : savingsRate > 0 ? `${savingsRate.toFixed(0)}% taxa de poupança` : undefined
            }
            subUp={percentChange !== 0 ? percentChange > 0 : undefined}
          />
        </motion.div>
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* Fluxo de Caixa */}
        <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Fluxo de Caixa</h3>
              <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2 }}>Últimos 6 meses</p>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: '0.72rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} /> Receitas
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: '#f43f5e' }} /> Despesas
              </span>
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Receitas" stroke="#10b981" strokeWidth={2.5} fill="url(#gIncome)" dot={false} activeDot={{ r: 5, fill: '#10b981' }} />
                <Area type="monotone" dataKey="Despesas" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gExpense)" dot={false} activeDot={{ r: 5, fill: '#f43f5e' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gastos por Categoria */}
        <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>Gastos por Categoria</h3>
          <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: 12 }}>{getMonthName(currentMonth)}</p>
          {categorySpending.length > 0 ? (
            <>
              <div style={{ height: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categorySpending} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" stroke="none" paddingAngle={2}>
                      {categorySpending.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: '0.78rem' }}
                      formatter={(v: any) => [formatCurrency(Number(v)), '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
                {categorySpending.slice(0, 4).map((cat, i) => {
                  const pct = totalExpense > 0 ? (cat.value / totalExpense) * 100 : 0;
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cat.icon} {cat.name}
                        </div>
                        <div style={{ height: 3, background: 'var(--border-subtle)', borderRadius: 2, marginTop: 3 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: cat.color, borderRadius: 2, transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {formatCurrency(cat.value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: 20 }}>
              <div className="empty-state-icon">📊</div>
              <p className="empty-state-text">Sem gastos este mês</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 16 }}>

        {/* Últimas Transações */}
        <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
            Últimas Transações
          </h3>
          {recentTransactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentTransactions.map((t, idx) => {
                const cat = categories.find((c) => c.id === t.categoryId);
                const isLast = idx === recentTransactions.length - 1;
                return (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '9px 0',
                    borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: t.type === 'income' ? 'rgba(16,185,129,0.1)' : t.type === 'expense' ? 'rgba(244,63,94,0.1)' : 'rgba(59,130,246,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                    }}>
                      {cat?.icon || '📦'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                        {t.description}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                        {formatDateRelative(t.date)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: '0.82rem', fontWeight: 700,
                        color: t.type === 'income' ? 'var(--accent-green)' : t.type === 'expense' ? 'var(--accent-red)' : 'var(--accent-blue)',
                      }}>
                        {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{formatCurrency(t.amount)}
                      </div>
                      {t.status === 'pending' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', marginTop: 2 }}>
                          <Clock size={10} style={{ color: 'var(--accent-amber)' }} />
                          <span style={{ fontSize: '0.64rem', color: 'var(--accent-amber)', fontWeight: 600 }}>Pendente</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 24 }}>
              <div className="empty-state-icon">💸</div>
              <p className="empty-state-text">Nenhuma transação ainda</p>
            </div>
          )}
        </motion.div>

        {/* Contas a Pagar */}
        <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={14} style={{ color: 'var(--accent-amber)' }} />
            </div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Contas a Pagar</h3>
          </div>
          {pendingBills.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingBills.map((t) => {
                const cat = categories.find((c) => c.id === t.categoryId);
                const daysLeft = Math.ceil((new Date(t.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const urgency = daysLeft <= 0 ? 'badge-red' : daysLeft <= 3 ? 'badge-red' : daysLeft <= 7 ? 'badge-amber' : 'badge-blue';
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--bg-primary)' }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{cat?.icon || '📦'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                        {t.description}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-red)', fontWeight: 700, marginTop: 2 }}>
                        {formatCurrency(t.amount)}
                      </div>
                    </div>
                    <span className={`badge ${urgency}`}>
                      {daysLeft <= 0 ? 'Vencido' : `${daysLeft}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 24 }}>
              <div className="empty-state-icon">✅</div>
              <p className="empty-state-text">Sem contas pendentes</p>
            </div>
          )}
        </motion.div>

        {/* Metas em Progresso */}
        <motion.div variants={item} className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(20,184,166,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={14} style={{ color: '#14b8a6' }} />
            </div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Metas Ativas</h3>
          </div>
          {activeGoals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeGoals.map((g) => {
                const percent = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
                return (
                  <div key={g.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: `${g.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', flexShrink: 0,
                      }}>
                        {g.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                          {g.name}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1 }}>
                          {formatCurrency(g.currentAmount)} de {formatCurrency(g.targetAmount)}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: g.color }}>{percent.toFixed(0)}%</span>
                    </div>
                    <ProgressBar value={g.currentAmount} max={g.targetAmount} gradient={`linear-gradient(90deg, ${g.color}, ${g.color}bb)`} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 24 }}>
              <div className="empty-state-icon">🎯</div>
              <p className="empty-state-text">Crie sua primeira meta financeira</p>
            </div>
          )}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .page-container > div:nth-child(2) { grid-template-columns: 1fr !important; }
          .page-container > div:last-of-type { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .page-container > div:last-of-type { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  );
}
