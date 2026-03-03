import React, { useState } from 'react';
import { useAppStore, StaffMember } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, UserPlus, Pencil, Trash2, Plus } from 'lucide-react';
import StaffFormModal from '@/components/staff/StaffFormModal';
import ShiftFormModal from '@/components/staff/ShiftFormModal';

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const toMonthly = (salary: number, period: 'monthly' | 'annual'): number =>
  period === 'annual' ? salary / 12 : salary;

const formatSalary = (salary: number, period: 'monthly' | 'annual'): string => {
  const label = period === 'monthly' ? '/ month' : '/ year';
  return `${formatINR(salary)} ${label}`;
};

const shiftTimeColor: Record<string, string> = {
  '06:00': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  '14:00': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  '22:00': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

const shiftStatusColor: Record<string, string> = {
  Scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Absent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function StaffManagement() {
  const { staff, shifts, deleteStaff } = useAppStore();
  const [search, setSearch] = useState('');
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase())
  );

  const totalMonthlyPayroll = staff.reduce(
    (sum, s) => sum + toMonthly(s.salary ?? 0, s.salaryPeriod ?? 'monthly'),
    0
  );

  const handleAddStaff = () => {
    setEditingStaff(null);
    setStaffModalOpen(true);
  };

  const handleEditStaff = (member: StaffMember) => {
    setEditingStaff(member);
    setStaffModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteStaff(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Staff Management</h1>
          <p className="text-sm text-muted-foreground">Manage your team and shift schedules</p>
        </div>
        <Button onClick={handleAddStaff} className="min-h-[44px] w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-card border rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-muted-foreground">Total Staff</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{staff.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {staff.filter((s) => s.isActive).length}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-3 sm:p-4 col-span-2 sm:col-span-1">
          <p className="text-xs sm:text-sm text-muted-foreground">Monthly Payroll</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {formatINR(totalMonthlyPayroll)}
          </p>
        </div>
      </div>

      <Tabs defaultValue="directory">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="directory" className="flex-1 sm:flex-none">Staff Directory</TabsTrigger>
          <TabsTrigger value="schedule" className="flex-1 sm:flex-none">Shift Schedule</TabsTrigger>
        </TabsList>

        {/* Staff Directory */}
        <TabsContent value="directory" className="space-y-4 mt-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 min-h-[44px]"
            />
          </div>

          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Name</TableHead>
                    <TableHead className="whitespace-nowrap">Role</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">Contact</TableHead>
                    <TableHead className="whitespace-nowrap hidden lg:table-cell">Salary</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{member.contact}</p>
                      </TableCell>
                      <TableCell className="text-sm">{member.role}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{member.contact}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm whitespace-nowrap">
                        {member.salary > 0
                          ? formatSalary(member.salary, member.salaryPeriod ?? 'monthly')
                          : <span className="text-muted-foreground">—</span>
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.isActive ? 'default' : 'secondary'}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleEditStaff(member)}
                            title="Edit staff member"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(member)}
                            title="Delete staff member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredStaff.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No staff members found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Shift Schedule */}
        <TabsContent value="schedule" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => setShiftModalOpen(true)} className="min-h-[44px]">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Shift
            </Button>
          </div>
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Staff</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Time</TableHead>
                    <TableHead className="whitespace-nowrap hidden md:table-cell">Pump</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No shifts scheduled.
                      </TableCell>
                    </TableRow>
                  ) : (
                    shifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell>
                          <p className="font-medium text-foreground">{shift.staffName}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{shift.date}</p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{shift.date}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${shiftTimeColor[shift.startTime] ?? 'bg-muted text-muted-foreground'}`}>
                            {shift.startTime} – {shift.endTime}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">Pump {shift.pumpNumber}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${shiftStatusColor[shift.status] ?? ''}`}>
                            {shift.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <StaffFormModal
        open={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        editingStaff={editingStaff}
      />

      <ShiftFormModal
        open={shiftModalOpen}
        onClose={() => setShiftModalOpen(false)}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
