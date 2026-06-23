import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import { useCategoryStore } from '../../store/categoryStore';
import { useToast } from '../../contexts/ToastContext';
import { natureMeta, groupMeta, groupColor, expenseNatures } from '../../db/seedData';
import type { CategoryType, CategoryNature } from '../../types';

interface FormData {
  name: string;
  type: CategoryType;
  nature: CategoryNature;
  group: string;
  icon: string;
  color: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editId?: string | null;
}

const icons = ['🏠', '🍔', '🚗', '💊', '📚', '🎮', '👕', '💡', '📱', '🐕', '✂️', '📦', '💰', '💼', '📈', '🎁', '🎵', '🍕', '☕', '🏋️', '✈️', '🎬', '💻', '🛒'];
const colors = ['#6366f1', '#a855f7', '#ec4899', '#00d4aa', '#3b82f6', '#f59e0b', '#ef4444', '#14b8a6', '#f97316', '#64748b', '#8b5cf6', '#eab308'];

const expenseGroups = Object.keys(groupMeta).filter((g) => g !== 'RECEITAS');

export default function CategoryModal({ isOpen, onClose, editId }: Props) {
  const { categories, addCategory, updateCategory } = useCategoryStore();
  const toast = useToast();
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: { type: 'expense', nature: 'variaveis', group: 'MORADIA', icon: '📦', color: '#6366f1' },
  });
  const selectedIcon = watch('icon');
  const selectedColor = watch('color');
  const type = watch('type');
  const group = watch('group');

  useEffect(() => {
    if (editId) {
      const c = categories.find((c) => c.id === editId);
      if (c) {
        setValue('name', c.name); setValue('type', c.type); setValue('nature', c.nature);
        setValue('group', c.group); setValue('icon', c.icon); setValue('color', c.color);
      }
    } else {
      reset({ type: 'expense', nature: 'variaveis', group: 'MORADIA', icon: '📦', color: groupColor('MORADIA') });
    }
  }, [editId, isOpen]);

  // Quando troca para receita, fixa natureza/grupo.
  useEffect(() => {
    if (type === 'income') { setValue('nature', 'receita'); setValue('group', 'RECEITAS'); }
    else if (watch('nature') === 'receita') { setValue('nature', 'variaveis'); setValue('group', 'MORADIA'); }
  }, [type]);

  const onSubmit = async (data: FormData) => {
    const payload = {
      name: data.name,
      type: data.type,
      nature: data.type === 'income' ? ('receita' as const) : data.nature,
      group: data.type === 'income' ? 'RECEITAS' : data.group,
      icon: data.icon,
      color: data.color,
      order: categories.length + 1,
    };
    if (editId) { await updateCategory(editId, payload); toast.success('Categoria atualizada'); }
    else { await addCategory(payload); toast.success('Categoria criada'); }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editId ? 'Editar Categoria' : 'Nova Categoria'}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="input-label">Nome</label>
          <input className="input-field" placeholder="Nome da categoria" {...register('name', { required: true })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: type === 'income' ? '1fr' : '1fr 1fr', gap: 12 }}>
          <div>
            <label className="input-label">Tipo</label>
            <select className="select-field" {...register('type')}>
              <option value="expense">💸 Despesa</option>
              <option value="income">💰 Receita</option>
            </select>
          </div>
          {type === 'expense' && (
            <div>
              <label className="input-label">Natureza</label>
              <select className="select-field" {...register('nature')}>
                {expenseNatures.map((n) => (
                  <option key={n} value={n}>{natureMeta[n].icon} {natureMeta[n].label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        {type === 'expense' && (
          <div>
            <label className="input-label">Grupo</label>
            <select className="select-field" {...register('group')}
              onChange={(e) => { setValue('group', e.target.value); setValue('color', groupColor(e.target.value)); }}>
              {expenseGroups.map((g) => (
                <option key={g} value={g}>{groupMeta[g].icon} {g}</option>
              ))}
            </select>
          </div>
        )}
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
          <label className="input-label">Cor {type === 'expense' && <span style={{ color: 'var(--text-muted)' }}>(padrão do grupo {group})</span>}</label>
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
