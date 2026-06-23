import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <ArrowLeft size={16} /> Voltar
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <img src="/logo.png" alt="Meu Bolso App" style={{ width: 36, height: 36, objectFit: 'contain' }} />
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Termos de Uso</h1>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>
        Meu Bolso App · Atualizado em {new Date().toLocaleDateString('pt-BR')}
      </p>

      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section>
          <h2 style={st}>1. Aceitação dos termos</h2>
          Ao criar uma conta e utilizar o Meu Bolso App, você concorda com estes Termos de Uso e com a nossa{' '}
          <Link to="/privacidade" className="auth-link">Política de Privacidade</Link>. Caso não concorde, não utilize o aplicativo.
        </section>

        <section>
          <h2 style={st}>2. Descrição do serviço</h2>
          O Meu Bolso App é uma ferramenta de organização financeira pessoal que permite registrar e visualizar
          receitas, despesas, contas, investimentos, contracheques, orçamentos e metas, além de importar
          extratos bancários e contracheques em PDF para facilitar o lançamento.
        </section>

        <section>
          <h2 style={st}>3. Conta do usuário</h2>
          <ul style={ul}>
            <li>Você é responsável por manter a confidencialidade das suas credenciais de acesso.</li>
            <li>As informações cadastradas devem ser verdadeiras e de sua responsabilidade.</li>
            <li>Você pode editar ou excluir seus dados a qualquer momento dentro do aplicativo.</li>
          </ul>
        </section>

        <section>
          <h2 style={st}>4. Uso adequado</h2>
          Você concorda em não utilizar o aplicativo para fins ilícitos, nem tentar acessar dados de outros
          usuários, comprometer a segurança ou o funcionamento do serviço.
        </section>

        <section>
          <h2 style={st}>5. Natureza informativa</h2>
          O Meu Bolso App é uma ferramenta de apoio à organização financeira. As informações, cálculos de
          rentabilidade e projeções (incluindo taxas de referência) têm caráter <strong>meramente informativo</strong>
          {' '}e não constituem recomendação ou consultoria de investimentos. As decisões financeiras são de sua
          exclusiva responsabilidade.
        </section>

        <section>
          <h2 style={st}>6. Disponibilidade e limitação de responsabilidade</h2>
          O serviço é fornecido "como está". Empenhamo-nos para manter a disponibilidade e a integridade dos
          dados, mas não garantimos funcionamento ininterrupto ou livre de erros. Recomendamos manter backups
          das informações importantes. Não nos responsabilizamos por perdas decorrentes do uso do aplicativo.
        </section>

        <section>
          <h2 style={st}>7. Alterações</h2>
          Estes termos podem ser atualizados periodicamente. O uso contínuo do aplicativo após mudanças
          significa a aceitação dos termos revisados.
        </section>

        <section>
          <h2 style={st}>8. Contato</h2>
          Dúvidas sobre estes termos: <strong>sistemaspsdev@gmail.com</strong>.
        </section>
      </div>
    </div>
  );
}

const st: CSSProperties = { fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 };
const ul: CSSProperties = { margin: '8px 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 };
