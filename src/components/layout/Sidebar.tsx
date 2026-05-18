import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Tag,
  Target,
  PieChart,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

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

      {/* Footer — sempre visível no rodapé, sem sobreposição */}
      <div style={{
        flexShrink: 0,
        margin: '8px 10px 12px',
        padding: '10px 12px',
        borderRadius: 10,
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.08))',
        border: '1px solid rgba(99,102,241,0.15)',
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 2 }}>
          💡 Dica do dia
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Registre suas despesas diariamente para um controle mais preciso.
        </div>
      </div>
    </aside>
  );
}
