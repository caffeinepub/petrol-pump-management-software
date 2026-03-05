import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type React from "react";
import { useEffect, useState } from "react";
import {
  type Shift,
  type ShiftStatus,
  useAppStore,
} from "../../store/appStore";

interface Props {
  open: boolean;
  onClose: () => void;
  editingShift?: Shift | null;
}

const SHIFT_STATUSES: ShiftStatus[] = ["Scheduled", "Completed", "Absent"];

export default function ShiftFormModal({ open, onClose, editingShift }: Props) {
  const staff = useAppStore((s) => s.staff).filter((s) => s.isActive);
  const addShift = useAppStore((s) => s.addShift);
  const updateShift = useAppStore((s) => s.updateShift);

  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [pumpNumber, setPumpNumber] = useState("");
  const [status, setStatus] = useState<ShiftStatus>("Scheduled");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (editingShift) {
        setStaffId(editingShift.staffId);
        setDate(editingShift.date);
        setStartTime(editingShift.startTime);
        setEndTime(editingShift.endTime);
        setPumpNumber(String(editingShift.pumpNumber));
        setStatus(editingShift.status);
      } else {
        setStaffId("");
        setDate("");
        setStartTime("");
        setEndTime("");
        setPumpNumber("");
        setStatus("Scheduled");
      }
      setErrors({});
    }
  }, [open, editingShift]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!staffId) errs.staffId = "Select a staff member";
    if (!date) errs.date = "Enter a date";
    if (!startTime) errs.startTime = "Enter start time";
    if (!endTime) errs.endTime = "Enter end time";
    if (!pumpNumber) errs.pumpNumber = "Enter pump number";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const member = staff.find((s) => s.id === staffId);
    if (editingShift) {
      updateShift(editingShift.id, {
        staffId,
        staffName: member?.name ?? editingShift.staffName,
        date,
        startTime,
        endTime,
        pumpNumber: Number.parseInt(pumpNumber, 10),
        status,
      });
    } else {
      addShift({
        id: `shift-${Date.now()}`,
        staffId,
        staffName: member?.name ?? "",
        date,
        startTime,
        endTime,
        pumpNumber: Number.parseInt(pumpNumber, 10),
        status,
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingShift ? "Edit Shift" : "Schedule Shift"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Staff Member *</Label>
            <Select
              value={staffId}
              onValueChange={(v) => {
                setStaffId(v);
                setErrors((p) => ({ ...p, staffId: "" }));
              }}
            >
              <SelectTrigger data-ocid="shift.staff.select">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {s.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.staffId && (
              <p className="text-destructive text-xs">{errors.staffId}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              data-ocid="shift.date.input"
              onChange={(e) => {
                setDate(e.target.value);
                setErrors((p) => ({ ...p, date: "" }));
              }}
            />
            {errors.date && (
              <p className="text-destructive text-xs">{errors.date}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                data-ocid="shift.start_time.input"
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setErrors((p) => ({ ...p, startTime: "" }));
                }}
              />
              {errors.startTime && (
                <p className="text-destructive text-xs">{errors.startTime}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                data-ocid="shift.end_time.input"
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setErrors((p) => ({ ...p, endTime: "" }));
                }}
              />
              {errors.endTime && (
                <p className="text-destructive text-xs">{errors.endTime}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="pump">Pump Number *</Label>
            <Input
              id="pump"
              type="number"
              min={1}
              value={pumpNumber}
              data-ocid="shift.pump.input"
              onChange={(e) => {
                setPumpNumber(e.target.value);
                setErrors((p) => ({ ...p, pumpNumber: "" }));
              }}
              placeholder="e.g. 1"
            />
            {errors.pumpNumber && (
              <p className="text-destructive text-xs">{errors.pumpNumber}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as ShiftStatus)}
            >
              <SelectTrigger data-ocid="shift.status.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHIFT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="shift.cancel_button"
            >
              Cancel
            </Button>
            <Button type="submit" data-ocid="shift.submit_button">
              {editingShift ? "Save Changes" : "Schedule Shift"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
