import { Menu, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { getMonthName } from '../../lib/utils';

export default function Header() {
  const { theme, toggleTheme, toggleSidebar, sidebarOpen, currentMonth, currentYear, nextMonth, prevMonth } =
    useAppStore();
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] ?? 'Usuário';

  return (
    <header className={`header safe-area-top ${!sidebarOpen ? 'header-full' : ''}`} style={{ gap: 0 }}>
      {/* Saudação */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <button className="btn-icon" onClick={toggleSidebar} aria-label="Menu">
          <Menu size={18} />
        </button>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Bem-vindo, <span className="gradient-text">{firstName}</span> 👋
        </span>
      </div>

      {/* Seletor de mês — pill estilo fintech */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2,
        background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
        borderRadius: 10, padding: '3px 4px',
      }}>
        <button
          onClick={prevMonth}
          aria-label="Mês anterior"
          style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '5px 8px', borderRadius: 7,
            color: 'var(--text-secondary)', transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <ChevronLeft size={14} />
        </button>

        <span style={{
          fontSize: '0.83rem', fontWeight: 700, minWidth: 116,
          textAlign: 'center', textTransform: 'capitalize', color: 'var(--text-primary)',
        }}>
          {getMonthName(currentMonth)} {currentYear}
        </span>

        <button
          onClick={nextMonth}
          aria-label="Próximo mês"
          style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '5px 8px', borderRadius: 7,
            color: 'var(--text-secondary)', transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 10 }}>
        <button
          className="btn-icon"
          onClick={toggleTheme}
          aria-label="Alternar tema"
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}
