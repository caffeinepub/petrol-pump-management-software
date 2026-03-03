import { useState, useEffect } from 'react';
import { useAppStore, Supplier } from '../../store/appStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  editingSupplier: Supplier | null;
}

const ALL_FUEL_TYPES = ['Petrol', 'Diesel', 'Premium', 'CNG'];

export default function SupplierFormModal({ open, onClose, editingSupplier }: Props) {
  const addSupplier = useAppStore(s => s.addSupplier);
  const updateSupplier = useAppStore(s => s.updateSupplier);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingSupplier) {
        setName(editingSupplier.name);
        setContact(editingSupplier.contact);
        setEmail(editingSupplier.email || '');
        setAddress(editingSupplier.address || '');
        setFuelTypes(editingSupplier.fuelTypesSupplied);
      } else {
        setName('');
        setContact('');
        setEmail('');
        setAddress('');
        setFuelTypes([]);
      }
      setSaving(false);
    }
  }, [editingSupplier, open]);

  const toggleFuelType = (ft: string) => {
    setFuelTypes(prev =>
      prev.includes(ft) ? prev.filter(f => f !== ft) : [...prev, ft]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Supplier name is required'); return; }
    if (fuelTypes.length === 0) { toast.error('Select at least one fuel type'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, { name, contact, email, address, fuelTypesSupplied: fuelTypes });
      toast.success('Supplier updated');
    } else {
      // Do NOT include 'id' — addSupplier expects Omit<Supplier, 'id'>
      addSupplier({
        name,
        contact,
        email,
        address,
        fuelTypesSupplied: fuelTypes,
        rating: 4.0,
        lastDelivery: new Date().toISOString().split('T')[0],
      });
      toast.success('Supplier added');
    }
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Supplier Name *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="e.g. Indian Oil Corporation"
              className="min-h-[44px]"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Contact</Label>
            <Input
              value={contact}
              onChange={e => setContact(e.target.value)}
              placeholder="Phone number"
              className="min-h-[44px]"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="supplier@example.com"
              className="min-h-[44px]"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Address</Label>
            <Input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="City, State"
              className="min-h-[44px]"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs mb-2 block">Fuel Types Supplied *</Label>
            <div className="flex flex-wrap gap-4">
              {ALL_FUEL_TYPES.map(ft => (
                <div key={ft} className="flex items-center gap-2">
                  <Checkbox
                    id={`ft-${ft}`}
                    checked={fuelTypes.includes(ft)}
                    onCheckedChange={() => toggleFuelType(ft)}
                  />
                  <Label htmlFor={`ft-${ft}`} className="text-foreground text-sm cursor-pointer">{ft}</Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px] w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={saving} className="min-h-[44px] w-full sm:w-auto">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : editingSupplier ? 'Update' : 'Add Supplier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
