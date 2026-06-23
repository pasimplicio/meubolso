import { useEffect, useMemo, useState } from 'react';
import { UploadCloud, Loader2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import Modal from '../ui/Modal';
import { useTransactionStore } from '../../store/transactionStore';
import { useAccountStore } from '../../store/accountStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useToast } from '../../contexts/ToastContext';
import { parseStatementPdf, type ParsedStatement } from '../../lib/statementParser';
import { formatCurrency, formatDate } from '../../lib/utils';
import { statementFallbackDefs, guessStatementCategoryName } from '../../db/seedData';
import type { PaymentMethod } from '../../types';

interface Props { isOpen: boolean; onClose: () => void; }

interface Row {
  date: Date;
  description: string;
  operationId: string;
  amount: number; // sinalizado
  type: 'income' | 'expense';
  categoryId: string;
  include: boolean;
}

function inferMethod(desc: string): PaymentMethod {
  const d = desc.toLowerCase();
  if (/cart[ãa]o de cr[ée]dito|fatura/.test(d)) return 'credito';
  if (/pagamento de conta|boleto/.test(d)) return 'boleto';
  if (/transfer/.test(d)) return 'transferencia';
  if (/pix|qr/.test(d)) return 'pix';
  return 'pix';
}

export default function StatementImportModal({ isOpen, onClose }: Props) {
  const { importMany } = useTransactionStore();
  const { accounts, updateAccount } = useAccountStore();
  const { categories, ensureCategories } = useCategoryStore();
  const toast = useToast();

  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedStatement | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [accountId, setAccountId] = useState('');
  const [setFinalBalance, setSetFinalBalance] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (isOpen) ensureCategories(statementFallbackDefs); }, [isOpen]);

  const reset = () => { setParsed(null); setRows([]); setAccountId(''); setSetFinalBalance(true); setParsing(false); };

  const incomeCats = useMemo(() => categories.filter((c) => c.type === 'income').sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')), [categories]);
  const expenseCats = useMemo(() => categories.filter((c) => c.type === 'expense').sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')), [categories]);
  const resolveCat = (name: string, isIncome: boolean) =>
    (isIncome ? incomeCats : expenseCats).find((c) => c.name === name)?.id ?? '';

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      toast.error('Selecione um PDF de extrato.'); return;
    }
    setParsing(true);
    try {
      await ensureCategories(statementFallbackDefs);
      const buf = await file.arrayBuffer();
      const res = await parseStatementPdf(buf);
      if (res.entries.length === 0) { toast.error('Nenhum lançamento encontrado no PDF.'); setParsing(false); return; }
      setParsed(res);
      setRows(res.entries.map((e) => {
        const isIncome = e.amount >= 0;
        return {
          date: e.date, description: e.description, operationId: e.operationId, amount: e.amount,
          type: isIncome ? 'income' : 'expense',
          categoryId: resolveCat(guessStatementCategoryName(e.description, isIncome), isIncome),
          include: true,
        };
      }));
      toast.success(`${res.entries.length} lançamentos lidos.`);
    } catch (err) {
      console.error(err);
      toast.error('Falha ao ler o extrato.');
    } finally {
      setParsing(false);
    }
  };

  const selected = rows.filter((r) => r.include);
  const totIn = selected.filter((r) => r.type === 'income').reduce((s, r) => s + Math.abs(r.amount), 0);
  const totOut = selected.filter((r) => r.type === 'expense').reduce((s, r) => s + Math.abs(r.amount), 0);

  const setRow = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const setAll = (include: boolean) => setRows((rs) => rs.map((r) => ({ ...r, include })));

  const handleImport = async () => {
    if (!accountId) { toast.error('Selecione a conta de destino.'); return; }
    if (selected.length === 0) { toast.error('Nenhum lançamento selecionado.'); return; }
    setSaving(true);
    try {
      // Ordem do mais recente para o mais antigo: dentro de cada dia, o
      // lançamento que vem por último no extrato (mais recente) recebe o maior
      // horário, então aparece primeiro na lista (ordenada por data decrescente),
      // mesmo após recarregar.
      const dayPos = new Map<string, number>();

      const drafts = selected.map((r) => {
        const k = r.date.toDateString();
        const pos = dayPos.get(k) ?? 0;
        dayPos.set(k, pos + 1);
        const date = new Date(r.date);
        date.setHours(12, 0, 0, 0);
        date.setSeconds(pos); // posição no extrato (mais recente = maior pos → topo da lista)
        return {
          type: r.type,
          amount: Math.abs(r.amount),
          description: r.description,
          categoryId: r.categoryId,
          accountId,
          date,
          status: 'paid' as const,
          reconciled: true,
          paymentMethod: inferMethod(r.description),
          externalId: r.operationId || undefined,
        };
      });
      const res = await importMany(drafts);
      if (setFinalBalance && parsed?.saldoFinal != null) {
        await updateAccount(accountId, { balance: parsed.saldoFinal });
      }
      toast.success(`${res.added} importados${res.skipped ? ` · ${res.skipped} já existiam` : ''}.`);
      reset();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao importar lançamentos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title="Importar Extrato Bancário" maxWidth="760px" closeOnOverlayClick={!parsed}>
      {!parsed ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ border: '2px dashed var(--border-subtle)', borderRadius: 14, padding: '36px 20px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: 'var(--bg-primary)' }}>
            {parsing
              ? <Loader2 size={36} style={{ color: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />
              : <UploadCloud size={36} style={{ color: 'var(--accent-blue)' }} />}
            <div style={{ fontWeight: 600 }}>{parsing ? 'Lendo o extrato…' : 'Selecione o PDF do extrato'}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Mercado Pago e extratos com colunas Data · Descrição · Valor · Saldo</div>
            <input type="file" accept="application/pdf" style={{ display: 'none' }} disabled={parsing}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </label>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Resumo */}
          <div className="glass-card-static" style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, fontSize: '0.8rem' }}>
            <div><div className="stat-label">Banco</div><strong>{parsed.bank}</strong></div>
            <div><div className="stat-label">Período</div><strong>{parsed.periodStart ? `${formatDate(parsed.periodStart, 'dd/MM')}–${formatDate(parsed.periodEnd!, 'dd/MM')}` : '—'}</strong></div>
            <div><div className="stat-label">Entradas</div><strong style={{ color: 'var(--accent-green)' }}>{formatCurrency(totIn)}</strong></div>
            <div><div className="stat-label">Saídas</div><strong style={{ color: 'var(--accent-red)' }}>{formatCurrency(totOut)}</strong></div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{selected.length} de {rows.length} selecionados</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setAll(true)}>Marcar todos</button>
              <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setAll(false)}>Desmarcar</button>
            </div>
          </div>

          {/* Tabela */}
          <div style={{ maxHeight: '42vh', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 10 }}>
            {rows.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 58px 1fr 96px 150px', gap: 8, alignItems: 'center', padding: '6px 10px', borderBottom: '1px solid var(--border-subtle)', opacity: r.include ? 1 : 0.45 }}>
                <input type="checkbox" checked={r.include} onChange={(e) => setRow(i, { include: e.target.checked })} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatDate(r.date, 'dd/MM')}</span>
                <span style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.description}>{r.description}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textAlign: 'right', color: r.type === 'income' ? 'var(--accent-green)' : 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                  {r.type === 'income' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                  {formatCurrency(Math.abs(r.amount))}
                </span>
                <select className="select-field" value={r.categoryId} onChange={(e) => setRow(i, { categoryId: e.target.value })} style={{ fontSize: '0.74rem', padding: '4px 6px' }}>
                  <option value="">Categoria…</option>
                  {(r.type === 'income' ? incomeCats : expenseCats).map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Conta + saldo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="input-label">Conta de destino</label>
              <select className="select-field" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                <option value="">Selecione…</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer', alignSelf: 'end', paddingBottom: 10 }}>
              <input type="checkbox" checked={setFinalBalance} onChange={(e) => setSetFinalBalance(e.target.checked)} />
              Ajustar saldo {parsed.saldoFinal != null ? `= ${formatCurrency(parsed.saldoFinal)}` : 'final'}
            </label>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Lançamentos já importados (mesmo ID de operação) são ignorados automaticamente.
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setParsed(null)}>Voltar</button>
            <button className="btn-primary" onClick={handleImport} disabled={saving}>
              {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <UploadCloud size={15} />}
              Importar {selected.length} lançamentos
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
