import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FuelType } from '../../store/appStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ThresholdConfigModal({ open, onClose }: Props) {
  const stockLevels = useAppStore(s => s.stockLevels);
  const updateThreshold = useAppStore(s => s.updateThreshold);

  const [thresholds, setThresholds] = useState<Record<FuelType, string>>({
    Petrol: String(stockLevels.find(s => s.fuelType === 'Petrol')?.threshold ?? 3000),
    Diesel: String(stockLevels.find(s => s.fuelType === 'Diesel')?.threshold ?? 4000),
    Premium: String(stockLevels.find(s => s.fuelType === 'Premium')?.threshold ?? 1500),
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    (['Petrol', 'Diesel', 'Premium'] as FuelType[]).forEach(ft => {
      const val = parseFloat(thresholds[ft]);
      if (!isNaN(val) && val >= 0) {
        updateThreshold(ft, val);
      }
    });
    toast.success('Thresholds updated successfully');
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Configure Low-Stock Thresholds</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Set the minimum stock level (in liters) that triggers a low-stock alert for each fuel type.
          </p>

          {(['Petrol', 'Diesel', 'Premium'] as FuelType[]).map(ft => {
            const stock = stockLevels.find(s => s.fuelType === ft);
            return (
              <div key={ft}>
                <Label className="text-muted-foreground text-xs mb-1.5 block">
                  {ft} Threshold (L)
                  {stock && (
                    <span className="ml-2 text-muted-foreground">
                      — Capacity: {stock.capacity.toLocaleString()}L
                    </span>
                  )}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={thresholds[ft]}
                  onChange={e => setThresholds(prev => ({ ...prev, [ft]: e.target.value }))}
                  className="min-h-[44px]"
                />
              </div>
            );
          })}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px] w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={saving} className="min-h-[44px] w-full sm:w-auto">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Thresholds'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
