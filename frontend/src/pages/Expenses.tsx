import React, { useState, useEffect } from 'react';
import { useAppStore, Expense } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const CATEGORIES = ['Maintenance', 'Utilities', 'Salaries', 'Supplies', 'Marketing', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'UPI', 'Card'];

export default function Expenses() {
  const { expenses, addExpense } = useAppStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  // Form state — all blank by default
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [approvedBy, setApprovedBy] = useState('');

  // Reset all form fields to blank whenever the modal opens
  useEffect(() => {
    if (modalOpen) {
      setDate('');
      setCategory('');
      setDescription('');
      setAmount('');
      setPaymentMethod('');
      setApprovedBy('');
    }
  }, [modalOpen]);

  const filtered = expenses.filter((e) => {
    const matchSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = CATEGORIES.map((cat) => ({
    category: cat,
    total: expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
  })).filter((c) => c.total > 0);

  const handleAddExpense = () => {
    const amountNum = parseFloat(amount);
    if (!date || !category || !description || isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please fill in all required fields with valid values.');
      return;
    }
    const newExpense: Omit<Expense, 'id'> = {
      date,
      category,
      description,
      amount: amountNum,
      paymentMethod: paymentMethod || 'Cash',
      approvedBy: approvedBy || 'Manager',
      recordedBy: approvedBy || 'Manager',
    };
    addExpense(newExpense);
    toast.success('Expense recorded successfully!');
    setModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground">Track and manage station expenses</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="min-h-[44px] w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card border rounded-lg p-4 sm:col-span-2 lg:col-span-1">
          <p className="text-xs text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold text-foreground">{formatINR(totalExpenses)}</p>
        </div>
        {categoryTotals.slice(0, 2).map((ct) => (
          <div key={ct.category} className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">{ct.category}</p>
            <p className="text-xl font-bold text-foreground">{formatINR(ct.total)}</p>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      {categoryTotals.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h2 className="font-semibold text-foreground mb-3 text-sm">By Category</h2>
          <div className="flex flex-wrap gap-2">
            {categoryTotals.map((ct) => (
              <div key={ct.category} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-xs">
                <span className="text-muted-foreground">{ct.category}:</span>
                <span className="font-semibold text-foreground">{formatINR(ct.total)}</span>
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
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44 min-h-[44px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expenses Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead className="whitespace-nowrap">Category</TableHead>
                <TableHead className="whitespace-nowrap">Description</TableHead>
                <TableHead className="whitespace-nowrap">Amount</TableHead>
                <TableHead className="whitespace-nowrap hidden sm:table-cell">Payment</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Recorded By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No expenses found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="text-sm whitespace-nowrap">{exp.date}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        {exp.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{exp.description}</TableCell>
                    <TableCell className="text-sm font-medium">{formatINR(exp.amount)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{exp.paymentMethod}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{exp.recordedBy}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Dialog open={modalOpen} onOpenChange={(v) => !v && setModalOpen(false)}>
        <DialogContent className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <Label>Date *</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="min-h-[44px]" />
            </div>
            <div className="space-y-1">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
              />
            </div>
            <div className="space-y-1">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
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
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="min-h-[44px] w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleAddExpense} className="min-h-[44px] w-full sm:w-auto">
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
