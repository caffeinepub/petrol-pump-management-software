import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  canAccessRoute,
  useCurrentUserRole,
} from "../../hooks/useCurrentUserRole";
import { useOwnerStore } from "../../store/ownerStore";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const currentRole = useCurrentUserRole();

  const ownerSetupDone = useOwnerStore((s) => s.ownerSetupDone);
  const activeUserId = useOwnerStore((s) => s.activeUserId);

  // Auth gate: redirect unauthenticated users
  useEffect(() => {
    if (!ownerSetupDone) {
      void navigate({ to: "/owner-setup" });
      return;
    }
    if (activeUserId === null) {
      void navigate({ to: "/login" });
      return;
    }
  }, [ownerSetupDone, activeUserId, navigate]);

  // Permission gate: redirect if the active user lacks access
  useEffect(() => {
    if (!ownerSetupDone || activeUserId === null) return;
    if (!canAccessRoute(currentRole, currentPath)) {
      toast.error("You don't have permission to access this page.");
      void navigate({ to: "/" });
    }
  }, [currentRole, currentPath, navigate, ownerSetupDone, activeUserId]);

  // Don't render layout content while redirecting
  if (!ownerSetupDone || activeUserId === null) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
