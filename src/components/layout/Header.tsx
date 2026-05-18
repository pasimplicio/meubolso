import { Menu, Moon, Sun, ChevronLeft, ChevronRight, Wallet } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { getMonthName } from '../../lib/utils';

export default function Header() {
  const { theme, toggleTheme, toggleSidebar, currentMonth, currentYear, nextMonth, prevMonth } =
    useAppStore();

  return (
    <header className="header safe-area-top" style={{ gap: 0 }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        <button className="btn-icon" onClick={toggleSidebar} aria-label="Menu">
          <Menu size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Wallet size={15} color="white" />
          </div>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em' }} className="gradient-text">
            MeuBolso
          </span>
        </div>
      </div>

      {/* Month Selector — pill estilo fintech */}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
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
