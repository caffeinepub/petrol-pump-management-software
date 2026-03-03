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
  type PayPeriod,
  type StaffMember,
  type StaffRole,
  useAppStore,
} from "../../store/appStore";

interface Props {
  open: boolean;
  onClose: () => void;
  editingStaff?: StaffMember | null;
}

const ROLES: StaffRole[] = [
  "Manager",
  "Attendant",
  "Cashier",
  "Technician",
  "Security",
];
const PAY_PERIODS: PayPeriod[] = ["monthly", "annual"];

export default function StaffFormModal({ open, onClose, editingStaff }: Props) {
  const addStaff = useAppStore((s) => s.addStaff);
  const updateStaff = useAppStore((s) => s.updateStaff);

  const [name, setName] = useState("");
  const [role, setRole] = useState<StaffRole | "">("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [salary, setSalary] = useState("");
  const [payPeriod, setPayPeriod] = useState<PayPeriod>("monthly");

  useEffect(() => {
    if (open) {
      if (editingStaff) {
        setName(editingStaff.name);
        setRole(editingStaff.role);
        setPhone(editingStaff.phone ?? editingStaff.contact ?? "");
        setEmail(editingStaff.email);
        setHireDate(editingStaff.hireDate);
        setSalary(String(editingStaff.salary));
        setPayPeriod(
          editingStaff.payPeriod ?? editingStaff.salaryPeriod ?? "monthly",
        );
      } else {
        setName("");
        setRole("");
        setPhone("");
        setEmail("");
        setHireDate("");
        setSalary("");
        setPayPeriod("monthly");
      }
    }
  }, [open, editingStaff]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role) return;

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        name: name.trim(),
        role: role as StaffRole,
        phone: phone.trim(),
        contact: phone.trim(),
        email: email.trim(),
        hireDate,
        salary: Number.parseFloat(salary) || 0,
        payPeriod,
        salaryPeriod: payPeriod,
      });
    } else {
      const newMember: StaffMember = {
        id: `staff-${Date.now()}`,
        name: name.trim(),
        role: role as StaffRole,
        phone: phone.trim(),
        contact: phone.trim(),
        email: email.trim(),
        hireDate,
        salary: Number.parseFloat(salary) || 0,
        payPeriod,
        salaryPeriod: payPeriod,
        isActive: true,
        status: "Active",
      };
      addStaff(newMember);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingStaff ? "Edit Staff Member" : "Add Staff Member"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Staff name"
              required
            />
          </div>

          <div className="space-y-1">
            <Label>Role *</Label>
            <Select value={role} onValueChange={(v) => setRole(v as StaffRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Mobile number"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="hireDate">Hire Date</Label>
            <Input
              id="hireDate"
              type="date"
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="salary">Salary (₹)</Label>
              <Input
                id="salary"
                type="number"
                min={0}
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. 25000"
              />
            </div>
            <div className="space-y-1">
              <Label>Pay Period</Label>
              <Select
                value={payPeriod}
                onValueChange={(v) => setPayPeriod(v as PayPeriod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAY_PERIODS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingStaff ? "Save Changes" : "Add Staff"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
