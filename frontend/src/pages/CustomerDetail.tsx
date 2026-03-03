import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useAppStore } from '../store/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail, Car, Star, ShoppingBag } from 'lucide-react';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function CustomerDetail() {
  const { customerId } = useParams({ from: '/layout/customers/$customerId' });
  const navigate = useNavigate();
  const customers = useAppStore(s => s.customers);
  const fuelSales = useAppStore(s => s.fuelSales);

  const customer = customers.find(c => c.id === customerId);

  if (!customer) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Customer not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate({ to: '/customers' })}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const customerSales = fuelSales.filter(s => s.customerId === customerId);
  const totalSpent = customerSales.reduce((sum, s) => sum + (s.total ?? s.totalAmount ?? 0), 0);
  const totalLitres = customerSales.reduce((sum, s) => sum + (s.litres ?? s.quantity ?? 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/customers' })}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
          <p className="text-muted-foreground text-sm">Customer Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contact Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{customer.phone ?? customer.contact ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{customer.email || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Car className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{customer.vehicleType} · {customer.vehicleNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-warning" />
              <span className="text-foreground">{customer.loyaltyPoints} loyalty points</span>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">Member since {customer.registrationDate}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Purchase Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-xl font-bold text-foreground">{formatINR(totalSpent)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Total Volume</p>
              <p className="text-xl font-bold text-foreground">
                {totalLitres.toLocaleString('en-IN')}L
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="text-xl font-bold text-foreground">{customerSales.length}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Loyalty Points</p>
              <p className="text-xl font-bold text-foreground">{customer.loyaltyPoints}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Purchase History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customerSales.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No purchases recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {customerSales.map(sale => (
                <div key={sale.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{sale.fuelType}</p>
                    <p className="text-xs text-muted-foreground">{sale.date} · {sale.litres ?? sale.quantity}L · Pump {sale.pumpNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{formatINR(sale.total ?? sale.totalAmount ?? 0)}</p>
                    <Badge variant="outline" className="text-xs">{sale.paymentMethod}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
