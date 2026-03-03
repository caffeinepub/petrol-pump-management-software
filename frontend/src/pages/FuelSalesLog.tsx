import React, { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useGetAllSaleRecords, useCreateSaleRecord } from '../hooks/useQueries';
import { FuelType, PaymentMethod } from '../backend';
import type { FuelSaleRecord } from '../backend';
import { exportSaleRecordsToCSV } from '../utils/csvExport';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Fuel,
  Download,
  PlusCircle,
  Loader2,
  TrendingUp,
  BarChart3,
  Calendar,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatFuelType(ft: FuelType): string {
  switch (ft) {
    case FuelType.petrol: return 'Petrol';
    case FuelType.diesel: return 'Diesel';
    case FuelType.premium: return 'Premium';
    default: return String(ft);
  }
}

function formatPaymentMethod(pm: PaymentMethod): string {
  switch (pm) {
    case PaymentMethod.cash: return 'Cash';
    case PaymentMethod.creditCard: return 'Credit Card';
    case PaymentMethod.mobileMoney: return 'Mobile Money';
    default: return String(pm);
  }
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleString();
}

function formatDateOnly(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString();
}

function fuelTypeBadgeClass(ft: FuelType): string {
  switch (ft) {
    case FuelType.petrol: return 'bg-fuel-petrol/20 text-fuel-petrol border-fuel-petrol/40';
    case FuelType.diesel: return 'bg-fuel-diesel/20 text-fuel-diesel border-fuel-diesel/40';
    case FuelType.premium: return 'bg-amber/20 text-amber border-amber/40';
    default: return '';
  }
}

function paymentBadgeClass(pm: PaymentMethod): string {
  switch (pm) {
    case PaymentMethod.cash: return 'bg-success/20 text-success border-success/40';
    case PaymentMethod.creditCard: return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    case PaymentMethod.mobileMoney: return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
    default: return '';
  }
}

// ─── default form state ──────────────────────────────────────────────────────

interface FormState {
  dateTime: string;
  fuelType: FuelType | '';
  quantityLitres: string;
  pricePerLitre: string;
  vehiclePlate: string;
  attendantName: string;
  paymentMethod: PaymentMethod | '';
}

function defaultForm(): FormState {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  return {
    dateTime: local,
    fuelType: '',
    quantityLitres: '',
    pricePerLitre: '',
    vehiclePlate: '',
    attendantName: '',
    paymentMethod: '',
  };
}

// ─── summary helpers ─────────────────────────────────────────────────────────

interface DailySummary {
  date: string;
  totalLitres: number;
  totalRevenue: number;
}

interface FuelTypeSummary {
  fuelType: FuelType;
  totalLitres: number;
  totalRevenue: number;
}

function computeDailySummaries(records: FuelSaleRecord[]): DailySummary[] {
  const map = new Map<string, DailySummary>();
  for (const r of records) {
    const date = formatDateOnly(r.timestamp);
    const existing = map.get(date) ?? { date, totalLitres: 0, totalRevenue: 0 };
    existing.totalLitres += Number(r.quantityLitres);
    existing.totalRevenue += Number(r.totalAmount);
    map.set(date, existing);
  }
  return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
}

function computeFuelTypeSummaries(records: FuelSaleRecord[]): FuelTypeSummary[] {
  const map = new Map<FuelType, FuelTypeSummary>();
  for (const r of records) {
    const existing = map.get(r.fuelType) ?? { fuelType: r.fuelType, totalLitres: 0, totalRevenue: 0 };
    existing.totalLitres += Number(r.quantityLitres);
    existing.totalRevenue += Number(r.totalAmount);
    map.set(r.fuelType, existing);
  }
  return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
}

// ─── sub-components ──────────────────────────────────────────────────────────

function SummaryCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-amber/10 border border-amber/20">
          <Icon className="w-4 h-4 text-amber" />
        </div>
        <h3 className="font-display text-base text-foreground tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function FuelSalesLog() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: records = [], isLoading: recordsLoading, error: recordsError } = useGetAllSaleRecords();
  const createSaleRecord = useCreateSaleRecord();

  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const isAuthenticated = !!identity;
  const showLoginPrompt = !isAuthenticated && !profileLoading;
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && profile === null;

  // Auto-redirect to profile setup if needed
  React.useEffect(() => {
    if (showProfileSetup) {
      navigate({ to: '/profile-setup' });
    }
  }, [showProfileSetup, navigate]);

  // Computed total
  const computedTotal = useMemo(() => {
    const qty = parseFloat(form.quantityLitres);
    const price = parseFloat(form.pricePerLitre);
    if (!isNaN(qty) && !isNaN(price) && qty > 0 && price > 0) {
      return (qty * price).toFixed(2);
    }
    return '';
  }, [form.quantityLitres, form.pricePerLitre]);

  // Sorted records (most recent first)
  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => Number(b.timestamp) - Number(a.timestamp)),
    [records]
  );

  const dailySummaries = useMemo(() => computeDailySummaries(records), [records]);
  const fuelTypeSummaries = useMemo(() => computeFuelTypeSummaries(records), [records]);

  const totalRevenue = useMemo(() => records.reduce((s, r) => s + Number(r.totalAmount), 0), [records]);
  const totalLitres = useMemo(() => records.reduce((s, r) => s + Number(r.quantityLitres), 0), [records]);

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.dateTime) newErrors.dateTime = 'Date/time is required';
    if (!form.fuelType) newErrors.fuelType = 'Fuel type is required';
    if (!form.quantityLitres || parseFloat(form.quantityLitres) <= 0) newErrors.quantityLitres = 'Enter a valid quantity';
    if (!form.pricePerLitre || parseFloat(form.pricePerLitre) <= 0) newErrors.pricePerLitre = 'Enter a valid price';
    if (!form.vehiclePlate.trim()) newErrors.vehiclePlate = 'Vehicle plate is required';
    if (!form.attendantName.trim()) newErrors.attendantName = 'Attendant name is required';
    if (!form.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const timestampMs = new Date(form.dateTime).getTime();
    const timestampNs = BigInt(timestampMs) * BigInt(1_000_000);
    const qty = Math.round(parseFloat(form.quantityLitres));
    const price = Math.round(parseFloat(form.pricePerLitre));
    const total = Math.round(parseFloat(computedTotal));

    const record: FuelSaleRecord = {
      timestamp: timestampNs,
      fuelType: form.fuelType as FuelType,
      quantityLitres: BigInt(qty),
      pricePerLitre: BigInt(price),
      totalAmount: BigInt(total),
      vehiclePlate: form.vehiclePlate.trim().toUpperCase(),
      attendantName: form.attendantName.trim(),
      paymentMethod: form.paymentMethod as PaymentMethod,
    };

    try {
      await createSaleRecord.mutateAsync(record);
      toast.success('Sale record saved successfully!');
      setForm(defaultForm());
      setErrors({});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save record';
      toast.error(msg);
    }
  }

  function handleExport() {
    if (sortedRecords.length === 0) {
      toast.info('No records to export.');
      return;
    }
    exportSaleRecordsToCSV(sortedRecords, `fuel-sales-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success('CSV exported successfully!');
  }

  // ── Login prompt ──────────────────────────────────────────────────────────
  if (showLoginPrompt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-2xl p-10 max-w-sm w-full text-center shadow-card">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber/10 border border-amber/30 mb-5">
            <Fuel className="w-8 h-8 text-amber" />
          </div>
          <h2 className="font-display text-2xl text-foreground mb-2">Sign In Required</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Please sign in to access the Fuel Sales Log.
          </p>
          <Button
            onClick={() => navigate({ to: '/login' })}
            className="w-full bg-amber text-navy-900 hover:bg-amber-light font-semibold rounded-xl"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-40 overflow-hidden">
        <img
          src="/assets/generated/banner-hero.dim_1200x300.png"
          alt="Fuel Station"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/60 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6 md:px-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-amber/20 border border-amber/40">
                <Fuel className="w-5 h-5 text-amber" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl text-amber tracking-wider">FUEL SALES LOG</h1>
            </div>
            <p className="text-muted-foreground text-sm ml-12">Record and track all fuel transactions</p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">

        {/* ── Stats Row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber/10 border border-amber/20">
              <TrendingUp className="w-5 h-5 text-amber" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Revenue</p>
              <p className="font-display text-2xl text-foreground">{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-fuel-petrol/10 border border-fuel-petrol/20">
              <Fuel className="w-5 h-5 text-fuel-petrol" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Litres Sold</p>
              <p className="font-display text-2xl text-foreground">{totalLitres.toLocaleString()} L</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-fuel-diesel/10 border border-fuel-diesel/20">
              <BarChart3 className="w-5 h-5 text-fuel-diesel" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Transactions</p>
              <p className="font-display text-2xl text-foreground">{records.length}</p>
            </div>
          </div>
        </div>

        {/* ── New Sale Form ──────────────────────────────────────────────── */}
        <div className="bg-card border border-amber/20 rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <PlusCircle className="w-5 h-5 text-amber" />
            <h2 className="font-display text-xl text-foreground tracking-wide">Record New Sale</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Date/Time */}
              <div className="space-y-1.5">
                <Label className="text-foreground text-sm font-medium">Date &amp; Time *</Label>
                <Input
                  type="datetime-local"
                  value={form.dateTime}
                  onChange={e => setForm(f => ({ ...f, dateTime: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
                {errors.dateTime && <p className="text-destructive text-xs">{errors.dateTime}</p>}
              </div>

              {/* Fuel Type */}
              <div className="space-y-1.5">
                <Label className="text-foreground text-sm font-medium">Fuel Type *</Label>
                <Select
                  value={form.fuelType}
                  onValueChange={v => setForm(f => ({ ...f, fuelType: v as FuelType }))}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FuelType.petrol}>Petrol</SelectItem>
                    <SelectItem value={FuelType.diesel}>Diesel</SelectItem>
                    <SelectItem value={FuelType.premium}>Premium</SelectItem>
                  </SelectContent>
                </Select>
                {errors.fuelType && <p className="text-destructive text-xs">{errors.fuelType}</p>}
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <Label className="text-foreground text-sm font-medium">Quantity (Litres) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantityLitres}
                  onChange={e => setForm(f => ({ ...f, quantityLitres: e.target.value }))}
                  placeholder="e.g. 50"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                {errors.quantityLitres && <p className="text-destructive text-xs">{errors.quantityLitres}</p>}
              </div>

              {/* Price Per Litre */}
              <div className="space-y-1.5">
                <Label className="text-foreground text-sm font-medium">Price Per Litre *</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={form.pricePerLitre}
                  onChange={e => setForm(f => ({ ...f, pricePerLitre: e.target.value }))}
                  placeholder="e.g. 150"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                {errors.pricePerLitre && <p className="text-destructive text-xs">{errors.pricePerLitre}</p>}
              </div>

              {/* Total Amount (auto-calculated) */}
              <div className="space-y-1.5">
                <Label className="text-foreground text-sm font-medium">Total Amount (auto)</Label>
                <div className="relative">
                  <Input
                    readOnly
                    value={computedTotal ? computedTotal : ''}
                    placeholder="Auto-calculated"
                    className="bg-amber/5 border-amber/30 text-amber font-semibold placeholder:text-muted-foreground cursor-default"
                  />
                  {computedTotal && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber/60">auto</span>
                  )}
                </div>
              </div>

              {/* Vehicle Plate */}
              <div className="space-y-1.5">
                <Label className="text-foreground text-sm font-medium">Vehicle Plate *</Label>
                <Input
                  value={form.vehiclePlate}
                  onChange={e => setForm(f => ({ ...f, vehiclePlate: e.target.value }))}
                  placeholder="e.g. ABC 1234"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground uppercase"
                />
                {errors.vehiclePlate && <p className="text-destructive text-xs">{errors.vehiclePlate}</p>}
              </div>

              {/* Attendant Name */}
              <div className="space-y-1.5">
                <Label className="text-foreground text-sm font-medium">Attendant Name *</Label>
                <Input
                  value={form.attendantName}
                  onChange={e => setForm(f => ({ ...f, attendantName: e.target.value }))}
                  placeholder="e.g. John Doe"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                {errors.attendantName && <p className="text-destructive text-xs">{errors.attendantName}</p>}
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <Label className="text-foreground text-sm font-medium">Payment Method *</Label>
                <Select
                  value={form.paymentMethod}
                  onValueChange={v => setForm(f => ({ ...f, paymentMethod: v as PaymentMethod }))}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentMethod.cash}>Cash</SelectItem>
                    <SelectItem value={PaymentMethod.creditCard}>Credit Card</SelectItem>
                    <SelectItem value={PaymentMethod.mobileMoney}>Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMethod && <p className="text-destructive text-xs">{errors.paymentMethod}</p>}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                disabled={createSaleRecord.isPending}
                className="bg-amber text-navy-900 hover:bg-amber-light font-semibold px-8 rounded-xl shadow-amber"
              >
                {createSaleRecord.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Save Sale Record
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Reporting Section ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Daily Totals */}
          <SummaryCard title="Daily Totals" icon={Calendar}>
            {recordsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : dailySummaries.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-thin">
                {dailySummaries.map(d => (
                  <div key={d.date} className="flex items-center justify-between py-2 px-3 rounded-lg bg-background border border-border">
                    <span className="text-sm text-foreground font-medium">{d.date}</span>
                    <div className="flex gap-4 text-xs text-right">
                      <span className="text-fuel-petrol">{d.totalLitres.toLocaleString()} L</span>
                      <span className="text-amber font-semibold">{d.totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SummaryCard>

          {/* Fuel Type Breakdown */}
          <SummaryCard title="Fuel Type Breakdown" icon={BarChart3}>
            {recordsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : fuelTypeSummaries.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-3">
                {fuelTypeSummaries.map(s => {
                  const pct = totalLitres > 0 ? (s.totalLitres / totalLitres) * 100 : 0;
                  const barColor =
                    s.fuelType === FuelType.petrol ? 'bg-fuel-petrol' :
                    s.fuelType === FuelType.diesel ? 'bg-fuel-diesel' : 'bg-amber';
                  return (
                    <div key={s.fuelType} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground font-medium">{formatFuelType(s.fuelType)}</span>
                        <div className="flex gap-3 text-xs">
                          <span className="text-muted-foreground">{s.totalLitres.toLocaleString()} L</span>
                          <span className="text-amber font-semibold">{s.totalRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden border border-border">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SummaryCard>
        </div>

        {/* ── Sales History Table ────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-amber" />
              <h2 className="font-display text-xl text-foreground tracking-wide">Sales History</h2>
              {!recordsLoading && (
                <Badge variant="outline" className="text-xs border-amber/30 text-amber">
                  {sortedRecords.length} records
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={sortedRecords.length === 0}
              className="border-amber/30 text-amber hover:bg-amber/10 hover:text-amber"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {recordsError ? (
            <div className="flex items-center gap-3 p-6 text-destructive">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">Failed to load records. Please refresh the page.</p>
            </div>
          ) : recordsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : sortedRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-2xl bg-amber/5 border border-amber/10 mb-4">
                <Fuel className="w-10 h-10 text-amber/40" />
              </div>
              <p className="text-muted-foreground text-sm">No sales records yet.</p>
              <p className="text-muted-foreground text-xs mt-1">Use the form above to record your first sale.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Date/Time</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Fuel Type</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">Qty (L)</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">Price/L</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">Total</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Vehicle</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Attendant</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRecords.map((r, idx) => (
                    <TableRow
                      key={idx}
                      className="border-border hover:bg-amber/5 transition-colors"
                    >
                      <TableCell className="text-sm text-foreground whitespace-nowrap">
                        {formatTimestamp(r.timestamp)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${fuelTypeBadgeClass(r.fuelType)}`}>
                          {formatFuelType(r.fuelType)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-foreground font-medium">
                        {Number(r.quantityLitres).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {Number(r.pricePerLitre).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-sm text-amber font-semibold">
                        {Number(r.totalAmount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-foreground font-mono tracking-wider">
                        {r.vehiclePlate}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {r.attendantName}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${paymentBadgeClass(r.paymentMethod)}`}>
                          {formatPaymentMethod(r.paymentMethod)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-muted-foreground border-t border-border">
          <p>
            © {new Date().getFullYear()} FuelStation Manager Pro &nbsp;·&nbsp; Built with{' '}
            <span className="text-amber">♥</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'fuel-station-tracker')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
