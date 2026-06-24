import type { ParsedStatement, StatementEntry } from './statementParser';

/** Decodifica o OFX respeitando o charset declarado no cabeçalho (UTF-8 ou Windows-1252). */
function decodeOfx(data: ArrayBuffer): string {
  const head = new TextDecoder('ascii').decode(new Uint8Array(data).slice(0, 400));
  const isLatin = /charset:\s*1252|encoding:\s*usascii|iso-8859|windows-1252/i.test(head);
  try {
    return new TextDecoder(isLatin ? 'windows-1252' : 'utf-8').decode(data);
  } catch {
    return new TextDecoder('utf-8').decode(data);
  }
}

/** Valor OFX: "-200.00" (padrão) ou "-200,00" / "1.234,56" (BR). */
function parseOfxAmount(s: string): number {
  let v = s.trim().replace(/\s/g, '');
  if (/,\d{1,2}$/.test(v)) v = v.replace(/\./g, '').replace(',', '.');
  return parseFloat(v);
}

/** Data OFX "YYYYMMDD..." → Date local (usa só os 8 primeiros dígitos). */
function parseOfxDate(s: string): Date {
  const m = s.trim().match(/(\d{4})(\d{2})(\d{2})/);
  if (!m) return new Date();
  return new Date(+m[1], +m[2] - 1, +m[3]);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&#39;|&apos;/gi, "'").replace(/&quot;/gi, '"').replace(/\s+/g, ' ').trim();
}

/** Lê o valor de uma tag OFX (funciona em OFX SGML sem fechamento e em OFX XML). */
function tag(seg: string, name: string): string {
  const m = seg.match(new RegExp(`<${name}>([^<\\r\\n]*)`, 'i'));
  return m ? m[1].trim() : '';
}

/**
 * Parser de extrato OFX/QFX. Retorna o mesmo formato do parser de PDF,
 * para reaproveitar todo o fluxo de importação (prévia, categorização, dedupe).
 */
export function parseOfxStatement(data: ArrayBuffer): ParsedStatement {
  const text = decodeOfx(data);
  const entries: StatementEntry[] = [];

  const blocks = text.split(/<STMTTRN>/i).slice(1);
  for (const block of blocks) {
    const seg = block.split(/<\/STMTTRN>/i)[0];
    const amount = parseOfxAmount(tag(seg, 'TRNAMT'));
    const dt = tag(seg, 'DTPOSTED');
    if (!dt || Number.isNaN(amount)) continue;
    const desc = decodeEntities(tag(seg, 'MEMO') || tag(seg, 'NAME') || 'Lançamento');
    entries.push({
      date: parseOfxDate(dt),
      description: desc || 'Lançamento',
      operationId: tag(seg, 'FITID'),
      amount,
    });
  }

  // Ordena cronologicamente (mais antigo primeiro), como o extrato em PDF.
  entries.sort((a, b) => a.date.getTime() - b.date.getTime());

  const balMatch = text.match(/<LEDGERBAL>[\s\S]*?<BALAMT>([^<\r\n]*)/i);
  const saldoFinal = balMatch ? parseOfxAmount(balMatch[1]) : undefined;
  const ds = text.match(/<DTSTART>([^<\r\n]*)/i);
  const de = text.match(/<DTEND>([^<\r\n]*)/i);
  const org = text.match(/<ORG>([^<\r\n]*)/i)?.[1]?.trim();
  const bank = /mercado\s*pago/i.test(text) ? 'Mercado Pago' : (org || 'Extrato OFX');

  return {
    bank,
    entries,
    saldoFinal,
    periodStart: ds ? parseOfxDate(ds[1]) : undefined,
    periodEnd: de ? parseOfxDate(de[1]) : undefined,
  };
}
