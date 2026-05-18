import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import { useGoalStore } from '../../store/goalStore';
import { useToast } from '../../contexts/ToastContext';

interface FormData { amount: string; notes: string; }
interface Props { goalId: string | null; onClose: () => void; }

export default function ContributionModal({ goalId, onClose }: Props) {
  const { addContribution, goals } = useGoalStore();
  const toast = useToast();
  const { register, handleSubmit, reset } = useForm<FormData>();

  const goal = goals.find((g) => g.id === goalId);

  const onSubmit = async (data: FormData) => {
    if (!goalId) return;
    const amount = parseFloat(data.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) { toast.error('Valor inválido'); return; }
    await addContribution(goalId, amount, data.notes || undefined);
    toast.success(`${amount >= (goal?.targetAmount ?? 0) - (goal?.currentAmount ?? 0) ? '🎉 Meta atingida!' : 'Contribuição adicionada!'}`);
    reset();
    onClose();
  };

  if (!goalId) return null;

  return (
    <Modal isOpen={!!goalId} onClose={onClose} title={`Contribuir — ${goal?.name || ''}`}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label className="input-label">Valor (R$)</label><input className="input-field" placeholder="0,00" {...register('amount', { required: true })} style={{ fontSize: '1.2rem', fontWeight: 700 }} /></div>
        <div><label className="input-label">Notas (opcional)</label><input className="input-field" placeholder="Ex: Economia do mês" {...register('notes')} /></div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary">Contribuir</button>
        </div>
      </form>
    </Modal>
  );
}
