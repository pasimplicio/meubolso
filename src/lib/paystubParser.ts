import * as pdfjsLib from 'pdfjs-dist';
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PaystubItem } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker;

export interface ParsedPaystub {
  employer?: string;
  month: number;
  year: number;
  sequence?: number;
  items: PaystubItem[];
  grossTotal: number;
  deductionsTotal: number;
  netTotal: number;
  fgts?: number;
  rawText: string;
}

interface Token { str: string; x: number; y: number; }
interface Line { y: number; tokens: Token[] }

/** Converte "1.173,91" → 1173.91. Retorna null se não for monetário. */
function parseBR(s: string): number | null {
  const t = s.trim();
  if (!/^\d{1,3}(\.\d{3})*,\d{2}$|^\d+,\d{2}$/.test(t)) return null;
  return parseFloat(t.replace(/\./g, '').replace(',', '.'));
}

function isMoney(s: string): boolean {
  return parseBR(s) !== null;
}

/** Reconstrói linhas a partir dos tokens posicionados (agrupando por Y). */
function buildLines(tokens: Token[]): Line[] {
  const sorted = [...tokens].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: Line[] = [];
  const TOL = 3;
  for (const tk of sorted) {
    if (!tk.str.trim()) continue;
    const line = lines.find((l) => Math.abs(l.y - tk.y) <= TOL);
    if (line) line.tokens.push(tk);
    else lines.push({ y: tk.y, tokens: [tk] });
  }
  lines.forEach((l) => l.tokens.sort((a, b) => a.x - b.x));
  return lines;
}

/** Acha o centro X das colunas a partir do cabeçalho. */
function findColumns(lines: Line[]) {
  let referencia = 0, vencimentos = 0, descontos = 0;
  for (const l of lines) {
    for (const t of l.tokens) {
      const u = t.str.toUpperCase();
      if (u.includes('REFER')) referencia = t.x;
      if (u.includes('VENCIMENTOS')) vencimentos = t.x;
      if (u.includes('DESCONTOS')) descontos = t.x;
    }
    if (referencia && vencimentos && descontos) break;
  }
  return { referencia, vencimentos, descontos };
}

export async function parsePaystubPdf(data: ArrayBuffer): Promise<ParsedPaystub> {
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const allTokens: Token[] = [];
  const textChunks: string[] = [];

  // Apenas a primeira página (as demais são vias idênticas).
  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  for (const item of content.items as Array<{ str: string; transform: number[] }>) {
    if (!('str' in item)) continue;
    allTokens.push({ str: item.str, x: item.transform[4], y: item.transform[5] });
    if (item.str.trim()) textChunks.push(item.str);
  }
  const rawText = textChunks.join(' ');
  const lines = buildLines(allTokens);
  const cols = findColumns(lines);

  // Fallback de centros caso o cabeçalho não seja detectado.
  const maxX = Math.max(...allTokens.map((t) => t.x), 1);
  const cVenc = cols.vencimentos || maxX * 0.55;
  const cDesc = cols.descontos || maxX * 0.78;
  const cRef = cols.referencia || maxX * 0.4;

  const items: PaystubItem[] = [];
  let fgts: number | undefined;

  for (const line of lines) {
    const first = line.tokens[0];
    if (!first || !/^\d{3}$/.test(first.str.trim())) continue;
    const code = first.str.trim();

    const numeric = line.tokens.filter((t) => isMoney(t.str));
    if (numeric.length === 0) continue;

    // Descrição = tokens entre o código e o primeiro número.
    const firstNumX = Math.min(...numeric.map((t) => t.x));
    const description = line.tokens
      .filter((t) => t.x > first.x && t.x < firstNumX && !isMoney(t.str))
      .map((t) => t.str)
      .join(' ')
      .trim();

    let reference: string | undefined;
    let provento = 0;
    let desconto = 0;
    for (const t of numeric) {
      const val = parseBR(t.str)!;
      const dRef = Math.abs(t.x - cRef);
      const dVenc = Math.abs(t.x - cVenc);
      const dDesc = Math.abs(t.x - cDesc);
      const min = Math.min(dRef, dVenc, dDesc);
      if (min === dRef) reference = t.str.trim();
      else if (min === dVenc) provento = val;
      else desconto = val;
    }

    // FGTS aparece na coluna de vencimentos mas é informativo (não entra no bruto).
    if (/FGTS/i.test(description) || code === '300') {
      fgts = provento || desconto || fgts;
      continue;
    }

    if (provento > 0) items.push({ code, description, reference, amount: provento, kind: 'provento' });
    else if (desconto > 0) items.push({ code, description, reference, amount: desconto, kind: 'desconto' });
  }

  const grossTotal = items.filter((i) => i.kind === 'provento').reduce((s, i) => s + i.amount, 0);
  const deductionsTotal = items.filter((i) => i.kind === 'desconto').reduce((s, i) => s + i.amount, 0);
  const netTotal = Math.max(0, grossTotal - deductionsTotal);

  // Mês/Ano (competência): considera só MM/AAAA válidos e escolhe o mais
  // frequente — a competência se repete no holerite, datas de admissão/CNPJ não.
  const now = new Date();
  let month = now.getMonth() + 1;
  let year = now.getFullYear();
  const candidates = [...rawText.matchAll(/(\d{1,2})\s*\/\s*(\d{4})/g)]
    .map((c) => ({ m: parseInt(c[1]), y: parseInt(c[2]) }))
    .filter((c) => c.m >= 1 && c.m <= 12 && c.y >= 2000 && c.y <= now.getFullYear() + 1);
  if (candidates.length) {
    const counts = new Map<string, number>();
    for (const c of candidates) {
      const k = `${c.m}/${c.y}`;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    let bestFreq = -1, bestRec = -1;
    for (const c of candidates) {
      const f = counts.get(`${c.m}/${c.y}`)!;
      const rec = c.y * 12 + c.m;
      if (f > bestFreq || (f === bestFreq && rec > bestRec)) { bestFreq = f; bestRec = rec; month = c.m; year = c.y; }
    }
  }

  // Empregador: melhor esforço — linha em caixa alta com sufixo societário.
  let employer: string | undefined;
  const empMatch = rawText.match(/([A-ZÀ-Ú][A-ZÀ-Ú0-9 .,&-]{6,}?(?:LTDA|S\.?A\.?|EIRELI|ME|CIA|SANEAMENTO|[A-ZÀ-Ú]{4,}))/);
  if (empMatch) employer = empMatch[1].replace(/\s+/g, ' ').trim().slice(0, 60);

  return { employer, month, year, items, grossTotal, deductionsTotal, netTotal, fgts, rawText };
}
