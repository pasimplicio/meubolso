# 💰 MeuBolso — Controle Financeiro Pessoal

Aplicativo web moderno e responsivo para controle financeiro pessoal completo, com **sincronização na nuvem** via Firebase (Auth + Firestore offline-first). UI em pt-BR, moeda BRL. Também empacotável como APK Android via Capacitor.

## ✨ Funcionalidades
- **Transações** com forma de pagamento e conciliação; **categorias em 3 níveis** (Tipo → Grupo → Categoria), modelo portado de uma planilha Power BI.
- **Contas**, **Orçamentos** (com clonagem do mês anterior) e **Metas** (com contribuições).
- **Investimentos** com rentabilidade calculada automaticamente por taxa (Prefixado / % CDI / % Selic / IPCA+), usando taxas reais do **Banco Central (API SGS)**.
- **Contracheque**: importa o PDF do holerite e lança o bruto como receita e cada desconto como despesa por categoria.
- **Importação de extrato bancário** em PDF (Mercado Pago) com categorização automática e deduplicação por ID da operação.
- **Dashboard** e **Relatórios** com gráficos (Recharts); **tema claro (verde) e escuro**.
- **Login** por e-mail/senha ou **Google**.

## 🛠️ Stack
React 19 · Vite · TypeScript · Zustand · **Firebase (Auth + Firestore)** · Recharts · Framer Motion · React Hook Form · pdfjs-dist · Tailwind CSS v4 · Capacitor (APK).

## 📦 Rodar localmente

```bash
npm install
cp .env.example .env   # preencha com as chaves do seu projeto Firebase
npm run dev            # http://localhost:5173
npm run build          # type-check (tsc) + build de produção em dist/
npm run lint           # eslint
```

### Variáveis de ambiente (`.env`)
São as chaves do app **Web** do Firebase (Console → Configurações do projeto → Seus apps → SDK). Veja `.env.example`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 🔥 Configuração do Firebase
1. **Authentication → Sign-in method**: ative **E-mail/senha** e **Google**.
2. **Firestore Database**: crie o banco (modo produção) e publique as regras de [`firestore.rules`](firestore.rules).
3. **Authentication → Settings → Authorized domains**: adicione o domínio de produção (ex.: `meubolso.vercel.app`) — `localhost` já vem liberado.

## 🚀 Deploy na Vercel (via GitHub)
1. Importe o repositório na Vercel — o framework **Vite** é detectado automaticamente (build `npm run build`, saída `dist`).
2. Em **Settings → Environment Variables**, adicione as 6 variáveis `VITE_FIREBASE_*` (ambientes **Production** e **Preview**).
3. Faça o deploy. O [`vercel.json`](vercel.json) já cuida do **fallback de SPA** e do header `Cross-Origin-Opener-Policy: same-origin-allow-popups` (necessário para o login com Google funcionar).
4. Adicione o domínio gerado pela Vercel em **Firebase → Authentication → Authorized domains**.

## 📱 Gerando APK (Android)
```bash
npm run build
npx cap add android   # uma única vez
npx cap sync
npx cap open android  # gere o APK no Android Studio
```
> Observação: o login **Google por popup** não funciona dentro do WebView do APK — nesse caso é necessário o plugin nativo de autenticação do Google. O login por e-mail/senha funciona normalmente.
