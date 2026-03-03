import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore, FuelType } from '../../store/appStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ThresholdConfigModal({ open, onClose }: Props) {
  const stockLevels = useAppStore(s => s.stockLevels);
  const updateThreshold = useAppStore(s => s.updateThreshold);

  const [thresholds, setThresholds] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const initial: Record<string, string> = {};
      stockLevels.forEach(sl => {
        initial[sl.fuelType] = String(sl.threshold);
      });
      setThresholds(initial);
    }
  }, [open, stockLevels]);

  const handleSave = () => {
    Object.entries(thresholds).forEach(([fuelType, val]) => {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 0) {
        updateThreshold(fuelType as FuelType, num);
      }
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Low-Stock Thresholds</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Set the minimum stock level (litres) before a low-stock alert is triggered.</p>
          {stockLevels.map(sl => (
            <div key={sl.fuelType} className="flex items-center gap-3">
              <Label className="w-20 shrink-0">{sl.fuelType}</Label>
              <Input
                type="number"
                min={0}
                value={thresholds[sl.fuelType] ?? ''}
                onChange={e => setThresholds(prev => ({ ...prev, [sl.fuelType]: e.target.value }))}
                placeholder="Threshold litres"
              />
              <span className="text-xs text-muted-foreground">Current: {sl.current.toLocaleString('en-IN')}L</span>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Thresholds</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
