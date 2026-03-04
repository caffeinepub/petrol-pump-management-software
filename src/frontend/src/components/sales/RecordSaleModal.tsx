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
import { AlertTriangle } from "lucide-react";
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
  // Always use fuelInventory as the source of truth (inventory and fuelInventory are kept in sync)
  const fuelInventory = useAppStore((s) => s.fuelInventory);

  const staff = useAppStore((s) => s.staff);
  const addFuelSale = useAppStore((s) => s.addFuelSale);
  const adjustStock = useAppStore((s) => s.adjustStock);
  const customers = useAppStore((s) => s.customers);

  // Use string type to support any custom fuel type names, not just the FuelType union
  const [fuelType, setFuelType] = useState<string>("");
  const [litres, setLitres] = useState("");
  const [pricePerLitre, setPricePerLitre] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [pumpNumber, setPumpNumber] = useState("");
  const [recordedBy, setRecordedBy] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Treat undefined isActive as active (old persisted records may not have this field)
  const activeStaff = (staff ?? []).filter((s) => s.isActive !== false);
  const hasActiveStaff = activeStaff.length > 0;
  // Filter out any null/undefined fuelType entries from stale persisted data
  const fuelTypes = (fuelInventory ?? [])
    .map((i) => i.fuelType)
    .filter(Boolean);

  // Pre-fill price when fuel type changes
  useEffect(() => {
    if (fuelType) {
      const inv = fuelInventory.find((i) => i.fuelType === fuelType);
      if (inv && inv.pricePerLitre != null && inv.pricePerLitre > 0) {
        setPricePerLitre(String(inv.pricePerLitre));
      }
    }
  }, [fuelType, fuelInventory]);

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

  const selectedInventory = (fuelInventory ?? []).find(
    (i) => i.fuelType === fuelType,
  );
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
    if (!recordedBy)
      errs.recordedBy = hasActiveStaff
        ? "Select staff member"
        : "Enter staff name";
    if (selectedInventory && litresNum > selectedInventory.currentStock) {
      errs.litres = `Insufficient stock (${selectedInventory.currentStock.toFixed(0)}L available)`;
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const errs = validate();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }

      const customer = (customers ?? []).find((c) => c.id === customerId);
      // When using staff dropdown, recordedBy is the staff id; when text input, it's the name directly
      const staffMember = hasActiveStaff
        ? (staff ?? []).find((s) => s.id === recordedBy)
        : undefined;
      const staffName = staffMember?.name ?? recordedBy ?? "";

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
        pumpNumber: Number.parseInt(pumpNumber, 10) || 1,
        recordedBy: staffName,
        staffName: staffName,
        customerId: customerId || undefined,
        customerName: customer?.name,
      };

      addFuelSale(newSale);

      // Deduct stock from inventory if the matching tank is found
      if (selectedInventory) {
        adjustStock(selectedInventory.id, -litresNum, "Sale", staffName);
      }

      toast.success(
        `Sale recorded: ${litresNum}L ${fuelType} for ₹${total.toFixed(2)}`,
      );
      onClose();
    } catch (err) {
      console.error("Error recording sale:", err);
      toast.error("Failed to record sale. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Fuel Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warning when no fuel types are available */}
          {fuelTypes.length === 0 && (
            <div
              className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-700 dark:text-yellow-400"
              data-ocid="sale.error_state"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                No fuel types found. Please add fuel to{" "}
                <strong>Inventory</strong> first before recording a sale.
              </span>
            </div>
          )}

          {/* Fuel Type */}
          <div className="space-y-1">
            <Label>Fuel Type *</Label>
            <Select
              value={fuelType}
              onValueChange={(v) => {
                setFuelType(v);
                setErrors((p) => ({ ...p, fuelType: "" }));
              }}
              disabled={fuelTypes.length === 0}
            >
              <SelectTrigger data-ocid="sale.select">
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
              <p className="text-xs text-destructive">{errors.fuelType}</p>
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
              data-ocid="sale.input"
            />
            {errors.litres && (
              <p className="text-xs text-destructive">{errors.litres}</p>
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
              data-ocid="sale.input"
            />
            {errors.pricePerLitre && (
              <p className="text-xs text-destructive">{errors.pricePerLitre}</p>
            )}
          </div>

          {/* Total */}
          {litresNum > 0 && priceNum > 0 && (
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
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
              <SelectTrigger data-ocid="sale.select">
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
              <p className="text-xs text-destructive">{errors.paymentMethod}</p>
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
              data-ocid="sale.input"
            />
            {errors.pumpNumber && (
              <p className="text-xs text-destructive">{errors.pumpNumber}</p>
            )}
          </div>

          {/* Staff — dropdown if active staff exist, text input fallback otherwise */}
          <div className="space-y-1">
            <Label htmlFor="recordedBy">Recorded By *</Label>
            {hasActiveStaff ? (
              <Select
                value={recordedBy}
                onValueChange={(v) => {
                  setRecordedBy(v);
                  setErrors((p) => ({ ...p, recordedBy: "" }));
                }}
              >
                <SelectTrigger data-ocid="sale.select">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {activeStaff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="recordedBy"
                type="text"
                value={recordedBy}
                onChange={(e) => {
                  setRecordedBy(e.target.value);
                  setErrors((p) => ({ ...p, recordedBy: "" }));
                }}
                placeholder="Enter staff name"
                data-ocid="sale.input"
              />
            )}
            {errors.recordedBy && (
              <p className="text-xs text-destructive">{errors.recordedBy}</p>
            )}
          </div>

          {/* Customer (optional) */}
          <div className="space-y-1">
            <Label>Customer (optional)</Label>
            <Select
              value={customerId || "walk-in"}
              onValueChange={(v) => setCustomerId(v === "walk-in" ? "" : v)}
            >
              <SelectTrigger data-ocid="sale.select">
                <SelectValue placeholder="Walk-in / Select customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="walk-in">Walk-in</SelectItem>
                {(customers ?? []).map((c) => (
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
              data-ocid="sale.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={fuelTypes.length === 0}
              data-ocid="sale.submit_button"
            >
              Record Sale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
