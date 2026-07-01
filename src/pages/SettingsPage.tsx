import { motion } from 'framer-motion';
import { Download, Upload, Trash2, Moon, Sun, Info } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { db, initializeDefaults, resetInitState } from '../db';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ui/ConfirmDialog';
import { useAccountStore } from '../store/accountStore';
import { useTransactionStore } from '../store/transactionStore';
import { useCategoryStore } from '../store/categoryStore';
import { useBudgetStore } from '../store/budgetStore';
import { useGoalStore } from '../store/goalStore';
import { useInvestmentStore } from '../store/investmentStore';
import { usePaystubStore } from '../store/paystubStore';

export default function SettingsPage() {
  const { theme, toggleTheme } = useAppStore();
  const toast = useToast();
  const confirm = useConfirm();
  const { loadAccounts } = useAccountStore();
  const { loadTransactions } = useTransactionStore();
  const { loadCategories } = useCategoryStore();
  const { loadBudgets } = useBudgetStore();
  const { loadGoals } = useGoalStore();
  const { loadInvestments } = useInvestmentStore();
  const { loadPaystubs } = usePaystubStore();

  const reloadAllData = () => Promise.all([
    loadAccounts(),
    loadTransactions(),
    loadCategories(),
    loadBudgets(),
    loadGoals(),
    loadInvestments(),
    loadPaystubs(),
  ]);

  const handleExport = async () => {
    const data = {
      accounts: await db.accounts.toArray(),
      categories: await db.categories.toArray(),
      transactions: await db.transactions.toArray(),
      budgets: await db.budgets.toArray(),
      goals: await db.goals.toArray(),
      goalContributions: await db.goalContributions.toArray(),
      investments: await db.investments.toArray(),
      investmentMoves: await db.investmentMoves.toArray(),
      paystubs: await db.paystubs.toArray(),
      exportedAt: new Date().toISOString(),
      version: '1.1',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meubolso-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup exportado com sucesso!');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data.version) { toast.error('Arquivo de backup inválido'); return; }

        await db.accounts.clear();
        await db.categories.clear();
        await db.transactions.clear();
        await db.budgets.clear();
        await db.goals.clear();
        await db.goalContributions.clear();
        await db.investmentMoves.clear();
        await db.investments.clear();
        await db.paystubs.clear();

        if (data.accounts?.length) await db.accounts.bulkAdd(data.accounts);
        if (data.categories?.length) await db.categories.bulkAdd(data.categories);
        if (data.transactions?.length) await db.transactions.bulkAdd(data.transactions);
        if (data.budgets?.length) await db.budgets.bulkAdd(data.budgets);
        if (data.goals?.length) await db.goals.bulkAdd(data.goals);
        if (data.goalContributions?.length) await db.goalContributions.bulkAdd(data.goalContributions);
        if (data.investments?.length) await db.investments.bulkAdd(data.investments);
        if (data.investmentMoves?.length) await db.investmentMoves.bulkAdd(data.investmentMoves);
        if (data.paystubs?.length) await db.paystubs.bulkAdd(data.paystubs);

        await reloadAllData();
        toast.success('Backup importado com sucesso!');
      } catch {
        toast.error('Erro ao importar backup');
      }
    };
    input.click();
  };

  const handleClear = async () => {
    const ok = await confirm({
      title: 'Apagar todos os dados?',
      message: 'Todas as contas, transações, orçamentos, metas, investimentos e contracheques serão removidos permanentemente. Esta ação não pode ser desfeita.',
      confirmLabel: 'Apagar tudo',
      cancelLabel: 'Cancelar',
      variant: 'danger',
    });
    if (ok) {
      await db.accounts.clear();
      await db.categories.clear();
      await db.transactions.clear();
      await db.budgets.clear();
      await db.goals.clear();
      await db.goalContributions.clear();
      await db.investmentMoves.clear();
      await db.investments.clear();
      await db.paystubs.clear();
      // Recria a taxonomia de categorias padrão (não some pra sempre).
      resetInitState();
      await initializeDefaults();
      await reloadAllData();
      toast.success('Dados apagados — categorias padrão restauradas');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header"><h1 className="page-title">Configurações</h1></div>

      <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Theme */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16 }}>Aparência</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              <span style={{ fontSize: '0.875rem' }}>Tema {theme === 'dark' ? 'Escuro' : 'Claro'}</span>
            </div>
            <button className="btn-secondary" onClick={toggleTheme}>
              Alternar para {theme === 'dark' ? 'Claro' : 'Escuro'}
            </button>
          </div>
        </motion.div>

        {/* Data */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16 }}>Dados</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn-secondary" onClick={handleExport} style={{ justifyContent: 'flex-start' }}>
              <Download size={16} /> Exportar Backup (JSON)
            </button>
            <button className="btn-secondary" onClick={handleImport} style={{ justifyContent: 'flex-start' }}>
              <Upload size={16} /> Importar Backup
            </button>
            <button className="btn-danger" onClick={handleClear} style={{ justifyContent: 'flex-start' }}>
              <Trash2 size={16} /> Limpar Todos os Dados
            </button>
          </div>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16 }}>Sobre</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Info size={16} style={{ color: 'var(--accent-blue)' }} />
            <span style={{ fontSize: '0.875rem' }}>MeuBolso v1.0.0</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Aplicativo de controle financeiro pessoal. Seus dados são sincronizados com segurança pelo Firebase e mantidos em cache no dispositivo para acesso offline.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
