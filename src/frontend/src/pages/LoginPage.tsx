import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Fuel, Loader2, Lock, LogIn, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useOwnerStore } from "../store/ownerStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, ownerSetupDone, activeUserId } = useOwnerStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (ownerSetupDone && activeUserId) {
      void navigate({ to: "/" });
    }
  }, [ownerSetupDone, activeUserId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const success = await login(username.trim(), password);
      if (success) {
        void navigate({ to: "/" });
      } else {
        setError("Invalid username or password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, oklch(0.75 0.18 65) 0, oklch(0.75 0.18 65) 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-navy-700 border-2 border-amber mb-4 shadow-amber">
            <img
              src="/assets/generated/pump-logo.dim_128x128.png"
              alt="PumpPro"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="font-display text-4xl text-amber tracking-wider">
            PUMPPRO
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-sans">
            Petrol Station Management System
          </p>
        </div>

        {/* Owner setup banner */}
        {!ownerSetupDone && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber/30 bg-amber/10 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-amber mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="text-amber font-semibold mb-0.5">
                First time here?
              </p>
              <p className="text-amber/80">
                Set up your Owner account first before signing in.{" "}
                <button
                  type="button"
                  className="underline underline-offset-2 font-semibold hover:text-amber transition-colors"
                  onClick={() => void navigate({ to: "/owner-setup" })}
                  data-ocid="login.owner_setup.link"
                >
                  Set up now →
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-navy-700 border border-navy-600 rounded-2xl p-8 shadow-card">
          <h2 className="font-display text-2xl text-foreground mb-2">
            Welcome Back
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in to access your station dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Username */}
            <div className="space-y-1.5">
              <Label
                htmlFor="login-username"
                className="text-foreground text-sm font-medium"
              >
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  className="pl-10 bg-navy-800 border-navy-600 text-foreground placeholder:text-muted-foreground/60 h-11 rounded-xl"
                  data-ocid="login.input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="login-password"
                className="text-foreground text-sm font-medium"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="pl-10 bg-navy-800 border-navy-600 text-foreground placeholder:text-muted-foreground/60 h-11 rounded-xl"
                  data-ocid="login.input"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5"
                data-ocid="login.error_state"
              >
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Sign In button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-amber text-navy-900 hover:bg-amber-light font-semibold text-base rounded-xl transition-all duration-200 shadow-amber mt-2"
              data-ocid="login.submit_button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-navy-600">
            <p className="text-xs text-muted-foreground text-center">
              Secure local authentication for station management
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {["Fuel Sales", "Inventory", "Analytics"].map((f) => (
            <div
              key={f}
              className="bg-navy-700/50 rounded-xl p-3 border border-navy-600"
            >
              <Fuel className="w-5 h-5 text-amber mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">{f}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
