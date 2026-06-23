import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <ArrowLeft size={16} /> Voltar
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <img src="/logo.png" alt="Meu Bolso App" style={{ width: 36, height: 36, objectFit: 'contain' }} />
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Política de Privacidade</h1>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>
        Meu Bolso App · Atualizada em {new Date().toLocaleDateString('pt-BR')}
      </p>

      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section>
          <h2 style={st}>1. Sobre o aplicativo</h2>
          O Meu Bolso App é uma ferramenta de controle financeiro pessoal que permite registrar receitas,
          despesas, contas, investimentos e contracheques, além de importar extratos e gerar relatórios.
        </section>

        <section>
          <h2 style={st}>2. Dados que coletamos</h2>
          Coletamos apenas os dados necessários para o funcionamento do app:
          <ul style={ul}>
            <li><strong>Conta:</strong> nome e e-mail informados no cadastro (ou fornecidos pelo login com Google).</li>
            <li><strong>Dados financeiros:</strong> as informações que você mesmo cadastra (contas, lançamentos, categorias, investimentos, contracheques, metas e orçamentos).</li>
          </ul>
          Não coletamos dados de navegação para fins de publicidade nem vendemos informações a terceiros.
        </section>

        <section>
          <h2 style={st}>3. Como usamos e armazenamos</h2>
          Os dados são usados exclusivamente para oferecer as funcionalidades do app e sincronizar a sua
          conta entre dispositivos. O armazenamento e a autenticação são feitos pela infraestrutura do
          <strong> Google Firebase</strong> (Authentication e Cloud Firestore), com regras de segurança que
          restringem o acesso somente à sua própria conta.
        </section>

        <section>
          <h2 style={st}>4. Login com Google</h2>
          Ao entrar com o Google, utilizamos apenas o seu nome, e-mail e foto de perfil para identificar a
          sua conta. Não acessamos contatos, e-mails ou outros dados da sua conta Google.
        </section>

        <section>
          <h2 style={st}>5. Seus direitos</h2>
          Você pode editar ou excluir seus dados a qualquer momento dentro do app, inclusive apagar todos os
          dados em Configurações. Para excluir sua conta ou solicitar a remoção completa das informações,
          entre em contato pelo e-mail abaixo.
        </section>

        <section>
          <h2 style={st}>6. Contato</h2>
          Dúvidas sobre privacidade: <strong>sistemaspsdev@gmail.com</strong>.
        </section>
      </div>
    </div>
  );
}

const st: CSSProperties = { fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 };
const ul: CSSProperties = { margin: '8px 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 };
