import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import { useTransactionStore } from '../../store/transactionStore';
import { useAccountStore } from '../../store/accountStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useToast } from '../../contexts/ToastContext';
import { parseDateInput, toDateInputValue } from '../../lib/utils';
import { paymentMethods, paymentMethodMeta, natureMeta } from '../../db/seedData';
import type { TransactionType, TransactionStatus, Recurrence, PaymentMethod, Category } from '../../types';

interface FormData {
  type: TransactionType;
  amount: string;
  description: string;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  date: string;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod | '';
  reconciled?: boolean;
  recurrence?: Recurrence | '';
  recurrenceEndDate?: string;
  notes?: string;
}

/** Agrupa categorias por Tipo → Grupo para o seletor, em ordem alfabética. */
function groupCategories(cats: Category[]) {
  const byKey = new Map<string, { nature: string; group: string; items: Category[] }>();
  for (const c of cats) {
    const key = `${c.nature}__${c.group}`;
    if (!byKey.has(key)) byKey.set(key, { nature: c.nature, group: c.group, items: [] });
    byKey.get(key)!.items.push(c);
  }
  const groups = [...byKey.values()];
  for (const g of groups) g.items.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  groups.sort((a, b) => a.group.localeCompare(b.group, 'pt-BR') || a.nature.localeCompare(b.nature, 'pt-BR'));
  return groups;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editId?: string | null;
}

export default function TransactionModal({ isOpen, onClose, editId }: Props) {
  const { transactions, addTransaction, updateTransaction } = useTransactionStore();
  const { accounts, updateBalance } = useAccountStore();
  const { categories } = useCategoryStore();
  const toast = useToast();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      type: 'expense',
      status: 'paid',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      reconciled: false,
      recurrence: '',
    },
  });

  const transactionType = watch('type');
  const recurrenceValue = watch('recurrence');
  const dateValue = watch('date');

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (editId) {
      const t = transactions.find((t) => t.id === editId);
      if (t) {
        setValue('type', t.type);
        setValue('amount', t.amount.toString());
        setValue('description', t.description);
        setValue('categoryId', t.categoryId);
        setValue('accountId', t.accountId);
        setValue('toAccountId', t.toAccountId || '');
        setValue('date', toDateInputValue(t.date));
        setValue('status', t.status);
        setValue('paymentMethod', t.paymentMethod || '');
        setValue('reconciled', t.reconciled ?? false);
        setValue('recurrence', t.recurrence || '');
        setValue('recurrenceEndDate', t.recurrenceEndDate ? toDateInputValue(t.recurrenceEndDate) : '');
        setValue('notes', t.notes || '');
        setTags(t.tags ?? []);
      }
    } else {
      reset({
        type: 'expense',
        status: 'paid',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        reconciled: false,
        recurrence: '',
        recurrenceEndDate: '',
      });
      setTags([]);
      setTagInput('');
    }
  }, [editId, isOpen]);

  const filteredCategories = categories.filter((c) =>
    transactionType === 'transfer' ? true : c.type === transactionType
  );

  const addTag = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); }
    if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) setTags((prev) => prev.slice(0, -1));
  };

  const onSubmit = async (data: FormData) => {
    const amount = parseFloat(data.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      toast.error('Valor inválido');
      return;
    }

    const payload = {
      type: data.type,
      amount,
      description: data.description,
      categoryId: data.categoryId,
      accountId: data.accountId,
      toAccountId: data.type === 'transfer' ? data.toAccountId : undefined,
      date: parseDateInput(data.date),
      status: data.status,
      paymentMethod: data.paymentMethod ? (data.paymentMethod as PaymentMethod) : undefined,
      reconciled: data.reconciled ?? false,
      recurrence: data.recurrence ? (data.recurrence as Recurrence) : undefined,
      recurrenceEndDate: data.recurrence && data.recurrenceEndDate ? parseDateInput(data.recurrenceEndDate) : undefined,
      tags: tags.length > 0 ? tags : undefined,
      notes: data.notes || undefined,
    };

    if (editId) {
      await updateTransaction(editId, payload);
      toast.success('Transação atualizada');
    } else {
      await addTransaction(payload);

      // Update account balances
      if (data.status === 'paid') {
        if (data.type === 'income') {
          await updateBalance(data.accountId, amount);
        } else if (data.type === 'expense') {
          await updateBalance(data.accountId, -amount);
        } else if (data.type === 'transfer' && data.toAccountId) {
          await updateBalance(data.accountId, -amount);
          await updateBalance(data.toAccountId, amount);
        }
      }

      toast.success('Transação adicionada');
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editId ? 'Editar Transação' : 'Nova Transação'}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Type Tabs */}
        <div className="tabs" style={{ width: '100%' }}>
          {(['expense', 'income', 'transfer'] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`tab-item ${transactionType === t ? 'active' : ''}`}
              onClick={() => setValue('type', t)}
              style={{ flex: 1, textAlign: 'center' }}
            >
              {t === 'expense' ? '💸 Despesa' : t === 'income' ? '💰 Receita' : '↔️ Transferência'}
            </button>
          ))}
        </div>

        <div>
          <label className="input-label">Valor (R$)</label>
          <input
            className={`input-field ${errors.amount ? 'input-error' : ''}`}
            placeholder="0,00"
            {...register('amount', { required: true })}
            style={{ fontSize: '1.2rem', fontWeight: 700 }}
          />
        </div>

        <div>
          <label className="input-label">Descrição</label>
          <input
            className={`input-field ${errors.description ? 'input-error' : ''}`}
            placeholder="Ex: Almoço, Salário, Aluguel..."
            {...register('description', { required: true })}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="input-label">Categoria</label>
            <select className="select-field" {...register('categoryId', { required: true })}>
              <option value="">Selecione</option>
              {groupCategories(filteredCategories).map((g) => (
                <optgroup
                  key={`${g.nature}-${g.group}`}
                  label={g.nature === 'receita' ? g.group : `${natureMeta[g.nature as keyof typeof natureMeta]?.label ?? ''} · ${g.group}`}
                >
                  {g.items.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Conta</label>
            <select className="select-field" {...register('accountId', { required: true })}>
              <option value="">Selecione</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {transactionType === 'transfer' && (
          <div>
            <label className="input-label">Conta Destino</label>
            <select className="select-field" {...register('toAccountId')}>
              <option value="">Selecione</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="input-label">Data</label>
            <input className="input-field" type="date" {...register('date', { required: true })} />
          </div>
          <div>
            <label className="input-label">Status</label>
            <select className="select-field" {...register('status')}>
              <option value="paid">✅ Pago</option>
              <option value="pending">⏳ Pendente</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label className="input-label">Forma de pagamento</label>
            <select className="select-field" {...register('paymentMethod')}>
              <option value="">Não informado</option>
              {paymentMethods.map((m) => (
                <option key={m} value={m}>{paymentMethodMeta[m].icon} {paymentMethodMeta[m].label}</option>
              ))}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer', paddingBottom: 10, whiteSpace: 'nowrap' }}>
            <input type="checkbox" {...register('reconciled')} /> Conciliado
          </label>
        </div>

        <div>
          <label className="input-label">Recorrência</label>
          <select className="select-field" {...register('recurrence')}>
            <option value="">Nenhuma</option>
            <option value="daily">Diária</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
          </select>
          {recurrenceValue && (
            <div style={{ marginTop: 10 }}>
              <label className="input-label">Repetir até</label>
              <input
                className="input-field"
                type="date"
                min={dateValue}
                {...register('recurrenceEndDate')}
              />
            </div>
          )}
        </div>

        <div>
          <label className="input-label">Tags (opcional)</label>
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'var(--accent-blue-soft, rgba(59,130,246,0.15))',
                    color: 'var(--accent-blue, #3b82f6)',
                    borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 500,
                  }}
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1, fontSize: '0.85rem' }}
                  >×</button>
                </span>
              ))}
            </div>
          )}
          <input
            className="input-field"
            placeholder="Adicionar tag... (Enter ou vírgula)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
        </div>

        <div>
          <label className="input-label">Notas (opcional)</label>
          <textarea
            className="input-field"
            rows={2}
            placeholder="Observações..."
            {...register('notes')}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            {editId ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
