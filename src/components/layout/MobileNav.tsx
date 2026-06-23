import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Wallet, TrendingUp, FileText } from 'lucide-react';

const mobileNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transações' },
  { to: '/accounts', icon: Wallet, label: 'Contas' },
  { to: '/investimentos', icon: TrendingUp, label: 'Invest.' },
  { to: '/contracheque', icon: FileText, label: 'Holerite' },
];

export default function MobileNav() {
  return (
    <nav className="mobile-nav safe-area-bottom">
      {mobileNavItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `mobile-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
