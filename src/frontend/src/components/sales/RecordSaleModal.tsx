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

  const [fuelType, setFuelType] = useState<string>("");
  const [startTotalizer, setStartTotalizer] = useState("");
  const [endTotalizer, setEndTotalizer] = useState("");
  const [saleDate, setSaleDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
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

  const startNum = Number.parseFloat(startTotalizer) || 0;
  const endNum = Number.parseFloat(endTotalizer) || 0;
  const litresDispensed = endNum > startNum ? endNum - startNum : 0;

  const selectedInventory = (fuelInventory ?? []).find(
    (i) => i.fuelType === fuelType,
  );
  const stockOk = selectedInventory
    ? litresDispensed <= selectedInventory.currentStock
    : true;

  // Reset form on open
  useEffect(() => {
    if (open) {
      setFuelType("");
      setStartTotalizer("");
      setEndTotalizer("");
      setSaleDate(new Date().toISOString().split("T")[0]);
      setPaymentMethod("");
      setPumpNumber("");
      setRecordedBy("");
      setCustomerId("");
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fuelType) errs.fuelType = "Select a fuel type";
    if (!startTotalizer || startNum < 0)
      errs.startTotalizer = "Enter valid start totalizer reading";
    if (!endTotalizer || endNum <= 0)
      errs.endTotalizer = "Enter valid end totalizer reading";
    if (endNum <= startNum)
      errs.endTotalizer = "End totalizer must be greater than start totalizer";
    if (!saleDate) errs.saleDate = "Enter sale date";
    if (!paymentMethod) errs.paymentMethod = "Select payment method";
    if (!pumpNumber) errs.pumpNumber = "Enter pump number";
    if (!recordedBy)
      errs.recordedBy = hasActiveStaff
        ? "Select staff member"
        : "Enter staff name";
    if (selectedInventory && litresDispensed > selectedInventory.currentStock) {
      errs.endTotalizer = `Insufficient stock (${selectedInventory.currentStock.toFixed(0)}L available)`;
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
        date: saleDate,
        saleDate: saleDate,
        fuelType: fuelType as FuelType,
        startTotalizer: startNum,
        endTotalizer: endNum,
        litres: litresDispensed,
        quantity: litresDispensed,
        total: 0,
        totalAmount: 0,
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
        adjustStock(selectedInventory.id, -litresDispensed, "Sale", staffName);
      }

      toast.success(
        `Sale recorded: ${litresDispensed.toFixed(2)}L ${fuelType} dispensed`,
      );
      onClose();
    } catch (err) {
      console.error("Error recording sale:", err);
      toast.error("Failed to record sale. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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

          {/* Sale Date */}
          <div className="space-y-1">
            <Label htmlFor="saleDate">Sale Date *</Label>
            <Input
              id="saleDate"
              type="date"
              value={saleDate}
              onChange={(e) => {
                setSaleDate(e.target.value);
                setErrors((p) => ({ ...p, saleDate: "" }));
              }}
              data-ocid="sale.input"
            />
            {errors.saleDate && (
              <p className="text-xs text-destructive">{errors.saleDate}</p>
            )}
          </div>

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

          {/* Start Totalizer */}
          <div className="space-y-1">
            <Label htmlFor="startTotalizer">Start Totalizer *</Label>
            <Input
              id="startTotalizer"
              type="number"
              min={0}
              step={0.01}
              value={startTotalizer}
              onChange={(e) => {
                setStartTotalizer(e.target.value);
                setErrors((p) => ({ ...p, startTotalizer: "" }));
              }}
              placeholder="e.g. 1200.00"
              data-ocid="sale.input"
            />
            {errors.startTotalizer && (
              <p className="text-xs text-destructive">
                {errors.startTotalizer}
              </p>
            )}
          </div>

          {/* End Totalizer */}
          <div className="space-y-1">
            <Label htmlFor="endTotalizer">End Totalizer *</Label>
            <Input
              id="endTotalizer"
              type="number"
              min={0}
              step={0.01}
              value={endTotalizer}
              onChange={(e) => {
                setEndTotalizer(e.target.value);
                setErrors((p) => ({ ...p, endTotalizer: "" }));
              }}
              placeholder="e.g. 1220.00"
              data-ocid="sale.input"
            />
            {errors.endTotalizer && (
              <p className="text-xs text-destructive">{errors.endTotalizer}</p>
            )}
          </div>

          {/* Litres Dispensed (derived) */}
          {startTotalizer && endTotalizer && endNum > startNum && (
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Litres Dispensed: </span>
              <span className="font-bold text-foreground">
                {litresDispensed.toFixed(2)} L
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
