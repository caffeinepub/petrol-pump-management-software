import React, { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, TrendingUp, Fuel, CreditCard, Users } from 'lucide-react';
import RecordSaleModal from '@/components/sales/RecordSaleModal';

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

const paymentBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  Cash: 'secondary',
  UPI: 'default',
  Card: 'outline',
  Credit: 'outline',
};

export default function FuelSales() {
  const { fuelSales, fuelInventory } = useAppStore();

  const [search, setSearch] = useState('');
  const [fuelFilter, setFuelFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = fuelSales.filter((sale) => {
    const matchSearch =
      sale.id.toLowerCase().includes(search.toLowerCase()) ||
      (sale.customerName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      sale.staffName.toLowerCase().includes(search.toLowerCase());
    const matchFuel = fuelFilter === 'all' || sale.fuelType === fuelFilter;
    const matchPayment = paymentFilter === 'all' || sale.paymentMethod === paymentFilter;
    return matchSearch && matchFuel && matchPayment;
  });

  const totalRevenue = fuelSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalLitres = fuelSales.reduce((sum, s) => sum + s.quantity, 0);
  const uniqueCustomers = new Set(fuelSales.map((s) => s.customerName).filter(Boolean)).size;

  const fuelTypes = Array.from(new Set(fuelInventory.map((f) => f.fuelType)));

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Fuel Sales</h1>
          <p className="text-sm text-muted-foreground">Track and manage all fuel transactions</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="min-h-[44px] w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Record Sale
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card border rounded-lg p-4 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-lg font-bold text-foreground">{formatINR(totalRevenue)}</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Fuel className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Litres Sold</p>
            <p className="text-lg font-bold text-foreground">{totalLitres.toLocaleString('en-IN')} L</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-3 sm:col-span-2 lg:col-span-1">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Users className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Unique Customers</p>
            <p className="text-lg font-bold text-foreground">{uniqueCustomers}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, customer, staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 min-h-[44px]"
          />
        </div>
        <Select value={fuelFilter} onValueChange={setFuelFilter}>
          <SelectTrigger className="w-full sm:w-40 min-h-[44px]">
            <SelectValue placeholder="Fuel Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fuels</SelectItem>
            {fuelTypes.map((ft) => (
              <SelectItem key={ft} value={ft}>{ft}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-full sm:w-40 min-h-[44px]">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="Card">Card</SelectItem>
            <SelectItem value="Credit">Credit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Sale ID</TableHead>
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead className="whitespace-nowrap">Fuel Type</TableHead>
                <TableHead className="whitespace-nowrap">Qty (L)</TableHead>
                <TableHead className="whitespace-nowrap">Price/L</TableHead>
                <TableHead className="whitespace-nowrap">Total</TableHead>
                <TableHead className="whitespace-nowrap hidden sm:table-cell">Payment</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Pump</TableHead>
                <TableHead className="whitespace-nowrap hidden lg:table-cell">Staff</TableHead>
                <TableHead className="whitespace-nowrap hidden lg:table-cell">Customer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    No sales records found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono text-xs">{sale.id}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{sale.date}</TableCell>
                    <TableCell className="text-sm">{sale.fuelType}</TableCell>
                    <TableCell className="text-sm">{sale.quantity.toFixed(2)}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      ₹{sale.pricePerLiter.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm font-medium whitespace-nowrap">
                      {formatINR(sale.totalAmount)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={paymentBadgeVariant[sale.paymentMethod] ?? 'secondary'}>
                        {sale.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{sale.pumpNumber}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{sale.staffName}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {sale.customerName ?? '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <RecordSaleModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
