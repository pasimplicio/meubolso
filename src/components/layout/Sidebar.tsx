import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Tag,
  Target,
  PieChart,
  BarChart3,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';

const sections = [
  {
    label: 'Principal',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', color: '#3b82f6' },
    ],
  },
  {
    label: 'Finanças',
    items: [
      { to: '/transactions', icon: ArrowLeftRight, label: 'Transações',  color: '#8b5cf6' },
      { to: '/accounts',     icon: CreditCard,     label: 'Contas',       color: '#10b981' },
      { to: '/categories',   icon: Tag,            label: 'Categorias',   color: '#f59e0b' },
      { to: '/contracheque', icon: FileText,       label: 'Contracheque', color: '#0ea5e9' },
      { to: '/investimentos', icon: TrendingUp,    label: 'Investimentos', color: '#22c55e' },
    ],
  },
  {
    label: 'Planejamento',
    items: [
      { to: '/budget', icon: PieChart, label: 'Orçamento', color: '#f43f5e' },
      { to: '/goals',  icon: Target,   label: 'Metas',     color: '#14b8a6' },
    ],
  },
  {
    label: 'Análise',
    items: [
      { to: '/reports', icon: BarChart3, label: 'Relatórios', color: '#6366f1' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/settings', icon: Settings, label: 'Configurações', color: '#64748b' },
    ],
  },
];

const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 768;

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // No celular, a sidebar começa recolhida.
  useEffect(() => {
    if (isMobile()) setSidebarOpen(false);
  }, []);

  // Fecha a sidebar ao navegar no celular (clicar em qualquer item).
  const closeOnMobile = () => { if (isMobile()) setSidebarOpen(false); };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <aside
      className={`sidebar ${!sidebarOpen ? 'sidebar-hidden' : ''}`}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      {/* Marca */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 6px 14px' }}>
        <img src="/logo.png" alt="MeuBolso" style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
        <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em' }} className="gradient-text">
          MeuBolso
        </span>
      </div>

      {/* Perfil do usuário (topo) */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 7,
        padding: '14px 13px', marginBottom: 12, borderRadius: 14,
        background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
          background: 'var(--accent-primary-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '0.02em',
        }}>
          {initials}
        </div>
        <div style={{ width: '100%', minWidth: 0 }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
            {user?.email}
          </div>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 10px', borderRadius: 999,
          fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em',
          color: 'white', background: 'linear-gradient(135deg, #f59e0b, #f97316)',
        }}>
          ⚡ PRO
        </span>
      </div>

      {/* Navegação — rolável, ocupa o espaço restante */}
      <nav style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sections.map((section) => (
          <div key={section.label} style={{ marginBottom: 4 }}>
            <div style={{
              fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
              padding: '10px 12px 4px',
            }}>
              {section.label}
            </div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={closeOnMobile}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                style={({ isActive }) => isActive ? { color: item.color } : {}}
              >
                {({ isActive }) => (
                  <>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isActive ? `${item.color}18` : `${item.color}0d`,
                      transition: 'background 0.2s',
                    }}>
                      <item.icon
                        size={16}
                        style={{ color: isActive ? item.color : `${item.color}cc` }}
                      />
                    </div>
                    <span style={{
                      fontSize: '0.845rem',
                      color: isActive ? item.color : 'var(--text-secondary)',
                      fontWeight: isActive ? 600 : 500,
                    }}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Sair (rodapé) */}
      <button
        onClick={handleLogout}
        className="sidebar-nav-item"
        style={{
          flexShrink: 0, marginTop: 8, width: '100%', border: 'none',
          background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-red-soft)'; e.currentTarget.style.color = 'var(--accent-red)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-red-soft)' }}>
          <LogOut size={15} style={{ color: 'var(--accent-red)' }} />
        </div>
        <span style={{ fontSize: '0.845rem', fontWeight: 600 }}>Sair</span>
      </button>
    </aside>
  );
}
