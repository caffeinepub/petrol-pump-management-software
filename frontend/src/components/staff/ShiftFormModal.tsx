import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ShiftStatus } from '../../store/appStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ShiftFormModal({ open, onClose }: Props) {
  const addShift = useAppStore(s => s.addShift);
  const staff = useAppStore(s => s.staff).filter(s => s.status === 'Active');

  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [pumpNumber, setPumpNumber] = useState('');
  const [status, setStatus] = useState<ShiftStatus>('Scheduled');
  const [saving, setSaving] = useState(false);

  // Reset all fields to blank when modal opens for a new shift
  useEffect(() => {
    if (open) {
      setStaffId('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setPumpNumber('');
      setStatus('Scheduled');
      setSaving(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) { toast.error('Select a staff member'); return; }
    if (!date) { toast.error('Select a date'); return; }
    if (!startTime) { toast.error('Enter a start time'); return; }
    if (!endTime) { toast.error('Enter an end time'); return; }
    if (startTime >= endTime) { toast.error('End time must be after start time'); return; }
    if (!pumpNumber) { toast.error('Select a pump number'); return; }

    const selectedStaff = staff.find(s => s.id === staffId);
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    addShift({
      staffId,
      staffName: selectedStaff?.name || 'Unknown',
      date,
      startTime,
      endTime,
      pumpNumber: parseInt(pumpNumber),
      status,
    });
    toast.success('Shift created successfully');
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Shift</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Staff Member *</Label>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name} — {s.role}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs mb-1.5 block">Date *</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="min-h-[44px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs mb-1.5 block">Start Time *</Label>
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="min-h-[44px]" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs mb-1.5 block">End Time *</Label>
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="min-h-[44px]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs mb-1.5 block">Pump Number *</Label>
              <Select value={pumpNumber} onValueChange={setPumpNumber}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Select pump" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map(n => <SelectItem key={n} value={String(n)}>Pump {n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs mb-1.5 block">Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as ShiftStatus)}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px] w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={saving} className="min-h-[44px] w-full sm:w-auto">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create Shift'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
