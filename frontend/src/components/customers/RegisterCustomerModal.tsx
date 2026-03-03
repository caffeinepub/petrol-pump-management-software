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
import { useAppStore, Customer } from '@/store/appStore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface RegisterCustomerModalProps {
  open: boolean;
  onClose: () => void;
  editingCustomer?: Customer | null;
}

export default function RegisterCustomerModal({
  open,
  onClose,
  editingCustomer,
}: RegisterCustomerModalProps) {
  const { addCustomer, updateCustomer } = useAppStore();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!editingCustomer;

  useEffect(() => {
    if (open) {
      if (editingCustomer) {
        setName(editingCustomer.name);
        setContact(editingCustomer.contact);
        setVehicleNumber(editingCustomer.vehicleNumber);
      } else {
        setName('');
        setContact('');
        setVehicleNumber('');
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open, editingCustomer]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Customer name is required.';
    if (!contact.trim()) newErrors.contact = 'Contact number is required.';
    else if (!/^\d{10}$/.test(contact.trim())) newErrors.contact = 'Enter a valid 10-digit contact number.';
    if (!vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (isEditMode && editingCustomer) {
        updateCustomer(editingCustomer.id, {
          name: name.trim(),
          contact: contact.trim(),
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
        });
        toast.success('Customer updated successfully!');
      } else {
        const today = new Date().toISOString().split('T')[0];
        const newCustomer: Customer = {
          id: `C${Date.now()}`,
          name: name.trim(),
          contact: contact.trim(),
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          loyaltyPoints: 0,
          totalPurchases: 0,
          totalPurchaseVolume: 0,
          registrationDate: today,
          lastVisit: today,
        };
        addCustomer(newCustomer);
        toast.success('Customer registered successfully!');
      }
      onClose();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Customer' : 'Register Customer'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="custName">Customer Name *</Label>
            <Input
              id="custName"
              placeholder="Enter customer name"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((err) => ({ ...err, name: '' })); }}
              className="min-h-[44px]"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="custContact">Contact Number *</Label>
            <Input
              id="custContact"
              placeholder="10-digit mobile number"
              value={contact}
              onChange={(e) => { setContact(e.target.value); setErrors((err) => ({ ...err, contact: '' })); }}
              className="min-h-[44px]"
            />
            {errors.contact && <p className="text-xs text-destructive">{errors.contact}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="custVehicle">Vehicle Number *</Label>
            <Input
              id="custVehicle"
              placeholder="e.g. MH12AB1234"
              value={vehicleNumber}
              onChange={(e) => { setVehicleNumber(e.target.value); setErrors((err) => ({ ...err, vehicleNumber: '' })); }}
              className="min-h-[44px]"
            />
            {errors.vehicleNumber && <p className="text-xs text-destructive">{errors.vehicleNumber}</p>}
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
                {isEditMode ? 'Updating...' : 'Registering...'}
              </>
            ) : (
              isEditMode ? 'Update Customer' : 'Register Customer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
