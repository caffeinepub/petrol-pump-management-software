import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FuelType } from '../../store/appStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function StockAdjustmentModal({ open, onClose }: Props) {
  const adjustStock = useAppStore(s => s.adjustStock);
  const stockLevels = useAppStore(s => s.stockLevels);
  const { data: profile } = useGetCallerUserProfile();

  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const currentStock = stockLevels.find(s => s.fuelType === fuelType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) { toast.error('Enter a valid quantity'); return; }
    if (adjustType === 'subtract' && currentStock && qty > currentStock.currentLevel) {
      toast.error(`Cannot subtract more than current stock (${currentStock.currentLevel}L)`);
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    const amount = adjustType === 'add' ? qty : -qty;
    adjustStock(fuelType, amount, reason || 'Manual adjustment', profile?.name || 'Manager');
    toast.success(`Stock ${adjustType === 'add' ? 'added' : 'removed'}: ${qty}L of ${fuelType}`);
    setSaving(false);
    setQuantity('');
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Adjust Stock Level</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Fuel Type</Label>
            <Select value={fuelType} onValueChange={v => setFuelType(v as FuelType)}>
              <SelectTrigger className="min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Petrol">Petrol</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            {currentStock && (
              <p className="text-xs text-muted-foreground mt-1">
                Current: {currentStock.currentLevel.toLocaleString()}L / {currentStock.capacity.toLocaleString()}L
              </p>
            )}
          </div>

          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Adjustment Type</Label>
            <Select value={adjustType} onValueChange={v => setAdjustType(v as 'add' | 'subtract')}>
              <SelectTrigger className="min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Stock (+)</SelectItem>
                <SelectItem value="subtract">Remove Stock (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Quantity (Liters)</Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              required
              className="min-h-[44px]"
            />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Reason / Note</Label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Delivery received, spillage correction..."
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px] w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={saving} className="min-h-[44px] w-full sm:w-auto">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Apply Adjustment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
