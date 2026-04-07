import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, AlertCircle, User } from "lucide-react";
import { login } from "@/lib/auth";
import { SiteBrandLockup } from "@/components/site-brand-lockup";

const adminInputClassName =
  "h-[48px] rounded-[12px] border border-slate-200 bg-white px-4 text-[#1E293B] shadow-none transition-colors hover:shadow-none focus-visible:border-[#0057B7]/40 focus-visible:ring-0 focus-visible:ring-offset-0";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [_, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(password, username || undefined);
      if (result.success) {
        setLocation("/admin/dashboard");
      } else {
        setError(result.error || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <Card className="w-full max-w-[420px] rounded-[24px] border-white bg-white p-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-slate-200/50">
        <CardHeader className="space-y-0 px-10 pb-8 pt-10 text-center">
          <div className="mb-8 flex flex-col items-center gap-2">
            <SiteBrandLockup className="scale-[1.1] origin-center -ml-1" />
          </div>
          <CardTitle className="mt-6 mb-1 text-center text-[22px] font-semibold tracking-tight text-[#0057B7]">
            Admin access
          </CardTitle>
          <CardDescription className="mb-8 text-center text-[14px] text-slate-400">
            Volunteer dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-10 pt-0">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className={`${adminInputClassName} pl-11`}
                  data-testid="input-admin-username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${adminInputClassName} pl-11 ${error ? "border-red-400 focus-visible:border-red-400" : ""}`}
                  disabled={isLoading}
                  data-testid="input-admin-password"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-500 mt-2 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="mt-4 h-[46px] w-full rounded-full bg-[#0057B7] px-6 text-[16px] font-medium tracking-tight text-white shadow-none transition-colors hover:bg-[#0047A0] hover:shadow-none"
              disabled={isLoading || !password}
              data-testid="button-admin-login"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
