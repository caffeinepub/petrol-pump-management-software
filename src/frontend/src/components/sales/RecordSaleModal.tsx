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
import { toast } from "sonner";
import {
  type FuelSale,
  type FuelType,
  type PaymentMethod,
  useAppStore,
} from "../../store/appStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "Card", "UPI", "Credit"];

export default function RecordSaleModal({ open, onClose }: Props) {
  const inventory = useAppStore((s) => s.inventory);
  const staff = useAppStore((s) => s.staff);
  const addFuelSale = useAppStore((s) => s.addFuelSale);
  const adjustStock = useAppStore((s) => s.adjustStock);
  const customers = useAppStore((s) => s.customers);

  const [fuelType, setFuelType] = useState<FuelType | "">("");
  const [litres, setLitres] = useState("");
  const [pricePerLitre, setPricePerLitre] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [pumpNumber, setPumpNumber] = useState("");
  const [recordedBy, setRecordedBy] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill price when fuel type changes
  useEffect(() => {
    if (fuelType) {
      const inv = inventory.find((i) => i.fuelType === fuelType);
      if (inv) setPricePerLitre(String(inv.pricePerLitre));
    }
  }, [fuelType, inventory]);

  // Reset form on open
  useEffect(() => {
    if (open) {
      setFuelType("");
      setLitres("");
      setPricePerLitre("");
      setPaymentMethod("");
      setPumpNumber("");
      setRecordedBy("");
      setCustomerId("");
      setErrors({});
    }
  }, [open]);

  const selectedInventory = inventory.find((i) => i.fuelType === fuelType);
  const litresNum = Number.parseFloat(litres) || 0;
  const priceNum = Number.parseFloat(pricePerLitre) || 0;
  const total = litresNum * priceNum;
  const stockOk = selectedInventory
    ? litresNum <= selectedInventory.currentStock
    : true;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fuelType) errs.fuelType = "Select a fuel type";
    if (!litres || litresNum <= 0) errs.litres = "Enter valid litres";
    if (!pricePerLitre || priceNum <= 0)
      errs.pricePerLitre = "Enter valid price";
    if (!paymentMethod) errs.paymentMethod = "Select payment method";
    if (!pumpNumber) errs.pumpNumber = "Enter pump number";
    if (!recordedBy) errs.recordedBy = "Select staff member";
    if (selectedInventory && litresNum > selectedInventory.currentStock) {
      errs.litres = `Insufficient stock (${selectedInventory.currentStock.toFixed(0)}L available)`;
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const customer = customers.find((c) => c.id === customerId);
      const staffMember = staff.find((s) => s.id === recordedBy);

      const newSale: FuelSale = {
        id: `sale-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        fuelType: fuelType as FuelType,
        litres: litresNum,
        quantity: litresNum,
        pricePerLitre: priceNum,
        pricePerLiter: priceNum,
        total,
        totalAmount: total,
        paymentMethod: paymentMethod as PaymentMethod,
        pumpNumber: Number.parseInt(pumpNumber, 10),
        recordedBy: staffMember?.name ?? recordedBy,
        staffName: staffMember?.name ?? recordedBy,
        customerId: customerId || undefined,
        customerName: customer?.name,
      };

      addFuelSale(newSale);

      if (selectedInventory) {
        adjustStock(
          selectedInventory.id,
          -litresNum,
          "Sale",
          staffMember?.name ?? recordedBy,
        );
      }

      toast.success(
        `Sale recorded: ${litresNum}L ${fuelType} for ₹${total.toFixed(2)}`,
      );
      onClose();
    } catch {
      toast.error("Failed to record sale. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fuelTypes = inventory.map((i) => i.fuelType);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Fuel Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fuel Type */}
          <div className="space-y-1">
            <Label>Fuel Type *</Label>
            <Select
              value={fuelType}
              onValueChange={(v) => {
                setFuelType(v as FuelType);
                setErrors((p) => ({ ...p, fuelType: "" }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                {fuelTypes.map((ft) => (
                  <SelectItem key={ft} value={ft}>
                    {ft}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fuelType && (
              <p className="text-destructive text-xs">{errors.fuelType}</p>
            )}
            {selectedInventory && (
              <p
                className={`text-xs ${stockOk ? "text-muted-foreground" : "text-destructive"}`}
              >
                Stock: {selectedInventory.currentStock.toFixed(0)}L available
              </p>
            )}
          </div>

          {/* Litres */}
          <div className="space-y-1">
            <Label htmlFor="litres">Litres *</Label>
            <Input
              id="litres"
              type="number"
              min={0}
              step={0.01}
              value={litres}
              onChange={(e) => {
                setLitres(e.target.value);
                setErrors((p) => ({ ...p, litres: "" }));
              }}
              placeholder="e.g. 20"
            />
            {errors.litres && (
              <p className="text-destructive text-xs">{errors.litres}</p>
            )}
          </div>

          {/* Price per litre */}
          <div className="space-y-1">
            <Label htmlFor="price">Price per Litre (₹) *</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step={0.01}
              value={pricePerLitre}
              onChange={(e) => {
                setPricePerLitre(e.target.value);
                setErrors((p) => ({ ...p, pricePerLitre: "" }));
              }}
              placeholder="e.g. 96.72"
            />
            {errors.pricePerLitre && (
              <p className="text-destructive text-xs">{errors.pricePerLitre}</p>
            )}
          </div>

          {/* Total */}
          {litresNum > 0 && priceNum > 0 && (
            <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm">
              <span className="text-muted-foreground">Total: </span>
              <span className="font-bold text-foreground">
                ₹{total.toFixed(2)}
              </span>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-1">
            <Label>Payment Method *</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => {
                setPaymentMethod(v as PaymentMethod);
                setErrors((p) => ({ ...p, paymentMethod: "" }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((pm) => (
                  <SelectItem key={pm} value={pm}>
                    {pm}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-destructive text-xs">{errors.paymentMethod}</p>
            )}
          </div>

          {/* Pump Number */}
          <div className="space-y-1">
            <Label htmlFor="pump">Pump Number *</Label>
            <Input
              id="pump"
              type="number"
              min={1}
              value={pumpNumber}
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

          {/* Staff */}
          <div className="space-y-1">
            <Label>Recorded By *</Label>
            <Select
              value={recordedBy}
              onValueChange={(v) => {
                setRecordedBy(v);
                setErrors((p) => ({ ...p, recordedBy: "" }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff
                  .filter((s) => s.isActive)
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.recordedBy && (
              <p className="text-destructive text-xs">{errors.recordedBy}</p>
            )}
          </div>

          {/* Customer (optional) */}
          <div className="space-y-1">
            <Label>Customer (optional)</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Walk-in / Select customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Walk-in</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Sale"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
