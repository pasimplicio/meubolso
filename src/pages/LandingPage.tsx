import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Wallet, TrendingUp, FileText, PieChart, ArrowLeftRight, ShieldCheck,
} from 'lucide-react';

const features = [
  { icon: ArrowLeftRight, title: 'Receitas e despesas', desc: 'Registre lançamentos com categorias, formas de pagamento e conciliação. Importe o extrato bancário em PDF.' },
  { icon: Wallet, title: 'Contas e saldos', desc: 'Acompanhe o saldo de todas as suas contas e o seu patrimônio em um só lugar.' },
  { icon: TrendingUp, title: 'Investimentos', desc: 'Carteira com rentabilidade calculada automaticamente por taxa (CDI, Selic, IPCA, prefixado).' },
  { icon: FileText, title: 'Contracheque', desc: 'Importe o PDF do holerite e lance automaticamente salário bruto, descontos e líquido.' },
  { icon: PieChart, title: 'Orçamentos e metas', desc: 'Defina limites por categoria e metas de longo prazo com acompanhamento visual.' },
  { icon: ShieldCheck, title: 'Privado e na nuvem', desc: 'Seus dados ficam protegidos na sua conta e sincronizam entre os seus dispositivos.' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Topo */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', maxWidth: 1100, margin: '0 auto', width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="Meu Bolso App" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Meu Bolso App
          </span>
        </div>
        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
          Entrar <ArrowRight size={16} />
        </Link>
      </header>

      {/* Hero */}
      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', width: '100%', padding: '24px' }}>
        <motion.section
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', padding: '48px 0 32px' }}
        >
          <img src="/logo.png" alt="Meu Bolso App" style={{ width: 96, height: 96, objectFit: 'contain', marginBottom: 18 }} />
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Controle financeiro pessoal,<br />simples e completo
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 620, margin: '16px auto 28px', lineHeight: 1.6 }}>
            O <strong>Meu Bolso App</strong> ajuda você a organizar receitas, despesas, contas bancárias,
            investimentos e contracheque — com importação de extratos, orçamentos, metas e relatórios.
            Tudo em um só lugar, sincronizado com segurança na nuvem.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 22px' }}>
              Criar conta gratuita <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '12px 22px' }}>
              Já tenho conta
            </Link>
          </div>
        </motion.section>

        {/* Recursos */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, paddingBottom: 40 }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              className="glass-card" style={{ padding: 20 }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 11, marginBottom: 12,
                background: 'var(--accent-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <f.icon size={20} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{f.desc}</p>
            </motion.div>
          ))}
        </section>
      </main>

      {/* Rodapé */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)', padding: '20px 24px',
        textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)',
      }}>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
          <Link to="/privacidade" className="auth-link">Política de Privacidade</Link>
          <Link to="/login" className="auth-link">Entrar</Link>
        </div>
        © {new Date().getFullYear()} Meu Bolso App · Controle financeiro pessoal
      </footer>
    </div>
  );
}
