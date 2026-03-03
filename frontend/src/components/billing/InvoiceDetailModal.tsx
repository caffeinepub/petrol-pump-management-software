import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore, Invoice, InvoiceStatus } from '../../store/appStore';

interface Props {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
}

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

export default function InvoiceDetailModal({ invoice, open, onClose }: Props) {
  const updateInvoiceStatus = useAppStore(s => s.updateInvoiceStatus);
  const toggleInvoiceStatus = useAppStore(s => s.toggleInvoiceStatus);

  if (!invoice) return null;

  const subtotal = invoice.subtotal ?? invoice.totalAmount ?? 0;
  const tax = invoice.tax ?? 0;
  const total = invoice.total ?? invoice.totalAmount ?? 0;

  const statusColor: Record<InvoiceStatus, string> = {
    Paid: 'bg-success/10 text-success',
    Pending: 'bg-warning/10 text-warning',
    Overdue: 'bg-destructive/10 text-destructive',
  };

  const handleMarkPaid = () => {
    updateInvoiceStatus(invoice.id, 'Paid');
    onClose();
  };

  const handleToggle = () => {
    toggleInvoiceStatus(invoice.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Invoice Detail</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[invoice.status]}`}>
              {invoice.status}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Invoice #</p>
              <p className="font-mono text-sm text-foreground font-bold">
                {invoice.invoiceNumber ?? invoice.id}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Customer</p>
              <p className="font-medium text-foreground">{invoice.customerName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Date</p>
              <p className="text-foreground">{invoice.date}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Due Date</p>
              <p className="text-foreground">{invoice.dueDate}</p>
            </div>
          </div>

          {invoice.paymentMethod && (
            <p className="text-muted-foreground text-xs">Payment: {invoice.paymentMethod}</p>
          )}

          {/* Line items */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="py-2 px-3 text-left text-muted-foreground font-medium">Description</th>
                  <th className="py-2 px-3 text-right text-muted-foreground font-medium">Qty</th>
                  <th className="py-2 px-3 text-right text-muted-foreground font-medium">Unit Price</th>
                  <th className="py-2 px-3 text-right text-muted-foreground font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="py-2 px-3 text-foreground">{item.description}</td>
                      <td className="py-2 px-3 text-right text-foreground">{item.quantity}</td>
                      <td className="py-2 px-3 text-right text-foreground">{formatINR(item.unitPrice)}</td>
                      <td className="py-2 px-3 text-right text-foreground">{formatINR(item.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-border">
                    <td className="py-2 px-3 text-foreground">
                      {invoice.fuelType ? `${invoice.fuelType} Fuel` : 'Fuel'}
                    </td>
                    <td className="py-2 px-3 text-right text-foreground">
                      {invoice.quantity ?? '—'}
                      {invoice.quantity ? 'L' : ''}
                    </td>
                    <td className="py-2 px-3 text-right text-foreground">
                      {invoice.pricePerLiter != null ? `${formatINR(invoice.pricePerLiter)}/L` : '—'}
                    </td>
                    <td className="py-2 px-3 text-right text-foreground">{formatINR(subtotal)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (10%)</span>
              <span>{formatINR(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-foreground text-base border-t border-border pt-2 mt-2">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {invoice.status !== 'Paid' && (
            <Button onClick={handleMarkPaid}>Mark as Paid</Button>
          )}
          {invoice.status === 'Paid' && (
            <Button variant="secondary" onClick={handleToggle}>Mark as Pending</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
