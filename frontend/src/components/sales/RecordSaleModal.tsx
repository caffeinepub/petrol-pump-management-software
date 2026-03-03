import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/appStore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface RecordSaleModalProps {
  open: boolean;
  onClose: () => void;
}

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Credit'];
const PUMP_NUMBERS = ['P1', 'P2', 'P3', 'P4'];

export default function RecordSaleModal({ open, onClose }: RecordSaleModalProps) {
  const { fuelInventory, staff, addFuelSale } = useAppStore();

  const [fuelType, setFuelType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [pumpNumber, setPumpNumber] = useState('');
  const [staffName, setStaffName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived values
  const selectedInventory = fuelInventory.find((f) => f.fuelType === fuelType);
  const pricePerLiter = selectedInventory?.pricePerLiter ?? 0;
  const currentStock = selectedInventory?.currentStock ?? 0;
  const quantityNum = parseFloat(quantity) || 0;
  const totalAmount = quantityNum * pricePerLiter;
  const isStockSufficient = quantityNum > 0 && quantityNum <= currentStock;

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFuelType('');
      setQuantity('');
      setPaymentMethod('');
      setPumpNumber('');
      setStaffName('');
      setCustomerName('');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fuelType) newErrors.fuelType = 'Please select a fuel type.';
    if (!quantity || quantityNum <= 0) newErrors.quantity = 'Enter a valid quantity.';
    else if (quantityNum > currentStock) newErrors.quantity = `Insufficient stock. Available: ${currentStock.toFixed(2)}L`;
    if (!paymentMethod) newErrors.paymentMethod = 'Please select a payment method.';
    if (!pumpNumber) newErrors.pumpNumber = 'Please select a pump number.';
    if (!staffName) newErrors.staffName = 'Please select a staff member.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const newSale = {
        id: `FS${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        fuelType,
        quantity: quantityNum,
        pricePerLiter,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        paymentMethod,
        pumpNumber,
        staffName,
        customerName: customerName.trim() || undefined,
        loyaltyPoints: Math.floor(totalAmount / 100),
      };

      addFuelSale(newSale);
      toast.success('Sale recorded successfully!');
      onClose();
    } catch (err) {
      toast.error('Failed to record sale. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Record Sale</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Fuel Type */}
          <div className="space-y-1">
            <Label htmlFor="fuelType">Fuel Type *</Label>
            <Select value={fuelType} onValueChange={(v) => { setFuelType(v); setErrors((e) => ({ ...e, fuelType: '' })); }}>
              <SelectTrigger id="fuelType" className="min-h-[44px]">
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                {fuelInventory.map((f) => (
                  <SelectItem key={f.fuelType} value={f.fuelType}>
                    {f.fuelType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fuelType && <p className="text-xs text-destructive">{errors.fuelType}</p>}
          </div>

          {/* Price per Liter (read-only) */}
          {fuelType && (
            <div className="space-y-1">
              <Label>Price per Litre</Label>
              <div className="flex items-center h-10 px-3 rounded-md border bg-muted text-sm font-medium">
                ₹{pricePerLiter.toFixed(2)} / L
              </div>
              <p className="text-xs text-muted-foreground">
                Available stock: {currentStock.toFixed(2)} L
              </p>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-1">
            <Label htmlFor="quantity">Quantity (Litres) *</Label>
            <Input
              id="quantity"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter quantity in litres"
              value={quantity}
              onChange={(e) => { setQuantity(e.target.value); setErrors((err) => ({ ...err, quantity: '' })); }}
              className="min-h-[44px]"
            />
            {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
            {fuelType && quantityNum > 0 && !errors.quantity && (
              <p className={`text-xs ${isStockSufficient ? 'text-green-600' : 'text-destructive'}`}>
                {isStockSufficient ? '✓ Stock available' : '✗ Insufficient stock'}
              </p>
            )}
          </div>

          {/* Total Amount */}
          {fuelType && quantityNum > 0 && (
            <div className="space-y-1">
              <Label>Total Amount</Label>
              <div className="flex items-center h-10 px-3 rounded-md border bg-muted text-sm font-semibold text-primary">
                ₹{totalAmount.toFixed(2)}
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-1">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select value={paymentMethod} onValueChange={(v) => { setPaymentMethod(v); setErrors((e) => ({ ...e, paymentMethod: '' })); }}>
              <SelectTrigger id="paymentMethod" className="min-h-[44px]">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMethod && <p className="text-xs text-destructive">{errors.paymentMethod}</p>}
          </div>

          {/* Pump Number */}
          <div className="space-y-1">
            <Label htmlFor="pumpNumber">Pump Number *</Label>
            <Select value={pumpNumber} onValueChange={(v) => { setPumpNumber(v); setErrors((e) => ({ ...e, pumpNumber: '' })); }}>
              <SelectTrigger id="pumpNumber" className="min-h-[44px]">
                <SelectValue placeholder="Select pump" />
              </SelectTrigger>
              <SelectContent>
                {PUMP_NUMBERS.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.pumpNumber && <p className="text-xs text-destructive">{errors.pumpNumber}</p>}
          </div>

          {/* Staff Name */}
          <div className="space-y-1">
            <Label htmlFor="staffName">Staff Member *</Label>
            <Select value={staffName} onValueChange={(v) => { setStaffName(v); setErrors((e) => ({ ...e, staffName: '' })); }}>
              <SelectTrigger id="staffName" className="min-h-[44px]">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.filter((s) => s.status === 'Active').map((s) => (
                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.staffName && <p className="text-xs text-destructive">{errors.staffName}</p>}
          </div>

          {/* Customer Name (optional) */}
          <div className="space-y-1">
            <Label htmlFor="customerName">Customer Name (Optional)</Label>
            <Input
              id="customerName"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="min-h-[44px]"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="min-h-[44px] w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="min-h-[44px] w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Record Sale'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
