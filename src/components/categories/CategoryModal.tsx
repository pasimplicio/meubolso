import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import { useCategoryStore } from '../../store/categoryStore';
import { useToast } from '../../contexts/ToastContext';
import type { CategoryType } from '../../types';

interface FormData {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  parentId: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editId?: string | null;
}

const icons = ['🏠', '🍔', '🚗', '💊', '📚', '🎮', '👕', '💡', '📱', '🐕', '✂️', '📦', '💰', '💼', '📈', '🎁', '🎵', '🍕', '☕', '🏋️', '✈️', '🎬', '💻', '🛒'];
const colors = ['#6366f1', '#a855f7', '#ec4899', '#00d4aa', '#3b82f6', '#f59e0b', '#ef4444', '#14b8a6', '#f97316', '#64748b', '#8b5cf6', '#eab308'];

export default function CategoryModal({ isOpen, onClose, editId }: Props) {
  const { categories, addCategory, updateCategory } = useCategoryStore();
  const toast = useToast();
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: { type: 'expense', icon: '📦', color: '#6366f1', parentId: '' },
  });
  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  useEffect(() => {
    if (editId) {
      const c = categories.find((c) => c.id === editId);
      if (c) { setValue('name', c.name); setValue('type', c.type); setValue('icon', c.icon); setValue('color', c.color); setValue('parentId', c.parentId || ''); }
    } else {
      reset({ type: 'expense', icon: '📦', color: '#6366f1', parentId: '' });
    }
  }, [editId, isOpen]);

  const parentOptions = categories.filter((c) => !c.parentId);

  const onSubmit = async (data: FormData) => {
    const payload = { name: data.name, type: data.type, icon: data.icon, color: data.color, parentId: data.parentId || undefined, order: categories.length + 1 };
    if (editId) {
      await updateCategory(editId, payload);
      toast.success('Categoria atualizada');
    } else {
      await addCategory(payload);
      toast.success('Categoria criada');
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editId ? 'Editar Categoria' : 'Nova Categoria'}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="input-label">Nome</label>
          <input className="input-field" placeholder="Nome da categoria" {...register('name', { required: true })} />
        </div>
        <div>
          <label className="input-label">Tipo</label>
          <select className="select-field" {...register('type')}>
            <option value="expense">💸 Despesa</option>
            <option value="income">💰 Receita</option>
          </select>
        </div>
        <div>
          <label className="input-label">Subcategoria de (opcional)</label>
          <select className="select-field" {...register('parentId')}>
            <option value="">Nenhuma (categoria principal)</option>
            {parentOptions.map((c) => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}
          </select>
        </div>
        <div>
          <label className="input-label">Ícone</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {icons.map((ic) => (
              <button key={ic} type="button" onClick={() => setValue('icon', ic)}
                style={{ width: 36, height: 36, borderRadius: 8, background: selectedIcon === ic ? 'var(--accent-blue-soft)' : 'var(--bg-glass)', border: selectedIcon === ic ? '2px solid var(--accent-blue)' : '1px solid var(--border-subtle)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {ic}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="input-label">Cor</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {colors.map((c) => (
              <button key={c} type="button" onClick={() => setValue('color', c)}
                style={{ width: 32, height: 32, borderRadius: 8, background: c, border: selectedColor === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer' }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary">{editId ? 'Salvar' : 'Criar'}</button>
        </div>
      </form>
    </Modal>
  );
}
