import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore, Customer } from '../../store/appStore';

interface Props {
  open: boolean;
  onClose: () => void;
  editingCustomer?: Customer | null;
}

export default function RegisterCustomerModal({ open, onClose, editingCustomer }: Props) {
  const addCustomer = useAppStore(s => s.addCustomer);
  const updateCustomer = useAppStore(s => s.updateCustomer);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  useEffect(() => {
    if (open) {
      if (editingCustomer) {
        setName(editingCustomer.name);
        setPhone(editingCustomer.phone ?? editingCustomer.contact ?? '');
        setEmail(editingCustomer.email);
        setVehicleType(editingCustomer.vehicleType);
        setVehicleNumber(editingCustomer.vehicleNumber);
      } else {
        setName('');
        setPhone('');
        setEmail('');
        setVehicleType('');
        setVehicleNumber('');
      }
    }
  }, [open, editingCustomer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: name.trim(),
        phone: phone.trim(),
        contact: phone.trim(),
        email: email.trim(),
        vehicleType: vehicleType.trim(),
        vehicleNumber: vehicleNumber.trim(),
      });
    } else {
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        contact: phone.trim(),
        email: email.trim(),
        vehicleType: vehicleType.trim(),
        vehicleNumber: vehicleNumber.trim(),
        loyaltyPoints: 0,
        totalPurchases: 0,
        totalPurchaseVolume: 0,
        registrationDate: new Date().toISOString().split('T')[0],
        lastVisit: new Date().toISOString().split('T')[0],
      };
      addCustomer(newCustomer);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Register New Customer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Customer name" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit mobile number" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Input id="vehicleType" value={vehicleType} onChange={e => setVehicleType(e.target.value)} placeholder="Car / Bike / Truck" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="vehicleNumber">Vehicle Number</Label>
              <Input id="vehicleNumber" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} placeholder="MH12AB1234" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{editingCustomer ? 'Save Changes' : 'Register'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
