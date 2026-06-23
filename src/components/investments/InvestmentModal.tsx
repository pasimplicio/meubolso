import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import { useInvestmentStore } from '../../store/investmentStore';
import { useAccountStore } from '../../store/accountStore';
import { useRatesStore } from '../../store/ratesStore';
import { useToast } from '../../contexts/ToastContext';
import { investmentClasses, investmentClassMeta } from '../../db/seedData';
import { effectiveAnnualRate } from '../../lib/investments';
import type { InvestmentClass, RateType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editId?: string | null;
}

const rateTypeOptions: { value: RateType; label: string }[] = [
  { value: 'cdi', label: '% do CDI' },
  { value: 'prefixado', label: 'Prefixado (% a.a.)' },
  { value: 'selic', label: '% da Selic' },
  { value: 'ipca', label: 'IPCA + (% a.a.)' },
  { value: 'manual', label: 'Manual (renda variável)' },
];

function rateLabel(t: RateType): string {
  switch (t) {
    case 'cdi': return '% do CDI';
    case 'selic': return '% da Selic';
    case 'prefixado': return 'Taxa (% a.a.)';
    case 'ipca': return 'IPCA + (% a.a.)';
    default: return 'Taxa';
  }
}

export default function InvestmentModal({ isOpen, onClose, editId }: Props) {
  const { investments, addInvestment, updateInvestment } = useInvestmentStore();
  const { accounts } = useAccountStore();
  const rates = useRatesStore();
  const toast = useToast();

  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [klass, setKlass] = useState<InvestmentClass>('renda_fixa');
  const [invested, setInvested] = useState('');
  const [current, setCurrent] = useState('');
  const [rateType, setRateType] = useState<RateType>('cdi');
  const [rate, setRate] = useState('100');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!isOpen) return;
    const inv = editId ? investments.find((i) => i.id === editId) : null;
    if (inv) {
      setName(inv.name); setInstitution(inv.institution ?? ''); setKlass(inv.class);
      setInvested(String(inv.investedAmount)); setCurrent(String(inv.currentValue));
      setRateType(inv.rateType ?? 'manual'); setRate(inv.rate != null ? String(inv.rate) : '100');
      setAccountId(inv.accountId ?? ''); setDate(new Date(inv.date).toISOString().split('T')[0]);
    } else {
      setName(''); setInstitution(''); setKlass('renda_fixa');
      setInvested(''); setCurrent(''); setRateType('cdi'); setRate('100');
      setAccountId(''); setDate(new Date().toISOString().split('T')[0]);
    }
  }, [editId, isOpen]);

  const isManual = rateType === 'manual';
  const investedPreview = parseFloat(invested.replace(',', '.')) || 0;
  // Prévia da taxa efetiva ao ano para renda fixa.
  const effRate = !isManual
    ? effectiveAnnualRate({ rateType, rate: parseFloat(rate.replace(',', '.')) || 0 }, rates)
    : 0;

  const handleSave = async () => {
    const investedNum = parseFloat(invested.replace(',', '.'));
    if (!name.trim()) { toast.error('Informe o nome do investimento'); return; }
    if (isNaN(investedNum) || investedNum < 0) { toast.error('Valor aplicado inválido'); return; }
    const rateNum = parseFloat(rate.replace(',', '.'));
    const currentNum = current ? parseFloat(current.replace(',', '.')) : investedNum;

    const payload = {
      name: name.trim(),
      institution: institution.trim() || undefined,
      class: klass,
      investedAmount: investedNum,
      // Para renda fixa o valor atual é calculado; guardamos o aplicado como base.
      currentValue: isManual ? (isNaN(currentNum) ? investedNum : currentNum) : investedNum,
      rateType,
      rate: isManual ? undefined : (isNaN(rateNum) ? 0 : rateNum),
      accountId: accountId || undefined,
      date: new Date(date),
    };

    if (editId) { await updateInvestment(editId, payload); toast.success('Investimento atualizado'); }
    else { await addInvestment(payload); toast.success('Investimento adicionado'); }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editId ? 'Editar Investimento' : 'Novo Investimento'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="input-label">Nome</label>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: CDB Banco X, Tesouro Selic 2029, PETR4..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="input-label">Classe</label>
            <select className="select-field" value={klass} onChange={(e) => setKlass(e.target.value as InvestmentClass)}>
              {investmentClasses.map((c) => (
                <option key={c} value={c}>{investmentClassMeta[c].icon} {investmentClassMeta[c].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Instituição</label>
            <input className="input-field" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Ex: Nubank, XP..." />
          </div>
        </div>

        {/* Rendimento */}
        <div style={{ display: 'grid', gridTemplateColumns: isManual ? '1fr' : '1fr 130px', gap: 12 }}>
          <div>
            <label className="input-label">Rendimento</label>
            <select className="select-field" value={rateType} onChange={(e) => setRateType(e.target.value as RateType)}>
              {rateTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {!isManual && (
            <div>
              <label className="input-label">{rateLabel(rateType)}</label>
              <input className="input-field" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0" />
            </div>
          )}
        </div>

        {/* Valores */}
        <div style={{ display: 'grid', gridTemplateColumns: isManual ? '1fr 1fr' : '1fr', gap: 12 }}>
          <div>
            <label className="input-label">Valor aplicado (R$)</label>
            <input className="input-field" value={invested} onChange={(e) => setInvested(e.target.value)} placeholder="0,00" />
          </div>
          {isManual && (
            <div>
              <label className="input-label">Valor atual (R$)</label>
              <input className="input-field" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="igual ao aplicado" />
            </div>
          )}
        </div>

        {!isManual && investedPreview > 0 && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: -6 }}>
            📈 Rende ~<strong style={{ color: 'var(--accent-green)' }}>{effRate.toFixed(2)}% a.a.</strong> e o valor atual é calculado automaticamente a cada dia (CDI atual {rates.cdi.toFixed(2)}%).
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="input-label">Conta de origem</label>
            <select className="select-field" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">Nenhuma</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Data de aplicação</label>
            <input className="input-field" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave}>{editId ? 'Salvar' : 'Adicionar'}</button>
        </div>
      </div>
    </Modal>
  );
}
