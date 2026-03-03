import { useState, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, TrendingUp, PieChart as PieIcon } from 'lucide-react';

const FUEL_COLORS: Record<string, string> = {
  Petrol: '#4db8a0',
  Diesel: '#4da8d4',
  Premium: '#d4a84d',
  CNG: '#a84dd4',
};

const PIE_COLORS = ['#4db8a0', '#4da8d4', '#d4a84d', '#a84dd4'];

const formatINR = (v: number) =>
  '\u20B9' + v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function Reports() {
  const fuelSales = useAppStore(s => s.fuelSales);
  const expenses = useAppStore(s => s.expenses);
  const fuelInventory = useAppStore(s => s.fuelInventory);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseStartDate, setExpenseStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [expenseEndDate, setExpenseEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fuelTypes = Array.from(new Set(fuelInventory.map(f => f.fuelType)));

  // Daily Summary
  const dailySummary = useMemo(() => {
    const daySales = fuelSales.filter(s => s.date.startsWith(selectedDate));
    return fuelTypes.map(ft => {
      const ftSales = daySales.filter(s => s.fuelType === ft);
      const volume = ftSales.reduce((sum, s) => sum + s.quantity, 0);
      const revenue = ftSales.reduce((sum, s) => sum + s.totalAmount, 0);
      return { fuelType: ft, volume, revenue, avgPrice: volume > 0 ? revenue / volume : 0 };
    });
  }, [fuelSales, selectedDate, fuelTypes]);

  // Monthly Trend (last 30 days)
  const monthlyTrend = useMemo(() => {
    const days: { day: string; revenue: number; volume: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      const daySales = fuelSales.filter(s => s.date.startsWith(d));
      days.push({
        day: new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenue: daySales.reduce((sum, s) => sum + s.totalAmount, 0),
        volume: daySales.reduce((sum, s) => sum + s.quantity, 0),
      });
    }
    return days;
  }, [fuelSales]);

  // Fuel Type Breakdown
  const fuelBreakdown = useMemo(() => {
    return fuelTypes.map(ft => ({
      name: ft,
      value: fuelSales.filter(s => s.fuelType === ft).reduce((sum, s) => sum + s.quantity, 0),
    })).filter(d => d.value > 0);
  }, [fuelSales, fuelTypes]);

  // Expense vs Revenue
  const expenseVsRevenue = useMemo(() => {
    const filteredSales = fuelSales.filter(s => s.date >= expenseStartDate && s.date <= expenseEndDate);
    const filteredExpenses = expenses.filter(e => e.date >= expenseStartDate && e.date <= expenseEndDate);
    const revenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const expense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    return [
      { name: 'Revenue', value: revenue },
      { name: 'Expenses', value: expense },
      { name: 'Net Profit', value: Math.max(0, revenue - expense) },
    ];
  }, [fuelSales, expenses, expenseStartDate, expenseEndDate]);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--foreground))',
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Daily Summary */}
      <section className="bg-card rounded-2xl border border-border p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Daily Sales Summary
          </h3>
          <div className="flex items-center gap-2">
            <Label className="text-muted-foreground text-xs">Date:</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-40 min-h-[44px]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted-foreground py-2 pr-4 whitespace-nowrap">Fuel Type</th>
                <th className="text-right text-muted-foreground py-2 px-4 whitespace-nowrap">Volume (L)</th>
                <th className="text-right text-muted-foreground py-2 px-4 whitespace-nowrap">Revenue (&#8377;)</th>
                <th className="text-right text-muted-foreground py-2 px-4 whitespace-nowrap">Avg Price (&#8377;/L)</th>
              </tr>
            </thead>
            <tbody>
              {dailySummary.map(row => (
                <tr key={row.fuelType} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-medium" style={{ color: FUEL_COLORS[row.fuelType] ?? '#888' }}>{row.fuelType}</td>
                  <td className="py-3 px-4 text-right text-foreground">{row.volume.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-primary font-semibold">
                    &#8377;{row.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">
                    &#8377;{row.avgPrice.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="bg-muted">
                <td className="py-3 pr-4 font-bold text-foreground">Total</td>
                <td className="py-3 px-4 text-right font-bold text-foreground">
                  {dailySummary.reduce((s, r) => s + r.volume, 0).toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right font-bold text-primary">
                  &#8377;{dailySummary.reduce((s, r) => s + r.revenue, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Monthly Trend */}
      <section className="bg-card rounded-2xl border border-border p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          30-Day Sales Trend
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickLine={false} interval={4} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickLine={false} axisLine={false}
              tickFormatter={v => '\u20B9' + (v / 1000).toFixed(0) + 'k'} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatINR(v), 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2}
              dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Fuel Breakdown + Expense vs Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Fuel Breakdown Pie */}
        <section className="bg-card rounded-2xl border border-border p-4 sm:p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-primary" />
            Fuel Volume Breakdown
          </h3>
          {fuelBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={fuelBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {fuelBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocaleString('en-IN')}L`, 'Volume']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">No sales data available</p>
          )}
        </section>

        {/* Expense vs Revenue Bar */}
        <section className="bg-card rounded-2xl border border-border p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h3 className="text-lg font-semibold text-foreground">Revenue vs Expenses</h3>
            <div className="flex gap-2 flex-wrap">
              <Input type="date" value={expenseStartDate} onChange={e => setExpenseStartDate(e.target.value)} className="w-36 text-xs min-h-[44px]" />
              <Input type="date" value={expenseEndDate} onChange={e => setExpenseEndDate(e.target.value)} className="w-36 text-xs min-h-[44px]" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={expenseVsRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={v => '\u20B9' + (v / 1000).toFixed(0) + 'k'} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatINR(v)]} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
