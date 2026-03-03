import React, { useState } from 'react';
import { useAppStore, Invoice, InvoiceStatus } from '../store/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import InvoiceDetailModal from '../components/billing/InvoiceDetailModal';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

const statusVariant: Record<InvoiceStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Paid: 'default',
  Pending: 'secondary',
  Overdue: 'destructive',
};

export default function Billing() {
  const invoices = useAppStore(s => s.invoices);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filtered = invoices.filter(inv =>
    inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
    (inv.invoiceNumber ?? inv.id).toLowerCase().includes(search.toLowerCase())
  );

  const paid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (i.total ?? i.totalAmount ?? 0), 0);
  const unpaid = invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + (i.total ?? i.totalAmount ?? 0), 0);
  const overdue = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + (i.total ?? i.totalAmount ?? 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Invoices</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage customer invoices and payment status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" /> Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatINR(paid)}</p>
            <p className="text-xs text-muted-foreground mt-1">{invoices.filter(i => i.status === 'Paid').length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" /> Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatINR(unpaid)}</p>
            <p className="text-xs text-muted-foreground mt-1">{invoices.filter(i => i.status === 'Pending').length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" /> Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatINR(overdue)}</p>
            <p className="text-xs text-muted-foreground mt-1">{invoices.filter(i => i.status === 'Overdue').length} invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by customer or invoice #..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
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
                filtered.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-xs">{invoice.invoiceNumber ?? invoice.id}</TableCell>
                    <TableCell className="font-medium text-sm">{invoice.customerName}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{invoice.date}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{invoice.dueDate}</TableCell>
                    <TableCell className="text-sm font-medium">{formatINR(invoice.total ?? invoice.totalAmount ?? 0)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[invoice.status]}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedInvoice(invoice)}>
                        <FileText className="w-4 h-4" />
                      </Button>
                      {invoice.status !== 'Paid' && (
                        <Button size="sm" variant="ghost" className="text-success" onClick={() => setSelectedInvoice(invoice)}>
                          Pay
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InvoiceDetailModal
        invoice={selectedInvoice}
        open={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}
