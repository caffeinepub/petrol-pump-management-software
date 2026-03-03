import React, { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, AlertTriangle, Fuel } from 'lucide-react';
import { toast } from 'sonner';

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

export default function Inventory() {
  const { fuelInventory, updateFuelStock, updateFuelPrice } = useAppStore();

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedFuelId, setSelectedFuelId] = useState('');
  const [stockAmount, setStockAmount] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const lowStockItems = fuelInventory.filter((f) => f.currentStock <= f.reorderLevel);

  const handleAddStock = () => {
    const qty = parseFloat(stockAmount);
    if (!selectedFuelId || isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity.');
      return;
    }
    updateFuelStock(selectedFuelId, qty);
    const item = fuelInventory.find(f => f.id === selectedFuelId);
    toast.success(`Added ${qty}L to ${item?.fuelType ?? ''} stock.`);
    setStockModalOpen(false);
    setStockAmount('');
  };

  const handleUpdatePrice = () => {
    const price = parseFloat(newPrice);
    if (!selectedFuelId || isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price.');
      return;
    }
    updateFuelPrice(selectedFuelId, price);
    const item = fuelInventory.find(f => f.id === selectedFuelId);
    toast.success(`Price updated for ${item?.fuelType ?? ''}.`);
    setPriceModalOpen(false);
    setNewPrice('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground">Monitor and manage fuel stock levels</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="min-h-[44px]"
            onClick={() => {
              setSelectedFuelId(fuelInventory[0]?.id ?? '');
              setPriceModalOpen(true);
            }}
          >
            Update Price
          </Button>
          <Button
            className="min-h-[44px]"
            onClick={() => {
              setSelectedFuelId(fuelInventory[0]?.id ?? '');
              setStockModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">Low Stock Warning</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {lowStockItems.map((item) => (
              <span key={item.id} className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full">
                {item.fuelType}: {item.currentStock.toLocaleString('en-IN')}L
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stock Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {fuelInventory.map((item) => {
          const pct = Math.round((item.currentStock / item.capacity) * 100);
          const isLow = item.currentStock <= item.reorderLevel;
          return (
            <div key={item.id} className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fuel className={`h-4 w-4 ${isLow ? 'text-destructive' : 'text-primary'}`} />
                  <span className="font-semibold text-sm text-foreground">{item.fuelType}</span>
                </div>
                {isLow && (
                  <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Low</span>
                )}
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{item.currentStock.toLocaleString('en-IN')}L</span>
                  <span>{item.capacity.toLocaleString('en-IN')}L</span>
                </div>
                <Progress value={pct} className={`h-3 ${isLow ? '[&>div]:bg-destructive' : ''}`} />
                <p className="text-xs text-muted-foreground mt-1">{pct}% capacity</p>
              </div>
              <div className="pt-1 border-t">
                <p className="text-xs text-muted-foreground">Price per Litre</p>
                <p className="text-sm font-semibold text-foreground">₹{item.pricePerLitre.toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inventory Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-foreground">Inventory Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fuel Type</TableHead>
                <TableHead className="whitespace-nowrap">Current Stock</TableHead>
                <TableHead className="whitespace-nowrap hidden sm:table-cell">Capacity</TableHead>
                <TableHead className="whitespace-nowrap">Price/L</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Reorder Level</TableHead>
                <TableHead className="whitespace-nowrap hidden lg:table-cell">Last Updated</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fuelInventory.map((item) => {
                const isLow = item.currentStock <= item.reorderLevel;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.fuelType}</TableCell>
                    <TableCell>{item.currentStock.toLocaleString('en-IN')} L</TableCell>
                    <TableCell className="hidden sm:table-cell">{item.capacity.toLocaleString('en-IN')} L</TableCell>
                    <TableCell>₹{item.pricePerLitre.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.reorderLevel.toLocaleString('en-IN')} L</TableCell>
                    <TableCell className="hidden lg:table-cell">{item.lastUpdated}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        isLow
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {isLow ? 'Low Stock' : 'Adequate'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Stock Modal */}
      <Dialog open={stockModalOpen} onOpenChange={(v) => !v && setStockModalOpen(false)}>
        <DialogContent className="w-full max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Add Fuel Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Fuel Type</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[44px]"
                value={selectedFuelId}
                onChange={(e) => setSelectedFuelId(e.target.value)}
              >
                {fuelInventory.map((f) => (
                  <option key={f.id} value={f.id}>{f.fuelType}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Quantity to Add (Litres)</Label>
              <Input
                type="number"
                min="1"
                placeholder="Enter quantity"
                value={stockAmount}
                onChange={(e) => setStockAmount(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setStockModalOpen(false)} className="min-h-[44px] w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleAddStock} className="min-h-[44px] w-full sm:w-auto">Add Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Price Modal */}
      <Dialog open={priceModalOpen} onOpenChange={(v) => !v && setPriceModalOpen(false)}>
        <DialogContent className="w-full max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Update Fuel Price</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Fuel Type</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[44px]"
                value={selectedFuelId}
                onChange={(e) => setSelectedFuelId(e.target.value)}
              >
                {fuelInventory.map((f) => (
                  <option key={f.id} value={f.id}>{f.fuelType}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>New Price per Litre (₹)</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter new price"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setPriceModalOpen(false)} className="min-h-[44px] w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleUpdatePrice} className="min-h-[44px] w-full sm:w-auto">Update Price</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
