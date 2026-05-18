import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Tag,
  Target,
  PieChart,
  BarChart3,
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

export default function Sidebar() {
  const { sidebarOpen } = useAppStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
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
      {/* Nav items — scrollable, takes all available space */}
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

      {/* Usuário logado */}
      <div style={{
        flexShrink: 0,
        margin: '8px 10px 12px',
        padding: '10px 12px',
        borderRadius: 10,
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Avatar com iniciais */}
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: 'white', letterSpacing: '0.02em',
          }}>
            {initials}
          </div>

          {/* Nome e e-mail */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {user?.name}
            </div>
            <div style={{
              fontSize: '0.68rem', color: 'var(--text-muted)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {user?.email}
            </div>
          </div>

          {/* Botão sair */}
          <button
            onClick={handleLogout}
            title="Sair"
            style={{
              flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center', transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-red)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
