import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FuelType = "Petrol" | "Diesel" | "CNG" | "LPG" | "EV";

export type PaymentMethod = "Cash" | "Card" | "UPI" | "Credit";

export type StaffRole =
  | "Manager"
  | "Attendant"
  | "Cashier"
  | "Technician"
  | "Security";

export type PayPeriod = "monthly" | "annual";

// Aliases for backward compat
export type SalaryPeriod = PayPeriod;

export type ShiftStatus = "Scheduled" | "Completed" | "Absent";

export type OrderStatus = "Pending" | "Delivered" | "Cancelled";

export type InvoiceStatus = "Paid" | "Pending" | "Overdue";

export type ExpenseCategory =
  | "Fuel Purchase"
  | "Maintenance"
  | "Utilities"
  | "Salaries"
  | "Equipment"
  | "Other";

export interface FuelInventory {
  id: string;
  fuelType: FuelType | string;
  currentStock: number;
  capacity: number;
  pricePerLitre: number;
  /** Alias kept for backward compat */
  pricePerLiter?: number;
  reorderLevel: number;
  lastUpdated: string;
}

export interface FuelSale {
  id: string;
  date: string;
  saleDate: string;
  fuelType: FuelType | string;
  startTotalizer: number;
  endTotalizer: number;
  /** Derived: endTotalizer - startTotalizer */
  litres: number;
  quantity: number;
  /** Kept for backward compat with old records */
  pricePerLitre?: number;
  /** Kept for backward compat with old records */
  pricePerLiter?: number;
  total: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  customerId?: string;
  customerName?: string;
  pumpNumber: number;
  recordedBy: string;
  staffName: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  contact: string;
  vehicleType: string;
  vehicleNumber: string;
  loyaltyPoints: number;
  totalPurchases: number;
  totalPurchaseVolume: number;
  registrationDate: string;
  lastVisit?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  fuelTypes: (FuelType | string)[];
  fuelTypesSupplied: (FuelType | string)[];
  rating: number;
  lastDelivery: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  fuelType: FuelType;
  quantity: number;
  totalLitres: number;
  pricePerLitre: number;
  litrePrice: number;
  totalAmount: number;
  invoicePrice: number;
  orderDate: string;
  invoiceDate: string;
  expectedDelivery: string;
  expectedDeliveryDate: string;
  status: OrderStatus;
  invoiceNumber?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  contact: string;
  email: string;
  hireDate: string;
  salary: number;
  payPeriod: PayPeriod;
  salaryPeriod: PayPeriod;
  isActive: boolean;
  status: "Active" | "Inactive";
  shift?: string;
}

// Alias export
export type Staff = StaffMember;

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

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  approvedBy: string;
  recordedBy?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  customerId: string;
  customerName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  totalAmount: number;
  fuelType?: FuelType;
  quantity?: number;
  pricePerLiter?: number;
  paymentMethod?: PaymentMethod;
  status: InvoiceStatus;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CustomerPurchase {
  id: string;
  date: string;
  fuelType: FuelType;
  litres: number;
  total: number;
  paymentMethod: PaymentMethod;
}

// ─── Store State & Actions ────────────────────────────────────────────────────

interface AppState {
  inventory: FuelInventory[];
  fuelInventory: FuelInventory[];
  fuelSales: FuelSale[];
  sales: FuelSale[];
  customers: Customer[];
  customerPurchases: CustomerPurchase[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  staff: StaffMember[];
  shiftSchedules: Shift[];
  shifts: Shift[];
  expenses: Expense[];
  invoices: Invoice[];
  stockLevels: Array<{
    fuelType: FuelType;
    threshold: number;
    current: number;
  }>;

  updateInventory: (id: string, updates: Partial<FuelInventory>) => void;
  adjustStock: (
    id: string,
    delta: number,
    reason: string,
    recordedBy?: string,
  ) => void;
  updateFuelStock: (id: string, delta: number) => void;
  updateFuelPrice: (id: string, price: number) => void;
  updateTankCapacity: (id: string, capacity: number) => void;
  deleteFuelTank: (id: string) => void;

  addFuelSale: (sale: FuelSale) => void;
  recordSale: (sale: FuelSale) => void;
  deleteFuelSale: (id: string) => void;

  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  redeemPoints: (customerId: string, points: number) => void;

  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  addPurchaseOrder: (order: PurchaseOrder) => void;
  updatePurchaseOrderStatus: (id: string, status: OrderStatus) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;

  addStaff: (member: StaffMember) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;

  addShift: (shift: Shift) => void;
  updateShift: (id: string, updates: Partial<Shift>) => void;
  deleteShift: (id: string) => void;

  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, "id">>) => void;
  deleteExpense: (id: string) => void;

  addInvoice: (invoice: Invoice) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  toggleInvoiceStatus: (id: string) => void;
  deleteInvoice: (id: string) => void;

  updateThreshold: (fuelType: FuelType, threshold: number) => void;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

function makeInventory(
  base: Omit<FuelInventory, "pricePerLiter" | "reorderLevel"> & {
    reorderLevel?: number;
  },
): FuelInventory {
  return {
    ...base,
    reorderLevel: base.reorderLevel ?? Math.round(base.capacity * 0.15),
    pricePerLiter: base.pricePerLitre,
  };
}

function makeSale(base: {
  id: string;
  date: string;
  fuelType: FuelType | string;
  litres: number;
  pricePerLitre?: number;
  total: number;
  paymentMethod: PaymentMethod;
  pumpNumber: number;
  recordedBy: string;
  customerId?: string;
  customerName?: string;
  startTotalizer?: number;
  endTotalizer?: number;
}): FuelSale {
  const startTotalizer = base.startTotalizer ?? 0;
  const endTotalizer = base.endTotalizer ?? base.litres;
  return {
    ...base,
    saleDate: base.date,
    startTotalizer,
    endTotalizer,
    litres: base.litres,
    quantity: base.litres,
    totalAmount: base.total,
    pricePerLitre: base.pricePerLitre,
    pricePerLiter: base.pricePerLitre,
    staffName: base.recordedBy,
  };
}

function makeCustomer(base: {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber: string;
  loyaltyPoints: number;
  totalPurchases: number;
  registrationDate: string;
  lastVisit?: string;
}): Customer {
  return {
    ...base,
    contact: base.phone,
    totalPurchaseVolume: base.totalPurchases,
  };
}

function makeSupplier(base: {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  fuelTypes: FuelType[];
  rating: number;
  lastDelivery: string;
}): Supplier {
  return { ...base, fuelTypesSupplied: base.fuelTypes };
}

function makePurchaseOrder(base: {
  id: string;
  supplierId: string;
  supplierName: string;
  fuelType: FuelType;
  quantity: number;
  pricePerLitre: number;
  totalAmount: number;
  orderDate: string;
  expectedDelivery: string;
  status: OrderStatus;
  invoiceNumber?: string;
}): PurchaseOrder {
  return {
    ...base,
    totalLitres: base.quantity,
    litrePrice: base.pricePerLitre,
    invoicePrice: base.totalAmount,
    invoiceDate: base.orderDate,
    expectedDeliveryDate: base.expectedDelivery,
  };
}

function makeStaff(base: {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  email: string;
  hireDate: string;
  salary: number;
  payPeriod: PayPeriod;
  isActive: boolean;
}): StaffMember {
  return {
    ...base,
    contact: base.phone,
    salaryPeriod: base.payPeriod,
    status: base.isActive ? "Active" : "Inactive",
  };
}

const seedInventory: FuelInventory[] = [
  makeInventory({
    id: "inv-1",
    fuelType: "Petrol",
    currentStock: 8500,
    capacity: 15000,
    pricePerLitre: 96.72,
    reorderLevel: 2000,
    lastUpdated: "2026-03-01",
  }),
  makeInventory({
    id: "inv-2",
    fuelType: "Diesel",
    currentStock: 12000,
    capacity: 20000,
    pricePerLitre: 89.62,
    reorderLevel: 3000,
    lastUpdated: "2026-03-01",
  }),
  makeInventory({
    id: "inv-3",
    fuelType: "CNG",
    currentStock: 2200,
    capacity: 5000,
    pricePerLitre: 76.0,
    reorderLevel: 500,
    lastUpdated: "2026-03-01",
  }),
  makeInventory({
    id: "inv-4",
    fuelType: "LPG",
    currentStock: 800,
    capacity: 3000,
    pricePerLitre: 55.0,
    reorderLevel: 300,
    lastUpdated: "2026-03-01",
  }),
];

const seedCustomers: Customer[] = [
  makeCustomer({
    id: "cust-1",
    name: "Rajesh Kumar",
    phone: "9876543210",
    email: "rajesh@example.com",
    vehicleType: "Car",
    vehicleNumber: "MH12AB1234",
    loyaltyPoints: 450,
    totalPurchases: 28500,
    registrationDate: "2024-01-15",
    lastVisit: "2026-03-03",
  }),
  makeCustomer({
    id: "cust-2",
    name: "Priya Sharma",
    phone: "9123456789",
    email: "priya@example.com",
    vehicleType: "Bike",
    vehicleNumber: "MH14CD5678",
    loyaltyPoints: 120,
    totalPurchases: 8200,
    registrationDate: "2024-03-22",
    lastVisit: "2026-03-02",
  }),
  makeCustomer({
    id: "cust-3",
    name: "Amit Patel",
    phone: "9988776655",
    email: "amit@example.com",
    vehicleType: "Truck",
    vehicleNumber: "GJ01EF9012",
    loyaltyPoints: 890,
    totalPurchases: 65000,
    registrationDate: "2023-11-08",
    lastVisit: "2026-03-01",
  }),
];

const seedSuppliers: Supplier[] = [
  makeSupplier({
    id: "sup-1",
    name: "IndianOil Corporation",
    contact: "9000011111",
    email: "supply@iocl.com",
    address: "Mumbai, Maharashtra",
    fuelTypes: ["Petrol", "Diesel"],
    rating: 4.8,
    lastDelivery: "2026-02-28",
  }),
  makeSupplier({
    id: "sup-2",
    name: "Bharat Petroleum",
    contact: "9000022222",
    email: "supply@bpcl.com",
    address: "Pune, Maharashtra",
    fuelTypes: ["Petrol", "Diesel", "LPG"],
    rating: 4.6,
    lastDelivery: "2026-02-25",
  }),
  makeSupplier({
    id: "sup-3",
    name: "Hindustan Petroleum",
    contact: "9000033333",
    email: "supply@hpcl.com",
    address: "Nashik, Maharashtra",
    fuelTypes: ["CNG", "LPG"],
    rating: 4.5,
    lastDelivery: "2026-02-20",
  }),
];

const seedPurchaseOrders: PurchaseOrder[] = [
  makePurchaseOrder({
    id: "po-1",
    supplierId: "sup-1",
    supplierName: "IndianOil Corporation",
    fuelType: "Petrol",
    quantity: 5000,
    pricePerLitre: 94.0,
    totalAmount: 470000,
    orderDate: "2026-02-25",
    expectedDelivery: "2026-02-28",
    status: "Delivered",
    invoiceNumber: "INV-2026-001",
  }),
  makePurchaseOrder({
    id: "po-2",
    supplierId: "sup-2",
    supplierName: "Bharat Petroleum",
    fuelType: "Diesel",
    quantity: 8000,
    pricePerLitre: 87.0,
    totalAmount: 696000,
    orderDate: "2026-02-27",
    expectedDelivery: "2026-03-02",
    status: "Pending",
  }),
  makePurchaseOrder({
    id: "po-3",
    supplierId: "sup-3",
    supplierName: "Hindustan Petroleum",
    fuelType: "CNG",
    quantity: 2000,
    pricePerLitre: 74.0,
    totalAmount: 148000,
    orderDate: "2026-03-01",
    expectedDelivery: "2026-03-05",
    status: "Pending",
  }),
];

const seedStaff: StaffMember[] = [
  makeStaff({
    id: "staff-1",
    name: "Suresh Yadav",
    role: "Manager",
    phone: "9111122222",
    email: "suresh@station.com",
    hireDate: "2022-01-10",
    salary: 35000,
    payPeriod: "monthly",
    isActive: true,
  }),
  makeStaff({
    id: "staff-2",
    name: "Mohan Verma",
    role: "Attendant",
    phone: "9333344444",
    email: "mohan@station.com",
    hireDate: "2023-06-15",
    salary: 18000,
    payPeriod: "monthly",
    isActive: true,
  }),
  makeStaff({
    id: "staff-3",
    name: "Kavita Singh",
    role: "Cashier",
    phone: "9555566666",
    email: "kavita@station.com",
    hireDate: "2023-09-01",
    salary: 22000,
    payPeriod: "monthly",
    isActive: true,
  }),
  makeStaff({
    id: "staff-4",
    name: "Ravi Gupta",
    role: "Technician",
    phone: "9777788888",
    email: "ravi@station.com",
    hireDate: "2024-02-20",
    salary: 28000,
    payPeriod: "monthly",
    isActive: true,
  }),
];

const seedShifts: Shift[] = [
  {
    id: "shift-1",
    staffId: "staff-2",
    staffName: "Mohan Verma",
    date: "2026-03-03",
    startTime: "06:00",
    endTime: "14:00",
    pumpNumber: 1,
    status: "Scheduled",
  },
  {
    id: "shift-2",
    staffId: "staff-3",
    staffName: "Kavita Singh",
    date: "2026-03-03",
    startTime: "14:00",
    endTime: "22:00",
    pumpNumber: 2,
    status: "Scheduled",
  },
  {
    id: "shift-3",
    staffId: "staff-2",
    staffName: "Mohan Verma",
    date: "2026-03-02",
    startTime: "06:00",
    endTime: "14:00",
    pumpNumber: 1,
    status: "Completed",
  },
];

const seedExpenses: Expense[] = [
  {
    id: "exp-1",
    date: "2026-03-01",
    category: "Maintenance",
    description: "Pump maintenance and servicing",
    amount: 15000,
    paymentMethod: "Cash",
    approvedBy: "Suresh Yadav",
    recordedBy: "Suresh Yadav",
  },
  {
    id: "exp-2",
    date: "2026-02-28",
    category: "Utilities",
    description: "Electricity bill February",
    amount: 8500,
    paymentMethod: "UPI",
    approvedBy: "Suresh Yadav",
    recordedBy: "Suresh Yadav",
  },
  {
    id: "exp-3",
    date: "2026-02-25",
    category: "Equipment",
    description: "New nozzle replacement",
    amount: 3200,
    paymentMethod: "Card",
    approvedBy: "Suresh Yadav",
    recordedBy: "Suresh Yadav",
  },
];

const seedSales: FuelSale[] = [
  makeSale({
    id: "sale-1",
    date: "2026-03-03",
    fuelType: "Petrol",
    litres: 40,
    pricePerLitre: 96.72,
    total: 3868.8,
    paymentMethod: "UPI",
    customerId: "cust-1",
    customerName: "Rajesh Kumar",
    pumpNumber: 1,
    recordedBy: "Mohan Verma",
  }),
  makeSale({
    id: "sale-2",
    date: "2026-03-03",
    fuelType: "Diesel",
    litres: 100,
    pricePerLitre: 89.62,
    total: 8962.0,
    paymentMethod: "Cash",
    pumpNumber: 2,
    recordedBy: "Kavita Singh",
  }),
  makeSale({
    id: "sale-3",
    date: "2026-03-02",
    fuelType: "Petrol",
    litres: 25,
    pricePerLitre: 96.72,
    total: 2418.0,
    paymentMethod: "Card",
    customerId: "cust-2",
    customerName: "Priya Sharma",
    pumpNumber: 1,
    recordedBy: "Mohan Verma",
  }),
  makeSale({
    id: "sale-4",
    date: "2026-03-02",
    fuelType: "CNG",
    litres: 30,
    pricePerLitre: 76.0,
    total: 2280.0,
    paymentMethod: "UPI",
    pumpNumber: 3,
    recordedBy: "Mohan Verma",
  }),
  makeSale({
    id: "sale-5",
    date: "2026-03-01",
    fuelType: "Diesel",
    litres: 200,
    pricePerLitre: 89.62,
    total: 17924.0,
    paymentMethod: "Credit",
    customerId: "cust-3",
    customerName: "Amit Patel",
    pumpNumber: 2,
    recordedBy: "Kavita Singh",
  }),
];

const seedInvoices: Invoice[] = [
  {
    id: "inv-bill-1",
    invoiceNumber: "INV-2026-B001",
    customerId: "cust-3",
    customerName: "Amit Patel",
    date: "2026-03-01",
    dueDate: "2026-03-15",
    items: [
      {
        description: "Diesel - 200L",
        quantity: 200,
        unitPrice: 89.62,
        total: 17924,
      },
    ],
    subtotal: 17924,
    tax: 1792.4,
    total: 19716.4,
    totalAmount: 19716.4,
    fuelType: "Diesel",
    quantity: 200,
    pricePerLiter: 89.62,
    paymentMethod: "Credit",
    status: "Pending",
  },
  {
    id: "inv-bill-2",
    invoiceNumber: "INV-2026-B002",
    customerId: "cust-1",
    customerName: "Rajesh Kumar",
    date: "2026-02-20",
    dueDate: "2026-02-28",
    items: [
      {
        description: "Petrol - 50L",
        quantity: 50,
        unitPrice: 96.72,
        total: 4836,
      },
    ],
    subtotal: 4836,
    tax: 483.6,
    total: 5319.6,
    totalAmount: 5319.6,
    fuelType: "Petrol",
    quantity: 50,
    pricePerLiter: 96.72,
    paymentMethod: "UPI",
    status: "Overdue",
  },
  {
    id: "inv-bill-3",
    invoiceNumber: "INV-2026-B003",
    customerId: "cust-2",
    customerName: "Priya Sharma",
    date: "2026-02-15",
    dueDate: "2026-02-22",
    items: [
      {
        description: "Petrol - 25L",
        quantity: 25,
        unitPrice: 96.72,
        total: 2418,
      },
    ],
    subtotal: 2418,
    tax: 241.8,
    total: 2659.8,
    totalAmount: 2659.8,
    fuelType: "Petrol",
    quantity: 25,
    pricePerLiter: 96.72,
    paymentMethod: "Card",
    status: "Paid",
  },
];

const seedCustomerPurchases: CustomerPurchase[] = [
  {
    id: "cp-1",
    date: "2026-03-03",
    fuelType: "Petrol",
    litres: 40,
    total: 3868.8,
    paymentMethod: "UPI",
  },
  {
    id: "cp-2",
    date: "2026-03-02",
    fuelType: "Petrol",
    litres: 25,
    total: 2418.0,
    paymentMethod: "Card",
  },
  {
    id: "cp-3",
    date: "2026-03-01",
    fuelType: "Diesel",
    litres: 200,
    total: 17924.0,
    paymentMethod: "Credit",
  },
];

const seedStockLevels = [
  { fuelType: "Petrol" as FuelType, threshold: 2000, current: 8500 },
  { fuelType: "Diesel" as FuelType, threshold: 3000, current: 12000 },
  { fuelType: "CNG" as FuelType, threshold: 500, current: 2200 },
  { fuelType: "LPG" as FuelType, threshold: 300, current: 800 },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      inventory: seedInventory,
      fuelInventory: seedInventory,
      fuelSales: seedSales,
      sales: seedSales,
      customers: seedCustomers,
      customerPurchases: seedCustomerPurchases,
      suppliers: seedSuppliers,
      purchaseOrders: seedPurchaseOrders,
      staff: seedStaff,
      shifts: seedShifts,
      shiftSchedules: seedShifts,
      expenses: seedExpenses,
      invoices: seedInvoices,
      stockLevels: seedStockLevels,

      updateInventory: (id, updates) =>
        set((state) => {
          const inventory = state.inventory.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...updates,
                  pricePerLiter: updates.pricePerLitre ?? item.pricePerLitre,
                }
              : item,
          );
          return { inventory, fuelInventory: inventory };
        }),

      adjustStock: (id, delta, _reason, _recordedBy) =>
        set((state) => {
          const inventory = state.inventory.map((item) =>
            item.id === id
              ? {
                  ...item,
                  currentStock: Math.max(0, item.currentStock + delta),
                  lastUpdated: new Date().toISOString().split("T")[0],
                }
              : item,
          );
          return { inventory, fuelInventory: inventory };
        }),

      updateFuelStock: (id, delta) =>
        set((state) => {
          const inventory = state.inventory.map((item) =>
            item.id === id
              ? {
                  ...item,
                  currentStock: Math.max(0, item.currentStock + delta),
                  lastUpdated: new Date().toISOString().split("T")[0],
                }
              : item,
          );
          return { inventory, fuelInventory: inventory };
        }),

      updateFuelPrice: (id, price) =>
        set((state) => {
          const inventory = state.inventory.map((item) =>
            item.id === id
              ? { ...item, pricePerLitre: price, pricePerLiter: price }
              : item,
          );
          return { inventory, fuelInventory: inventory };
        }),

      updateTankCapacity: (id, capacity) =>
        set((state) => {
          const inventory = state.inventory.map((item) =>
            item.id === id
              ? {
                  ...item,
                  capacity,
                  lastUpdated: new Date().toISOString().split("T")[0],
                }
              : item,
          );
          return { inventory, fuelInventory: inventory };
        }),

      deleteFuelTank: (id) =>
        set((state) => {
          const inventory = state.inventory.filter((item) => item.id !== id);
          return { inventory, fuelInventory: inventory };
        }),

      addFuelSale: (sale) =>
        set((state) => ({
          fuelSales: [sale, ...(state.fuelSales ?? [])],
          sales: [sale, ...(state.sales ?? [])],
        })),

      recordSale: (sale) =>
        set((state) => ({
          fuelSales: [sale, ...(state.fuelSales ?? [])],
          sales: [sale, ...(state.sales ?? [])],
        })),

      deleteFuelSale: (id) =>
        set((state) => ({
          fuelSales: (state.fuelSales ?? []).filter((s) => s.id !== id),
          sales: (state.sales ?? []).filter((s) => s.id !== id),
        })),

      addCustomer: (customer) =>
        set((state) => ({ customers: [...(state.customers ?? []), customer] })),

      updateCustomer: (id, updates) =>
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),

      deleteCustomer: (id) =>
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        })),

      redeemPoints: (customerId, points) =>
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId
              ? { ...c, loyaltyPoints: Math.max(0, c.loyaltyPoints - points) }
              : c,
          ),
        })),

      addSupplier: (supplier) =>
        set((state) => ({ suppliers: [...(state.suppliers ?? []), supplier] })),

      updateSupplier: (id, updates) =>
        set((state) => ({
          suppliers: state.suppliers.map((s) => {
            if (s.id !== id) return s;
            const merged = { ...s, ...updates };
            if (updates.fuelTypes) merged.fuelTypesSupplied = updates.fuelTypes;
            if (updates.fuelTypesSupplied)
              merged.fuelTypes = updates.fuelTypesSupplied;
            return merged;
          }),
        })),

      deleteSupplier: (id) =>
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== id),
        })),

      addPurchaseOrder: (order) =>
        set((state) => ({
          purchaseOrders: [...(state.purchaseOrders ?? []), order],
        })),

      updatePurchaseOrderStatus: (id, status) =>
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((o) =>
            o.id === id ? { ...o, status } : o,
          ),
        })),

      updateOrderStatus: (id, status) =>
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((o) =>
            o.id === id ? { ...o, status } : o,
          ),
        })),

      addStaff: (member) =>
        set((state) => ({ staff: [...(state.staff ?? []), member] })),

      updateStaff: (id, updates) =>
        set((state) => ({
          staff: state.staff.map((s) =>
            s.id === id ? { ...s, ...updates } : s,
          ),
        })),

      deleteStaff: (id) =>
        set((state) => ({ staff: state.staff.filter((s) => s.id !== id) })),

      addShift: (shift) =>
        set((state) => ({
          shifts: [...(state.shifts ?? []), shift],
          shiftSchedules: [...(state.shiftSchedules ?? []), shift],
        })),

      updateShift: (id, updates) =>
        set((state) => ({
          shifts: state.shifts.map((s) =>
            s.id === id ? { ...s, ...updates } : s,
          ),
          shiftSchedules: state.shiftSchedules.map((s) =>
            s.id === id ? { ...s, ...updates } : s,
          ),
        })),

      deleteShift: (id) =>
        set((state) => ({
          shifts: state.shifts.filter((s) => s.id !== id),
          shiftSchedules: state.shiftSchedules.filter((s) => s.id !== id),
        })),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [
            ...(state.expenses ?? []),
            {
              ...expense,
              id: `exp-${Date.now()}`,
              recordedBy: expense.recordedBy ?? expense.approvedBy,
            },
          ],
        })),

      updateExpense: (id, updates) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...updates } : e,
          ),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      addInvoice: (invoice) =>
        set((state) => ({
          invoices: [
            ...state.invoices,
            { ...invoice, totalAmount: invoice.totalAmount ?? invoice.total },
          ],
        })),

      updateInvoiceStatus: (id, status) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, status } : inv,
          ),
        })),

      toggleInvoiceStatus: (id) =>
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.id !== id) return inv;
            const next: InvoiceStatus =
              inv.status === "Pending"
                ? "Paid"
                : inv.status === "Overdue"
                  ? "Paid"
                  : "Pending";
            return { ...inv, status: next };
          }),
        })),

      deleteInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        })),

      updateThreshold: (fuelType, threshold) =>
        set((state) => ({
          stockLevels: state.stockLevels.map((sl) =>
            sl.fuelType === fuelType ? { ...sl, threshold } : sl,
          ),
        })),
    }),
    {
      name: "fuel-station-store",
      // Bump version to force-clear stale persisted state from old deployments.
      // The migrate function returns undefined so Zustand falls back to the fresh
      // seed data defined above — this resolves all state-corruption issues.
      version: 3,
      migrate: (_persistedState: unknown, _version: number) => {
        return undefined;
      },
    },
  ),
);
