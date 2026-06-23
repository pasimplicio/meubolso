import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where as fsWhere,
  orderBy as fsOrderBy,
  Timestamp,
  type CollectionReference,
} from 'firebase/firestore';
import { firestore, auth } from '../firebase';
import type {
  Account, Category, Transaction, Budget, Goal, GoalContribution,
  Investment, InvestmentMove, Paystub,
} from '../types';
import { defaultCategories } from './seedData';

export { defaultCategories } from './seedData';

/** UID do usuário autenticado (cada usuário tem suas próprias subcoleções). */
function uid(): string {
  const u = auth.currentUser;
  if (!u) throw new Error('Usuário não autenticado');
  return u.uid;
}

function col(name: string): CollectionReference {
  return collection(firestore, 'users', uid(), name);
}

/** Executa operações em lotes respeitando o limite de 500 do Firestore. */
async function inBatches<I>(items: I[], op: (batch: ReturnType<typeof writeBatch>, item: I) => void) {
  for (let i = 0; i < items.length; i += 450) {
    const batch = writeBatch(firestore);
    items.slice(i, i + 450).forEach((it) => op(batch, it));
    await batch.commit();
  }
}

/** Converte Timestamps do Firestore de volta para Date. */
function fromFs<T>(data: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const k in data) {
    const v = data[k];
    out[k] = v instanceof Timestamp ? v.toDate() : v;
  }
  return out as T;
}

class Filtered<T> {
  private name: string;
  private field: string;
  private val: unknown;
  constructor(name: string, field: string, val: unknown) { this.name = name; this.field = field; this.val = val; }
  private build() {
    // userId é redundante (a subcoleção já é por usuário) — evita índice composto.
    return this.field === 'userId' ? col(this.name) : query(col(this.name), fsWhere(this.field, '==', this.val));
  }
  async toArray(): Promise<T[]> {
    const snap = await getDocs(this.build());
    return snap.docs.map((d) => fromFs<T>(d.data()));
  }
  async delete(): Promise<void> {
    const snap = await getDocs(this.build());
    const batch = writeBatch(firestore);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

class WhereClause<T> {
  private name: string;
  private field: string;
  constructor(name: string, field: string) { this.name = name; this.field = field; }
  equals(val: unknown) { return new Filtered<T>(this.name, this.field, val); }
}

class Ordered<T> {
  private name: string;
  private field: string;
  private dir: 'asc' | 'desc';
  constructor(name: string, field: string, dir: 'asc' | 'desc') { this.name = name; this.field = field; this.dir = dir; }
  reverse() { return new Ordered<T>(this.name, this.field, this.dir === 'asc' ? 'desc' : 'asc'); }
  async toArray(): Promise<T[]> {
    const snap = await getDocs(query(col(this.name), fsOrderBy(this.field, this.dir)));
    return snap.docs.map((d) => fromFs<T>(d.data()));
  }
}

class Table<T extends { id: string }> {
  name: string;
  constructor(name: string) { this.name = name; }

  async add(obj: T): Promise<void> { await setDoc(doc(col(this.name), obj.id), obj as Record<string, unknown>); }
  async update(id: string, data: Partial<T>): Promise<void> { await updateDoc(doc(col(this.name), id), data as Record<string, unknown>); }
  async delete(id: string): Promise<void> { await deleteDoc(doc(col(this.name), id)); }

  async bulkAdd(arr: T[]): Promise<void> {
    const name = this.name;
    await inBatches(arr, (batch, o) => batch.set(doc(col(name), o.id), o as Record<string, unknown>));
  }
  async bulkDelete(ids: string[]): Promise<void> {
    const name = this.name;
    await inBatches(ids, (batch, id) => batch.delete(doc(col(name), id)));
  }
  async clear(): Promise<void> {
    const snap = await getDocs(col(this.name));
    await inBatches(snap.docs, (batch, d) => batch.delete(d.ref));
  }

  async toArray(): Promise<T[]> {
    const snap = await getDocs(col(this.name));
    return snap.docs.map((d) => fromFs<T>(d.data()));
  }
  async count(): Promise<number> {
    const snap = await getDocs(col(this.name));
    return snap.size;
  }

  where(field: string) { return new WhereClause<T>(this.name, field); }
  orderBy(field: string) { return new Ordered<T>(this.name, field, 'asc'); }
}

export const db = {
  accounts: new Table<Account>('accounts'),
  categories: new Table<Category>('categories'),
  transactions: new Table<Transaction>('transactions'),
  budgets: new Table<Budget>('budgets'),
  goals: new Table<Goal>('goals'),
  goalContributions: new Table<GoalContribution>('goalContributions'),
  investments: new Table<Investment>('investments'),
  investmentMoves: new Table<InvestmentMove>('investmentMoves'),
  paystubs: new Table<Paystub>('paystubs'),
};

/**
 * Semeia as categorias padrão para o usuário atual quando ele ainda não tem
 * nenhuma (primeiro acesso). Cada usuário tem sua própria taxonomia.
 */
let initPromise: Promise<void> | null = null;
export function initializeDefaults(): Promise<void> {
  if (!initPromise) initPromise = doInitializeDefaults();
  return initPromise;
}
// Reinicia o controle ao trocar de usuário (logout/login).
export function resetInitState() { initPromise = null; }

async function doInitializeDefaults() {
  const count = await db.categories.count();
  if (count === 0) {
    const { nanoid } = await import('nanoid');
    const cats: Category[] = defaultCategories.map((cat) => ({ ...cat, id: nanoid(), userId: uid() }));
    await db.categories.bulkAdd(cats);
  } else {
    await dedupeCategories();
  }
}

/** Remove categorias duplicadas (tipo+natureza+grupo+nome), reapontando vínculos. */
export async function dedupeCategories() {
  const all = await db.categories.toArray();
  const keptByKey = new Map<string, string>();
  const remap = new Map<string, string>();
  for (const c of all) {
    const key = `${c.type}|${c.nature}|${c.group}|${c.name.trim().toLowerCase()}`;
    const kept = keptByKey.get(key);
    if (kept) remap.set(c.id, kept);
    else keptByKey.set(key, c.id);
  }
  if (remap.size === 0) return;

  const [txs, budgets] = await Promise.all([db.transactions.toArray(), db.budgets.toArray()]);
  for (const t of txs) {
    const k = remap.get(t.categoryId);
    if (k) await db.transactions.update(t.id, { categoryId: k });
  }
  for (const b of budgets) {
    const k = remap.get(b.categoryId);
    if (k) await db.budgets.update(b.id, { categoryId: k });
  }
  await db.categories.bulkDelete([...remap.keys()]);
}
