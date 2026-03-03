import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/store/appStore";
import { useNavigate } from "@tanstack/react-router";
import { Bell, ChevronDown, LogOut, Menu, Shield, User } from "lucide-react";
import React from "react";
import { useOwnerStore } from "../../store/ownerStore";

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const inventory = useAppStore((s) => s.inventory);
  const navigate = useNavigate();
  const { logout, users, activeUserId } = useOwnerStore();

  const activeUser = users.find((u) => u.id === activeUserId);

  const lowStockCount = inventory.filter(
    (f) => f.currentStock <= f.reorderLevel,
  ).length;

  const handleLogout = () => {
    logout();
    void navigate({ to: "/login" });
  };

  return (
    <header className="h-14 bg-card border-b flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <span className="font-semibold text-foreground text-sm sm:text-base hidden sm:block">
          Fuel Station Manager
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {lowStockCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {lowStockCount}
            </span>
          )}
        </Button>

        {/* User menu */}
        {activeUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-10 px-2 sm:px-3 rounded-lg hover:bg-muted"
                data-ocid="topbar.dropdown_menu"
              >
                <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-bold">
                    {activeUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-foreground text-xs font-semibold truncate max-w-[100px]">
                    {activeUser.name}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    {activeUser.permissionLevel}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 bg-card border-border"
              data-ocid="topbar.dropdown_menu"
            >
              {/* User info */}
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <span className="text-primary text-xs font-bold">
                      {activeUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground text-sm font-semibold truncate">
                      {activeUser.name}
                    </p>
                    <p className="text-muted-foreground text-xs truncate font-mono">
                      @{activeUser.username}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 px-1">
                  <Shield className="h-3 w-3 text-primary" />
                  <span className="text-xs text-primary font-semibold">
                    {activeUser.permissionLevel}
                  </span>
                </div>
              </div>

              <DropdownMenuSeparator className="bg-border" />

              <DropdownMenuItem
                className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
                onSelect={() => void navigate({ to: "/user-management" })}
                data-ocid="topbar.link"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                User Management
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border" />

              <DropdownMenuItem
                className="flex items-center gap-2 text-sm text-destructive cursor-pointer hover:text-destructive focus:text-destructive"
                onSelect={handleLogout}
                data-ocid="topbar.button"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
