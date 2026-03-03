import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore, FuelInventory } from '../../store/appStore';

interface Props {
  open: boolean;
  onClose: () => void;
  item?: FuelInventory | null;
}

export default function StockAdjustmentModal({ open, onClose, item }: Props) {
  const inventory = useAppStore(s => s.inventory);
  const adjustStock = useAppStore(s => s.adjustStock);

  const [selectedId, setSelectedId] = useState('');
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [direction, setDirection] = useState<'add' | 'remove'>('add');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = item?.id ?? selectedId;
    if (!id || !delta) return;
    const amount = parseFloat(delta);
    if (isNaN(amount) || amount <= 0) return;
    adjustStock(id, direction === 'add' ? amount : -amount, reason);
    setDelta('');
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!item && (
            <div className="space-y-1">
              <Label>Fuel Type</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map(inv => (
                    <SelectItem key={inv.id} value={inv.id}>{inv.fuelType}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {item && (
            <p className="text-sm font-medium text-foreground">Adjusting: <span className="text-primary">{item.fuelType}</span></p>
          )}
          <div className="space-y-1">
            <Label>Adjustment Type</Label>
            <Select value={direction} onValueChange={v => setDirection(v as 'add' | 'remove')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Stock</SelectItem>
                <SelectItem value="remove">Remove Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="delta">Quantity (Litres)</Label>
            <Input id="delta" type="number" min={0} value={delta} onChange={e => setDelta(e.target.value)} placeholder="Enter litres" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="reason">Reason</Label>
            <Input id="reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for adjustment" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Apply Adjustment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
