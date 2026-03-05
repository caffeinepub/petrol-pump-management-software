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
  const [invoicePrice, setInvoicePrice] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [status, setStatus] = useState<OrderStatus>("Pending");

  useEffect(() => {
    if (open) {
      setSupplierId("");
      setFuelType("");
      setInvoiceNumber("");
      setQuantity("");
      setInvoicePrice("");
      setOrderDate("");
      setInvoiceDate("");
      setExpectedDelivery("");
      setStatus("Pending");
    }
  }, [open]);

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);
  const availableFuelTypes: (FuelType | string)[] = selectedSupplier
    ? (selectedSupplier.fuelTypes ?? selectedSupplier.fuelTypesSupplied ?? [])
    : ["Petrol", "Diesel", "CNG", "LPG"];

  const qty = Number.parseFloat(quantity) || 0;
  const invPrice = Number.parseFloat(invoicePrice) || 0;
  const pricePerLitre = qty > 0 ? invPrice / qty : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !fuelType || !quantity || !invoicePrice) return;

    const supplier = suppliers.find((s) => s.id === supplierId);
    const order: PurchaseOrder = {
      id: `po-${Date.now()}`,
      supplierId,
      supplierName: supplier?.name ?? "",
      fuelType: fuelType as FuelType,
      quantity: qty,
      totalLitres: qty,
      pricePerLitre,
      litrePrice: pricePerLitre,
      totalAmount: invPrice,
      invoicePrice: invPrice,
      orderDate,
      invoiceDate: invoiceDate || orderDate,
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
                data-ocid="purchase_order.quantity.input"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="invoicePrice">Invoice Price (₹) *</Label>
              <Input
                id="invoicePrice"
                type="number"
                min={0}
                step={0.01}
                value={invoicePrice}
                onChange={(e) => setInvoicePrice(e.target.value)}
                placeholder="e.g. 470000"
                data-ocid="purchase_order.invoice_price.input"
                required
              />
            </div>
          </div>

          {qty > 0 && invPrice > 0 && (
            <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm space-y-1">
              <div>
                <span className="text-muted-foreground">Price per Litre: </span>
                <span className="font-bold text-foreground">
                  ₹
                  {pricePerLitre.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </span>
                <span className="text-muted-foreground text-xs ml-1">
                  (Invoice Price ÷ Quantity)
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                data-ocid="purchase_order.invoice_date.input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="orderDate">Order Date</Label>
              <Input
                id="orderDate"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                data-ocid="purchase_order.order_date.input"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="delivery">Expected Delivery</Label>
            <Input
              id="delivery"
              type="date"
              value={expectedDelivery}
              onChange={(e) => setExpectedDelivery(e.target.value)}
              data-ocid="purchase_order.expected_delivery.input"
            />
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
