import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { useCategoryStore } from '../store/categoryStore';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ui/ConfirmDialog';
import CategoryModal from '../components/categories/CategoryModal';

export default function CategoriesPage() {
  const { categories, deleteCategory } = useCategoryStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState<'expense' | 'income'>('expense');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = categories.filter((c) => c.type === tab && !c.parentId);
  const subs = (parentId: string) => categories.filter((c) => c.parentId === parentId);

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Excluir categoria?',
      message: 'Subcategorias sem vínculos também serão removidas.',
      confirmLabel: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await deleteCategory(id);
      toast.success('Categoria excluída');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

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

      <div className="grid-cols-3">
        {filtered.map((cat, i) => (
          <motion.div key={cat.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                  {cat.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</div>
                  {subs(cat.id).length > 0 && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{subs(cat.id).length} subcategorias</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn-icon" style={{ padding: 5 }} onClick={() => { setEditId(cat.id); setModalOpen(true); }}><Edit3 size={13} /></button>
                <button className="btn-icon" style={{ padding: 5, color: 'var(--accent-red)' }} onClick={() => handleDelete(cat.id)}><Trash2 size={13} /></button>
              </div>
            </div>
            {subs(cat.id).length > 0 && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {subs(cat.id).map((sub) => (
                  <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 8 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sub.icon} {sub.name}</span>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <button className="btn-icon" style={{ padding: 4 }} onClick={() => { setEditId(sub.id); setModalOpen(true); }}><Edit3 size={12} /></button>
                      <button className="btn-icon" style={{ padding: 4, color: 'var(--accent-red)' }} onClick={() => handleDelete(sub.id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ width: '100%', height: 3, borderRadius: 2, marginTop: 10, background: `linear-gradient(90deg, ${cat.color}, transparent)`, opacity: 0.4 }} />
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="glass-card-static" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state">
              <div className="empty-state-icon">🏷️</div>
              <div className="empty-state-title">Sem categorias</div>
              <p className="empty-state-text">As categorias padrão serão criadas automaticamente.</p>
            </div>
          </div>
        )}
      </div>
      <CategoryModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditId(null); }} editId={editId} />
    </div>
  );
}
