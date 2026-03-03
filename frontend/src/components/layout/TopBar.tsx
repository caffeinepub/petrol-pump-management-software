import React from 'react';
import { Bell, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { fuelInventory } = useAppStore();

  const lowStockCount = fuelInventory.filter(
    (f) => f.currentStock <= f.reorderLevel
  ).length;

  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-4 shrink-0">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-foreground text-sm sm:text-base hidden sm:block">
          Fuel Station Manager
        </span>
      </div>

      {/* Right: alerts + user */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" className="relative h-10 w-10" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {lowStockCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {lowStockCount}
            </span>
          )}
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="User profile">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
