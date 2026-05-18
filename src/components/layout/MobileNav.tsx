import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Wallet, PieChart, Target } from 'lucide-react';

const mobileNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transações' },
  { to: '/accounts', icon: Wallet, label: 'Contas' },
  { to: '/budget', icon: PieChart, label: 'Orçamento' },
  { to: '/goals', icon: Target, label: 'Metas' },
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
