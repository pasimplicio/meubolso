import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useAccountStore } from '../store/accountStore';
import GoogleButton from '../components/auth/GoogleButton';
import type { AccountType } from '../types';

const ACCOUNT_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e', '#6366f1'];

function getPasswordStrength(p: string): number {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

const strengthLabel = ['', 'Fraca', 'Regular', 'Boa', 'Forte'];
const strengthColor = ['', '#f43f5e', '#f59e0b', '#10b981', '#10b981'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuthStore();
  const { addAccount } = useAccountStore();

  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Step 0 — credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 1 — first account
  const [accountName, setAccountName] = useState('Conta Principal');
  const [accountType, setAccountType] = useState<AccountType>('checking');
  const [accountBalance, setAccountBalance] = useState('0');
  const [accountColor, setAccountColor] = useState(ACCOUNT_COLORS[0]);

  const strength = getPasswordStrength(password);

  const handleStepZero = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Informe seu nome'); return; }
    if (!email.trim()) { setError('Informe seu e-mail'); return; }
    if (password.length < 8) { setError('Senha deve ter no mínimo 8 caracteres'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem'); return; }
    setLoading(true);
    try {
      await register(email, password, name);
      setStep(1);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const ok = await loginWithGoogle();
      if (ok) navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar com Google');
    } finally {
      setLoading(false);
    }
  };

  const finishOnboarding = async (createAccount: boolean) => {
    setLoading(true);
    try {
      if (createAccount && accountName.trim()) {
        await addAccount({
          name: accountName.trim(),
          type: accountType,
          balance: parseFloat(accountBalance) || 0,
          color: accountColor,
          icon: '',
        });
      }
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar conta');
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
          <img src="/logo.png" alt="MeuBolso" className="auth-logo-img" />
        </div>

        {/* Step indicator */}
        <div className="auth-steps">
          <div className={`auth-step-dot ${step >= 0 ? 'active' : ''}`} />
          <div className={`auth-step-dot ${step >= 1 ? 'active' : ''}`} />
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <p className="auth-subtitle">Crie sua conta gratuita</p>
              <form onSubmit={handleStepZero}>
                <div className="auth-field">
                  <label className="auth-label">Nome</label>
                  <input
                    className="auth-input" type="text" placeholder="Seu nome"
                    value={name} onChange={e => setName(e.target.value)} autoFocus
                  />
                </div>
                <div className="auth-field">
                  <label className="auth-label">E-mail</label>
                  <input
                    className="auth-input" type="email" placeholder="seu@email.com"
                    value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
                  />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Senha</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="auth-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
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
                  {password && (
                    <div style={{ marginTop: 6 }}>
                      <div className="password-strength">
                        <div
                          className="password-strength-bar"
                          style={{ width: `${strength * 25}%`, background: strengthColor[strength] }}
                        />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: strengthColor[strength], marginTop: 3 }}>
                        {strengthLabel[strength]}
                      </div>
                    </div>
                  )}
                </div>
                <div className="auth-field">
                  <label className="auth-label">Confirmar Senha</label>
                  <input
                    className="auth-input" type="password" placeholder="••••••••"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>

                {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? 'Criando conta...' : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      Próximo <ArrowRight size={16} />
                    </span>
                  )}
                </button>
              </form>

              <div className="auth-divider">ou</div>

              <GoogleButton onClick={handleGoogle} disabled={loading} label="Cadastrar com Google" />

              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 18 }}>
                Já tem conta?{' '}
                <Link to="/login" className="auth-link">Fazer login</Link>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <p className="auth-subtitle">Configure sua primeira conta 🏦</p>

              <div className="auth-field">
                <label className="auth-label">Nome da conta</label>
                <input
                  className="auth-input" type="text" placeholder="Ex: Nubank, Bradesco..."
                  value={accountName} onChange={e => setAccountName(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Tipo</label>
                <select
                  className="auth-input"
                  value={accountType}
                  onChange={e => setAccountType(e.target.value as AccountType)}
                >
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Poupança</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="cash">Dinheiro em Espécie</option>
                  <option value="investment">Investimentos</option>
                </select>
              </div>
              <div className="auth-field">
                <label className="auth-label">Saldo inicial (R$)</label>
                <input
                  className="auth-input" type="number" step="0.01" placeholder="0,00"
                  value={accountBalance} onChange={e => setAccountBalance(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Cor</label>
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  {ACCOUNT_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAccountColor(c)}
                      style={{
                        width: 30, height: 30, borderRadius: '50%', background: c,
                        border: 'none', cursor: 'pointer',
                        outline: accountColor === c ? `3px solid ${c}` : '3px solid transparent',
                        outlineOffset: 3, transition: 'outline 0.15s ease',
                      }}
                    />
                  ))}
                </div>
              </div>

              {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}

              <button
                className="auth-btn-primary"
                onClick={() => finishOnboarding(true)}
                disabled={loading}
              >
                {loading ? 'Salvando...' : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Check size={16} /> Concluir
                  </span>
                )}
              </button>
              <button
                className="auth-btn-ghost"
                style={{ width: '100%', marginTop: 10, padding: '10px' }}
                onClick={() => finishOnboarding(false)}
                disabled={loading}
              >
                Pular por agora
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
