import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore } from "@/store/appStore";
import { AlertTriangle, Fuel, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface FuelColorConfig {
  iconClass: string;
  progressClass: string;
  borderClass: string;
}

function getFuelColor(fuelType: string): FuelColorConfig {
  const type = fuelType.toLowerCase();
  if (type === "petrol") {
    return {
      iconClass: "text-orange-500",
      progressClass: "[&>div]:bg-orange-500",
      borderClass: "border-l-4 border-l-orange-400",
    };
  }
  if (type === "diesel") {
    return {
      iconClass: "text-blue-500",
      progressClass: "[&>div]:bg-blue-500",
      borderClass: "border-l-4 border-l-blue-400",
    };
  }
  if (type === "cng") {
    return {
      iconClass: "text-green-500",
      progressClass: "[&>div]:bg-green-500",
      borderClass: "border-l-4 border-l-green-400",
    };
  }
  if (type === "lpg") {
    return {
      iconClass: "text-purple-500",
      progressClass: "[&>div]:bg-purple-500",
      borderClass: "border-l-4 border-l-purple-400",
    };
  }
  if (type === "ev") {
    return {
      iconClass: "text-teal-500",
      progressClass: "[&>div]:bg-teal-500",
      borderClass: "border-l-4 border-l-teal-400",
    };
  }
  return {
    iconClass: "text-primary",
    progressClass: "",
    borderClass: "border-l-4 border-l-primary",
  };
}

export default function Inventory() {
  const {
    fuelInventory,
    updateFuelStock,
    updateFuelPrice,
    updateTankCapacity,
    deleteFuelTank,
  } = useAppStore();

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [removeStockModalOpen, setRemoveStockModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [capacityModalOpen, setCapacityModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tankToDelete, setTankToDelete] = useState<{
    id: string;
    fuelType: string;
  } | null>(null);
  const [selectedFuelId, setSelectedFuelId] = useState("");
  const [removeSelectedFuelId, setRemoveSelectedFuelId] = useState("");
  const [stockAmount, setStockAmount] = useState("");
  const [removeStockAmount, setRemoveStockAmount] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCapacity, setNewCapacity] = useState("");

  const lowStockItems = fuelInventory.filter(
    (f) => f.currentStock <= f.reorderLevel,
  );

  const handleAddStock = () => {
    const qty = Number.parseFloat(stockAmount);
    if (!selectedFuelId || Number.isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }
    updateFuelStock(selectedFuelId, qty);
    const item = fuelInventory.find((f) => f.id === selectedFuelId);
    toast.success(`Added ${qty}L to ${item?.fuelType ?? ""} stock.`);
    setStockModalOpen(false);
    setStockAmount("");
  };

  const handleRemoveStock = () => {
    const qty = Number.parseFloat(removeStockAmount);
    if (!removeSelectedFuelId || Number.isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }
    const item = fuelInventory.find((f) => f.id === removeSelectedFuelId);
    if (!item) {
      toast.error("Please select a fuel type.");
      return;
    }
    if (qty > item.currentStock) {
      toast.error(
        `Cannot remove ${qty}L — only ${item.currentStock.toLocaleString("en-IN")}L available in ${item.fuelType} tank.`,
      );
      return;
    }
    updateFuelStock(removeSelectedFuelId, -qty);
    toast.success(`Removed ${qty}L from ${item.fuelType} stock.`);
    setRemoveStockModalOpen(false);
    setRemoveStockAmount("");
  };

  const handleUpdatePrice = () => {
    const price = Number.parseFloat(newPrice);
    if (!selectedFuelId || Number.isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }
    updateFuelPrice(selectedFuelId, price);
    const item = fuelInventory.find((f) => f.id === selectedFuelId);
    toast.success(`Price updated for ${item?.fuelType ?? ""}.`);
    setPriceModalOpen(false);
    setNewPrice("");
  };

  const handleUpdateCapacity = () => {
    const cap = Number.parseFloat(newCapacity);
    const item = fuelInventory.find((f) => f.id === selectedFuelId);
    if (!selectedFuelId || Number.isNaN(cap) || cap <= 0) {
      toast.error("Please enter a valid capacity.");
      return;
    }
    if (item && cap < item.currentStock) {
      toast.error(
        `Capacity cannot be less than current stock (${item.currentStock.toLocaleString("en-IN")}L).`,
      );
      return;
    }
    updateTankCapacity(selectedFuelId, cap);
    toast.success(`Tank capacity updated for ${item?.fuelType ?? ""}.`);
    setCapacityModalOpen(false);
    setNewCapacity("");
  };

  const handleDeleteTank = () => {
    if (!tankToDelete) return;
    deleteFuelTank(tankToDelete.id);
    toast.success(`Tank "${tankToDelete.fuelType}" has been deleted.`);
    setDeleteConfirmOpen(false);
    setTankToDelete(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Inventory
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor and manage fuel stock levels
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="min-h-[44px]"
            onClick={() => {
              setSelectedFuelId(fuelInventory[0]?.id ?? "");
              setPriceModalOpen(true);
            }}
          >
            Update Price
          </Button>
          <Button
            variant="outline"
            className="min-h-[44px] border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            data-ocid="inventory.remove_stock.open_modal_button"
            onClick={() => {
              setRemoveSelectedFuelId(fuelInventory[0]?.id ?? "");
              setRemoveStockAmount("");
              setRemoveStockModalOpen(true);
            }}
          >
            <Minus className="mr-2 h-4 w-4" />
            Remove Stock
          </Button>
          <Button
            className="min-h-[44px]"
            onClick={() => {
              setSelectedFuelId(fuelInventory[0]?.id ?? "");
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
            <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">
              Low Stock Warning
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {lowStockItems.map((item) => (
              <span
                key={item.id}
                className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full"
              >
                {item.fuelType}: {item.currentStock.toLocaleString("en-IN")}L
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
          const colors = getFuelColor(item.fuelType);
          return (
            <div
              key={item.id}
              className={`bg-card border rounded-lg p-4 space-y-3 ${colors.borderClass}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fuel className={`h-4 w-4 ${colors.iconClass}`} />
                  <span className="font-semibold text-sm text-foreground">
                    {item.fuelType}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {isLow && (
                    <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                      Low
                    </span>
                  )}
                  <button
                    type="button"
                    data-ocid="inventory.tank.delete_button"
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                    title="Delete tank"
                    onClick={() => {
                      setTankToDelete({ id: item.id, fuelType: item.fuelType });
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{item.currentStock.toLocaleString("en-IN")}L</span>
                  <div className="flex items-center gap-1">
                    <span>{item.capacity.toLocaleString("en-IN")}L</span>
                    <button
                      type="button"
                      data-ocid="inventory.capacity.edit_button"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="Edit tank capacity"
                      onClick={() => {
                        setSelectedFuelId(item.id);
                        setNewCapacity(String(item.capacity));
                        setCapacityModalOpen(true);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <Progress
                  value={pct}
                  className={`h-3 ${isLow ? "[&>div]:bg-destructive" : colors.progressClass}`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {pct}% capacity
                </p>
              </div>
              <div className="pt-1 border-t">
                <p className="text-xs text-muted-foreground">Price per Litre</p>
                <p className="text-sm font-semibold text-foreground">
                  ₹{item.pricePerLitre.toFixed(2)}
                </p>
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
                <TableHead className="whitespace-nowrap">
                  Current Stock
                </TableHead>
                <TableHead className="whitespace-nowrap hidden sm:table-cell">
                  Capacity
                </TableHead>
                <TableHead className="whitespace-nowrap">Price/L</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">
                  Reorder Level
                </TableHead>
                <TableHead className="whitespace-nowrap hidden lg:table-cell">
                  Last Updated
                </TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fuelInventory.map((item) => {
                const isLow = item.currentStock <= item.reorderLevel;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.fuelType}
                    </TableCell>
                    <TableCell>
                      {item.currentStock.toLocaleString("en-IN")} L
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {item.capacity.toLocaleString("en-IN")} L
                    </TableCell>
                    <TableCell>₹{item.pricePerLitre.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.reorderLevel.toLocaleString("en-IN")} L
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {item.lastUpdated}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          isLow
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {isLow ? "Low Stock" : "Adequate"}
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
      <Dialog
        open={stockModalOpen}
        onOpenChange={(v) => !v && setStockModalOpen(false)}
      >
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
                  <option key={f.id} value={f.id}>
                    {f.fuelType}
                  </option>
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
            <Button
              variant="outline"
              onClick={() => setStockModalOpen(false)}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStock}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Stock Modal */}
      <Dialog
        open={removeStockModalOpen}
        onOpenChange={(v) => {
          if (!v) {
            setRemoveStockModalOpen(false);
            setRemoveStockAmount("");
          }
        }}
      >
        <DialogContent
          className="w-full max-w-sm mx-auto"
          data-ocid="inventory.remove_stock.dialog"
        >
          <DialogHeader>
            <DialogTitle>Remove Fuel Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Fuel Type</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[44px]"
                value={removeSelectedFuelId}
                onChange={(e) => setRemoveSelectedFuelId(e.target.value)}
                data-ocid="inventory.remove_stock.select"
              >
                {fuelInventory.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fuelType}
                  </option>
                ))}
              </select>
            </div>
            {removeSelectedFuelId && (
              <p className="text-xs text-muted-foreground">
                Available stock:{" "}
                <span className="font-medium text-foreground">
                  {fuelInventory
                    .find((f) => f.id === removeSelectedFuelId)
                    ?.currentStock.toLocaleString("en-IN")}
                  L
                </span>
              </p>
            )}
            <div className="space-y-1">
              <Label>Quantity to Remove (Litres)</Label>
              <Input
                type="number"
                min="1"
                placeholder="Enter quantity"
                value={removeStockAmount}
                onChange={(e) => setRemoveStockAmount(e.target.value)}
                className="min-h-[44px]"
                data-ocid="inventory.remove_stock.input"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRemoveStockModalOpen(false);
                setRemoveStockAmount("");
              }}
              className="min-h-[44px] w-full sm:w-auto"
              data-ocid="inventory.remove_stock.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveStock}
              className="min-h-[44px] w-full sm:w-auto"
              data-ocid="inventory.remove_stock.submit_button"
            >
              <Minus className="mr-2 h-4 w-4" />
              Remove Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Tank Capacity Modal */}
      <Dialog
        open={capacityModalOpen}
        onOpenChange={(v) => !v && setCapacityModalOpen(false)}
      >
        <DialogContent
          className="w-full max-w-sm mx-auto"
          data-ocid="inventory.capacity.dialog"
        >
          <DialogHeader>
            <DialogTitle>Update Tank Capacity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Fuel Type</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[44px]"
                value={selectedFuelId}
                onChange={(e) => {
                  setSelectedFuelId(e.target.value);
                  const item = fuelInventory.find(
                    (f) => f.id === e.target.value,
                  );
                  if (item) setNewCapacity(String(item.capacity));
                }}
                data-ocid="inventory.capacity.select"
              >
                {fuelInventory.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fuelType}
                  </option>
                ))}
              </select>
            </div>
            {selectedFuelId && (
              <p className="text-xs text-muted-foreground">
                Current stock:{" "}
                {fuelInventory
                  .find((f) => f.id === selectedFuelId)
                  ?.currentStock.toLocaleString("en-IN")}
                L (new capacity must be at least this value)
              </p>
            )}
            <div className="space-y-1">
              <Label>New Tank Capacity (Litres)</Label>
              <Input
                type="number"
                min="1"
                placeholder="Enter new capacity"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                className="min-h-[44px]"
                data-ocid="inventory.capacity.input"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setCapacityModalOpen(false)}
              className="min-h-[44px] w-full sm:w-auto"
              data-ocid="inventory.capacity.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCapacity}
              className="min-h-[44px] w-full sm:w-auto"
              data-ocid="inventory.capacity.save_button"
            >
              Update Capacity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tank Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent data-ocid="inventory.tank.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tank</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the{" "}
              <strong>{tankToDelete?.fuelType}</strong> tank? This action cannot
              be undone and all associated stock data will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="inventory.tank.delete.cancel_button"
              onClick={() => setTankToDelete(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="inventory.tank.delete.confirm_button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteTank}
            >
              Delete Tank
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Price Modal */}
      <Dialog
        open={priceModalOpen}
        onOpenChange={(v) => !v && setPriceModalOpen(false)}
      >
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
                  <option key={f.id} value={f.id}>
                    {f.fuelType}
                  </option>
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
            <Button
              variant="outline"
              onClick={() => setPriceModalOpen(false)}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePrice}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Update Price
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
