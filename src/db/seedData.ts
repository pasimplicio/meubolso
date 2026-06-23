import type {
  Account,
  Category,
  CategoryNature,
  ExpenseNature,
  PaymentMethod,
  InvestmentClass,
} from '../types';

// ===== NATUREZA (TIPO) =====

export const natureMeta: Record<CategoryNature, { label: string; icon: string; color: string }> = {
  receita:    { label: 'Receitas',   icon: '💰', color: '#00d4aa' },
  fixas:      { label: 'Fixas',      icon: '📌', color: '#6366f1' },
  variaveis:  { label: 'Variáveis',  icon: '📊', color: '#f59e0b' },
  extras:     { label: 'Extras',     icon: '⚠️', color: '#ef4444' },
  adicionais: { label: 'Adicionais', icon: '✨', color: '#ec4899' },
};

export const expenseNatures: ExpenseNature[] = ['fixas', 'variaveis', 'extras', 'adicionais'];

// ===== GRUPOS =====

export const groupMeta: Record<string, { icon: string; color: string }> = {
  'RECEITAS':              { icon: '💰', color: '#00d4aa' },
  'MORADIA':               { icon: '🏠', color: '#6366f1' },
  'TRANSPORTE':            { icon: '🚗', color: '#3b82f6' },
  'SAÚDE':                 { icon: '💊', color: '#ef4444' },
  'ALIMENTAÇÃO':           { icon: '🍔', color: '#f97316' },
  'EDUCAÇÃO':              { icon: '📚', color: '#8b5cf6' },
  'FILHO':                 { icon: '🧒', color: '#ec4899' },
  'IMPOSTOS':              { icon: '🧾', color: '#eab308' },
  'CUIDADOS PESSOAIS':     { icon: '✂️', color: '#a855f7' },
  'BANCOS/FINANCEIRAS':    { icon: '🏦', color: '#14b8a6' },
  'MANUTENÇÃO/PREVENÇÃO':  { icon: '🔧', color: '#64748b' },
  'LAZER':                 { icon: '🎮', color: '#f43f5e' },
  'VESTUÁRIOS':            { icon: '👕', color: '#06b6d4' },
  'FOLHA DE PAGAMENTO':    { icon: '📋', color: '#0ea5e9' },
  'OUTROS':                { icon: '📦', color: '#94a3b8' },
};

export function groupColor(group: string): string {
  return groupMeta[group]?.color ?? '#94a3b8';
}
export function groupIcon(group: string): string {
  return groupMeta[group]?.icon ?? '📁';
}

// ===== FORMAS DE PAGAMENTO =====

export const paymentMethodMeta: Record<PaymentMethod, { label: string; icon: string }> = {
  debito:        { label: 'Débito',                 icon: '💳' },
  credito:       { label: 'Crédito',                icon: '💳' },
  pix:           { label: 'PIX',                    icon: '⚡' },
  transferencia: { label: 'Transferência Bancária', icon: '🏦' },
  dinheiro:      { label: 'Dinheiro',               icon: '💵' },
  boleto:        { label: 'Boleto',                 icon: '🧾' },
};

export const paymentMethods = Object.keys(paymentMethodMeta) as PaymentMethod[];

// ===== CLASSES DE INVESTIMENTO =====

export const investmentClassMeta: Record<InvestmentClass, { label: string; icon: string; color: string }> = {
  renda_fixa:     { label: 'Renda Fixa',     icon: '🏦', color: '#10b981' },
  renda_variavel: { label: 'Renda Variável', icon: '📈', color: '#3b82f6' },
  fundos:         { label: 'Fundos',         icon: '🗂️', color: '#8b5cf6' },
  tesouro:        { label: 'Tesouro Direto', icon: '🏛️', color: '#0ea5e9' },
  cripto:         { label: 'Criptomoedas',   icon: '🪙', color: '#f59e0b' },
  previdencia:    { label: 'Previdência',    icon: '👵', color: '#a855f7' },
  outros:         { label: 'Outros',         icon: '📦', color: '#64748b' },
};

export const investmentClasses = Object.keys(investmentClassMeta) as InvestmentClass[];

// ===== TAXONOMIA COMPLETA (do modelo Power BI) =====

type LeafDef = [nature: CategoryNature, group: string, name: string, icon: string];

const expenseLeaves: LeafDef[] = [
  // FIXAS
  ['fixas', 'MORADIA', 'Aluguel', '🏠'],
  ['fixas', 'MORADIA', 'Condomínio', '🏢'],
  ['fixas', 'MORADIA', 'Prestação da casa', '🏡'],
  ['fixas', 'MORADIA', 'Seguro da casa', '🛡️'],
  ['fixas', 'MORADIA', 'Diarista', '🧹'],
  ['fixas', 'MORADIA', 'Mensalista', '🧽'],
  ['fixas', 'MORADIA', 'Piscineiro', '🏊'],
  ['fixas', 'TRANSPORTE', 'Prestação do carro', '🚗'],
  ['fixas', 'TRANSPORTE', 'Seguro do carro', '🛡️'],
  ['fixas', 'TRANSPORTE', 'Licenciamento', '📋'],
  ['fixas', 'TRANSPORTE', 'Estacionamento (mensalista)', '🅿️'],
  ['fixas', 'SAÚDE', 'Seguro saúde', '🩺'],
  ['fixas', 'SAÚDE', 'Plano de saúde', '🏥'],
  ['fixas', 'FILHO', 'Mesada (mensal)', '🧒'],
  ['fixas', 'FILHO', 'Pensão', '👨‍👧'],
  ['fixas', 'EDUCAÇÃO', 'Colégio', '🏫'],
  ['fixas', 'EDUCAÇÃO', 'Faculdade', '🎓'],
  ['fixas', 'EDUCAÇÃO', 'Curso', '📖'],
  ['fixas', 'IMPOSTOS', 'IPTU', '🧾'],
  ['fixas', 'IMPOSTOS', 'IPVA', '🚙'],
  ['fixas', 'OUTROS', 'Empréstimos', '💸'],
  ['fixas', 'OUTROS', 'Seguro de vida', '🛡️'],
  // VARIÁVEIS
  ['variaveis', 'MORADIA', 'Luz', '💡'],
  ['variaveis', 'MORADIA', 'Água', '🚰'],
  ['variaveis', 'MORADIA', 'Telefone', '☎️'],
  ['variaveis', 'MORADIA', 'Telefone Celular', '📱'],
  ['variaveis', 'MORADIA', 'Gás', '🔥'],
  ['variaveis', 'MORADIA', 'TV e Streaming', '📺'],
  ['variaveis', 'MORADIA', 'Internet', '🌐'],
  ['variaveis', 'TRANSPORTE', 'Metrô', '🚇'],
  ['variaveis', 'TRANSPORTE', 'Ônibus', '🚌'],
  ['variaveis', 'TRANSPORTE', 'Uber', '🚕'],
  ['variaveis', 'TRANSPORTE', 'Táxi', '🚖'],
  ['variaveis', 'TRANSPORTE', 'Bla Bla Car', '🚗'],
  ['variaveis', 'TRANSPORTE', '99 Táxi', '🚖'],
  ['variaveis', 'TRANSPORTE', 'Combustível', '⛽'],
  ['variaveis', 'TRANSPORTE', 'Estacionamento', '🅿️'],
  ['variaveis', 'TRANSPORTE', 'VEM', '🎫'],
  ['variaveis', 'ALIMENTAÇÃO', 'Supermercado', '🛒'],
  ['variaveis', 'ALIMENTAÇÃO', 'Feira', '🥬'],
  ['variaveis', 'ALIMENTAÇÃO', 'Padaria', '🥖'],
  ['variaveis', 'ALIMENTAÇÃO', 'Delivery alimentação', '🛵'],
  ['variaveis', 'ALIMENTAÇÃO', 'Pet ração', '🐕'],
  ['variaveis', 'ALIMENTAÇÃO', 'Lanchonetes', '🍔'],
  ['variaveis', 'ALIMENTAÇÃO', 'Restaurantes', '🍽️'],
  ['variaveis', 'SAÚDE', 'Farmácia / Medicamentos', '💊'],
  ['variaveis', 'CUIDADOS PESSOAIS', 'Cabeleireiro', '💇'],
  ['variaveis', 'CUIDADOS PESSOAIS', 'Barbeiro', '💈'],
  ['variaveis', 'CUIDADOS PESSOAIS', 'Manicure', '💅'],
  ['variaveis', 'CUIDADOS PESSOAIS', 'Esteticista', '💆'],
  ['variaveis', 'CUIDADOS PESSOAIS', 'Academia', '🏋️'],
  ['variaveis', 'CUIDADOS PESSOAIS', 'Clube', '🎾'],
  ['variaveis', 'BANCOS/FINANCEIRAS', 'Juros Bancários', '🏦'],
  ['variaveis', 'BANCOS/FINANCEIRAS', 'Cartão de crédito', '💳'],
  // FOLHA DE PAGAMENTO (descontos do contracheque)
  ['fixas', 'FOLHA DE PAGAMENTO', 'INSS', '🏛️'],
  ['fixas', 'FOLHA DE PAGAMENTO', 'IRRF', '🧾'],
  ['fixas', 'FOLHA DE PAGAMENTO', 'Contribuição Sindical', '🤝'],
  ['fixas', 'FOLHA DE PAGAMENTO', 'Empréstimo Consignado', '💳'],
  ['fixas', 'FOLHA DE PAGAMENTO', 'Plano de Saúde (Folha)', '🏥'],
  ['fixas', 'FOLHA DE PAGAMENTO', 'Plano Odontológico', '🦷'],
  ['fixas', 'FOLHA DE PAGAMENTO', 'Pensão Alimentícia', '👨‍👧'],
  ['fixas', 'FOLHA DE PAGAMENTO', 'Vale / Benefícios', '🍽️'],
  ['fixas', 'FOLHA DE PAGAMENTO', 'Outros Descontos', '📦'],
  // EXTRAS
  ['extras', 'SAÚDE', 'Médico', '👨‍⚕️'],
  ['extras', 'SAÚDE', 'Dentista', '🦷'],
  ['extras', 'SAÚDE', 'Hospital', '🏥'],
  ['extras', 'MANUTENÇÃO/PREVENÇÃO', 'Carro (manutenção)', '🔧'],
  ['extras', 'MANUTENÇÃO/PREVENÇÃO', 'Casa (manutenção)', '🛠️'],
  ['extras', 'MANUTENÇÃO/PREVENÇÃO', 'Eletricista (manutenção)', '⚡'],
  ['extras', 'MANUTENÇÃO/PREVENÇÃO', 'Pintor (manutenção)', '🎨'],
  ['extras', 'EDUCAÇÃO', 'Material Escolar', '✏️'],
  ['extras', 'EDUCAÇÃO', 'Uniforme', '👕'],
  ['extras', 'EDUCAÇÃO', 'Passeios', '🎡'],
  // ADICIONAIS
  ['adicionais', 'LAZER', 'Viagens', '✈️'],
  ['adicionais', 'LAZER', 'Airbnb', '🏨'],
  ['adicionais', 'LAZER', 'Cinema/teatro', '🎬'],
  ['adicionais', 'LAZER', 'Bares', '🍻'],
  ['adicionais', 'LAZER', 'Outros (Lazer)', '🎉'],
  ['adicionais', 'VESTUÁRIOS', 'Roupas', '👗'],
  ['adicionais', 'VESTUÁRIOS', 'Calçados', '👟'],
  ['adicionais', 'VESTUÁRIOS', 'Acessórios', '👜'],
  ['adicionais', 'OUTROS', 'Presentes', '🎁'],
  ['adicionais', 'OUTROS', 'Doações', '❤️'],
  ['variaveis', 'OUTROS', 'Transferências', '🔄'],
  ['variaveis', 'OUTROS', 'Outros (Despesa)', '📦'],
];

const incomeLeaves: LeafDef[] = [
  ['receita', 'RECEITAS', 'Salário', '💰'],
  ['receita', 'RECEITAS', 'Recebimento de Aluguel', '🏠'],
  ['receita', 'RECEITAS', 'Horas extras', '⏰'],
  ['receita', 'RECEITAS', '13º salário', '🎄'],
  ['receita', 'RECEITAS', 'Férias', '🏖️'],
  ['receita', 'RECEITAS', 'Rendimentos', '📈'],
  ['receita', 'RECEITAS', 'Restituição Imposto de Renda', '🧾'],
  ['receita', 'RECEITAS', 'Empréstimos Bancários', '🏦'],
  ['receita', 'RECEITAS', 'FGTS', '🏛️'],
  ['receita', 'RECEITAS', 'PIX Recebido', '⚡'],
  ['receita', 'RECEITAS', 'Outras Receitas', '🎁'],
];

export const defaultCategories: Omit<Category, 'id'>[] = [...incomeLeaves, ...expenseLeaves].map(
  ([nature, group, name, icon], i) => ({
    name,
    type: nature === 'receita' ? 'income' : 'expense',
    nature,
    group,
    icon,
    color: groupColor(group),
    order: i + 1,
  })
);

// Defs das categorias de Folha de Pagamento (para garantir que existam mesmo
// em bancos antigos — usado por categoryStore.ensureCategories).
export const payrollDeductionDefs: Omit<Category, 'id'>[] = [...incomeLeaves, ...expenseLeaves]
  .filter(([, group]) => group === 'FOLHA DE PAGAMENTO')
  .map(([nature, group, name, icon], i) => ({
    name, type: 'expense' as const, nature, group, icon, color: groupColor(group), order: 900 + i,
  }));

/**
 * Sugere o NOME da categoria de despesa para um desconto do contracheque,
 * a partir da descrição da rubrica.
 */
export function guessDeductionCategoryName(description: string): string {
  const d = description.toLowerCase();
  if (/inss|previd/.test(d)) return 'INSS';
  if (/irrf|imposto de renda|i\.?r\.?r?f?\b/.test(d)) return 'IRRF';
  if (/sindic|stiu|contrib/.test(d)) return 'Contribuição Sindical';
  if (/empr[ée]stimo|consignad|cred.*trabalhador|cred\b/.test(d)) return 'Empréstimo Consignado';
  if (/odonto|dental/.test(d)) return 'Plano Odontológico';
  if (/sa[uú]de|plano|hapvida|unimed|amil|bradesco s|odontoprev/.test(d)) return 'Plano de Saúde (Folha)';
  if (/pens[aã]o|aliment[íi]cia/.test(d)) return 'Pensão Alimentícia';
  if (/ticket|vale|alimenta|refei[çc]|va\b|vr\b|vt\b/.test(d)) return 'Vale / Benefícios';
  return 'Outros Descontos';
}

// Categorias mínimas que o import de extrato precisa para o fallback.
export const statementFallbackDefs: Omit<Category, 'id'>[] = [...incomeLeaves, ...expenseLeaves]
  .filter(([, , name]) => name === 'Outros (Despesa)' || name === 'Transferências' || name === 'Outras Receitas' || name === 'PIX Recebido' || name === 'Rendimentos')
  .map(([nature, group, name, icon], i) => ({
    name, type: nature === 'receita' ? ('income' as const) : ('expense' as const),
    nature, group, icon, color: groupColor(group), order: 950 + i,
  }));

/**
 * Sugere o NOME da categoria para um lançamento do extrato bancário,
 * a partir da descrição e do sinal do valor.
 */
export function guessStatementCategoryName(description: string, isIncome: boolean): string {
  const d = description.toLowerCase();
  if (isIncome) {
    if (/rendimento/.test(d)) return 'Rendimentos';
    if (/sal[áa]rio/.test(d)) return 'Salário';
    if (/restitu|imposto de renda/.test(d)) return 'Restituição Imposto de Renda';
    if (/fgts/.test(d)) return 'FGTS';
    if (/pix recebido|transfer[êe]ncia recebida|recebido|reembolso/.test(d)) return 'PIX Recebido';
    return 'Outras Receitas';
  }
  // Despesas
  if (/cart[ãa]o de cr[ée]dito|fatura|santander|visa|mastercard|elo cred/.test(d)) return 'Cartão de crédito';
  if (/uber/.test(d)) return 'Uber';
  if (/\b99\b|99 ?pay|99 tecnologia/.test(d)) return '99 Táxi';
  if (/recargapay|recarga ?pay/.test(d)) return 'Ônibus';
  if (/posto|combust[íi]vel|gasolina|ipiranga|shell|petrobr/.test(d)) return 'Combustível';
  if (/supermerc|mateus|atacad|carrefour|assa[íi]|big bompre|distribuidora/.test(d)) return 'Supermercado';
  if (/panificad|padaria|panlan|pao\b/.test(d)) return 'Padaria';
  if (/restaurant|lanchonet|burger|pizz|ifood|cantinho|point do|batata|doce|panificadoram/.test(d)) return 'Restaurantes';
  if (/energia|equatorial|cemar|light|enel|eletric/.test(d)) return 'Luz';
  if (/[áa]gua|caema|saneamento|sanea/.test(d)) return 'Água';
  if (/hapvida|unimed|amil|assistencia medica|plano de sa[úu]de|odonto/.test(d)) return 'Plano de saúde';
  if (/farm[áa]cia|drogaria|pague menos|pacheco|drogasil|raia/.test(d)) return 'Farmácia / Medicamentos';
  if (/empr[ée]stimo|financiamento|realize|cons[óo]rcio|bcon|midway|crediario|cr[ée]dito financ|d[íi]vida/.test(d)) return 'Empréstimos';
  if (/telecom|claro|vivo|tim\b|oi\b|internet|net\b/.test(d)) return 'Internet';
  if (/netflix|spotify|prime|streaming|anthropic|claude|play servicos|disney|hbo|youtube/.test(d)) return 'TV e Streaming';
  if (/uber|99|taxi|metr[ôo]|[ôo]nibus/.test(d)) return 'Uber';
  if (/transfer|reservado|emerg[êe]ncia|pix enviado paulo alves|simplicio/.test(d)) return 'Transferências';
  return 'Outros (Despesa)';
}

// ===== CONTAS PADRÃO =====

export const defaultAccounts: Omit<Account, 'id' | 'createdAt'>[] = [
  { name: 'Conta Corrente', type: 'checking',    balance: 0, color: '#3b82f6', icon: '🏦' },
  { name: 'Poupança',       type: 'savings',     balance: 0, color: '#10b981', icon: '🐷' },
  { name: 'Carteira',       type: 'cash',        balance: 0, color: '#f59e0b', icon: '💵' },
];
