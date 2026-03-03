import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PayPeriod } from '../backend';

export default function ProfileSetup() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [role, setRole] = useState('Manager');
  const [contact, setContact] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !name.trim()) return;
    setSaving(true);
    try {
      await actor.saveCallerUserProfile({
        name: name.trim(),
        role,
        contact,
        salary: {
          amount: BigInt(0),
          payPeriod: PayPeriod.monthly,
        },
      });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile created successfully!');
      navigate({ to: '/' });
    } catch (err) {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!identity) {
    navigate({ to: '/login' });
    return null;
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-navy-700 border-2 border-amber mb-4">
            <User className="w-8 h-8 text-amber" />
          </div>
          <h1 className="font-display text-3xl text-amber">Setup Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Complete your profile to get started</p>
        </div>

        <div className="bg-navy-700 border border-navy-600 rounded-2xl p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-foreground mb-2 block">Full Name *</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="bg-navy-800 border-navy-600 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Role</Label>
              <Input
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Manager, Attendant"
                className="bg-navy-800 border-navy-600 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Contact</Label>
              <Input
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="Phone or email"
                className="bg-navy-800 border-navy-600 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button
              type="submit"
              disabled={saving || !name.trim()}
              className="w-full h-11 bg-amber text-navy-900 hover:bg-amber-light font-semibold rounded-xl"
            >
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Complete Setup'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
