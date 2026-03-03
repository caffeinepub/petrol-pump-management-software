import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore, Customer } from '../../store/appStore';

interface Props {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
}

export default function RedeemPointsModal({ customer, open, onClose }: Props) {
  const redeemPoints = useAppStore(s => s.redeemPoints);
  const [points, setPoints] = useState('');
  const [error, setError] = useState('');

  if (!customer) return null;

  const handleRedeem = () => {
    const pts = parseInt(points, 10);
    if (isNaN(pts) || pts <= 0) {
      setError('Enter a valid number of points.');
      return;
    }
    if (pts > customer.loyaltyPoints) {
      setError(`Cannot redeem more than ${customer.loyaltyPoints} points.`);
      return;
    }
    redeemPoints(customer.id, pts);
    setPoints('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Redeem Loyalty Points</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {customer.name} has <span className="font-bold text-foreground">{customer.loyaltyPoints}</span> points available.
          </p>
          <div className="space-y-1">
            <Label htmlFor="points">Points to Redeem</Label>
            <Input
              id="points"
              type="number"
              min={1}
              max={customer.loyaltyPoints}
              value={points}
              onChange={e => { setPoints(e.target.value); setError(''); }}
              placeholder="Enter points"
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleRedeem}>Redeem</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
