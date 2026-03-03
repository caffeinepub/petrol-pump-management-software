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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type Expense,
  type ExpenseCategory,
  type PaymentMethod,
  useAppStore,
} from "@/store/appStore";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const CATEGORIES: ExpenseCategory[] = [
  "Maintenance",
  "Utilities",
  "Salaries",
  "Equipment",
  "Fuel Purchase",
  "Other",
];
const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "UPI", "Card", "Credit"];

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useAppStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const [date, setDate] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "">("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [approvedBy, setApprovedBy] = useState("");

  // Reset form when modal closes, or populate when editing
  useEffect(() => {
    if (modalOpen) {
      if (editingExpense) {
        setDate(editingExpense.date);
        setCategory(editingExpense.category);
        setDescription(editingExpense.description);
        setAmount(String(editingExpense.amount));
        setPaymentMethod(editingExpense.paymentMethod);
        setApprovedBy(editingExpense.approvedBy);
      } else {
        setDate("");
        setCategory("");
        setDescription("");
        setAmount("");
        setPaymentMethod("");
        setApprovedBy("");
      }
    }
  }, [modalOpen, editingExpense]);

  const openAddModal = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setModalOpen(true);
  };

  const filtered = expenses.filter((e) => {
    const matchSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = CATEGORIES.map((cat) => ({
    category: cat,
    total: expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0),
  })).filter((c) => c.total > 0);

  const handleSaveExpense = () => {
    const amountNum = Number.parseFloat(amount);
    if (
      !date ||
      !category ||
      !description ||
      Number.isNaN(amountNum) ||
      amountNum <= 0
    ) {
      toast.error("Please fill in all required fields with valid values.");
      return;
    }
    if (editingExpense) {
      updateExpense(editingExpense.id, {
        date,
        category: category as ExpenseCategory,
        description,
        amount: amountNum,
        paymentMethod: (paymentMethod || "Cash") as PaymentMethod,
        approvedBy: approvedBy || "Manager",
        recordedBy: approvedBy || "Manager",
      });
      toast.success("Expense updated successfully!");
    } else {
      addExpense({
        date,
        category: category as ExpenseCategory,
        description,
        amount: amountNum,
        paymentMethod: (paymentMethod || "Cash") as PaymentMethod,
        approvedBy: approvedBy || "Manager",
        recordedBy: approvedBy || "Manager",
      });
      toast.success("Expense recorded successfully!");
    }
    setModalOpen(false);
    setEditingExpense(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteExpense(deleteTarget.id);
    toast.success("Expense deleted.");
    setDeleteTarget(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Expenses
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage station expenses
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="min-h-[44px] w-full sm:w-auto"
          data-ocid="expenses.add_expense.button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card border rounded-lg p-4 sm:col-span-2 lg:col-span-1">
          <p className="text-xs text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold text-foreground">
            {formatINR(totalExpenses)}
          </p>
        </div>
        {categoryTotals.slice(0, 2).map((ct) => (
          <div key={ct.category} className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">{ct.category}</p>
            <p className="text-xl font-bold text-foreground">
              {formatINR(ct.total)}
            </p>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      {categoryTotals.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h2 className="font-semibold text-foreground mb-3 text-sm">
            By Category
          </h2>
          <div className="flex flex-wrap gap-2">
            {categoryTotals.map((ct) => (
              <div
                key={ct.category}
                className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-xs"
              >
                <span className="text-muted-foreground">{ct.category}:</span>
                <span className="font-semibold text-foreground">
                  {formatINR(ct.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 min-h-[44px]"
            data-ocid="expenses.search_input"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger
            className="w-full sm:w-44 min-h-[44px]"
            data-ocid="expenses.category.select"
          >
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expenses Table */}
      <div
        className="bg-card border rounded-lg overflow-hidden"
        data-ocid="expenses.table"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead className="whitespace-nowrap">Category</TableHead>
                <TableHead className="whitespace-nowrap">Description</TableHead>
                <TableHead className="whitespace-nowrap">Amount</TableHead>
                <TableHead className="whitespace-nowrap hidden sm:table-cell">
                  Payment
                </TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">
                  Approved By
                </TableHead>
                <TableHead className="whitespace-nowrap text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                    data-ocid="expenses.empty_state"
                  >
                    No expenses found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((exp, idx) => (
                  <TableRow key={exp.id} data-ocid={`expenses.row.${idx + 1}`}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {exp.date}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        {exp.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{exp.description}</TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatINR(exp.amount)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {exp.paymentMethod}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {exp.approvedBy}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditModal(exp)}
                          data-ocid={`expenses.edit_button.${idx + 1}`}
                          title="Edit expense"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(exp)}
                          data-ocid={`expenses.delete_button.${idx + 1}`}
                          title="Delete expense"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      <Dialog
        open={modalOpen}
        onOpenChange={(v) => {
          if (!v) {
            setModalOpen(false);
            setEditingExpense(null);
          }
        }}
      >
        <DialogContent
          className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto"
          data-ocid="expenses.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <Label>Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="min-h-[44px]"
                data-ocid="expenses.date.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Category *</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as ExpenseCategory)}
              >
                <SelectTrigger
                  className="min-h-[44px]"
                  data-ocid="expenses.form_category.select"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Description *</Label>
              <Input
                placeholder="Describe the expense"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[44px]"
                data-ocid="expenses.description.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Amount (&#8377;) *</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="min-h-[44px]"
                data-ocid="expenses.amount.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              >
                <SelectTrigger
                  className="min-h-[44px]"
                  data-ocid="expenses.payment_method.select"
                >
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Approved By</Label>
              <Input
                placeholder="Manager name"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="min-h-[44px]"
                data-ocid="expenses.approved_by.input"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                setEditingExpense(null);
              }}
              className="min-h-[44px] w-full sm:w-auto"
              data-ocid="expenses.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveExpense}
              className="min-h-[44px] w-full sm:w-auto"
              data-ocid="expenses.save_button"
            >
              {editingExpense ? "Save Changes" : "Add Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="expenses.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the expense &quot;
              {deleteTarget?.description}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteTarget(null)}
              data-ocid="expenses.delete.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="expenses.delete.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
