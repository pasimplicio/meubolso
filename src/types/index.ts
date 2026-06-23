// ===== CORE TYPES =====

export type AccountType = 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'paid' | 'pending';
export type CategoryType = 'income' | 'expense';
export type Recurrence = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type GoalType = 'emergency' | 'travel' | 'purchase' | 'investment' | 'debt' | 'custom';
export type ThemeMode = 'dark' | 'light';

/**
 * Natureza da despesa (classificação de topo, vinda do modelo Power BI).
 * Income usa sempre 'receita'.
 */
export type ExpenseNature = 'fixas' | 'variaveis' | 'extras' | 'adicionais';
export type CategoryNature = ExpenseNature | 'receita';

/** Forma de pagamento / recebimento. */
export type PaymentMethod =
  | 'debito'
  | 'credito'
  | 'pix'
  | 'transferencia'
  | 'dinheiro'
  | 'boleto';

/** Classe de investimento. */
export type InvestmentClass =
  | 'renda_fixa'
  | 'renda_variavel'
  | 'fundos'
  | 'tesouro'
  | 'cripto'
  | 'previdencia'
  | 'outros';

export type InvestmentMoveType = 'aporte' | 'resgate' | 'rendimento';

/**
 * Como o rendimento é calculado:
 * - manual: você informa o valor atual (renda variável, cripto, ações)
 * - prefixado: taxa fixa % ao ano
 * - cdi: percentual do CDI (ex.: 100 = 100% do CDI)
 * - selic: percentual da Selic
 * - ipca: IPCA + spread % ao ano
 */
export type RateType = 'manual' | 'prefixado' | 'cdi' | 'selic' | 'ipca';

// ===== INTERFACES =====

export interface User {
  id: string;
  email: string;
  name: string;
  salt: string;
  passwordHash: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Account {
  id: string;
  userId?: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  icon: string;
  createdAt: Date;
}

/**
 * Categoria — modelo de 3 níveis:
 *   nature (Tipo: Fixas/Variáveis/Extras/Adicionais/Receita)
 *     → group (Grupo: Moradia, Transporte, ...)
 *       → name (Categoria folha: Aluguel, Luz, ...)
 */
export interface Category {
  id: string;
  userId?: string;
  name: string;
  type: CategoryType;
  nature: CategoryNature;
  group: string;
  icon: string;
  color: string;
  /** Mantido para subcategorias customizadas; o agrupamento principal é via `group`. */
  parentId?: string;
  order: number;
}

export interface Transaction {
  id: string;
  userId?: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  date: Date;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  /** Conciliado com o extrato bancário (coluna CONCILIADO do modelo). */
  reconciled?: boolean;
  recurrence?: Recurrence;
  recurrenceEndDate?: Date;
  /** Agrupa os lançamentos de uma mesma série recorrente (para excluir juntos). */
  recurrenceGroupId?: string;
  tags?: string[];
  notes?: string;
  /** Vínculo opcional com um contracheque ou investimento de origem. */
  sourceId?: string;
  /** ID da operação no extrato bancário importado (evita duplicidade). */
  externalId?: string;
  createdAt: Date;
}

export interface Budget {
  id: string;
  userId?: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export interface Goal {
  id: string;
  userId?: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  icon: string;
  color: string;
  type: GoalType;
  createdAt: Date;
}

export interface GoalContribution {
  id: string;
  userId?: string;
  goalId: string;
  amount: number;
  date: Date;
  notes?: string;
}

// ===== INVESTIMENTOS =====

export interface Investment {
  id: string;
  userId?: string;
  name: string;
  institution?: string;
  class: InvestmentClass;
  /** Total já aportado (custo). */
  investedAmount: number;
  /** Valor de mercado atual (usado quando rateType = manual). */
  currentValue: number;
  /** Forma de cálculo do rendimento. */
  rateType?: RateType;
  /** Taxa associada ao rateType (% a.a. para prefixado/ipca; % do índice para cdi/selic). */
  rate?: number;
  accountId?: string;
  date: Date;
  createdAt: Date;
}

export interface InvestmentMove {
  id: string;
  userId?: string;
  investmentId: string;
  type: InvestmentMoveType;
  amount: number;
  date: Date;
  notes?: string;
}

// ===== CONTRACHEQUE =====

export type PaystubItemKind = 'provento' | 'desconto';

export interface PaystubItem {
  code?: string;
  description: string;
  reference?: string;
  amount: number;
  kind: PaystubItemKind;
  /** Categoria de despesa associada (apenas para descontos lançados no fluxo). */
  categoryId?: string;
}

export interface Paystub {
  id: string;
  userId?: string;
  employer?: string;
  month: number;
  year: number;
  sequence?: number;
  /** Data em que o contracheque é lançado no fluxo de caixa. */
  date?: Date;
  /** Total de vencimentos (proventos). */
  grossTotal: number;
  /** Total de descontos. */
  deductionsTotal: number;
  /** Valor líquido recebido. */
  netTotal: number;
  fgts?: number;
  salaryBase?: number;
  baseInss?: number;
  baseIrrf?: number;
  baseFgts?: number;
  items: PaystubItem[];
  accountId?: string;
  /** Receita gerada a partir do líquido, se houver. */
  transactionId?: string;
  createdAt: Date;
}

export interface AppSettings {
  currency: string;
  theme: ThemeMode;
  locale: string;
}

// ===== HELPER TYPES =====

export interface MonthlyOverview {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  percentChange: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
}
