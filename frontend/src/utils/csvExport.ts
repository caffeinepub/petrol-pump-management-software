import type { FuelSaleRecord } from '../backend';
import { FuelType, PaymentMethod } from '../backend';

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

export function exportSaleRecordsToCSV(records: FuelSaleRecord[], filename = 'fuel-sales.csv'): void {
  const headers = [
    'Date/Time',
    'Fuel Type',
    'Quantity (Litres)',
    'Price Per Litre',
    'Total Amount',
    'Vehicle Plate',
    'Attendant Name',
    'Payment Method',
  ];

  const rows = records.map((r) => [
    formatTimestamp(r.timestamp),
    formatFuelType(r.fuelType),
    r.quantityLitres.toString(),
    r.pricePerLitre.toString(),
    r.totalAmount.toString(),
    r.vehiclePlate,
    r.attendantName,
    formatPaymentMethod(r.paymentMethod),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
