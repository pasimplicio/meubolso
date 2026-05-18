import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import { useAccountStore } from '../../store/accountStore';
import { useToast } from '../../contexts/ToastContext';
import type { AccountType } from '../../types';

interface FormData {
  name: string;
  type: AccountType;
  balance: string;
  color: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editId?: string | null;
}

const colors = ['#6366f1', '#a855f7', '#ec4899', '#00d4aa', '#3b82f6', '#f59e0b', '#ef4444', '#14b8a6', '#f97316', '#64748b'];

export default function AccountModal({ isOpen, onClose, editId }: Props) {
  const { accounts, addAccount, updateAccount } = useAccountStore();
  const toast = useToast();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { type: 'checking', color: '#6366f1', balance: '0' },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (editId) {
      const a = accounts.find((a) => a.id === editId);
      if (a) {
        setValue('name', a.name);
        setValue('type', a.type);
        setValue('balance', a.balance.toString());
        setValue('color', a.color);
      }
    } else {
      reset({ type: 'checking', color: '#6366f1', balance: '0' });
    }
  }, [editId, isOpen]);

  const onSubmit = async (data: FormData) => {
    const balance = parseFloat(data.balance.replace(',', '.'));
    if (isNaN(balance)) { toast.error('Saldo inválido'); return; }

    if (editId) {
      await updateAccount(editId, { name: data.name, type: data.type, balance, color: data.color });
      toast.success('Conta atualizada');
    } else {
      await addAccount({ name: data.name, type: data.type, balance, color: data.color, icon: '' });
      toast.success('Conta criada');
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editId ? 'Editar Conta' : 'Nova Conta'}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="input-label">Nome da Conta</label>
          <input className={`input-field ${errors.name ? 'input-error' : ''}`} placeholder="Ex: Nubank, Itaú, Carteira..." {...register('name', { required: true })} />
        </div>
        <div>
          <label className="input-label">Tipo</label>
          <select className="select-field" {...register('type')}>
            <option value="checking">🏦 Conta Corrente</option>
            <option value="savings">🐷 Poupança</option>
            <option value="credit_card">💳 Cartão de Crédito</option>
            <option value="cash">💵 Dinheiro</option>
            <option value="investment">📊 Investimentos</option>
          </select>
        </div>
        <div>
          <label className="input-label">Saldo Inicial (R$)</label>
          <input className="input-field" placeholder="0,00" {...register('balance', { required: true })} />
        </div>
        <div>
          <label className="input-label">Cor</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {colors.map((c) => (
              <button key={c} type="button" onClick={() => setValue('color', c)}
                style={{ width: 32, height: 32, borderRadius: 8, background: c, border: selectedColor === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary">{editId ? 'Salvar' : 'Criar Conta'}</button>
        </div>
      </form>
    </Modal>
  );
}
