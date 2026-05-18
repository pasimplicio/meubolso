import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import { useGoalStore } from '../../store/goalStore';
import { useToast } from '../../contexts/ToastContext';
import type { GoalType } from '../../types';

interface FormData {
  name: string;
  targetAmount: string;
  deadline: string;
  type: GoalType;
  icon: string;
  color: string;
}

interface Props { isOpen: boolean; onClose: () => void; }

const goalIcons = ['🏦', '✈️', '🏠', '🚗', '📱', '💍', '🎓', '💰', '🏋️', '🎯'];
const colors = ['#6366f1', '#a855f7', '#ec4899', '#00d4aa', '#3b82f6', '#f59e0b', '#ef4444', '#14b8a6'];

export default function GoalModal({ isOpen, onClose }: Props) {
  const { addGoal } = useGoalStore();
  const toast = useToast();
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: { type: 'custom', icon: '🎯', color: '#6366f1' },
  });
  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  const onSubmit = async (data: FormData) => {
    const targetAmount = parseFloat(data.targetAmount.replace(',', '.'));
    if (isNaN(targetAmount) || targetAmount <= 0) { toast.error('Valor inválido'); return; }
    await addGoal({ name: data.name, targetAmount, deadline: new Date(data.deadline), type: data.type, icon: data.icon, color: data.color });
    toast.success('Meta criada!');
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Meta">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label className="input-label">Nome</label><input className="input-field" placeholder="Ex: Viagem para Europa" {...register('name', { required: true })} /></div>
        <div><label className="input-label">Valor Alvo (R$)</label><input className="input-field" placeholder="10.000,00" {...register('targetAmount', { required: true })} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label className="input-label">Prazo</label><input className="input-field" type="date" {...register('deadline', { required: true })} /></div>
          <div><label className="input-label">Tipo</label>
            <select className="select-field" {...register('type')}>
              <option value="emergency">Reserva de Emergência</option>
              <option value="travel">Viagem</option>
              <option value="purchase">Compra</option>
              <option value="investment">Investimento</option>
              <option value="debt">Quitação de Dívida</option>
              <option value="custom">Personalizada</option>
            </select>
          </div>
        </div>
        <div><label className="input-label">Ícone</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {goalIcons.map((ic) => (<button key={ic} type="button" onClick={() => setValue('icon', ic)} style={{ width: 36, height: 36, borderRadius: 8, background: selectedIcon === ic ? 'var(--accent-blue-soft)' : 'var(--bg-glass)', border: selectedIcon === ic ? '2px solid var(--accent-blue)' : '1px solid var(--border-subtle)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ic}</button>))}
          </div>
        </div>
        <div><label className="input-label">Cor</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {colors.map((c) => (<button key={c} type="button" onClick={() => setValue('color', c)} style={{ width: 32, height: 32, borderRadius: 8, background: c, border: selectedColor === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer' }} />))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary">Criar Meta</button>
        </div>
      </form>
    </Modal>
  );
}
