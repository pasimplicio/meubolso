# 💰 MeuBolso — Controle Financeiro Pessoal

Aplicativo web moderno, responsivo e multiplataforma para controle financeiro pessoal completo. Projetado com design premium dark-mode glassmorphism. Compatível com web e Android (APK via Capacitor).

## 🚀 O que foi implementado

O projeto foi inicializado do zero e agora possui uma base sólida com as seguintes features completas:

1. **Fundação Tecnológica & Design System**
   - Setup com React 19, Vite 6 e TypeScript.
   - Integração com Tailwind CSS v4 para estilos utilitários.
   - Design System customizado (`index.css`) com suporte a Dark Mode, Glassmorphism, botões responsivos e animações com Framer Motion.
   - Banco de dados local com `Dexie.js` (IndexedDB) para garantir que o aplicativo funcione **100% offline** e com privacidade total (nenhum dado sai do dispositivo).
   - Gerenciamento de estado global com `Zustand` (tema, barra lateral, meses).
   - Configuração do **Capacitor** para geração de build Android nativo (`APK`).

2. **Módulo de Dashboard**
   - Cartões de resumo de contas (Saldo, Receitas, Despesas, Saldo do Mês).
   - Gráfico de área para evolução do Fluxo de Caixa.
   - Gráfico de donut para Gastos por Categoria do mês atual.
   - Feed de últimas transações e contas pendentes.
   - Progresso rápido das Metas financeiras ativas.

3. **Módulo de Transações**
   - Listagem com filtro dinâmico de texto e tipos (Receita, Despesa, Transferência).
   - Modal de criação/edição inteligente com abas, data, status (Pago/Pendente) e atualizações automáticas dos saldos bancários.

4. **Módulo de Contas**
   - Gestão de diferentes tipos de contas (Conta Corrente, Poupança, Cartões de Crédito, etc.).
   - Cartões visuais que refletem dinamicamente as cores e ícones baseados no tipo de conta e saldo.

5. **Módulo de Categorias**
   - Categorias padrão carregadas dinamicamente ao iniciar o app.
   - Suporte para divisão por Receita/Despesa e hierarquia de Subcategorias.
   - Seleção de ícones (emojis) e cores.

6. **Módulo de Orçamento**
   - Criação de metas de gasto por categoria.
   - Barras de progresso com alertas automáticos baseados no limite estipulado (alertas laranjas para mais de 80% e vermelhos para estouro de orçamento).
   - Capacidade de clonar orçamentos do mês anterior com um clique.

7. **Módulo de Metas**
   - Criação de metas de prazo longo e reserva de emergência com target e deadlines.
   - Depósito de contribuições isoladas para o fundo da meta e sistema de confetes ao completar 100%.

8. **Relatórios e Analytics**
   - 4 diferentes visões via `Recharts`:
     1. Receitas x Despesas em barras por mês.
     2. Gasto anual em categorias por gráfico circular.
     3. Evolução acumulada de patrimônio.
     4. Linha de tendência mês a mês.

9. **Configurações e Gestão de Dados**
   - **Sistema completo de Backup JSON**: Opção de exportar todos os dados locais e importar os backups quando necessário (excelente para trocar de aparelho).
   - Função de "Limpar Todos os Dados" para reiniciar a carteira do zero de forma segura.

## 🛠️ Tecnologias Principais

- **Frontend**: React 19, TypeScript, Vite
- **UI/Estilos**: Tailwind CSS v4, Framer Motion, Lucide React
- **Banco de Dados**: Dexie.js (IndexedDB wrapper)
- **Gerenciador de Estado**: Zustand
- **Formulários**: React Hook Form
- **Gráficos**: Recharts
- **Mobile**: Capacitor (Ionic) para empacotamento em APK

## 📦 Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento Vite:
   ```bash
   npm run dev
   ```

3. Acesse no navegador em `http://localhost:5173`.

## 📱 Gerando APK (Android)

O app está configurado com Capacitor para se transformar em um aplicativo Android real.
Para criar o app Android siga estes passos:

1. Faça o build web do projeto de produção:
   ```bash
   npm run build
   ```

2. Adicione a plataforma Android ao projeto (uma única vez):
   ```bash
   npx cap add android
   ```

3. Sincronize os arquivos compilados com o projeto Android:
   ```bash
   npx cap sync
   ```

4. Abra o projeto nativo no Android Studio (requer Android Studio instalado):
   ```bash
   npx cap open android
   ```
   No Android Studio, você pode ir em **Build > Build Bundle(s) / APK(s) > Build APK(s)** para gerar seu `.apk`.
