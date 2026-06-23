import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ReferenceRates {
  cdi: number;   // % a.a.
  selic: number; // % a.a.
  ipca: number;  // % acumulado 12 meses
}

interface RatesStore extends ReferenceRates {
  updatedAt?: string;
  loading: boolean;
  setRates: (r: Partial<ReferenceRates>) => void;
  /** Busca as taxas reais na API do Banco Central (SGS). Retorna true se ok. */
  fetchFromBcb: () => Promise<boolean>;
}

// Valores-padrão razoáveis (editáveis / atualizáveis pelo BCB).
const DEFAULTS: ReferenceRates = { cdi: 10.5, selic: 10.75, ipca: 4.0 };

// Séries do SGS/BCB: 4389 = CDI a.a.; 432 = Selic meta a.a.; 13522 = IPCA 12m.
async function bcb(series: number): Promise<number | null> {
  try {
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${series}/dados/ultimos/1?formato=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as Array<{ valor: string }>;
    const v = parseFloat(json[0]?.valor?.replace(',', '.'));
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

export const useRatesStore = create<RatesStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      loading: false,

      setRates: (r) => set((s) => ({ ...s, ...r })),

      fetchFromBcb: async () => {
        set({ loading: true });
        const [selic, cdi, ipca] = await Promise.all([bcb(432), bcb(4389), bcb(13522)]);
        const cur = get();
        // Guarda contra séries diárias acidentais (valor < 1 a.a. é improvável aqui).
        const next: Partial<ReferenceRates> = {};
        if (selic && selic >= 1) next.selic = selic;
        if (cdi && cdi >= 1) next.cdi = cdi;
        if (ipca && ipca >= -5) next.ipca = ipca;
        const ok = Object.keys(next).length > 0;
        set({ ...cur, ...next, loading: false, updatedAt: ok ? new Date().toISOString() : cur.updatedAt });
        return ok;
      },
    }),
    { name: 'meubolso-rates' }
  )
);
