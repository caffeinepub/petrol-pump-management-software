import { useState, useEffect } from 'react';
import { useAppStore, Staff, StaffStatus, SalaryPeriod } from '../../store/appStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  editingStaff: Staff | null;
}

export default function StaffFormModal({ open, onClose, editingStaff }: Props) {
  const addStaff = useAppStore(s => s.addStaff);
  const updateStaff = useAppStore(s => s.updateStaff);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [contact, setContact] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [status, setStatus] = useState<StaffStatus>('Active');
  const [salary, setSalary] = useState('');
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>('monthly');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingStaff) {
        setName(editingStaff.name);
        setRole(editingStaff.role);
        setContact(editingStaff.contact);
        setHireDate(editingStaff.hireDate || editingStaff.joinDate || '');
        setStatus(editingStaff.status);
        setSalary(editingStaff.salary > 0 ? String(editingStaff.salary) : '');
        setSalaryPeriod(editingStaff.salaryPeriod ?? 'monthly');
      } else {
        setName('');
        setRole('');
        setContact('');
        setHireDate('');
        setStatus('Active');
        setSalary('');
        setSalaryPeriod('monthly');
      }
      setSaving(false);
    }
  }, [editingStaff, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      toast.error('Name and role are required');
      return;
    }
    const salaryNum = parseFloat(salary);
    if (!salary || isNaN(salaryNum) || salaryNum <= 0) {
      toast.error('Please enter a valid salary amount');
      return;
    }

    setSaving(true);
    await new Promise(r => setTimeout(r, 300));

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        name,
        role,
        contact,
        hireDate,
        joinDate: hireDate,
        status,
        salary: salaryNum,
        salaryPeriod,
      });
      toast.success('Staff member updated');
    } else {
      addStaff({
        name,
        role,
        contact,
        hireDate,
        joinDate: hireDate,
        status,
        email: '',
        shift: 'Morning',
        salary: salaryNum,
        salaryPeriod,
      });
      toast.success('Staff member added');
    }

    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Full Name *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Enter full name"
              className="min-h-[44px]"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Role *</Label>
            <Input
              value={role}
              onChange={e => setRole(e.target.value)}
              required
              placeholder="e.g. Pump Attendant, Cashier"
              className="min-h-[44px]"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Contact</Label>
            <Input
              value={contact}
              onChange={e => setContact(e.target.value)}
              placeholder="Phone or email"
              className="min-h-[44px]"
            />
          </div>

          {/* Salary Section */}
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Salary *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium select-none">
                  &#8377;
                </span>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={salary}
                  onChange={e => setSalary(e.target.value)}
                  placeholder="e.g. 18000"
                  className="pl-7 min-h-[44px]"
                  required
                />
              </div>
              <Select value={salaryPeriod} onValueChange={v => setSalaryPeriod(v as SalaryPeriod)}>
                <SelectTrigger className="min-h-[44px] w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">/ Month</SelectItem>
                  <SelectItem value="annual">/ Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs mb-1.5 block">Hire Date</Label>
              <Input
                type="date"
                value={hireDate}
                onChange={e => setHireDate(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs mb-1.5 block">Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as StaffStatus)}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px] w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="min-h-[44px] w-full sm:w-auto">
              {saving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                : editingStaff ? 'Update' : 'Add Staff'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
