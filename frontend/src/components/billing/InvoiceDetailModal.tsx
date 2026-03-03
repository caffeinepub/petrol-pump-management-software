import { useRef } from 'react';
import { useAppStore, Invoice } from '../../store/appStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  invoice: Invoice;
  open?: boolean;
  onClose: () => void;
}

export default function InvoiceDetailModal({ invoice, onClose }: Props) {
  const toggleInvoiceStatus = useAppStore(s => s.toggleInvoiceStatus);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleToggleStatus = () => {
    toggleInvoiceStatus(invoice.id);
    toast.success(`Invoice marked as ${invoice.status === 'Paid' ? 'Unpaid' : 'Paid'}`);
    onClose();
  };

  const subtotal = invoice.subtotal ?? invoice.totalAmount;
  const tax = invoice.tax ?? 0;
  const total = invoice.total ?? invoice.totalAmount;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-navy-700 border-navy-600 text-foreground max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-amber">Invoice Details</DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="space-y-4">
          {/* Invoice Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-display text-2xl text-amber">FUEL STATION</h2>
              <p className="text-muted-foreground text-xs">Petrol Station Management</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm text-foreground font-bold">{invoice.invoiceNumber}</p>
              <p className="text-muted-foreground text-xs">{new Date(invoice.date).toLocaleDateString('en-IN')}</p>
              <Badge
                variant="outline"
                className={invoice.status === 'Paid'
                  ? 'mt-1 bg-green-500/20 text-green-600 border-green-500/30'
                  : 'mt-1 bg-destructive/20 text-destructive border-destructive/30'}
              >
                {invoice.status}
              </Badge>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-muted rounded-xl p-4 border border-border">
            <p className="text-muted-foreground text-xs mb-1">Bill To</p>
            <p className="text-foreground font-semibold">{invoice.customerName}</p>
            {invoice.paymentMethod && (
              <p className="text-muted-foreground text-xs">Payment: {invoice.paymentMethod}</p>
            )}
          </div>

          {/* Line Items */}
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="text-left text-muted-foreground py-2 px-3">Description</th>
                  <th className="text-right text-muted-foreground py-2 px-3">Qty</th>
                  <th className="text-right text-muted-foreground py-2 px-3">Rate</th>
                  <th className="text-right text-muted-foreground py-2 px-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0">
                      <td className="py-2 px-3 text-foreground">{item.description}</td>
                      <td className="py-2 px-3 text-right text-foreground">{item.quantity}</td>
                      <td className="py-2 px-3 text-right text-foreground">&#8377;{item.unitPrice.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-foreground">&#8377;{item.total.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-border">
                    <td className="py-2 px-3 text-foreground">{invoice.fuelType} Fuel</td>
                    <td className="py-2 px-3 text-right text-foreground">{invoice.quantity}L</td>
                    <td className="py-2 px-3 text-right text-foreground">&#8377;{invoice.pricePerLiter.toFixed(2)}/L</td>
                    <td className="py-2 px-3 text-right text-foreground">
                      &#8377;{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>&#8377;{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>&#8377;{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-bold text-foreground border-t border-border pt-2">
              <span className="font-display text-lg">TOTAL</span>
              <span className="font-display text-lg text-primary">
                &#8377;{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="outline" onClick={handleToggleStatus} className="border-border text-foreground hover:bg-muted">
            {invoice.status === 'Paid'
              ? <><XCircle className="w-4 h-4 mr-2 text-destructive" />Mark Unpaid</>
              : <><CheckCircle className="w-4 h-4 mr-2 text-green-600" />Mark Paid</>
            }
          </Button>
          <Button variant="outline" onClick={handlePrint} className="border-border text-foreground hover:bg-muted">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
