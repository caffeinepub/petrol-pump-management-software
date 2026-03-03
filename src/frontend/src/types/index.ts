// ── Fuel Types ──────────────────────────────────────────────────────────────
export type FuelType = "Petrol" | "Diesel" | "Premium";
export type PaymentMethod = "Cash" | "Card" | "Credit";
export type ShiftStatus = "Scheduled" | "Active" | "Completed";
export type OrderStatus = "Pending" | "Delivered" | "Cancelled";
export type InvoiceStatus = "Paid" | "Unpaid";
export type ExpenseCategory =
  | "Maintenance"
  | "Utilities"
  | "Salaries"
  | "Other";
export type StaffStatus = "Active" | "Inactive";
export type SalaryPeriod = "monthly" | "annual";

// ── Fuel Sales ───────────────────────────────────────────────────────────────
export interface FuelSale {
  id: string;
  date: string; // ISO string
  fuelType: FuelType;
  quantity: number; // liters
  pricePerLiter: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  pumpNumber: number;
  staffId: string;
  staffName: string;
  customerId?: string;
  customerName?: string;
  invoiceId: string;
}

// ── Inventory ────────────────────────────────────────────────────────────────
export interface StockLevel {
  fuelType: FuelType;
  currentLevel: number; // liters
  capacity: number; // liters
  threshold: number; // liters - low stock alert
}

export interface StockHistoryEntry {
  id: string;
  date: string;
  fuelType: FuelType;
  changeAmount: number; // positive = add, negative = subtract
  reason: string;
  recordedBy: string;
  type: "adjustment" | "sale" | "purchase";
}

// ── Staff ────────────────────────────────────────────────────────────────────
export interface Staff {
  id: string;
  name: string;
  role: string;
  contact: string;
  hireDate: string;
  status: StaffStatus;
  salary: number;
  salaryPeriod: SalaryPeriod;
}

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  pumpNumber: number;
  status: ShiftStatus;
}

// ── Customers ────────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  contact: string;
  vehicleNumber: string;
  registrationDate: string;
  totalPurchaseVolume: number; // liters
  loyaltyPoints: number;
}

export interface CustomerPurchase {
  id: string;
  date: string;
  fuelType: FuelType;
  quantity: number;
  amount: number;
  pointsEarned: number;
}

// ── Billing ──────────────────────────────────────────────────────────────────
export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId?: string;
  customerName: string;
  saleId: string;
  fuelType: FuelType;
  quantity: number;
  pricePerLiter: number;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
}

// ── Suppliers ────────────────────────────────────────────────────────────────
export interface Supplier {
  id: string;
  name: string;
  contact: string;
  fuelTypesSupplied: FuelType[];
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  fuelType: FuelType;
  quantityOrdered: number; // liters (same as totalLitres)
  invoiceNumber?: string; // optional user-entered invoice number
  invoicePrice: number; // total invoice cost
  invoiceDate: string; // ISO date string
  totalLitres: number; // total litres ordered
  litrePrice: number; // derived: invoicePrice / totalLitres
  totalCost: number; // same as invoicePrice for compatibility
  orderDate: string;
  expectedDeliveryDate: string;
  status: OrderStatus;
}

// ── Expenses ─────────────────────────────────────────────────────────────────
export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  recordedBy: string;
}

// ── Reports ──────────────────────────────────────────────────────────────────
export interface DailySummaryRow {
  fuelType: FuelType;
  volume: number;
  revenue: number;
  avgPrice: number;
}

export interface MonthlySalesTrendPoint {
  day: number;
  revenue: number;
  volume: number;
}
