import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { useCategoryStore } from '../store/categoryStore';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ui/ConfirmDialog';
import { natureMeta, groupMeta, expenseNatures } from '../db/seedData';
import CategoryModal from '../components/categories/CategoryModal';
import type { Category, CategoryNature } from '../types';

export default function CategoriesPage() {
  const { categories, deleteCategory } = useCategoryStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState<'expense' | 'income'>('expense');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: 'Excluir categoria?', message: 'Categorias com transações vinculadas não podem ser excluídas.', confirmLabel: 'Excluir', variant: 'danger' });
    if (!ok) return;
    try { await deleteCategory(id); toast.success('Categoria excluída'); }
    catch (err: any) { toast.error(err.message); }
  };

  // Estrutura nature → group → categorias
  const sections = useMemo(() => {
    const list = categories.filter((c) => c.type === tab);
    const natures: CategoryNature[] = tab === 'income' ? ['receita'] : expenseNatures;
    return natures.map((nature) => {
      const inNature = list.filter((c) => c.nature === nature);
      const groups = [...new Set(inNature.map((c) => c.group))].map((group) => ({
        group,
        items: inNature.filter((c) => c.group === group).sort((a, b) => a.order - b.order),
      }));
      return { nature, count: inNature.length, groups };
    }).filter((s) => s.count > 0);
  }, [categories, tab]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Categorias</h1>
        <button className="btn-primary" onClick={() => { setEditId(null); setModalOpen(true); }}>
          <Plus size={16} /> Nova Categoria
        </button>
      </div>

      <div className="tabs" style={{ marginBottom: 20, width: 'fit-content' }}>
        <button className={`tab-item ${tab === 'expense' ? 'active' : ''}`} onClick={() => setTab('expense')}>💸 Despesas</button>
        <button className={`tab-item ${tab === 'income' ? 'active' : ''}`} onClick={() => setTab('income')}>💰 Receitas</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {sections.map((section) => {
          const meta = natureMeta[section.nature];
          return (
            <motion.div key={section.nature} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              {/* Cabeçalho da natureza */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${meta.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{meta.icon}</div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: meta.color }}>{meta.label}</h2>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{section.count} categorias</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {section.groups.map((g) => (
                  <div key={g.group} className="glass-card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: '0.95rem' }}>{groupMeta[g.group]?.icon ?? '📁'}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.03em', color: 'var(--text-secondary)' }}>{g.group}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {g.items.map((cat) => (
                        <CategoryChip key={cat.id} cat={cat}
                          onEdit={() => { setEditId(cat.id); setModalOpen(true); }}
                          onDelete={() => handleDelete(cat.id)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {sections.length === 0 && (
          <div className="glass-card-static">
            <div className="empty-state">
              <div className="empty-state-icon">🏷️</div>
              <div className="empty-state-title">Sem categorias</div>
              <p className="empty-state-text">As categorias padrão são criadas automaticamente ao iniciar.</p>
            </div>
          </div>
        )}
      </div>

      <CategoryModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditId(null); }} editId={editId} />
    </div>
  );
}

function CategoryChip({ cat, onEdit, onDelete }: { cat: Category; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="category-chip" style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 10,
      background: `${cat.color}12`, border: `1px solid ${cat.color}30`,
    }}>
      <span style={{ fontSize: '0.95rem' }}>{cat.icon}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{cat.name}</span>
      <div style={{ display: 'flex', gap: 1, marginLeft: 2 }}>
        <button className="btn-icon" style={{ padding: 3 }} onClick={onEdit}><Edit3 size={11} /></button>
        <button className="btn-icon" style={{ padding: 3, color: 'var(--accent-red)' }} onClick={onDelete}><Trash2 size={11} /></button>
      </div>
    </div>
  );
}
