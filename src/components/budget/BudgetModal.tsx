import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import { useBudgetStore } from '../../store/budgetStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useAppStore } from '../../store/appStore';
import { useToast } from '../../contexts/ToastContext';

interface FormData {
  categoryId: string;
  amount: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function BudgetModal({ isOpen, onClose }: Props) {
  const { currentMonth, currentYear } = useAppStore();
  const { addBudget } = useBudgetStore();
  const { categories } = useCategoryStore();
  const toast = useToast();
  const { register, handleSubmit, reset } = useForm<FormData>();

  const expenseCategories = categories.filter((c) => c.type === 'expense' && !c.parentId);

  const onSubmit = async (data: FormData) => {
    const amount = parseFloat(data.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) { toast.error('Valor inválido'); return; }
    await addBudget({ categoryId: data.categoryId, amount, month: currentMonth, year: currentYear });
    toast.success('Orçamento definido');
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Orçamento">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="input-label">Categoria</label>
          <select className="select-field" {...register('categoryId', { required: true })}>
            <option value="">Selecione</option>
            {expenseCategories.map((c) => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}
          </select>
        </div>
        <div>
          <label className="input-label">Limite (R$)</label>
          <input className="input-field" placeholder="0,00" {...register('amount', { required: true })} />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary">Definir</button>
        </div>
      </form>
    </Modal>
  );
}
