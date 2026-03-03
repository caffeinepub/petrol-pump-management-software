import React, { useState } from 'react';
import { useAppStore, Customer } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { UserPlus, Search, Pencil, Trash2 } from 'lucide-react';
import RegisterCustomerModal from '@/components/customers/RegisterCustomerModal';
import { useNavigate } from '@tanstack/react-router';

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function Customers() {
  const { customers, deleteCustomer } = useAppStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.includes(search) ||
      c.vehicleNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteCustomer(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground">Manage your customer database</p>
        </div>
        <Button onClick={handleOpenAdd} className="min-h-[44px] w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Register Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, contact, or vehicle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 min-h-[44px]"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-card border rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-muted-foreground">Total Customers</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{customers.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-muted-foreground">Active Today</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {customers.filter((c) => c.lastVisit === new Date().toISOString().split('T')[0]).length}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-3 sm:p-4 col-span-2 sm:col-span-1">
          <p className="text-xs sm:text-sm text-muted-foreground">Total Loyalty Points</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {customers.reduce((sum, c) => sum + c.loyaltyPoints, 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Customer</TableHead>
                <TableHead className="whitespace-nowrap">Contact</TableHead>
                <TableHead className="whitespace-nowrap hidden sm:table-cell">Vehicle No.</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Loyalty Pts</TableHead>
                <TableHead className="whitespace-nowrap hidden lg:table-cell">Total Purchases</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Last Visit</TableHead>
                <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/50">
                    <TableCell>
                      <button
                        className="font-medium text-primary hover:underline text-left"
                        onClick={() => navigate({ to: `/layout/customers/${customer.id}` })}
                      >
                        {customer.name}
                      </button>
                      <p className="text-xs text-muted-foreground sm:hidden">{customer.vehicleNumber}</p>
                    </TableCell>
                    <TableCell className="text-sm">{customer.contact}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{customer.vehicleNumber}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">{customer.loyaltyPoints} pts</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{formatINR(customer.totalPurchases)}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{customer.lastVisit}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEdit(customer)}
                          title="Edit customer"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(customer)}
                          title="Delete customer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Register / Edit Modal */}
      <RegisterCustomerModal
        open={modalOpen}
        onClose={handleCloseModal}
        editingCustomer={editingCustomer}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
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
