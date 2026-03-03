import React from 'react';
import { useAppStore } from '@/store/appStore';
import { TrendingUp, TrendingDown, Users, AlertTriangle, Fuel } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function Dashboard() {
  const { fuelSales, expenses, customers, fuelInventory } = useAppStore();

  const totalRevenue = fuelSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const lowStockItems = fuelInventory.filter((f) => f.currentStock <= f.reorderLevel);

  const recentSales = fuelSales.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Banner */}
      <div className="relative rounded-xl overflow-hidden h-32 sm:h-40">
        <img
          src="/assets/generated/dashboard-banner.dim_1200x300.png"
          alt="Dashboard Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-4 sm:px-6">
          <div>
            <h1 className="text-white text-lg sm:text-2xl font-bold">Welcome Back!</h1>
            <p className="text-white/80 text-xs sm:text-sm">Here's your station overview</p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Revenue</p>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{formatINR(totalRevenue)}</p>
          <p className="text-xs text-green-600 mt-1">All time</p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Expenses</p>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{formatINR(totalExpenses)}</p>
          <p className="text-xs text-red-600 mt-1">All time</p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm text-muted-foreground">Net Profit</p>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className={`text-xl sm:text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
            {formatINR(netProfit)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Revenue - Expenses</p>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm text-muted-foreground">Customers</p>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{customers.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Registered</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">Low Stock Alert</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map((item) => (
              <span key={item.fuelType} className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full">
                {item.fuelType}: {item.currentStock.toLocaleString('en-IN')}L remaining
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inventory & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Fuel Inventory */}
        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-sm sm:text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Fuel className="h-4 w-4" />
            Fuel Inventory
          </h2>
          <div className="space-y-4">
            {fuelInventory.map((item) => {
              const pct = Math.round((item.currentStock / item.capacity) * 100);
              const isLow = item.currentStock <= item.reorderLevel;
              return (
                <div key={item.fuelType}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm font-medium text-foreground">{item.fuelType}</span>
                    <span className={`text-xs font-medium ${isLow ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {item.currentStock.toLocaleString('en-IN')}L / {item.capacity.toLocaleString('en-IN')}L
                    </span>
                  </div>
                  <Progress value={pct} className={`h-2 ${isLow ? '[&>div]:bg-destructive' : ''}`} />
                  <div className="flex justify-between mt-0.5">
                    <span className="text-xs text-muted-foreground">{pct}% full</span>
                    <span className="text-xs text-muted-foreground">₹{item.pricePerLiter.toFixed(2)}/L</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-sm sm:text-base font-semibold text-foreground mb-4">Recent Sales</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2 text-muted-foreground font-medium">Fuel</th>
                  <th className="text-left pb-2 text-muted-foreground font-medium hidden sm:table-cell">Qty</th>
                  <th className="text-right pb-2 text-muted-foreground font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="border-b last:border-0">
                    <td className="py-2">
                      <p className="font-medium text-foreground">{sale.fuelType}</p>
                      <p className="text-xs text-muted-foreground">{sale.customerName ?? 'Walk-in'}</p>
                    </td>
                    <td className="py-2 hidden sm:table-cell text-muted-foreground">{sale.quantity}L</td>
                    <td className="py-2 text-right font-medium text-foreground">{formatINR(sale.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
