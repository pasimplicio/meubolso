// ============================================================
// SCRIPT DE SEED — MeuBolso  (idempotente)
// 1. Digite: allow pasting   → Enter
// 2. Cole este script        → Enter
// 3. Aguarde "🎉 Concluído!" → F5
// ============================================================

(async () => {
  const uid = () => crypto.randomUUID().replace(/-/g, '').slice(0, 21);
  const now = new Date();
  const d   = (day) => new Date(2026, 4, day, 12, 0, 0); // maio 2026

  // ── Abre banco (sem especificar versão = abre a atual) ──
  const db = await new Promise((res, rej) => {
    const req = indexedDB.open('meubolso');
    req.onsuccess     = () => res(req.result);
    req.onerror       = () => rej(new Error('Erro ao abrir o banco: ' + req.error));
    req.onblocked     = () => console.warn('⚠️ Banco bloqueado — feche outras abas do app e tente novamente.');
  });

  console.log('✅ Banco aberto. Versão:', db.version, '| Stores:', [...db.objectStoreNames].join(', '));

  // ── Helper: limpa uma store em transação própria ──
  const clearStore = (name) => new Promise((res, rej) => {
    const tx  = db.transaction(name, 'readwrite');
    tx.objectStore(name).clear();
    tx.oncomplete = () => { console.log(`   🗑️  ${name} limpa`); res(); };
    tx.onerror    = () => rej(new Error(`Erro ao limpar ${name}: ` + tx.error));
    tx.onabort    = () => rej(new Error(`Transação abortada em ${name}`));
  });

  // ── Helper: busca todos os registros ──
  const getAll = (name) => new Promise((res, rej) => {
    const tx  = db.transaction(name, 'readonly');
    const req = tx.objectStore(name).getAll();
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });

  // ── Helper: insere lista em uma única transação ──
  const addAll = (name, items) => new Promise((res, rej) => {
    if (!items.length) return res();
    const tx = db.transaction(name, 'readwrite');
    const os = tx.objectStore(name);
    items.forEach((item) => os.add(item));
    tx.oncomplete = () => { console.log(`   ✅ ${items.length} registro(s) → ${name}`); res(); };
    tx.onerror    = () => rej(new Error(`Erro ao inserir em ${name}: ` + tx.error));
    tx.onabort    = () => rej(new Error(`Transação abortada em ${name}: ` + tx.error));
  });

  try {
    // ══ PASSO 1 — Limpar (sequencial para evitar conflito) ══
    console.log('\n🗑️  Limpando stores...');
    await clearStore('accounts');
    await clearStore('transactions');
    await clearStore('budgets');
    await clearStore('goals');
    await clearStore('goalContributions');
    console.log('✅ Limpeza concluída.\n');

    // ══ PASSO 2 — Verificar categorias ══
    const cats = await getAll('categories');
    const c    = (name) => cats.find(x => x.name === name)?.id ?? cats[0]?.id;

    if (!cats.length) {
      console.warn('⚠️ Sem categorias. Abra o app primeiro (ele cria as categorias padrão), depois rode o seed.');
      db.close(); return;
    }
    console.log(`✅ ${cats.length} categorias encontradas.\n`);

    // ══ PASSO 3 — Inserir dados ══
    console.log('📥 Inserindo dados...');

    // Contas
    const acc1 = uid(), acc2 = uid(), acc3 = uid();
    await addAll('accounts', [
      { id: acc1, name: 'Nubank',        type: 'checking',    balance: 5420.50, color: '#8B5CF6', icon: '', createdAt: now },
      { id: acc2, name: 'Poupança',      type: 'savings',     balance: 15000,   color: '#10B981', icon: '', createdAt: now },
      { id: acc3, name: 'Cartão Nubank', type: 'credit_card', balance:  -820,   color: '#6366F1', icon: '', createdAt: now },
    ]);

    // Transações
    await addAll('transactions', [
      { id: uid(), type: 'income',   amount: 8000,   description: 'Salário',            categoryId: c('Salário'),          accountId: acc1,                   date: d(2),  status: 'paid',    tags: ['trabalho'],             createdAt: now },
      { id: uid(), type: 'income',   amount: 2000,   description: 'Freelance Design',   categoryId: c('Freelance'),        accountId: acc1,                   date: d(10), status: 'paid',    tags: ['trabalho', 'extra'],    createdAt: now },
      { id: uid(), type: 'expense',  amount: 2500,   description: 'Aluguel',            categoryId: c('Moradia'),          accountId: acc1,                   date: d(5),  status: 'paid',    tags: ['moradia', 'fixo'],      createdAt: now },
      { id: uid(), type: 'expense',  amount: 450.80, description: 'Supermercado',       categoryId: c('Alimentação'),      accountId: acc1,                   date: d(7),  status: 'paid',    tags: ['alimentação'],          createdAt: now },
      { id: uid(), type: 'expense',  amount: 189,    description: 'Jantar Restaurante', categoryId: c('Alimentação'),      accountId: acc3,                   date: d(13), status: 'paid',    tags: ['alimentação', 'lazer'], createdAt: now },
      { id: uid(), type: 'expense',  amount: 55.90,  description: 'Netflix',            categoryId: c('Lazer'),            accountId: acc3,                   date: d(8),  status: 'paid',    tags: ['streaming', 'lazer'],   recurrence: 'monthly', createdAt: now },
      { id: uid(), type: 'expense',  amount: 139.90, description: 'Academia Smart Fit', categoryId: c('Saúde'),            accountId: acc1,                   date: d(1),  status: 'paid',    tags: ['saúde', 'fixo'],        recurrence: 'monthly', createdAt: now },
      { id: uid(), type: 'expense',  amount: 127.50, description: 'Farmácia',           categoryId: c('Saúde'),            accountId: acc3,                   date: d(11), status: 'paid',                                    createdAt: now },
      { id: uid(), type: 'expense',  amount: 253.40, description: 'Conta de Luz',       categoryId: c('Contas'),           accountId: acc1,                   date: d(12), status: 'paid',    tags: ['contas', 'fixo'],       createdAt: now },
      { id: uid(), type: 'expense',  amount: 89,     description: 'Uber',               categoryId: c('Transporte'),       accountId: acc3,                   date: d(14), status: 'paid',    tags: ['transporte'],           createdAt: now },
      { id: uid(), type: 'expense',  amount: 350,    description: 'Plano de Saúde',     categoryId: c('Saúde'),            accountId: acc1,                   date: d(15), status: 'pending', tags: ['saúde', 'fixo'],        recurrence: 'monthly', createdAt: now },
      { id: uid(), type: 'expense',  amount: 299,    description: 'Curso Udemy',        categoryId: c('Educação'),         accountId: acc3,                   date: d(9),  status: 'paid',    tags: ['educação'],             createdAt: now },
      { id: uid(), type: 'expense',  amount: 180,    description: 'Vestuário C&A',      categoryId: c('Vestuário'),        accountId: acc3,                   date: d(16), status: 'paid',    tags: ['roupa'],                createdAt: now },
      { id: uid(), type: 'transfer', amount: 1000,   description: 'Aporte Poupança',    categoryId: c('Outros (Receita)'), accountId: acc1, toAccountId: acc2, date: d(10), status: 'paid',                                    createdAt: now },
    ]);

    // Orçamentos
    await addAll('budgets', [
      { id: uid(), categoryId: c('Alimentação'), amount: 800,  month: 5, year: 2026 },
      { id: uid(), categoryId: c('Moradia'),     amount: 2600, month: 5, year: 2026 },
      { id: uid(), categoryId: c('Lazer'),       amount: 350,  month: 5, year: 2026 },
      { id: uid(), categoryId: c('Saúde'),       amount: 400,  month: 5, year: 2026 },
      { id: uid(), categoryId: c('Transporte'),  amount: 250,  month: 5, year: 2026 },
      { id: uid(), categoryId: c('Educação'),    amount: 300,  month: 5, year: 2026 },
    ]);

    // Metas
    const g1 = uid(), g2 = uid(), g3 = uid();
    await addAll('goals', [
      { id: g1, name: 'Reserva de Emergência', type: 'emergency', targetAmount: 30000, currentAmount: 15000, deadline: new Date(2026, 11, 31), icon: '🛡️', color: '#10B981', createdAt: now },
      { id: g2, name: 'Viagem Europa',         type: 'travel',    targetAmount: 15000, currentAmount:  3500, deadline: new Date(2027,  5,  1), icon: '✈️', color: '#3B82F6', createdAt: now },
      { id: g3, name: 'MacBook Pro',           type: 'purchase',  targetAmount: 12000, currentAmount:  4800, deadline: new Date(2026,  8,  1), icon: '💻', color: '#8B5CF6', createdAt: now },
    ]);

    // Contribuições
    await addAll('goalContributions', [
      { id: uid(), goalId: g1, amount: 5000, date: new Date(2026, 1, 10), notes: 'Aporte inicial',         createdAt: now },
      { id: uid(), goalId: g1, amount: 5000, date: new Date(2026, 2, 10), notes: 'Segundo aporte',         createdAt: now },
      { id: uid(), goalId: g1, amount: 5000, date: new Date(2026, 3, 10), notes: 'Terceiro aporte',        createdAt: now },
      { id: uid(), goalId: g2, amount: 1500, date: new Date(2026, 1, 15), notes: 'Início do fundo viagem', createdAt: now },
      { id: uid(), goalId: g2, amount: 2000, date: new Date(2026, 3, 20), notes: 'Extras de março',        createdAt: now },
      { id: uid(), goalId: g3, amount: 2400, date: new Date(2026, 2,  5), notes: 'Bônus de trabalho',      createdAt: now },
      { id: uid(), goalId: g3, amount: 2400, date: new Date(2026, 4, 10), notes: 'Freelance maio',         createdAt: now },
    ]);

    db.close();
    console.log('\n🎉 Seed concluído com sucesso! Pressione F5 para recarregar o app.');

  } catch (err) {
    console.error('❌ Erro durante o seed:', err);
    db.close();
  }
})();
