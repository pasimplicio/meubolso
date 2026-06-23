import * as pdfjsLib from 'pdfjs-dist';
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker;

export interface StatementEntry {
  date: Date;
  description: string;
  operationId: string;
  amount: number; // sinalizado (+ entrada, − saída)
  balance?: number;
}

export interface ParsedStatement {
  bank: string;
  entries: StatementEntry[];
  saldoInicial?: number;
  saldoFinal?: number;
  periodStart?: Date;
  periodEnd?: Date;
}

interface Token { str: string; x: number; y: number; }
interface LineObj { y: number; text: string; }

function parseMoney(s: string): number {
  return parseFloat(s.replace(/\./g, '').replace(',', '.'));
}

function buildLines(tokens: Token[]): LineObj[] {
  const sorted = [...tokens].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: { y: number; tokens: Token[] }[] = [];
  const TOL = 3;
  for (const tk of sorted) {
    if (!tk.str.trim()) continue;
    const line = lines.find((l) => Math.abs(l.y - tk.y) <= TOL);
    if (line) line.tokens.push(tk);
    else lines.push({ y: tk.y, tokens: [tk] });
  }
  lines.forEach((l) => l.tokens.sort((a, b) => a.x - b.x));
  // Mantém ordem de cima para baixo (Y decrescente) — ordem do PDF.
  return lines
    .sort((a, b) => b.y - a.y)
    .map((l) => ({ y: l.y, text: l.tokens.map((t) => t.str).join(' ').replace(/\s+/g, ' ').trim() }));
}

function isAnchor(text: string): boolean {
  return [...text.matchAll(MONEY_RE)].length >= 2 && /\b\d{9,16}\b/.test(text);
}

// Linhas de cabeçalho/rodapé que não são lançamentos.
const NOISE = /saldo inicial|entradas:|sa[íi]das|saldo final|extrato de conta|detalhe dos movimentos|id da opera|data de gera|institui[çc][ãa]o de pagamento|per[íi]odo|cpf\/cnpj|www\.|portal de ajuda|ag[êe]ncia|^\s*\d+\/\d+\s*$|^data\b|^\s*$|0800|ligue para|ouvidoria|protocolo|c[óo]digo de atendimento|conte com|nossos produtos|canais de consulta|na[çc][õo]es unidas|cep\b|d[úu]vida/i;

// Distância máxima (Y) entre a linha de descrição e o lançamento ao qual pertence.
// Evita que rodapé/textos distantes sejam puxados para a descrição.
const MAX_DESC_GAP = 40;
const MONEY_RE = /R\$\s*(-?\d[\d.]*,\d{2})/g;

export async function parseStatementPdf(data: ArrayBuffer): Promise<ParsedStatement> {
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const allLines: LineObj[] = [];
  const rawChunks: string[] = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const tokens: Token[] = [];
    for (const item of content.items as Array<{ str: string; transform: number[] }>) {
      if (!('str' in item)) continue;
      tokens.push({ str: item.str, x: item.transform[4], y: item.transform[5] });
      if (item.str.trim()) rawChunks.push(item.str);
    }
    // Desloca o Y por página para manter a ordem do PDF e isolar o agrupamento por página.
    const offset = p * 1_000_000;
    allLines.push(...buildLines(tokens).map((l) => ({ y: l.y - offset, text: l.text })));
  }

  const rawText = rawChunks.join(' ');
  const entries: StatementEntry[] = [];

  // Linhas úteis (sem cabeçalho/rodapé), já em ordem de cima para baixo.
  const clean = allLines.filter((l) => l.text && !NOISE.test(l.text));
  const anchors = clean.filter((l) => isAnchor(l.text)); // ordem do PDF
  const others = clean.filter((l) => !isAnchor(l.text));

  // Cada linha de descrição/data pertence ao lançamento (âncora) mais próximo no eixo Y.
  const grouped = new Map<number, LineObj[]>();
  for (const o of others) {
    let best = -1, bestD = Infinity;
    anchors.forEach((a, idx) => {
      const d = Math.abs(a.y - o.y);
      if (d < bestD) { bestD = d; best = idx; }
    });
    // Ignora linhas longe de qualquer lançamento (rodapé, títulos soltos).
    if (best >= 0 && bestD <= MAX_DESC_GAP) {
      const arr = grouped.get(best) ?? [];
      arr.push(o);
      grouped.set(best, arr);
    }
  }

  anchors.forEach((a, idx) => {
    const text = a.text;
    const monies = [...text.matchAll(MONEY_RE)];
    const amount = parseMoney(monies[0][1]);
    const balance = parseMoney(monies[1][1]);

    // ID = último número 9–16 dígitos antes do primeiro "R$".
    const beforeRS = text.slice(0, text.indexOf('R$'));
    const idRuns = [...beforeRS.matchAll(/\b(\d{9,16})\b/g)].map((m) => m[1]);
    const operationId = idRuns.length ? idRuns[idRuns.length - 1] : '';

    // Fragmentos de descrição (com Y), montados de cima para baixo como no PDF.
    const frags: { y: number; t: string }[] = [];
    let lead = beforeRS;
    if (operationId) lead = lead.replace(operationId, ' ');
    frags.push({ y: a.y, t: lead });
    for (const o of grouped.get(idx) ?? []) frags.push({ y: o.y, t: o.text });
    frags.sort((p, q) => q.y - p.y); // topo primeiro

    let descFull = frags.map((f) => f.t).join(' ');
    const dm = descFull.match(/(\d{2})-(\d{2})-(\d{4})/);
    if (dm) descFull = descFull.replace(dm[0], ' ');
    const description = descFull.replace(/R\$\s*-?\d[\d.]*,\d{2}/g, ' ').replace(/\s+/g, ' ').trim();

    if (dm && !Number.isNaN(amount)) {
      entries.push({
        date: new Date(+dm[3], +dm[2] - 1, +dm[1]),
        description: description || 'Lançamento',
        operationId,
        amount,
        balance: Number.isNaN(balance) ? undefined : balance,
      });
    }
  });

  // Metadados.
  const grab = (re: RegExp) => { const m = rawText.match(re); return m ? parseMoney(m[1]) : undefined; };
  const saldoInicial = grab(/saldo inicial:?\s*R\$\s*(-?\d[\d.]*,\d{2})/i);
  const saldoFinal = grab(/saldo final:?\s*R\$\s*(-?\d[\d.]*,\d{2})/i);
  const period = rawText.match(/(\d{2}-\d{2}-\d{4})\s*a[lt]?\s*(\d{2}-\d{2}-\d{4})/i);
  const toDate = (s: string) => { const [d, mo, y] = s.split('-'); return new Date(+y, +mo - 1, +d); };
  const bank = /mercado\s*pago/i.test(rawText) ? 'Mercado Pago' : 'Extrato';

  return {
    bank,
    entries,
    saldoInicial,
    saldoFinal,
    periodStart: period ? toDate(period[1]) : undefined,
    periodEnd: period ? toDate(period[2]) : undefined,
  };
}
