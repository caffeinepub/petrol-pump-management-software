import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppStore, Customer } from '../store/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserPlus, Users, Star, TrendingUp, Trash2, Edit } from 'lucide-react';
import RegisterCustomerModal from '../components/customers/RegisterCustomerModal';
import RedeemPointsModal from '../components/customers/RedeemPointsModal';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function Customers() {
  const customers = useAppStore(s => s.customers);
  const deleteCustomer = useAppStore(s => s.deleteCustomer);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [redeemCustomer, setRedeemCustomer] = useState<Customer | null>(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? c.contact ?? '').includes(search) ||
    c.vehicleNumber.toLowerCase().includes(search.toLowerCase())
  );

  const today = new Date().toISOString().split('T')[0];
  const todayVisits = customers.filter(c => c.lastVisit === today).length;
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
  const avgPurchase = customers.length > 0
    ? customers.reduce((sum, c) => sum + (c.totalPurchases ?? c.totalPurchaseVolume ?? 0), 0) / customers.length
    : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage customer profiles and loyalty</p>
        </div>
        <Button onClick={() => setShowRegister(true)}>
          <UserPlus className="w-4 h-4 mr-2" /> Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" /> Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{customers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Today's Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{todayVisits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Star className="w-3 h-3" /> Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{totalLoyaltyPoints.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Avg. Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatINR(avgPurchase)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name, phone, vehicle..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Phone</TableHead>
                <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                <TableHead>Points</TableHead>
                <TableHead className="hidden md:table-cell">Last Visit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(customer => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate({ to: '/customers/$customerId', params: { customerId: customer.id } })}
                  >
                    <TableCell>
                      <p className="font-medium text-sm text-foreground">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.email}</p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{customer.phone ?? customer.contact ?? '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {customer.vehicleType} · {customer.vehicleNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />{customer.loyaltyPoints}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {customer.lastVisit ?? '—'}
                    </TableCell>
                    <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setRedeemCustomer(customer)}
                        title="Redeem points"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditingCustomer(customer); setShowRegister(true); }}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => deleteCustomer(customer.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RegisterCustomerModal
        open={showRegister}
        onClose={() => { setShowRegister(false); setEditingCustomer(null); }}
        editingCustomer={editingCustomer}
      />
      <RedeemPointsModal
        customer={redeemCustomer}
        open={!!redeemCustomer}
        onClose={() => setRedeemCustomer(null)}
      />
    </div>
  );
}
