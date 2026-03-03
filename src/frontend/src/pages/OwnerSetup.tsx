import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Fuel,
  Loader2,
  Lock,
  Shield,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useOwnerStore } from "../store/ownerStore";

export default function OwnerSetup() {
  const navigate = useNavigate();
  const { setupOwner, ownerSetupDone } = useOwnerStore();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // If owner is already set up, redirect to login
  useEffect(() => {
    if (ownerSetupDone) {
      void navigate({ to: "/login" });
    }
  }, [ownerSetupDone, navigate]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = "Full name is required.";
    if (!username.trim()) errs.username = "Username is required.";
    else if (username.trim().length < 3)
      errs.username = "Username must be at least 3 characters.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    if (!confirmPassword)
      errs.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await setupOwner(name.trim(), username.trim(), password);
      void navigate({ to: "/" });
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

      <div className="relative z-10 w-full max-w-md px-6 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
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

        {/* Setup Card */}
        <div className="bg-navy-700 border border-navy-600 rounded-2xl p-8 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber/20 border border-amber/30">
              <Shield className="h-5 w-5 text-amber" />
            </div>
            <h2 className="font-display text-2xl text-foreground">
              Owner Setup
            </h2>
          </div>
          <p className="text-muted-foreground text-sm mb-6">
            Create the primary owner account to get started
          </p>

          {/* Warning banner */}
          <div className="flex items-start gap-2.5 rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 mb-6">
            <AlertCircle className="h-4 w-4 text-amber mt-0.5 shrink-0" />
            <p className="text-xs text-amber/90 leading-relaxed">
              <span className="font-semibold">Owner account:</span> This account
              will have full access to everything, including User Management.
              Keep the credentials secure.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="owner-name"
                className="text-foreground text-sm font-medium"
              >
                Your Full Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="owner-name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Rajesh Kumar"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className="pl-10 bg-navy-800 border-navy-600 text-foreground placeholder:text-muted-foreground/60 h-11 rounded-xl"
                  data-ocid="owner_setup.input"
                />
              </div>
              {errors.name && (
                <p
                  className="text-xs text-destructive flex items-center gap-1"
                  data-ocid="owner_setup.error_state"
                >
                  <AlertCircle className="h-3 w-3" /> {errors.name}
                </p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <Label
                htmlFor="owner-username"
                className="text-foreground text-sm font-medium"
              >
                Username <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="owner-username"
                  type="text"
                  autoComplete="username"
                  placeholder="e.g. owner123"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrors((prev) => ({ ...prev, username: undefined }));
                  }}
                  className="pl-10 bg-navy-800 border-navy-600 text-foreground placeholder:text-muted-foreground/60 h-11 rounded-xl"
                  data-ocid="owner_setup.input"
                />
              </div>
              {errors.username && (
                <p
                  className="text-xs text-destructive flex items-center gap-1"
                  data-ocid="owner_setup.error_state"
                >
                  <AlertCircle className="h-3 w-3" /> {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="owner-password"
                className="text-foreground text-sm font-medium"
              >
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="owner-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className="pl-10 bg-navy-800 border-navy-600 text-foreground placeholder:text-muted-foreground/60 h-11 rounded-xl"
                  data-ocid="owner_setup.input"
                />
              </div>
              {errors.password && (
                <p
                  className="text-xs text-destructive flex items-center gap-1"
                  data-ocid="owner_setup.error_state"
                >
                  <AlertCircle className="h-3 w-3" /> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="owner-confirm-password"
                className="text-foreground text-sm font-medium"
              >
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="owner-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }));
                  }}
                  className="pl-10 bg-navy-800 border-navy-600 text-foreground placeholder:text-muted-foreground/60 h-11 rounded-xl"
                  data-ocid="owner_setup.input"
                />
              </div>
              {errors.confirmPassword ? (
                <p
                  className="text-xs text-destructive flex items-center gap-1"
                  data-ocid="owner_setup.error_state"
                >
                  <AlertCircle className="h-3 w-3" /> {errors.confirmPassword}
                </p>
              ) : confirmPassword && password === confirmPassword ? (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Passwords match
                </p>
              ) : null}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-amber text-navy-900 hover:bg-amber-light font-semibold text-base rounded-xl transition-all duration-200 shadow-amber mt-2"
              data-ocid="owner_setup.submit_button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Fuel className="w-5 h-5 mr-2" />
                  Create Owner Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-navy-600">
            <p className="text-xs text-muted-foreground text-center">
              Already have an account?{" "}
              <button
                type="button"
                className="text-amber underline underline-offset-2 hover:text-amber-light transition-colors"
                onClick={() => void navigate({ to: "/login" })}
                data-ocid="owner_setup.link"
              >
                Sign in instead
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
