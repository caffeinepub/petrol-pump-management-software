import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import AppLayout from "./components/layout/AppLayout";
import Billing from "./pages/Billing";
import CustomerDetail from "./pages/CustomerDetail";
import Customers from "./pages/Customers";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import FuelSales from "./pages/FuelSales";
import Inventory from "./pages/Inventory";
import LoginPage from "./pages/LoginPage";
import Other from "./pages/Other";
import ProfileSetup from "./pages/ProfileSetup";
import Reports from "./pages/Reports";
import StaffManagement from "./pages/StaffManagement";
import Suppliers from "./pages/Suppliers";
import UserManagement from "./pages/UserManagement";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: AppLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const profileSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile-setup",
  component: ProfileSetup,
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: Dashboard,
});

const salesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/sales",
  component: FuelSales,
});

const inventoryRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/inventory",
  component: Inventory,
});

const staffRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/staff",
  component: StaffManagement,
});

const customersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/customers",
  component: Customers,
});

const customerDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/customers/$customerId",
  component: CustomerDetail,
});

const billingRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/billing",
  component: Billing,
});

const reportsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/reports",
  component: Reports,
});

const suppliersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/suppliers",
  component: Suppliers,
});

const expensesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/expenses",
  component: Expenses,
});

const otherRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/other",
  component: Other,
});

const userManagementRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/user-management",
  component: UserManagement,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  profileSetupRoute,
  layoutRoute.addChildren([
    dashboardRoute,
    salesRoute,
    inventoryRoute,
    staffRoute,
    customersRoute,
    customerDetailRoute,
    billingRoute,
    reportsRoute,
    suppliersRoute,
    expensesRoute,
    otherRoute,
    userManagementRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
