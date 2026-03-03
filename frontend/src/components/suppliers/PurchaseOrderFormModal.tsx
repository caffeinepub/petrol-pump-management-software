import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { OrderStatus } from '../../store/appStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PurchaseOrderFormModal({ open, onClose }: Props) {
  const addPurchaseOrder = useAppStore(s => s.addPurchaseOrder);
  const suppliers = useAppStore(s => s.suppliers);

  const [supplierId, setSupplierId] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoicePrice, setInvoicePrice] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [totalLitres, setTotalLitres] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [status, setStatus] = useState<OrderStatus>('Pending');
  const [saving, setSaving] = useState(false);

  // Reset all fields to blank when modal opens for a new entry
  useEffect(() => {
    if (open) {
      setSupplierId('');
      setFuelType('');
      setInvoiceNumber('');
      setInvoicePrice('');
      setInvoiceDate('');
      setTotalLitres('');
      setOrderDate('');
      setExpectedDeliveryDate('');
      setStatus('Pending');
      setSaving(false);
    }
  }, [open]);

  const selectedSupplier = suppliers.find(s => s.id === supplierId);

  const invoicePriceNum = parseFloat(invoicePrice) || 0;
  const totalLitresNum = parseFloat(totalLitres) || 0;

  const litrePrice = useMemo(() => {
    if (totalLitresNum > 0 && invoicePriceNum > 0) {
      return invoicePriceNum / totalLitresNum;
    }
    return 0;
  }, [invoicePriceNum, totalLitresNum]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) { toast.error('Select a supplier'); return; }
    if (!fuelType) { toast.error('Select a fuel type'); return; }
    if (!totalLitresNum || totalLitresNum <= 0) { toast.error('Enter a valid total litres value'); return; }
    if (!invoicePriceNum || invoicePriceNum <= 0) { toast.error('Enter a valid invoice price'); return; }
    if (!invoiceDate) { toast.error('Select an invoice date'); return; }
    if (orderDate && expectedDeliveryDate && expectedDeliveryDate < orderDate) {
      toast.error('Delivery date must be after order date');
      return;
    }

    setSaving(true);
    await new Promise(r => setTimeout(r, 300));

    addPurchaseOrder({
      supplierId,
      supplierName: selectedSupplier?.name || 'Unknown',
      fuelType,
      quantityOrdered: totalLitresNum,
      invoiceNumber: invoiceNumber.trim() || undefined,
      invoicePrice: invoicePriceNum,
      invoiceDate,
      totalLitres: totalLitresNum,
      litrePrice,
      totalAmount: invoicePriceNum,
      totalCost: invoicePriceNum,
      orderDate: orderDate || new Date().toISOString().split('T')[0],
      expectedDeliveryDate: expectedDeliveryDate || '',
      status,
    });

    toast.success('Purchase order created');
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Purchase Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Supplier */}
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Supplier *</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fuel Type */}
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Fuel Type *</Label>
            <Select value={fuelType} onValueChange={setFuelType}>
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                {(selectedSupplier?.fuelTypesSupplied ?? ['Petrol', 'Diesel', 'Premium']).map(ft => (
                  <SelectItem key={ft} value={ft}>{ft}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Invoice Number */}
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Invoice Number</Label>
            <Input
              type="text"
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
              placeholder="e.g. IOCL-INV-2024-001"
              className="min-h-[44px]"
            />
          </div>

          {/* Invoice Price & Invoice Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs mb-1.5 block">Invoice Price (&#8377;) *</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={invoicePrice}
                onChange={e => setInvoicePrice(e.target.value)}
                placeholder="e.g. 967200"
                required
                className="min-h-[44px]"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs mb-1.5 block">Invoice Date *</Label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                required
                className="min-h-[44px]"
              />
            </div>
          </div>

          {/* Total Litres & Derived Litre Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs mb-1.5 block">Total Litres *</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={totalLitres}
                onChange={e => setTotalLitres(e.target.value)}
                placeholder="e.g. 10000"
                required
                className="min-h-[44px]"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs mb-1.5 block">Litre Price (&#8377;)</Label>
              <div className="min-h-[44px] flex items-center px-3 rounded-md border border-border bg-muted text-sm font-medium text-foreground">
                {totalLitresNum > 0 && invoicePriceNum > 0
                  ? `\u20B9${litrePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : <span className="text-muted-foreground">—</span>
                }
              </div>
            </div>
          </div>

          {/* Order Date & Expected Delivery */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs mb-1.5 block">Order Date</Label>
              <Input
                type="date"
                value={orderDate}
                onChange={e => setOrderDate(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs mb-1.5 block">Expected Delivery</Label>
              <Input
                type="date"
                value={expectedDeliveryDate}
                onChange={e => setExpectedDeliveryDate(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Status</Label>
            <Select value={status} onValueChange={v => setStatus(v as OrderStatus)}>
              <SelectTrigger className="min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Total Invoice Cost Summary */}
          <div className="bg-muted rounded-xl p-4 border border-border">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Total Invoice Cost</span>
              <span className="text-2xl font-bold text-primary">
                &#8377;{invoicePriceNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {totalLitresNum > 0 && invoicePriceNum > 0 && (
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {totalLitresNum.toLocaleString('en-IN')} L &times; &#8377;{litrePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/L
              </p>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px] w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="min-h-[44px] w-full sm:w-auto">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
