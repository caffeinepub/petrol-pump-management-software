import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  DollarSign,
  FileText,
  Fuel,
  LayoutDashboard,
  MoreHorizontal,
  Package,
  Shield,
  Truck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useCurrentUserRole } from "../../hooks/useCurrentUserRole";
import { type PermissionLevel, canAccess } from "../../store/ownerStore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  requiredLevel: PermissionLevel;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
    requiredLevel: "Viewer",
  },
  { label: "Fuel Sales", icon: Fuel, path: "/sales", requiredLevel: "Staff" },
  {
    label: "Inventory",
    icon: Package,
    path: "/inventory",
    requiredLevel: "Staff",
  },
  {
    label: "Customers",
    icon: Users,
    path: "/customers",
    requiredLevel: "Staff",
  },
  {
    label: "Suppliers",
    icon: Truck,
    path: "/suppliers",
    requiredLevel: "Manager",
  },
  { label: "Staff", icon: UserCog, path: "/staff", requiredLevel: "Manager" },
  {
    label: "Billing",
    icon: FileText,
    path: "/billing",
    requiredLevel: "Manager",
  },
  {
    label: "Reports",
    icon: BarChart3,
    path: "/reports",
    requiredLevel: "Staff",
  },
  {
    label: "Expenses",
    icon: DollarSign,
    path: "/expenses",
    requiredLevel: "Manager",
  },
  {
    label: "Other",
    icon: MoreHorizontal,
    path: "/other",
    requiredLevel: "Manager",
  },
  {
    label: "User Management",
    icon: Shield,
    path: "/user-management",
    requiredLevel: "Owner",
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const currentRole = useCurrentUserRole();

  // Filter nav items based on the current user's role
  const visibleNavItems = navItems.filter((item) =>
    canAccess(currentRole, item.requiredLevel),
  );

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
          onKeyUp={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:z-auto md:flex md:shrink-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/pump-logo.dim_128x128.png"
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">
                FuelStation
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                Manager Pro
              </p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            type="button"
            className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role indicator */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
            <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground">Role:</span>
            <span className="text-xs font-semibold text-primary">
              {currentRole}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          <ul className="space-y-0.5">
            {visibleNavItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? currentPath === "/"
                  : currentPath === item.path ||
                    currentPath.startsWith(`${item.path}/`);
              const isUserMgmt = item.path === "/user-management";
              return (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => handleNav(item.path)}
                    data-ocid={`nav.${item.label.toLowerCase().replace(/\s+/g, "-")}.link`}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-colors min-h-[44px]
                      ${
                        isActive
                          ? isUserMgmt
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-primary text-primary-foreground"
                          : isUserMgmt
                            ? "text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
