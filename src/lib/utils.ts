import { format, parseISO, isValid, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ===== CURRENCY =====

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

// ===== DATES =====

export function formatDate(date: Date | string, pattern: string = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, pattern, { locale: ptBR });
}

export function formatDateRelative(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';

  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  if (diff < 7) return `${diff} dias atrás`;
  return format(d, "dd 'de' MMM", { locale: ptBR });
}

export function getMonthName(month: number): string {
  const date = new Date(2024, month - 1, 1);
  return format(date, 'MMMM', { locale: ptBR });
}

export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  return { start: startOfMonth(now), end: endOfMonth(now) };
}

export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const date = new Date(year, month - 1, 1);
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

export function isInMonth(date: Date, year: number, month: number): boolean {
  const { start, end } = getMonthRange(year, month);
  return isWithinInterval(date, { start, end });
}

export function getPreviousMonthRange(): { start: Date; end: Date } {
  const prev = subMonths(new Date(), 1);
  return { start: startOfMonth(prev), end: endOfMonth(prev) };
}

/** Converte "YYYY-MM-DD" (input type=date) em Date LOCAL — evita o shift de fuso. */
export function parseDateInput(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Formata uma Date para "YYYY-MM-DD" no fuso local (para popular input type=date). */
export function toDateInputValue(date: Date | string): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Primeiro dia útil (seg–sex) do mês informado. `month` é 1–12. */
export function firstBusinessDay(year: number, month: number): Date {
  const d = new Date(year, month - 1, 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d;
}

/** Primeiro dia útil do mês subsequente ao informado (competência → pagamento). */
export function firstBusinessDayOfNextMonth(year: number, month: number): Date {
  let m = month + 1;
  let y = year;
  if (m > 12) { m = 1; y += 1; }
  return firstBusinessDay(y, m);
}

// ===== PERCENTAGE =====

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function calcPercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

// ===== CLASSNAMES HELPER =====

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ===== ACCOUNT TYPE LABELS =====

export const accountTypeLabels: Record<string, string> = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  credit_card: 'Cartão de Crédito',
  cash: 'Dinheiro',
  investment: 'Investimentos',
};

export const accountTypeIcons: Record<string, string> = {
  checking: '🏦',
  savings: '🐷',
  credit_card: '💳',
  cash: '💵',
  investment: '📊',
};

// ===== GOAL TYPE LABELS =====

export const goalTypeLabels: Record<string, string> = {
  emergency: 'Reserva de Emergência',
  travel: 'Viagem',
  purchase: 'Compra',
  investment: 'Investimento',
  debt: 'Quitação de Dívida',
  custom: 'Personalizada',
};
