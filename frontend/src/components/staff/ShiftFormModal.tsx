import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore, ShiftStatus } from '../../store/appStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SHIFT_STATUSES: ShiftStatus[] = ['Scheduled', 'Completed', 'Absent'];

export default function ShiftFormModal({ open, onClose }: Props) {
  const staff = useAppStore(s => s.staff).filter(s => s.isActive);
  const addShift = useAppStore(s => s.addShift);

  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [pumpNumber, setPumpNumber] = useState('');
  const [status, setStatus] = useState<ShiftStatus>('Scheduled');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setStaffId('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setPumpNumber('');
      setStatus('Scheduled');
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!staffId) errs.staffId = 'Select a staff member';
    if (!date) errs.date = 'Enter a date';
    if (!startTime) errs.startTime = 'Enter start time';
    if (!endTime) errs.endTime = 'Enter end time';
    if (!pumpNumber) errs.pumpNumber = 'Enter pump number';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const member = staff.find(s => s.id === staffId);
    addShift({
      id: `shift-${Date.now()}`,
      staffId,
      staffName: member?.name ?? '',
      date,
      startTime,
      endTime,
      pumpNumber: parseInt(pumpNumber, 10),
      status,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Shift</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Staff Member *</Label>
            <Select value={staffId} onValueChange={v => { setStaffId(v); setErrors(p => ({ ...p, staffId: '' })); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name} — {s.role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.staffId && <p className="text-destructive text-xs">{errors.staffId}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="date">Date *</Label>
            <Input id="date" type="date" value={date} onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: '' })); }} />
            {errors.date && <p className="text-destructive text-xs">{errors.date}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input id="startTime" type="time" value={startTime} onChange={e => { setStartTime(e.target.value); setErrors(p => ({ ...p, startTime: '' })); }} />
              {errors.startTime && <p className="text-destructive text-xs">{errors.startTime}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="endTime">End Time *</Label>
              <Input id="endTime" type="time" value={endTime} onChange={e => { setEndTime(e.target.value); setErrors(p => ({ ...p, endTime: '' })); }} />
              {errors.endTime && <p className="text-destructive text-xs">{errors.endTime}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="pump">Pump Number *</Label>
            <Input id="pump" type="number" min={1} value={pumpNumber} onChange={e => { setPumpNumber(e.target.value); setErrors(p => ({ ...p, pumpNumber: '' })); }} placeholder="e.g. 1" />
            {errors.pumpNumber && <p className="text-destructive text-xs">{errors.pumpNumber}</p>}
          </div>

          <div className="space-y-1">
            <Label>Status</Label>
            <Select value={status} onValueChange={v => setStatus(v as ShiftStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHIFT_STATUSES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Schedule Shift</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
