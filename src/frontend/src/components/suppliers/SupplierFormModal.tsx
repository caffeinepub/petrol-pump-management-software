import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type React from "react";
import { useEffect, useState } from "react";
import {
  type FuelType,
  type Supplier,
  useAppStore,
} from "../../store/appStore";

interface Props {
  open: boolean;
  onClose: () => void;
  editingSupplier?: Supplier | null;
}

const ALL_FUEL_TYPES: FuelType[] = ["Petrol", "Diesel", "CNG", "LPG", "EV"];

export default function SupplierFormModal({
  open,
  onClose,
  editingSupplier,
}: Props) {
  const addSupplier = useAppStore((s) => s.addSupplier);
  const updateSupplier = useAppStore((s) => s.updateSupplier);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [fuelTypes, setFuelTypes] = useState<(FuelType | string)[]>([]);
  const [rating, setRating] = useState("");

  useEffect(() => {
    if (open) {
      if (editingSupplier) {
        setName(editingSupplier.name);
        setContact(editingSupplier.contact);
        setEmail(editingSupplier.email);
        setAddress(editingSupplier.address);
        setFuelTypes(
          editingSupplier.fuelTypes ?? editingSupplier.fuelTypesSupplied ?? [],
        );
        setRating(String(editingSupplier.rating));
      } else {
        setName("");
        setContact("");
        setEmail("");
        setAddress("");
        setFuelTypes([]);
        setRating("");
      }
    }
  }, [open, editingSupplier]);

  const toggleFuelType = (ft: FuelType) => {
    setFuelTypes((prev) =>
      prev.includes(ft) ? prev.filter((f) => f !== ft) : [...prev, ft],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, {
        name: name.trim(),
        contact: contact.trim(),
        email: email.trim(),
        address: address.trim(),
        fuelTypes,
        fuelTypesSupplied: fuelTypes,
        rating: Number.parseFloat(rating) || editingSupplier.rating,
      });
    } else {
      const newSupplier: Supplier = {
        id: `sup-${Date.now()}`,
        name: name.trim(),
        contact: contact.trim(),
        email: email.trim(),
        address: address.trim(),
        fuelTypes,
        fuelTypesSupplied: fuelTypes,
        rating: Number.parseFloat(rating) || 4.0,
        lastDelivery: "",
      };
      addSupplier(newSupplier);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingSupplier ? "Edit Supplier" : "Add Supplier"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Supplier Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Company name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="City, State"
            />
          </div>

          <div className="space-y-2">
            <Label>Fuel Types Supplied</Label>
            <div className="flex flex-wrap gap-3">
              {ALL_FUEL_TYPES.map((ft) => (
                <label
                  key={ft}
                  htmlFor={`fuel-${ft}`}
                  className="flex items-center gap-1.5 cursor-pointer text-sm"
                >
                  <Checkbox
                    id={`fuel-${ft}`}
                    checked={fuelTypes.includes(ft)}
                    onCheckedChange={() => toggleFuelType(ft)}
                  />
                  {ft}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="rating">Rating (1–5)</Label>
            <Input
              id="rating"
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="e.g. 4.5"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingSupplier ? "Save Changes" : "Add Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
