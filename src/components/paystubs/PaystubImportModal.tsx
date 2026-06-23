import { useEffect, useState } from 'react';
import { UploadCloud, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import { usePaystubStore } from '../../store/paystubStore';
import { useAccountStore } from '../../store/accountStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useToast } from '../../contexts/ToastContext';
import { parsePaystubPdf } from '../../lib/paystubParser';
import { formatCurrency, firstBusinessDayOfNextMonth, parseDateInput, toDateInputValue } from '../../lib/utils';
import { payrollDeductionDefs, guessDeductionCategoryName, natureMeta } from '../../db/seedData';
import type { PaystubItem, Category } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface Draft {
  employer: string;
  month: number;
  year: number;
  date: string; // yyyy-mm-dd
  sequence?: number;
  items: PaystubItem[];
  fgts?: number;
}

const toInput = (d: Date) => toDateInputValue(d);

const emptyDraft = (): Draft => {
  const now = new Date();
  return {
    employer: '',
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    date: toInput(firstBusinessDayOfNextMonth(now.getFullYear(), now.getMonth() + 1)),
    items: [],
  };
};

/** Agrupa categorias de despesa por Tipo · Grupo para o seletor. */
function groupExpense(cats: Category[]) {
  const exp = cats.filter((c) => c.type === 'expense');
  const map = new Map<string, { nature: string; group: string; items: Category[] }>();
  for (const c of exp) {
    const key = `${c.nature}__${c.group}`;
    if (!map.has(key)) map.set(key, { nature: c.nature, group: c.group, items: [] });
    map.get(key)!.items.push(c);
  }
  const groups = [...map.values()];
  for (const g of groups) g.items.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  groups.sort((a, b) => a.group.localeCompare(b.group, 'pt-BR') || a.nature.localeCompare(b.nature, 'pt-BR'));
  return groups;
}

export default function PaystubImportModal({ isOpen, onClose }: Props) {
  const { addPaystub } = usePaystubStore();
  const { accounts } = useAccountStore();
  const { categories, ensureCategories } = useCategoryStore();
  const toast = useToast();

  const [parsing, setParsing] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [accountId, setAccountId] = useState('');
  const [register, setRegister] = useState(true);
  const [saving, setSaving] = useState(false);

  // Garante que as categorias de Folha de Pagamento existam ao abrir.
  useEffect(() => { if (isOpen) ensureCategories(payrollDeductionDefs); }, [isOpen]);

  const reset = () => { setDraft(null); setAccountId(''); setRegister(true); setParsing(false); };

  const resolveCatId = (name: string) =>
    categories.find((c) => c.type === 'expense' && c.name === name)?.id;

  /** Atribui a categoria-palpite a cada desconto. */
  const withGuessedCategories = (items: PaystubItem[]): PaystubItem[] =>
    items.map((it) =>
      it.kind === 'desconto' && !it.categoryId
        ? { ...it, categoryId: resolveCatId(guessDeductionCategoryName(it.description)) }
        : it
    );

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Selecione um arquivo PDF do contracheque.');
      return;
    }
    setParsing(true);
    try {
      await ensureCategories(payrollDeductionDefs);
      const buf = await file.arrayBuffer();
      const parsed = await parsePaystubPdf(buf);
      if (parsed.items.length === 0) toast.error('Não consegui ler as rubricas. Lance manualmente abaixo.');
      else toast.success(`Contracheque lido: ${parsed.items.length} rubricas.`);
      setDraft({
        employer: parsed.employer ?? '',
        month: parsed.month,
        year: parsed.year,
        date: toInput(firstBusinessDayOfNextMonth(parsed.year, parsed.month)),
        sequence: parsed.sequence,
        items: withGuessedCategories(parsed.items),
        fgts: parsed.fgts,
      });
    } catch (e) {
      console.error(e);
      toast.error('Falha ao processar o PDF. Tente lançar manualmente.');
      setDraft(emptyDraft());
    } finally {
      setParsing(false);
    }
  };

  const gross = (draft?.items ?? []).filter((i) => i.kind === 'provento').reduce((s, i) => s + i.amount, 0);
  const deductions = (draft?.items ?? []).filter((i) => i.kind === 'desconto').reduce((s, i) => s + i.amount, 0);
  const net = Math.max(0, gross - deductions);

  const updateItem = (idx: number, patch: Partial<PaystubItem>) => {
    if (!draft) return;
    setDraft({ ...draft, items: draft.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) });
  };
  const removeItem = (idx: number) => draft && setDraft({ ...draft, items: draft.items.filter((_, i) => i !== idx) });
  const addItem = (kind: PaystubItem['kind']) => {
    if (!draft) return;
    const base: PaystubItem = { description: '', amount: 0, kind };
    if (kind === 'desconto') base.categoryId = resolveCatId('Outros Descontos');
    setDraft({ ...draft, items: [...draft.items, base] });
  };

  // Quando muda mês/ano, recalcula a data sugerida.
  const setMonthYear = (patch: Partial<Pick<Draft, 'month' | 'year'>>) => {
    if (!draft) return;
    const month = patch.month ?? draft.month;
    const year = patch.year ?? draft.year;
    setDraft({ ...draft, month, year, date: toInput(firstBusinessDayOfNextMonth(year, month)) });
  };

  const handleSave = async () => {
    if (!draft) return;
    if (draft.items.length === 0) { toast.error('Adicione ao menos uma rubrica.'); return; }
    if (register && !accountId) { toast.error('Selecione a conta para registrar no fluxo de caixa.'); return; }
    setSaving(true);
    try {
      const items = draft.items
        .filter((i) => i.description.trim() && i.amount > 0)
        .map((i) => (i.kind === 'desconto' && !i.categoryId
          ? { ...i, categoryId: resolveCatId('Outros Descontos') }
          : i));
      await addPaystub(
        {
          employer: draft.employer || undefined,
          month: draft.month,
          year: draft.year,
          sequence: draft.sequence,
          date: parseDateInput(draft.date),
          grossTotal: gross,
          deductionsTotal: deductions,
          netTotal: net,
          fgts: draft.fgts,
          items,
          accountId: accountId || undefined,
        },
        register && !!accountId
      );
      toast.success('Contracheque salvo!');
      reset();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar o contracheque.');
    } finally {
      setSaving(false);
    }
  };

  const proventos = (draft?.items ?? []).map((it, i) => ({ it, i })).filter((x) => x.it.kind === 'provento');
  const descontos = (draft?.items ?? []).map((it, i) => ({ it, i })).filter((x) => x.it.kind === 'desconto');
  const expenseGroups = groupExpense(categories);

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title="Importar Contracheque" maxWidth="660px" closeOnOverlayClick={!draft}>
      {!draft ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ border: '2px dashed var(--border-subtle)', borderRadius: 14, padding: '36px 20px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: 'var(--bg-primary)' }}>
            {parsing
              ? <Loader2 size={36} style={{ color: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />
              : <UploadCloud size={36} style={{ color: 'var(--accent-blue)' }} />}
            <div style={{ fontWeight: 600 }}>{parsing ? 'Lendo o PDF…' : 'Selecione o PDF do contracheque'}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Holerite Digital / Demonstrativo de Pagamento de Salário</div>
            <input type="file" accept="application/pdf" style={{ display: 'none' }} disabled={parsing}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </label>
          <button className="btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setDraft(emptyDraft())}>
            <Plus size={15} /> Lançar manualmente
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Cabeçalho editável */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 80px', gap: 10 }}>
            <div>
              <label className="input-label">Empregador</label>
              <input className="input-field" value={draft.employer} onChange={(e) => setDraft({ ...draft, employer: e.target.value })} placeholder="Empresa" />
            </div>
            <div>
              <label className="input-label">Mês</label>
              <input className="input-field" type="number" min={1} max={12} value={draft.month} onChange={(e) => setMonthYear({ month: parseInt(e.target.value) || 1 })} />
            </div>
            <div>
              <label className="input-label">Ano</label>
              <input className="input-field" type="number" value={draft.year} onChange={(e) => setMonthYear({ year: parseInt(e.target.value) || draft.year })} />
            </div>
          </div>

          {/* Data de registro */}
          <div>
            <label className="input-label">Data de registro (lançamento no fluxo de caixa)</label>
            <input className="input-field" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Sugerido: 1º dia útil do mês seguinte à competência {String(draft.month).padStart(2, '0')}/{draft.year}.
            </div>
          </div>

          {/* Proventos */}
          <ProventoSection rows={proventos} onChange={updateItem} onRemove={removeItem} onAdd={() => addItem('provento')} />

          {/* Descontos com categoria */}
          <DescontoSection rows={descontos} groups={expenseGroups} onChange={updateItem} onRemove={removeItem} onAdd={() => addItem('desconto')} />

          {/* Resumo */}
          <div className="glass-card-static" style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
            <Summary label="Bruto (Receita)" value={gross} color="var(--accent-green)" />
            <Summary label="Descontos (Despesas)" value={deductions} color="var(--accent-red)" />
            <Summary label="Líquido" value={net} color="var(--accent-blue)" strong />
          </div>
          {draft.fgts ? (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>FGTS do mês (informativo): {formatCurrency(draft.fgts)}</div>
          ) : null}

          {/* Conta + registro */}
          <div>
            <label className="input-label">Conta</label>
            <select className="select-field" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">Selecione a conta…</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={register} onChange={(e) => setRegister(e.target.checked)} />
            Registrar no fluxo de caixa (Bruto como receita + Descontos como despesas)
          </label>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setDraft(null)}>Voltar</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <FileText size={15} />}
              Salvar contracheque
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Summary({ label, value, color, strong }: { label: string; value: number; color: string; strong?: boolean }) {
  return (
    <div>
      <div className="stat-label">{label}</div>
      <div style={{ fontWeight: strong ? 800 : 700, color, fontSize: strong ? '1.05rem' : '0.95rem' }}>{formatCurrency(value)}</div>
    </div>
  );
}

function SectionHeader({ title, color, onAdd }: { title: string; color: string; onAdd: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{title}</span>
      <button className="btn-icon" style={{ padding: 4 }} onClick={onAdd} title={`Adicionar ${title}`}><Plus size={14} /></button>
    </div>
  );
}

function ProventoSection({ rows, onChange, onRemove, onAdd }: {
  rows: { it: PaystubItem; i: number }[];
  onChange: (idx: number, patch: Partial<PaystubItem>) => void;
  onRemove: (idx: number) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      <SectionHeader title="Proventos (entram no Bruto)" color="var(--accent-green)" onAdd={onAdd} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.length === 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nenhum item.</div>}
        {rows.map(({ it, i }) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 30px', gap: 6 }}>
            <input className="input-field" value={it.description} placeholder="Descrição" onChange={(e) => onChange(i, { description: e.target.value })} style={{ fontSize: '0.8rem' }} />
            <input className="input-field" type="number" step="0.01" value={it.amount || ''} onChange={(e) => onChange(i, { amount: parseFloat(e.target.value) || 0 })} style={{ fontSize: '0.8rem' }} />
            <button className="btn-icon" style={{ padding: 4, color: 'var(--accent-red)' }} onClick={() => onRemove(i)}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DescontoSection({ rows, groups, onChange, onRemove, onAdd }: {
  rows: { it: PaystubItem; i: number }[];
  groups: { nature: string; group: string; items: Category[] }[];
  onChange: (idx: number, patch: Partial<PaystubItem>) => void;
  onRemove: (idx: number) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      <SectionHeader title="Descontos (viram despesas por categoria)" color="var(--accent-red)" onAdd={onAdd} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.length === 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nenhum item.</div>}
        {rows.map(({ it, i }) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 95px 1fr 30px', gap: 6 }}>
            <input className="input-field" value={it.description} placeholder="Descrição" onChange={(e) => onChange(i, { description: e.target.value })} style={{ fontSize: '0.8rem' }} />
            <input className="input-field" type="number" step="0.01" value={it.amount || ''} onChange={(e) => onChange(i, { amount: parseFloat(e.target.value) || 0 })} style={{ fontSize: '0.8rem' }} />
            <select className="select-field" value={it.categoryId ?? ''} onChange={(e) => onChange(i, { categoryId: e.target.value })} style={{ fontSize: '0.78rem' }}>
              <option value="">Categoria…</option>
              {groups.map((g) => (
                <optgroup key={`${g.nature}-${g.group}`} label={`${natureMeta[g.nature as keyof typeof natureMeta]?.label ?? ''} · ${g.group}`}>
                  {g.items.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </optgroup>
              ))}
            </select>
            <button className="btn-icon" style={{ padding: 4, color: 'var(--accent-red)' }} onClick={() => onRemove(i)}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
