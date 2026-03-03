import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useAppStore, CustomerPurchase } from '../store/appStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, ShoppingBag, Gift } from 'lucide-react';
import RedeemPointsModal from '../components/customers/RedeemPointsModal';

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

export default function CustomerDetail() {
  const { customerId } = useParams({ from: '/layout/customers/$customerId' });
  const navigate = useNavigate();
  const customers = useAppStore(s => s.customers);
  const customerPurchases = useAppStore(s => s.customerPurchases);
  const [showRedeem, setShowRedeem] = useState(false);

  const customer = customers.find(c => c.id === customerId);
  const purchases: CustomerPurchase[] = customerPurchases[customerId] ?? [];

  if (!customer) {
    return (
      <div className="text-center py-20 p-6">
        <p className="text-muted-foreground">Customer not found.</p>
        <Button onClick={() => navigate({ to: '/customers' })} className="mt-4">
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/customers' })}
        className="text-muted-foreground hover:text-foreground -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Customers
      </Button>

      {/* Customer Header */}
      <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-primary text-xl sm:text-2xl font-bold">
                {customer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{customer.name}</h2>
              <p className="text-muted-foreground text-sm">{customer.contact}</p>
              <Badge variant="outline" className="mt-1 font-mono text-xs">
                {customer.vehicleNumber}
              </Badge>
            </div>
          </div>
          <Button
            onClick={() => setShowRedeem(true)}
            className="min-h-[44px] w-full sm:w-auto"
          >
            <Gift className="w-4 h-4 mr-2" />
            Redeem Points
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div className="bg-muted rounded-xl p-3 sm:p-4 border border-border">
            <p className="text-muted-foreground text-xs mb-1">Registered</p>
            <p className="text-foreground font-semibold text-sm">
              {new Date(customer.registrationDate).toLocaleDateString('en-IN')}
            </p>
          </div>
          <div className="bg-muted rounded-xl p-3 sm:p-4 border border-border">
            <p className="text-muted-foreground text-xs mb-1">Total Volume</p>
            <p className="text-foreground font-semibold text-sm">
              {customer.totalPurchaseVolume.toLocaleString('en-IN')}L
            </p>
          </div>
          <div className="bg-primary/10 rounded-xl p-3 sm:p-4 border border-primary/30 col-span-2 sm:col-span-1">
            <p className="text-primary text-xs mb-1 flex items-center gap-1">
              <Star className="w-3 h-3" />
              Loyalty Points
            </p>
            <p className="text-primary text-2xl font-bold">{customer.loyaltyPoints.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <div className="bg-card rounded-2xl border border-border p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          Purchase History ({purchases.length})
        </h3>
        {purchases.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No purchases yet</p>
        ) : (
          <div className="space-y-2">
            {purchases.map((p: CustomerPurchase) => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{p.fuelType}</Badge>
                  <div>
                    <p className="text-sm text-foreground font-medium">{p.quantity}L</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.date).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary font-semibold text-sm">{formatINR(p.amount)}</p>
                  <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                    <Star className="w-3 h-3 text-primary" />
                    +{p.pointsEarned} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RedeemPointsModal open={showRedeem} onClose={() => setShowRedeem(false)} customer={customer} />
    </div>
  );
}
