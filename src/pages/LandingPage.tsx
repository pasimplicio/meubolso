import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, TrendingUp, FileText, ArrowLeftRight, ShieldCheck,
  Wallet, Sparkles, Target, Check,
} from 'lucide-react';

const features = [
  { icon: ArrowLeftRight, color: '#8b5cf6', title: 'Receitas e despesas', desc: 'Lançamentos com categorias, formas de pagamento e conciliação. Importe o extrato bancário em PDF.' },
  { icon: Wallet, color: '#10b981', title: 'Contas e patrimônio', desc: 'Saldo de todas as contas e o seu patrimônio líquido reunidos em um só painel.' },
  { icon: TrendingUp, color: '#22c55e', title: 'Investimentos', desc: 'Rentabilidade calculada automaticamente por taxa (CDI, Selic, IPCA, prefixado) com dados do Banco Central.' },
  { icon: FileText, color: '#0ea5e9', title: 'Contracheque', desc: 'Importe o PDF do holerite e lance bruto, descontos e líquido automaticamente.' },
  { icon: Target, color: '#f43f5e', title: 'Orçamentos e metas', desc: 'Defina limites por categoria e metas de longo prazo com acompanhamento visual.' },
  { icon: ShieldCheck, color: '#6366f1', title: 'Privado e na nuvem', desc: 'Seus dados protegidos na sua conta, sincronizados com segurança entre dispositivos.' },
];

const highlights = ['Importação de extrato em PDF', 'Login com Google', 'Tema claro e escuro', 'Funciona offline'];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div className="lp-mesh" />

      {/* Topo */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', maxWidth: 1140, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="Meu Bolso App" style={{ width: 42, height: 42, objectFit: 'contain' }} />
          <span className="gradient-text" style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Meu Bolso</span>
        </div>
        <Link to="/login" className="lp-ghost" style={{ padding: '9px 18px', fontSize: '0.85rem' }}>Entrar</Link>
      </header>

      {/* Hero */}
      <main style={{ flex: 1, maxWidth: 1140, margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <section style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center', padding: '40px 0 24px' }}>
          {/* Texto */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
            style={{ flex: '1 1 380px', minWidth: 300 }}>
            <span className="lp-badge"><Sparkles size={14} /> Controle financeiro inteligente</span>
            <h1 style={{ fontSize: 'clamp(2.1rem, 5.5vw, 3.4rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '18px 0 16px' }}>
              Toda a sua vida<br />financeira em{' '}
              <span className="gradient-text">um só lugar</span>
            </h1>
            <p style={{ fontSize: '1.08rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 520, marginBottom: 26 }}>
              Organize receitas, despesas, contas, investimentos e contracheque — com importação de extratos,
              orçamentos, metas e relatórios. Simples, bonito e sincronizado na nuvem.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
              <Link to="/register" className="lp-cta">Criar conta grátis <ArrowRight size={18} /></Link>
              <Link to="/login" className="lp-ghost">Já tenho conta</Link>
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {['Grátis para começar', 'Sem cartão de crédito', 'Dados seguros'].map((t) => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} style={{ color: 'var(--accent-primary)' }} /> {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Mockup do app */}
          <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            style={{ flex: '1 1 360px', minWidth: 300, display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{ animation: 'floaty 6s ease-in-out infinite', width: '100%', maxWidth: 440 }}>
              <AppMockup />
            </div>
            {/* Pílulas flutuantes */}
            <div style={{ position: 'absolute', top: 6, left: 0, animation: 'floatyDelay 7s ease-in-out infinite' }}>
              <FloatPill icon="💰" label="Salário" value="+ R$ 7.760" color="var(--accent-green)" />
            </div>
            <div style={{ position: 'absolute', bottom: 8, right: 0, animation: 'floaty 5.5s ease-in-out infinite' }}>
              <FloatPill icon="📈" label="Rendimento" value="+ 1,18%" color="#22c55e" />
            </div>
          </motion.div>
        </section>

        {/* Recursos */}
        <section style={{ padding: '32px 0 8px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Tudo que você precisa para <span className="gradient-text">cuidar do seu dinheiro</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Recursos pensados para o dia a dia da sua vida financeira.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.04 * i }}
                className="glass-card lp-feature" style={{ padding: 22 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, marginBottom: 14, background: `${f.color}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 7 }}>{f.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Faixa de destaques */}
        <section style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', padding: '28px 0' }}>
          {highlights.map((h) => (
            <span key={h} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 999, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', fontSize: '0.84rem', fontWeight: 600, boxShadow: 'var(--shadow-card)' }}>
              <Check size={15} style={{ color: 'var(--accent-primary)' }} /> {h}
            </span>
          ))}
        </section>

        {/* CTA final */}
        <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-card" style={{ textAlign: 'center', padding: '40px 24px', margin: '12px 0 48px', background: 'linear-gradient(135deg, var(--accent-primary-soft), transparent)' }}>
          <img src="/logo.png" alt="" style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 12 }} />
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.1rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>
            Comece a organizar suas finanças hoje
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 24px' }}>
            Crie sua conta gratuita em segundos e tenha o controle total do seu dinheiro.
          </p>
          <Link to="/register" className="lp-cta" style={{ padding: '15px 30px', fontSize: '1rem' }}>
            Criar minha conta <ArrowRight size={18} />
          </Link>
        </motion.section>
      </main>

      {/* Rodapé */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '22px 24px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
          <Link to="/privacidade" className="auth-link">Política de Privacidade</Link>
          <Link to="/termos" className="auth-link">Termos de Uso</Link>
          <Link to="/login" className="auth-link">Entrar</Link>
          <Link to="/register" className="auth-link">Criar conta</Link>
        </div>
        © {new Date().getFullYear()} Meu Bolso App · Controle financeiro pessoal
      </footer>
    </div>
  );
}

function FloatPill({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 13px', boxShadow: 'var(--shadow-card-hover)' }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <div>
        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '0.82rem', fontWeight: 800, color }}>{value}</div>
      </div>
    </div>
  );
}

/** Mini painel que simula o app. */
function AppMockup() {
  const bars = [42, 64, 38, 78, 90, 56];
  return (
    <div className="glass-card-static" style={{ padding: 16, boxShadow: 'var(--shadow-modal)', border: '1px solid var(--border-subtle)' }}>
      {/* topo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Maio 2026</span>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-primary)' }}>P</div>
      </div>
      {/* stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
        {[['Receitas', 'R$ 8.450', 'var(--accent-green)'], ['Despesas', 'R$ 5.120', 'var(--accent-red)'], ['Saldo', 'R$ 3.330', 'var(--accent-blue)']].map(([l, v, c]) => (
          <div key={l} style={{ padding: '9px 10px', borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.54rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{l}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      {/* gráfico */}
      <div style={{ padding: '12px 12px 8px', borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', marginBottom: 12 }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Fluxo de caixa</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 70 }}>
          {bars.map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 5, background: 'var(--brand-gradient)', opacity: 0.55 + (h / 250) }} />
          ))}
        </div>
      </div>
      {/* transações */}
      {[['🛒', 'Supermercado', '- R$ 320,00', 'var(--accent-red)'], ['💰', 'Salário', '+ R$ 7.760,40', 'var(--accent-green)']].map(([ic, n, v, c]) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '1rem' }}>{ic}</span>
          <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 600 }}>{n}</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: c }}>{v}</span>
        </div>
      ))}
    </div>
  );
}
