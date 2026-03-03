import { useState } from 'react';
import { useAppStore, Customer } from '../../store/appStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  customer: Customer;
}

export default function RedeemPointsModal({ open, onClose, customer }: Props) {
  const redeemPoints = useAppStore(s => s.redeemPoints);
  const [points, setPoints] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(points);
    if (!pts || pts <= 0) { toast.error('Enter a valid number of points'); return; }
    if (pts > customer.loyaltyPoints) { toast.error(`Cannot redeem more than ${customer.loyaltyPoints} points`); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    redeemPoints(customer.id, pts);
    toast.success(`${pts} points redeemed for ${customer.name}`);
    setSaving(false);
    setPoints(''); setNote('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Redeem Loyalty Points</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-primary/10 rounded-xl p-4 border border-primary/30 flex items-center gap-3">
            <Star className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-primary">{customer.loyaltyPoints.toLocaleString()} pts</p>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Points to Redeem</Label>
            <Input
              type="number"
              min="1"
              max={customer.loyaltyPoints}
              value={points}
              onChange={e => setPoints(e.target.value)}
              required
              placeholder={`Max: ${customer.loyaltyPoints}`}
              className="min-h-[44px]"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Redemption Note</Label>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Reason for redemption..."
              rows={2}
              className="resize-none"
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px] w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={saving} className="min-h-[44px] w-full sm:w-auto">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redeeming...</> : 'Redeem Points'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
