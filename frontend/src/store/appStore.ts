import { create } from 'zustand';

// ── Types ──────────────────────────────────────────────────────────────────

export type FuelType = 'Petrol' | 'Diesel' | 'Premium';
export type PaymentMethod = 'Cash' | 'Card' | 'UPI' | 'Credit';
export type StaffStatus = 'Active' | 'Inactive';
export type SalaryPeriod = 'monthly' | 'annual';
export type ShiftStatus = 'Scheduled' | 'Active' | 'Completed';
export type OrderStatus = 'Pending' | 'Delivered' | 'Cancelled';
export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Overdue';

export interface FuelSale {
  id: string;
  date: string;
  fuelType: string;
  quantity: number;
  pricePerLiter: number;
  totalAmount: number;
  paymentMethod: string;
  pumpNumber: string;
  staffName: string;
  customerName?: string;
  loyaltyPoints?: number;
}

export interface StockLevel {
  fuelType: FuelType;
  currentLevel: number;
  capacity: number;
  threshold: number;
}

export interface StockHistoryEntry {
  id: string;
  date: string;
  fuelType: FuelType;
  changeAmount: number;
  reason: string;
  recordedBy: string;
  type: 'sale' | 'purchase' | 'adjustment';
}

export interface FuelInventoryItem {
  fuelType: string;
  currentStock: number;
  capacity: number;
  pricePerLiter: number;
  reorderLevel: number;
  lastUpdated: string;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  vehicleNumber: string;
  loyaltyPoints: number;
  totalPurchases: number;
  registrationDate: string;
  totalPurchaseVolume: number;
  lastVisit: string;
}

export interface CustomerPurchase {
  id: string;
  date: string;
  fuelType: FuelType;
  quantity: number;
  amount: number;
  pointsEarned: number;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  contact: string;
  email: string;
  shift: string;
  salary: number;
  salaryPeriod: SalaryPeriod;
  joinDate: string;
  hireDate: string;
  status: StaffStatus;
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

export interface ShiftSchedule {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  shift: 'Morning' | 'Afternoon' | 'Night';
  pumpAssigned: string;
  status: 'Scheduled' | 'Completed' | 'Absent';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  saleId: string;
  fuelType: FuelType;
  quantity: number;
  pricePerLiter: number;
  subtotal: number;
  tax: number;
  total: number;
  totalAmount: number;
  date: string;
  dueDate: string;
  paymentMethod?: string;
  status: InvoiceStatus;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  fuelTypesSupplied: string[];
  rating: number;
  lastDelivery: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  fuelType: string;
  quantityOrdered: number;  // same as totalLitres
  invoiceNumber?: string;   // optional user-entered invoice number
  invoicePrice: number;     // total invoice cost
  invoiceDate: string;      // ISO date string
  totalLitres: number;      // total litres ordered
  litrePrice: number;       // derived: invoicePrice / totalLitres
  totalAmount: number;      // same as invoicePrice for compatibility
  totalCost: number;        // same as invoicePrice for compatibility
  orderDate: string;
  expectedDeliveryDate: string;
  status: OrderStatus;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  approvedBy: string;
  recordedBy: string;
}

// ── Seed Data ──────────────────────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

const seedFuelInventory: FuelInventoryItem[] = [
  { fuelType: 'Petrol', currentStock: 8500, capacity: 15000, pricePerLiter: 96.72, reorderLevel: 3000, lastUpdated: today },
  { fuelType: 'Diesel', currentStock: 2100, capacity: 20000, pricePerLiter: 89.62, reorderLevel: 4000, lastUpdated: yesterday },
  { fuelType: 'Premium', currentStock: 3200, capacity: 10000, pricePerLiter: 104.50, reorderLevel: 2000, lastUpdated: today },
];

const seedStockLevels: StockLevel[] = [
  { fuelType: 'Petrol', currentLevel: 8500, capacity: 15000, threshold: 3000 },
  { fuelType: 'Diesel', currentLevel: 2100, capacity: 20000, threshold: 4000 },
  { fuelType: 'Premium', currentLevel: 3200, capacity: 10000, threshold: 2000 },
];

const seedStockHistory: StockHistoryEntry[] = [
  { id: 'sh1', date: today, fuelType: 'Petrol', changeAmount: -150, reason: 'Sales', recordedBy: 'System', type: 'sale' },
  { id: 'sh2', date: yesterday, fuelType: 'Diesel', changeAmount: 5000, reason: 'Delivery from supplier', recordedBy: 'Admin', type: 'purchase' },
  { id: 'sh3', date: twoDaysAgo, fuelType: 'Premium', changeAmount: -80, reason: 'Sales', recordedBy: 'System', type: 'sale' },
];

const seedSales: FuelSale[] = [
  { id: 's1', date: today, fuelType: 'Petrol', quantity: 40, pricePerLiter: 96.72, totalAmount: 3868.80, paymentMethod: 'Cash', pumpNumber: '1', staffName: 'Ravi Kumar', customerName: 'Amit Shah' },
  { id: 's2', date: today, fuelType: 'Diesel', quantity: 60, pricePerLiter: 89.62, totalAmount: 5377.20, paymentMethod: 'Card', pumpNumber: '2', staffName: 'Priya Singh' },
  { id: 's3', date: yesterday, fuelType: 'Premium', quantity: 25, pricePerLiter: 104.50, totalAmount: 2612.50, paymentMethod: 'UPI', pumpNumber: '3', staffName: 'Ravi Kumar', customerName: 'Neha Patel' },
  { id: 's4', date: yesterday, fuelType: 'Petrol', quantity: 35, pricePerLiter: 96.72, totalAmount: 3385.20, paymentMethod: 'Cash', pumpNumber: '1', staffName: 'Suresh Yadav' },
  { id: 's5', date: twoDaysAgo, fuelType: 'Diesel', quantity: 80, pricePerLiter: 89.62, totalAmount: 7169.60, paymentMethod: 'Credit', pumpNumber: '2', staffName: 'Priya Singh', customerName: 'Rajesh Mehta' },
];

const seedCustomers: Customer[] = [
  { id: 'c1', name: 'Amit Shah', contact: '9876543210', vehicleNumber: 'MH12AB1234', loyaltyPoints: 450, totalPurchases: 28, registrationDate: '2023-01-15', totalPurchaseVolume: 1120, lastVisit: today },
  { id: 'c2', name: 'Neha Patel', contact: '9876543211', vehicleNumber: 'MH14CD5678', loyaltyPoints: 320, totalPurchases: 19, registrationDate: '2023-03-22', totalPurchaseVolume: 760, lastVisit: yesterday },
  { id: 'c3', name: 'Rajesh Mehta', contact: '9876543212', vehicleNumber: 'MH01EF9012', loyaltyPoints: 780, totalPurchases: 45, registrationDate: '2022-11-08', totalPurchaseVolume: 2250, lastVisit: twoDaysAgo },
  { id: 'c4', name: 'Sunita Verma', contact: '9876543213', vehicleNumber: 'MH04GH3456', loyaltyPoints: 120, totalPurchases: 8, registrationDate: '2024-02-14', totalPurchaseVolume: 320, lastVisit: yesterday },
];

const seedCustomerPurchases: Record<string, CustomerPurchase[]> = {
  c1: [
    { id: 'cp1', date: today, fuelType: 'Petrol', quantity: 40, amount: 3868.80, pointsEarned: 40 },
    { id: 'cp2', date: yesterday, fuelType: 'Petrol', quantity: 35, amount: 3385.20, pointsEarned: 35 },
  ],
  c2: [
    { id: 'cp3', date: yesterday, fuelType: 'Premium', quantity: 25, amount: 2612.50, pointsEarned: 25 },
  ],
  c3: [
    { id: 'cp4', date: twoDaysAgo, fuelType: 'Diesel', quantity: 80, amount: 7169.60, pointsEarned: 80 },
  ],
};

const seedStaff: Staff[] = [
  { id: 'st1', name: 'Ravi Kumar', role: 'Pump Operator', contact: '9876501234', email: 'ravi@fuelstation.com', shift: 'Morning', salary: 18000, salaryPeriod: 'monthly', joinDate: '2022-06-01', hireDate: '2022-06-01', status: 'Active' },
  { id: 'st2', name: 'Priya Singh', role: 'Cashier', contact: '9876501235', email: 'priya@fuelstation.com', shift: 'Afternoon', salary: 20000, salaryPeriod: 'monthly', joinDate: '2021-09-15', hireDate: '2021-09-15', status: 'Active' },
  { id: 'st3', name: 'Suresh Yadav', role: 'Pump Operator', contact: '9876501236', email: 'suresh@fuelstation.com', shift: 'Night', salary: 18000, salaryPeriod: 'monthly', joinDate: '2023-01-10', hireDate: '2023-01-10', status: 'Active' },
  { id: 'st4', name: 'Meena Joshi', role: 'Manager', contact: '9876501237', email: 'meena@fuelstation.com', shift: 'Morning', salary: 35000, salaryPeriod: 'monthly', joinDate: '2020-03-20', hireDate: '2020-03-20', status: 'Active' },
  { id: 'st5', name: 'Arun Sharma', role: 'Pump Operator', contact: '9876501238', email: 'arun@fuelstation.com', shift: 'Afternoon', salary: 18000, salaryPeriod: 'monthly', joinDate: '2023-07-05', hireDate: '2023-07-05', status: 'Inactive' },
];

const seedShifts: Shift[] = [
  { id: 'sh1', staffId: 'st1', staffName: 'Ravi Kumar', date: today, startTime: '06:00', endTime: '14:00', pumpNumber: 1, status: 'Active' },
  { id: 'sh2', staffId: 'st2', staffName: 'Priya Singh', date: today, startTime: '14:00', endTime: '22:00', pumpNumber: 2, status: 'Scheduled' },
  { id: 'sh3', staffId: 'st3', staffName: 'Suresh Yadav', date: today, startTime: '22:00', endTime: '06:00', pumpNumber: 3, status: 'Scheduled' },
];

const seedShiftSchedules: ShiftSchedule[] = [
  { id: 'ss1', staffId: 'st1', staffName: 'Ravi Kumar', date: today, shift: 'Morning', pumpAssigned: 'Pump 1', status: 'Scheduled' },
  { id: 'ss2', staffId: 'st2', staffName: 'Priya Singh', date: today, shift: 'Afternoon', pumpAssigned: 'Pump 2', status: 'Scheduled' },
  { id: 'ss3', staffId: 'st3', staffName: 'Suresh Yadav', date: yesterday, shift: 'Night', pumpAssigned: 'Pump 3', status: 'Completed' },
];

const seedInvoices: Invoice[] = [
  {
    id: 'inv1', invoiceNumber: 'INV-2024-001', customerId: 'c1', customerName: 'Amit Shah',
    saleId: 's1', fuelType: 'Petrol', quantity: 40, pricePerLiter: 96.72,
    subtotal: 3868.80, tax: 696.38, total: 4565.18, totalAmount: 4565.18,
    date: today, dueDate: today, paymentMethod: 'Cash', status: 'Paid',
  },
  {
    id: 'inv2', invoiceNumber: 'INV-2024-002', customerName: 'Walk-in Customer',
    saleId: 's2', fuelType: 'Diesel', quantity: 60, pricePerLiter: 89.62,
    subtotal: 5377.20, tax: 967.90, total: 6345.10, totalAmount: 6345.10,
    date: today, dueDate: today, paymentMethod: 'Card', status: 'Paid',
  },
  {
    id: 'inv3', invoiceNumber: 'INV-2024-003', customerId: 'c2', customerName: 'Neha Patel',
    saleId: 's3', fuelType: 'Premium', quantity: 25, pricePerLiter: 104.50,
    subtotal: 2612.50, tax: 470.25, total: 3082.75, totalAmount: 3082.75,
    date: yesterday, dueDate: yesterday, paymentMethod: 'UPI', status: 'Unpaid',
  },
  {
    id: 'inv4', invoiceNumber: 'INV-2024-004', customerId: 'c3', customerName: 'Rajesh Mehta',
    saleId: 's5', fuelType: 'Diesel', quantity: 80, pricePerLiter: 89.62,
    subtotal: 7169.60, tax: 1290.53, total: 8460.13, totalAmount: 8460.13,
    date: twoDaysAgo, dueDate: twoDaysAgo, paymentMethod: 'Credit', status: 'Overdue',
  },
];

const seedSuppliers: Supplier[] = [
  { id: 'sup1', name: 'IndianOil Corporation', contact: '9800001111', email: 'supply@iocl.com', address: 'Mumbai, Maharashtra', fuelTypesSupplied: ['Petrol', 'Diesel'], rating: 4.8, lastDelivery: yesterday },
  { id: 'sup2', name: 'Bharat Petroleum', contact: '9800002222', email: 'supply@bpcl.com', address: 'Pune, Maharashtra', fuelTypesSupplied: ['Petrol', 'Diesel', 'Premium'], rating: 4.6, lastDelivery: twoDaysAgo },
  { id: 'sup3', name: 'Hindustan Petroleum', contact: '9800003333', email: 'supply@hpcl.com', address: 'Nashik, Maharashtra', fuelTypesSupplied: ['Diesel', 'Premium'], rating: 4.5, lastDelivery: today },
];

const seedPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po1', supplierId: 'sup1', supplierName: 'IndianOil Corporation', fuelType: 'Petrol',
    quantityOrdered: 10000, invoiceNumber: 'IOCL-INV-2024-001',
    invoicePrice: 967200, invoiceDate: yesterday,
    totalLitres: 10000, litrePrice: 96.72,
    totalAmount: 967200, totalCost: 967200,
    orderDate: twoDaysAgo, expectedDeliveryDate: today, status: 'Delivered',
  },
  {
    id: 'po2', supplierId: 'sup2', supplierName: 'Bharat Petroleum', fuelType: 'Diesel',
    quantityOrdered: 15000, invoiceNumber: 'BPCL-INV-2024-042',
    invoicePrice: 1344300, invoiceDate: today,
    totalLitres: 15000, litrePrice: 89.62,
    totalAmount: 1344300, totalCost: 1344300,
    orderDate: yesterday, expectedDeliveryDate: today, status: 'Pending',
  },
  {
    id: 'po3', supplierId: 'sup3', supplierName: 'Hindustan Petroleum', fuelType: 'Premium',
    quantityOrdered: 5000,
    invoicePrice: 522500, invoiceDate: twoDaysAgo,
    totalLitres: 5000, litrePrice: 104.50,
    totalAmount: 522500, totalCost: 522500,
    orderDate: twoDaysAgo, expectedDeliveryDate: yesterday, status: 'Delivered',
  },
];

const seedExpenses: Expense[] = [
  { id: 'exp1', date: today, category: 'Utilities', description: 'Electricity Bill', amount: 12500, paymentMethod: 'Bank Transfer', approvedBy: 'Meena Joshi', recordedBy: 'Meena Joshi' },
  { id: 'exp2', date: yesterday, category: 'Maintenance', description: 'Pump Maintenance', amount: 8000, paymentMethod: 'Cash', approvedBy: 'Meena Joshi', recordedBy: 'Ravi Kumar' },
  { id: 'exp3', date: twoDaysAgo, category: 'Salaries', description: 'Staff Salaries - March', amount: 109000, paymentMethod: 'Bank Transfer', approvedBy: 'Meena Joshi', recordedBy: 'Meena Joshi' },
  { id: 'exp4', date: twoDaysAgo, category: 'Other', description: 'Office Supplies', amount: 2500, paymentMethod: 'Cash', approvedBy: 'Meena Joshi', recordedBy: 'Priya Singh' },
];

// ── Store Interface ────────────────────────────────────────────────────────

export interface AppState {
  // Data
  fuelInventory: FuelInventoryItem[];
  stockLevels: StockLevel[];
  stockHistory: StockHistoryEntry[];
  /** Primary sales collection — also accessible as fuelSales for compatibility */
  sales: FuelSale[];
  /** Alias for sales — used by Dashboard, FuelSales, Reports pages */
  fuelSales: FuelSale[];
  customers: Customer[];
  customerPurchases: Record<string, CustomerPurchase[]>;
  staff: Staff[];
  shifts: Shift[];
  shiftSchedules: ShiftSchedule[];
  invoices: Invoice[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  expenses: Expense[];

  // Actions
  addSale: (sale: Omit<FuelSale, 'id'>) => void;
  /** Alias for addSale — used by RecordSaleModal */
  addFuelSale: (sale: FuelSale) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  addShift: (shift: Omit<Shift, 'id'>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id'>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  toggleInvoiceStatus: (id: string) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  redeemPoints: (customerId: string, points: number) => void;
  adjustStock: (fuelType: FuelType, amount: number, reason: string, recordedBy?: string) => void;
  updateThreshold: (fuelType: FuelType, threshold: number) => void;
  updateFuelStock: (fuelType: string, newStock: number) => void;
  updateFuelPrice: (fuelType: string, newPrice: number) => void;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set) => ({
  fuelInventory: seedFuelInventory,
  stockLevels: seedStockLevels,
  stockHistory: seedStockHistory,
  sales: seedSales,
  fuelSales: seedSales,
  customers: seedCustomers,
  customerPurchases: seedCustomerPurchases,
  staff: seedStaff,
  shifts: seedShifts,
  shiftSchedules: seedShiftSchedules,
  invoices: seedInvoices,
  suppliers: seedSuppliers,
  purchaseOrders: seedPurchaseOrders,
  expenses: seedExpenses,

  addSale: (sale) => set((state) => {
    const newSales = [{ ...sale, id: `s${Date.now()}` }, ...state.sales];
    return { sales: newSales, fuelSales: newSales };
  }),

  addFuelSale: (sale) => set((state) => {
    const newSales = [sale, ...state.sales];
    return { sales: newSales, fuelSales: newSales };
  }),

  addCustomer: (customer) => set((state) => ({
    customers: [{ ...customer, id: `c${Date.now()}` }, ...state.customers],
  })),

  updateCustomer: (id, updates) => set((state) => ({
    customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c),
  })),

  deleteCustomer: (id) => set((state) => ({
    customers: state.customers.filter(c => c.id !== id),
  })),

  addStaff: (staff) => set((state) => ({
    staff: [{ ...staff, id: `st${Date.now()}` }, ...state.staff],
  })),

  updateStaff: (id, updates) => set((state) => ({
    staff: state.staff.map(s => s.id === id ? { ...s, ...updates } : s),
  })),

  deleteStaff: (id) => set((state) => ({
    staff: state.staff.filter(s => s.id !== id),
  })),

  addShift: (shift) => set((state) => ({
    shifts: [{ ...shift, id: `shift${Date.now()}` }, ...state.shifts],
  })),

  addSupplier: (supplier) => set((state) => ({
    suppliers: [{ ...supplier, id: `sup${Date.now()}` }, ...state.suppliers],
  })),

  updateSupplier: (id, updates) => set((state) => ({
    suppliers: state.suppliers.map(s => s.id === id ? { ...s, ...updates } : s),
  })),

  deleteSupplier: (id) => set((state) => ({
    suppliers: state.suppliers.filter(s => s.id !== id),
  })),

  addPurchaseOrder: (order) => set((state) => ({
    purchaseOrders: [{ ...order, id: `po${Date.now()}` }, ...state.purchaseOrders],
  })),

  updateOrderStatus: (id, status) => set((state) => ({
    purchaseOrders: state.purchaseOrders.map(o => o.id === id ? { ...o, status } : o),
  })),

  addExpense: (expense) => set((state) => ({
    expenses: [{ ...expense, id: `exp${Date.now()}` }, ...state.expenses],
  })),

  toggleInvoiceStatus: (id) => set((state) => ({
    invoices: state.invoices.map(inv =>
      inv.id === id ? { ...inv, status: inv.status === 'Paid' ? 'Unpaid' : 'Paid' } : inv
    ),
  })),

  updateInvoiceStatus: (id, status) => set((state) => ({
    invoices: state.invoices.map(inv =>
      inv.id === id ? { ...inv, status } : inv
    ),
  })),

  redeemPoints: (customerId, points) => set((state) => ({
    customers: state.customers.map(c =>
      c.id === customerId ? { ...c, loyaltyPoints: Math.max(0, c.loyaltyPoints - points) } : c
    ),
  })),

  adjustStock: (fuelType, amount, reason, recordedBy = 'Admin') => set((state) => {
    const entry: StockHistoryEntry = {
      id: `sh${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      fuelType,
      changeAmount: amount,
      reason,
      recordedBy,
      type: amount > 0 ? 'purchase' : 'adjustment',
    };
    return {
      stockLevels: state.stockLevels.map(sl =>
        sl.fuelType === fuelType
          ? { ...sl, currentLevel: Math.max(0, sl.currentLevel + amount) }
          : sl
      ),
      stockHistory: [entry, ...state.stockHistory],
    };
  }),

  updateThreshold: (fuelType, threshold) => set((state) => ({
    stockLevels: state.stockLevels.map(sl =>
      sl.fuelType === fuelType ? { ...sl, threshold } : sl
    ),
  })),

  updateFuelStock: (fuelType, newStock) => set((state) => ({
    fuelInventory: state.fuelInventory.map(item =>
      item.fuelType === fuelType ? { ...item, currentStock: newStock, lastUpdated: new Date().toISOString().split('T')[0] } : item
    ),
  })),

  updateFuelPrice: (fuelType, newPrice) => set((state) => ({
    fuelInventory: state.fuelInventory.map(item =>
      item.fuelType === fuelType ? { ...item, pricePerLiter: newPrice, lastUpdated: new Date().toISOString().split('T')[0] } : item
    ),
  })),
}));
