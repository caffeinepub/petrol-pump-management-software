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
  type FuelType,
  type OrderStatus,
  type PurchaseOrder,
  useAppStore,
} from "../../store/appStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ORDER_STATUSES: OrderStatus[] = ["Pending", "Delivered", "Cancelled"];

export default function PurchaseOrderFormModal({ open, onClose }: Props) {
  const suppliers = useAppStore((s) => s.suppliers);
  const addPurchaseOrder = useAppStore((s) => s.addPurchaseOrder);

  const [supplierId, setSupplierId] = useState("");
  const [fuelType, setFuelType] = useState<FuelType | "">("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pricePerLitre, setPricePerLitre] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [status, setStatus] = useState<OrderStatus>("Pending");

  useEffect(() => {
    if (open) {
      setSupplierId("");
      setFuelType("");
      setInvoiceNumber("");
      setQuantity("");
      setPricePerLitre("");
      setOrderDate("");
      setExpectedDelivery("");
      setStatus("Pending");
    }
  }, [open]);

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);
  const availableFuelTypes: FuelType[] = selectedSupplier
    ? (selectedSupplier.fuelTypes ?? selectedSupplier.fuelTypesSupplied ?? [])
    : ["Petrol", "Diesel", "CNG", "LPG"];

  const qty = Number.parseFloat(quantity) || 0;
  const price = Number.parseFloat(pricePerLitre) || 0;
  const totalAmount = qty * price;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !fuelType || !quantity || !pricePerLitre) return;

    const supplier = suppliers.find((s) => s.id === supplierId);
    const order: PurchaseOrder = {
      id: `po-${Date.now()}`,
      supplierId,
      supplierName: supplier?.name ?? "",
      fuelType: fuelType as FuelType,
      quantity: qty,
      totalLitres: qty,
      pricePerLitre: price,
      litrePrice: price,
      totalAmount,
      invoicePrice: totalAmount,
      orderDate,
      invoiceDate: orderDate,
      expectedDelivery,
      expectedDeliveryDate: expectedDelivery,
      status,
      invoiceNumber: invoiceNumber || undefined,
    };
    addPurchaseOrder(order);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Supplier *</Label>
            <Select
              value={supplierId}
              onValueChange={(v) => {
                setSupplierId(v);
                setFuelType("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Fuel Type *</Label>
            <Select
              value={fuelType}
              onValueChange={(v) => setFuelType(v as FuelType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                {availableFuelTypes.map((ft) => (
                  <SelectItem key={ft} value={ft}>
                    {ft}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="e.g. INV-2026-001"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="quantity">Quantity (Litres) *</Label>
              <Input
                id="quantity"
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 5000"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="price">Price/Litre (₹) *</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={0.01}
                value={pricePerLitre}
                onChange={(e) => setPricePerLitre(e.target.value)}
                placeholder="e.g. 94.00"
                required
              />
            </div>
          </div>

          {qty > 0 && price > 0 && (
            <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm">
              <span className="text-muted-foreground">Total Amount: </span>
              <span className="font-bold text-foreground">
                ₹
                {totalAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="orderDate">Order Date</Label>
              <Input
                id="orderDate"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="delivery">Expected Delivery</Label>
              <Input
                id="delivery"
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as OrderStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Order</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
