import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/store/appStore";
import {
  AlertTriangle,
  DollarSign,
  Droplets,
  Flame,
  Fuel,
  Receipt,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import type React from "react";

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

// ── Fuel type visual config ────────────────────────────────────────────────────
const FUEL_COLORS: Record<
  string,
  { bar: string; badge: string; label: string; icon: React.ReactNode }
> = {
  Petrol: {
    bar: "bg-[oklch(0.72_0.2_55)]",
    badge:
      "bg-[oklch(0.72_0.2_55/0.15)] text-[oklch(0.82_0.18_55)] border border-[oklch(0.72_0.2_55/0.3)]",
    label: "Petrol",
    icon: <Flame className="h-3 w-3" />,
  },
  Diesel: {
    bar: "bg-[oklch(0.6_0.18_230)]",
    badge:
      "bg-[oklch(0.6_0.18_230/0.15)] text-[oklch(0.72_0.16_230)] border border-[oklch(0.6_0.18_230/0.3)]",
    label: "Diesel",
    icon: <Droplets className="h-3 w-3" />,
  },
  CNG: {
    bar: "bg-[oklch(0.65_0.18_145)]",
    badge:
      "bg-[oklch(0.65_0.18_145/0.15)] text-[oklch(0.75_0.16_145)] border border-[oklch(0.65_0.18_145/0.3)]",
    label: "CNG",
    icon: <Zap className="h-3 w-3" />,
  },
  LPG: {
    bar: "bg-[oklch(0.78_0.16_80)]",
    badge:
      "bg-[oklch(0.78_0.16_80/0.15)] text-[oklch(0.82_0.14_80)] border border-[oklch(0.78_0.16_80/0.3)]",
    label: "LPG",
    icon: <Fuel className="h-3 w-3" />,
  },
  EV: {
    bar: "bg-[oklch(0.6_0.18_185)]",
    badge:
      "bg-[oklch(0.6_0.18_185/0.15)] text-[oklch(0.72_0.16_185)] border border-[oklch(0.6_0.18_185/0.3)]",
    label: "EV",
    icon: <Zap className="h-3 w-3" />,
  },
};

function getFuelConfig(fuelType: string) {
  return (
    FUEL_COLORS[fuelType] ?? {
      bar: "bg-muted-foreground",
      badge: "bg-muted text-muted-foreground border border-border",
      label: fuelType,
      icon: <Fuel className="h-3 w-3" />,
    }
  );
}

// ── Metric Card Component ──────────────────────────────────────────────────────
interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
  trend?: "up" | "down" | "neutral";
  "data-ocid"?: string;
  index: number;
}

function MetricCard({
  title,
  value,
  subtext,
  icon,
  gradientFrom,
  gradientTo,
  borderColor,
  glowColor,
  textColor,
  trend,
  "data-ocid": dataOcid,
  index,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
      data-ocid={dataOcid}
      className="relative rounded-xl overflow-hidden group cursor-default"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        boxShadow: `0 4px 24px ${glowColor}, 0 1px 3px rgba(0,0,0,0.4)`,
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${borderColor}15 0%, transparent 70%)`,
        }}
      />

      <div className="relative p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs sm:text-sm font-medium text-white/60 uppercase tracking-widest">
            {title}
          </p>
          <div
            className="p-2 rounded-lg"
            style={{ background: `${borderColor}20`, color: textColor }}
          >
            {icon}
          </div>
        </div>

        <p
          className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight"
          style={{
            color: textColor,
            fontFamily: "'Bricolage Grotesque', sans-serif",
          }}
        >
          {value}
        </p>

        <div className="flex items-center gap-1 mt-2">
          {trend === "up" && <TrendingUp className="h-3 w-3 text-white/50" />}
          {trend === "down" && (
            <TrendingDown className="h-3 w-3 text-white/50" />
          )}
          <p className="text-xs text-white/45">{subtext}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { fuelSales, expenses, customers, fuelInventory } = useAppStore();

  const totalRevenue = fuelSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const lowStockItems = fuelInventory.filter(
    (f) => f.currentStock <= f.reorderLevel,
  );

  const recentSales = fuelSales.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden h-36 sm:h-44"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.05 250) 0%, oklch(0.15 0.03 260) 40%, oklch(0.12 0.02 270) 100%)",
          boxShadow: "0 8px 32px oklch(0.1 0.02 250 / 0.6)",
        }}
      >
        {/* Banner image */}
        <img
          src="/assets/generated/dashboard-banner.dim_1200x300.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />

        {/* Gradient mesh overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.06 250 / 0.85) 0%, oklch(0.15 0.04 260 / 0.7) 50%, transparent 100%)",
          }}
        />

        {/* Accent glow orbs */}
        <div
          className="absolute -top-8 -left-8 w-40 h-40 rounded-full blur-3xl opacity-30"
          style={{ background: "oklch(0.75 0.18 65)" }}
        />
        <div
          className="absolute -bottom-10 right-10 w-52 h-52 rounded-full blur-3xl opacity-20"
          style={{ background: "oklch(0.65 0.2 200)" }}
        />

        {/* Content */}
        <div className="relative h-full flex items-center px-5 sm:px-8 gap-4">
          <div
            className="hidden sm:flex shrink-0 items-center justify-center w-12 h-12 rounded-xl"
            style={{
              background: "oklch(0.75 0.18 65 / 0.2)",
              border: "1px solid oklch(0.75 0.18 65 / 0.4)",
            }}
          >
            <Fuel className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1
              className="text-white text-xl sm:text-2xl lg:text-3xl font-bold leading-tight"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Station Dashboard
            </h1>
            <p className="text-white/55 text-xs sm:text-sm mt-0.5">
              Live overview · Fuel sales, stock & finances
            </p>
          </div>

          {/* Live indicator */}
          <div className="ml-auto flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/60 font-medium hidden sm:block">
              Live
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Metric Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          data-ocid="dashboard.revenue_card"
          index={0}
          title="Total Revenue"
          value={formatINR(totalRevenue)}
          subtext="All time earnings"
          icon={<TrendingUp className="h-4 w-4" />}
          gradientFrom="oklch(0.3 0.09 145)"
          gradientTo="oklch(0.2 0.04 145)"
          borderColor="oklch(0.62 0.2 145)"
          glowColor="oklch(0.62 0.2 145 / 0.2)"
          textColor="oklch(0.82 0.18 145)"
          trend="up"
        />
        <MetricCard
          data-ocid="dashboard.expenses_card"
          index={1}
          title="Total Expenses"
          value={formatINR(totalExpenses)}
          subtext="All time outgoing"
          icon={<TrendingDown className="h-4 w-4" />}
          gradientFrom="oklch(0.3 0.09 25)"
          gradientTo="oklch(0.2 0.04 25)"
          borderColor="oklch(0.65 0.22 25)"
          glowColor="oklch(0.65 0.22 25 / 0.2)"
          textColor="oklch(0.82 0.2 25)"
          trend="down"
        />
        <MetricCard
          data-ocid="dashboard.profit_card"
          index={2}
          title="Net Profit"
          value={formatINR(netProfit)}
          subtext="Revenue minus expenses"
          icon={<DollarSign className="h-4 w-4" />}
          gradientFrom={
            netProfit >= 0 ? "oklch(0.28 0.07 200)" : "oklch(0.28 0.07 25)"
          }
          gradientTo={
            netProfit >= 0 ? "oklch(0.2 0.04 200)" : "oklch(0.2 0.04 25)"
          }
          borderColor={
            netProfit >= 0 ? "oklch(0.65 0.18 200)" : "oklch(0.65 0.22 25)"
          }
          glowColor={
            netProfit >= 0
              ? "oklch(0.65 0.18 200 / 0.2)"
              : "oklch(0.65 0.22 25 / 0.2)"
          }
          textColor={
            netProfit >= 0 ? "oklch(0.78 0.16 200)" : "oklch(0.82 0.2 25)"
          }
          trend={netProfit >= 0 ? "up" : "down"}
        />
        <MetricCard
          data-ocid="dashboard.customers_card"
          index={3}
          title="Customers"
          value={customers.length.toString()}
          subtext="Registered members"
          icon={<Users className="h-4 w-4" />}
          gradientFrom="oklch(0.28 0.07 280)"
          gradientTo="oklch(0.2 0.04 280)"
          borderColor="oklch(0.6 0.2 280)"
          glowColor="oklch(0.6 0.2 280 / 0.2)"
          textColor="oklch(0.75 0.18 280)"
          trend="up"
        />
      </div>

      {/* ── Low Stock Alert ─────────────────────────────────────────────── */}
      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          data-ocid="dashboard.low_stock_alert"
          className="rounded-xl p-4 sm:p-5"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.28 0.1 65 / 0.15), oklch(0.22 0.06 60 / 0.08))",
            border: "1px solid oklch(0.75 0.18 65 / 0.35)",
            boxShadow: "0 4px 20px oklch(0.75 0.18 65 / 0.12)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ background: "oklch(0.75 0.18 65 / 0.2)" }}
            >
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <h3
              className="text-sm font-semibold text-amber-300"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Low Stock Alert — Action Required
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map((item) => (
              <span
                key={item.fuelType}
                className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{
                  background: "oklch(0.75 0.18 65 / 0.12)",
                  border: "1px solid oklch(0.75 0.18 65 / 0.4)",
                  color: "oklch(0.85 0.16 68)",
                }}
              >
                ⚠ {item.fuelType}: {item.currentStock.toLocaleString("en-IN")}L
                remaining
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Inventory & Sales Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Fuel Inventory */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          data-ocid="dashboard.inventory_section"
          className="rounded-xl p-5"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.22 0.03 250) 0%, oklch(0.19 0.025 252) 100%)",
            border: "1px solid oklch(0.3 0.04 250)",
            boxShadow: "0 4px 24px oklch(0.1 0.02 250 / 0.5)",
          }}
        >
          {/* Section header */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{
                background: "oklch(0.72 0.2 55 / 0.15)",
                border: "1px solid oklch(0.72 0.2 55 / 0.3)",
              }}
            >
              <Fuel className="h-4 w-4 text-amber-400" />
            </div>
            <h2
              className="text-sm sm:text-base font-semibold text-white"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Fuel Inventory
            </h2>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: "oklch(0.3 0.04 250)",
                color: "oklch(0.65 0.05 250)",
              }}
            >
              {fuelInventory.length} tanks
            </span>
          </div>

          <div className="space-y-5">
            {fuelInventory.map((item, idx) => {
              const pct = Math.round((item.currentStock / item.capacity) * 100);
              const isLow = item.currentStock <= item.reorderLevel;
              const fuelCfg = getFuelConfig(item.fuelType);

              return (
                <motion.div
                  key={item.fuelType}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.07, duration: 0.35 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${fuelCfg.badge}`}
                      >
                        {fuelCfg.icon}
                        {item.fuelType}
                      </span>
                      {isLow && (
                        <span
                          className="text-xs font-medium px-1.5 py-0.5 rounded"
                          style={{
                            background: "oklch(0.6 0.22 25 / 0.2)",
                            color: "oklch(0.8 0.2 25)",
                            border: "1px solid oklch(0.6 0.22 25 / 0.4)",
                          }}
                        >
                          Low
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isLow ? "text-[oklch(0.8_0.2_25)]" : "text-white/50"
                      }`}
                    >
                      {item.currentStock.toLocaleString("en-IN")}L /{" "}
                      {item.capacity.toLocaleString("en-IN")}L
                    </span>
                  </div>

                  {/* Colored progress bar */}
                  <div
                    className="w-full h-2.5 rounded-full overflow-hidden"
                    style={{ background: "oklch(0.15 0.02 250)" }}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${fuelCfg.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-white/35">{pct}% full</span>
                    <span className="text-xs text-white/35">
                      ₹{item.pricePerLitre.toFixed(2)}/L
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Sales */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.45 }}
          data-ocid="dashboard.sales_section"
          className="rounded-xl p-5"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.22 0.03 250) 0%, oklch(0.19 0.025 252) 100%)",
            border: "1px solid oklch(0.3 0.04 250)",
            boxShadow: "0 4px 24px oklch(0.1 0.02 250 / 0.5)",
          }}
        >
          {/* Section header */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{
                background: "oklch(0.65 0.18 200 / 0.15)",
                border: "1px solid oklch(0.65 0.18 200 / 0.3)",
              }}
            >
              <Receipt className="h-4 w-4 text-[oklch(0.72_0.16_200)]" />
            </div>
            <h2
              className="text-sm sm:text-base font-semibold text-white"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Recent Sales
            </h2>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: "oklch(0.3 0.04 250)",
                color: "oklch(0.65 0.05 250)",
              }}
            >
              Last {recentSales.length}
            </span>
          </div>

          {recentSales.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-10 text-center"
              data-ocid="dashboard.sales_section.empty_state"
            >
              <Receipt className="h-8 w-8 mb-3 text-white/20" />
              <p className="text-sm text-white/30">No sales recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid oklch(0.3 0.04 250)",
                    }}
                  >
                    <th className="text-left pb-3 text-white/35 font-medium text-xs uppercase tracking-widest">
                      Fuel Type
                    </th>
                    <th className="text-left pb-3 text-white/35 font-medium text-xs uppercase tracking-widest hidden sm:table-cell">
                      Qty
                    </th>
                    <th className="text-right pb-3 text-white/35 font-medium text-xs uppercase tracking-widest">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale, idx) => {
                    const fuelCfg = getFuelConfig(sale.fuelType);
                    return (
                      <motion.tr
                        key={sale.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.5 + idx * 0.06,
                          duration: 0.3,
                        }}
                        className="group"
                        style={{
                          borderBottom: "1px solid oklch(0.27 0.03 250)",
                        }}
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${fuelCfg.badge}`}
                            >
                              {fuelCfg.icon}
                              {sale.fuelType}
                            </span>
                          </div>
                          <p className="text-xs text-white/35 mt-0.5">
                            {sale.customerName ?? "Walk-in"}
                          </p>
                        </td>
                        <td className="py-3 hidden sm:table-cell text-white/45 text-sm">
                          {sale.litres}L
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className="font-semibold text-sm"
                            style={{ color: "oklch(0.88 0.08 145)" }}
                          >
                            {formatINR(sale.total)}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
