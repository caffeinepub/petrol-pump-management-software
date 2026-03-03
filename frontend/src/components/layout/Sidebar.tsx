import React from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Fuel,
  Package,
  Users,
  Truck,
  UserCog,
  FileText,
  BarChart3,
  DollarSign,
  MoreHorizontal,
  ClipboardList,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Fuel Sales Log', icon: ClipboardList, path: '/fuel-sales-log' },
  { label: 'Fuel Sales', icon: Fuel, path: '/sales' },
  { label: 'Inventory', icon: Package, path: '/inventory' },
  { label: 'Customers', icon: Users, path: '/customers' },
  { label: 'Suppliers', icon: Truck, path: '/suppliers' },
  { label: 'Staff', icon: UserCog, path: '/staff' },
  { label: 'Billing', icon: FileText, path: '/billing' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'Expenses', icon: DollarSign, path: '/expenses' },
  { label: 'Other', icon: MoreHorizontal, path: '/other' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleNav = (path: string) => {
    navigate({ to: path });
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:z-auto md:flex md:shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <img src="/assets/generated/pump-logo.dim_128x128.png" alt="Logo" className="h-8 w-8 object-contain" />
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">FuelStation</p>
              <p className="text-xs text-muted-foreground leading-tight">Manager Pro</p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? currentPath === '/'
                  : currentPath === item.path || currentPath.startsWith(item.path + '/');
              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleNav(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-colors min-h-[44px]
                      ${isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} FuelStation Manager
          </p>
        </div>
      </aside>
    </>
  );
}
