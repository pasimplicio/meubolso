import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Preencha todos os campos'); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Wallet size={22} color="white" />
          </div>
        </div>
        <h1 className="auth-title">MeuBolso</h1>
        <p className="auth-subtitle">Seu dinheiro sob controle</p>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">E-mail</label>
            <input
              className={`auth-input ${error ? 'error' : ''}`}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                className={`auth-input ${error ? 'error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>
          )}

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                Entrar <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        <div className="auth-divider">ou</div>

        <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Não tem conta?{' '}
          <Link to="/register" className="auth-link">Criar gratuitamente</Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span
            style={{ fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}
            onClick={() => setError('Recuperação de senha em breve. Por enquanto, crie uma nova conta.')}
          >
            Esqueci minha senha
          </span>
        </div>
      </motion.div>
    </div>
  );
}
