import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Fuel, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { login, loginStatus, identity, isLoggingIn } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!identity) return;
    if (profileLoading) return;
    if (!isFetched) return;
    if (profile === null) {
      navigate({ to: '/profile-setup' });
    } else {
      navigate({ to: '/' });
    }
  }, [identity, profile, profileLoading, isFetched, navigate]);

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, oklch(0.75 0.18 65) 0, oklch(0.75 0.18 65) 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-navy-700 border-2 border-amber mb-4 shadow-amber">
            <img src="/assets/generated/pump-logo.dim_128x128.png" alt="PumpPro" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="font-display text-4xl text-amber tracking-wider">PUMPPRO</h1>
          <p className="text-muted-foreground text-sm mt-1 font-sans">Petrol Station Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-navy-700 border border-navy-600 rounded-2xl p-8 shadow-card">
          <h2 className="font-display text-2xl text-foreground mb-2">Welcome Back</h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to access your station dashboard</p>

          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-12 bg-amber text-navy-900 hover:bg-amber-light font-semibold text-base rounded-xl transition-all duration-200 shadow-amber"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Sign In with Internet Identity
              </>
            )}
          </Button>

          {loginStatus === 'loginError' && (
            <p className="text-destructive text-sm mt-4 text-center">Login failed. Please try again.</p>
          )}

          <div className="mt-6 pt-6 border-t border-navy-600">
            <p className="text-xs text-muted-foreground text-center">
              Secure authentication powered by Internet Identity
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {['Fuel Sales', 'Inventory', 'Analytics'].map(f => (
            <div key={f} className="bg-navy-700/50 rounded-xl p-3 border border-navy-600">
              <Fuel className="w-5 h-5 text-amber mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">{f}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
