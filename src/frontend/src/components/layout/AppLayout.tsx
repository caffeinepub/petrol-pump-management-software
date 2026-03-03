import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  canAccessRoute,
  useCurrentUserRole,
} from "../../hooks/useCurrentUserRole";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const currentRole = useCurrentUserRole();

  useEffect(() => {
    if (!canAccessRoute(currentRole, currentPath)) {
      toast.error("You don't have permission to access this page.");
      void navigate({ to: "/" });
    }
  }, [currentRole, currentPath, navigate]);

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
