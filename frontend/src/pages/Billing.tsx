import React, { useState } from 'react';
import { useAppStore, Invoice } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import InvoiceDetailModal from '@/components/billing/InvoiceDetailModal';

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  Paid: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="h-3 w-3" /> },
  Unpaid: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="h-3 w-3" /> },
  Overdue: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <AlertCircle className="h-3 w-3" /> },
};

export default function Billing() {
  const { invoices, updateInvoiceStatus } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.totalAmount, 0);
  const unpaid = invoices.filter((i) => i.status === 'Unpaid').reduce((s, i) => s + i.totalAmount, 0);
  const overdue = invoices.filter((i) => i.status === 'Overdue').reduce((s, i) => s + i.totalAmount, 0);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground">Manage invoices and payments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card border rounded-lg p-4 flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-lg font-bold text-foreground">{formatINR(paid)}</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Unpaid</p>
            <p className="text-lg font-bold text-foreground">{formatINR(unpaid)}</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Overdue</p>
            <p className="text-lg font-bold text-foreground">{formatINR(overdue)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 min-h-[44px]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'Paid', 'Unpaid', 'Overdue'].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="min-h-[44px] capitalize"
            >
              {s === 'all' ? 'All' : s}
            </Button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Invoice #</TableHead>
                <TableHead className="whitespace-nowrap">Customer</TableHead>
                <TableHead className="whitespace-nowrap hidden sm:table-cell">Date</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Due Date</TableHead>
                <TableHead className="whitespace-nowrap">Amount</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((invoice) => {
                  const sc = statusConfig[invoice.status];
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-xs">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="text-sm">
                        <p>{invoice.customerName}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{invoice.date}</p>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{invoice.date}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{invoice.dueDate}</TableCell>
                      <TableCell className="text-sm font-medium">{formatINR(invoice.totalAmount)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc?.color ?? ''}`}>
                          {sc?.icon}
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {invoice.status === 'Unpaid' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-green-600 hover:text-green-700"
                              onClick={() => updateInvoiceStatus(invoice.id, 'Paid')}
                            >
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          open={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
