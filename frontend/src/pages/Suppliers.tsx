import React, { useState } from 'react';
import { useAppStore, Supplier, PurchaseOrder } from '@/store/appStore';
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
import { Plus, Search, Star, Pencil, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import SupplierFormModal from '@/components/suppliers/SupplierFormModal';
import PurchaseOrderFormModal from '@/components/suppliers/PurchaseOrderFormModal';

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const statusColor: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function Suppliers() {
  const { suppliers, purchaseOrders, deleteSupplier, updateOrderStatus } = useAppStore();

  const [search, setSearch] = useState('');
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteSupplier(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Suppliers</h1>
          <p className="text-sm text-muted-foreground">Manage fuel suppliers and purchase orders</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setOrderModalOpen(true)} className="min-h-[44px]">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
          <Button onClick={handleOpenAddSupplier} className="min-h-[44px]">
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </div>

      <Tabs defaultValue="directory">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="directory" className="flex-1 sm:flex-none">Supplier Directory</TabsTrigger>
          <TabsTrigger value="orders" className="flex-1 sm:flex-none">Purchase Orders</TabsTrigger>
        </TabsList>

        {/* Supplier Directory Tab */}
        <TabsContent value="directory" className="space-y-4 mt-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuppliers.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-8">
                No suppliers found.
              </div>
            ) : (
              filteredSuppliers.map((supplier) => (
                <div key={supplier.id} className="bg-card border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{supplier.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">{supplier.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEditSupplier(supplier)}
                        title="Edit supplier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(supplier)}
                        title="Delete supplier"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{supplier.contact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{supplier.address}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {supplier.fuelTypesSupplied.map((ft) => (
                      <Badge key={ft} variant="secondary" className="text-xs">{ft}</Badge>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Last delivery: {supplier.lastDelivery}
                  </p>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="orders" className="space-y-4 mt-4">
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Order ID</TableHead>
                    <TableHead className="whitespace-nowrap">Supplier</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">Fuel Type</TableHead>
                    <TableHead className="whitespace-nowrap hidden md:table-cell">Invoice No.</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">Total Litres</TableHead>
                    <TableHead className="whitespace-nowrap hidden md:table-cell">Litre Price</TableHead>
                    <TableHead className="whitespace-nowrap hidden md:table-cell">Invoice Price</TableHead>
                    <TableHead className="whitespace-nowrap hidden lg:table-cell">Invoice Date</TableHead>
                    <TableHead className="whitespace-nowrap hidden lg:table-cell">Expected</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap hidden md:table-cell">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                        No purchase orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchaseOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.id}</TableCell>
                        <TableCell className="text-sm">
                          <span>{order.supplierName}</span>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {order.fuelType} · {order.totalLitres.toLocaleString('en-IN')}L
                          </p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{order.fuelType}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm font-mono">
                          {order.invoiceNumber || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">
                          {order.totalLitres.toLocaleString('en-IN')} L
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          &#8377;{order.litrePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {formatINR(order.invoicePrice)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{order.invoiceDate}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{order.expectedDeliveryDate}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.status]}`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {order.status === 'Pending' && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-8"
                                onClick={() => updateOrderStatus(order.id, 'Delivered')}
                              >
                                Mark Delivered
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs h-8 text-destructive hover:text-destructive"
                                onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
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

      {/* Supplier Form Modal */}
      <SupplierFormModal
        open={supplierModalOpen}
        onClose={() => { setSupplierModalOpen(false); setEditingSupplier(null); }}
        editingSupplier={editingSupplier}
      />

      {/* Purchase Order Modal */}
      <PurchaseOrderFormModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
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
