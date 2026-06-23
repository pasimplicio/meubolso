# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

MeuBolso is a personal-finance SPA (React 19 + Vite + TypeScript) that runs **100% offline**. All data lives in the browser's IndexedDB via Dexie — there is no backend server or API. The same web build is packaged as an Android APK through Capacitor. UI and all user-facing strings are in Brazilian Portuguese (pt-BR), currency BRL.

## Commands

```bash
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # tsc -b (type-check) then vite build → dist/
npm run lint      # eslint over the repo
npm run preview   # serve the production build
```

There is no test suite. `start.bat` is a Windows convenience script that frees ports 5173/5174 and runs `npm run dev`.

Path alias: `@` → `/src` (configured in both `vite.config.ts` and `tsconfig.app.json`).

### Android (Capacitor)
`npm run build` then `npx cap sync`; `npx cap open android` opens Android Studio. App id `com.meubolso.app`, `webDir: dist`.

## Architecture

**Data layer** — `src/db/index.ts` defines the Dexie database (`MeuBolsoDB`, db name `meubolso`). Schema is versioned; v2 added `users`/`userId`; **v3** added the `investments`, `investmentMoves`, `paystubs` tables and `nature`/`group` indexes on categories (with a non-destructive `.upgrade()` that backfills old categories). `src/db/seedData.ts` holds the full taxonomy ported from the user's Power BI model (`defaultCategories`, ~70 leaves) plus the metadata maps (`natureMeta`, `groupMeta`, `paymentMethodMeta`, `investmentClassMeta`) — **import labels/icons/colors from here, don't hardcode**. `initializeDefaults()` seeds categories only when the DB is empty. Domain types live in `src/types/index.ts`.

**Category model is 3-level** (from the Excel): `nature` (Tipo: `fixas`/`variaveis`/`extras`/`adicionais`, or `receita` for income) → `group` (Grupo string, e.g. `MORADIA`) → `name` (leaf categoria). Each leaf is one `Category` row carrying both `nature` and `group`. Group color/icon come from `groupMeta`; `parentId` is legacy and unused by the seed.

**State layer** — One Zustand store per domain in `src/store/` (`account`, `category`, `transaction`, `budget`, `goal`, `investment`, `paystub`, plus `app` and `auth`). Each domain store holds an in-memory array mirroring IndexedDB: every mutation writes to Dexie **and** updates the array via `set(...)`, so components read from the store, not the DB directly. Stores call each other through `useXStore.getState()` (e.g. `accountStore.deleteAccount` checks `transactionStore`; `paystubStore.addPaystub` calls `transactionStore` + `accountStore`). `appStore` (theme, sidebar, current month/year) and `authStore` (session) persist to localStorage via `persist`; the domain stores do not.

**Importação de extrato bancário** — `src/lib/statementParser.ts` (`parseStatementPdf`) lê PDFs de extrato (Mercado Pago e similares com colunas Data · Descrição · ID · Valor · Saldo) em todas as páginas. Reconstrói linhas por posição e usa a **linha que contém o ID da operação + dois valores R$** como âncora de um lançamento (a descrição pode ter várias linhas, que são acumuladas num buffer). `guessStatementCategoryName` categoriza por palavra-chave. O `StatementImportModal` mostra a prévia editável; `transactionStore.importMany` insere em lote, deduplicando por `Transaction.externalId` (= ID da operação), e opcionalmente reconcilia o saldo da conta para o Saldo Final do extrato (em vez de somar deltas, para evitar drift).

**Contracheque (paystub) module** — `src/lib/paystubParser.ts` parses Brazilian "Holerite Digital / Demonstrativo de Pagamento" PDFs with `pdfjs-dist` (worker imported as `pdfjs-dist/build/pdf.worker.min.mjs?url`). It reconstructs text lines by Y-position, detects the Vencimentos/Descontos columns by the header X-positions, classifies each money token by nearest column, and computes gross/deductions/net from the line items. The import flow (`PaystubImportModal`) lets the user review/edit before saving. `paystubStore.addPaystub(data, createIncome)` optionally posts the net as a `Salário` income transaction and credits the chosen account.

**Auth** — Fully client-side. `authStore` hashes passwords with PBKDF2 (Web Crypto, 100k iterations, SHA-256) and stores users in the `users` table. There is no token/server. On first-ever registration, all pre-existing orphan records (created before any user existed) are claimed by setting their `userId` to the new user. All `load*` functions filter by the current `userId`.

**Routing** — `src/App.tsx` is the single router. When unauthenticated only `/login` and `/register` render; otherwise the full app shell (Header, Sidebar, MobileNav, QuickAddFAB) wraps the page routes. `ProtectedRoute`/`PublicRoute` redirect based on `authStore.isAuthenticated`.

**Pages & components** — `src/pages/` = one component per route. `src/components/` is grouped by feature (`accounts/`, `transactions/`, `budget/`, `goals/`, `categories/`) plus `ui/` (Modal, ConfirmDialog, ProgressBar) and `layout/`. Toasts and confirm dialogs are provided via React context (`src/contexts/ToastContext.tsx`, `src/components/ui/ConfirmDialog.tsx`) wrapping the app in `App.tsx` — use `useToast()` / the confirm hook rather than building ad-hoc dialogs.

**Styling** — Tailwind CSS v4 (via `@tailwindcss/vite`), but most component styling uses the custom design system and CSS variables in `src/index.css` (dark/light themes, glassmorphism) plus inline styles. The theme class is applied to `<html>` from `appStore.theme`. Charts use Recharts; animations use Framer Motion.

## Key behaviors & gotchas

- **Account balances are not derived from transactions.** `Account.balance` is a stored field. It is adjusted *only* in `TransactionModal.onSubmit`, *only* when creating a new `paid` transaction (income +, expense −, transfer moves between accounts). Editing, deleting, or toggling a transaction's status does **not** re-adjust balances. Keep this in mind before adding transaction mutations — the balance/transaction consistency is manual, not automatic.
- **Recurring transactions** are expanded eagerly on creation in `transactionStore.addTransaction`: up to `MAX_RECURRING` (60) future instances are inserted as `status: 'pending'`. Balance updates are not applied to these pending instances.
- **Paystub parsing caveats**: `FGTS` (code 300) appears in the Vencimentos column but is informational and must be **excluded** from gross (the parser stores it in `paystub.fgts`). Net is computed as gross − deductions, not read from the PDF. The parser targets the Senior "Holerite Digital" layout; other layouts may need the column heuristic adjusted, so the import modal always allows manual correction.
- **Transactions** carry `paymentMethod` (Débito/Crédito/PIX/Transferência/Dinheiro/Boleto) and `reconciled` (the "Conciliado" flag from the model). The category picker in `TransactionModal` groups options by Tipo · Grupo via `<optgroup>`.
- **Investments** track `investedAmount` (cost) and `currentValue` (market) separately; `investmentStore.addMove` adjusts them per move type (aporte/resgate/rendimento). Net worth on the Dashboard = total account balance + total investment current value.
- Budgets are keyed by `[month+year]` compound index; goals track `currentAmount` updated via `goalContributions`.
- `src/lib/utils.ts` holds shared formatters (`formatCurrency`, date helpers using `date-fns` + ptBR locale) and the `accountTypeLabels`/`goalTypeLabels`/icon maps — reuse these instead of duplicating.
- IDs are generated with `nanoid()` everywhere.
