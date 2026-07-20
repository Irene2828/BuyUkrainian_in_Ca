import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, AlertCircle, User } from "lucide-react";
import { login } from "@/lib/auth";
import { SiteBrandLockup } from "@/components/site-brand-lockup";
import "../../components/admin-dashboard.css";

const adminInputClassName =
  "h-[48px] rounded-[12px] border border-[#dbe7f3] bg-white px-4 text-[#243b53] shadow-none transition-colors hover:shadow-none focus-visible:border-[#6ea8dc] focus-visible:ring-4 focus-visible:ring-[#0057B7]/10 focus-visible:ring-offset-0";

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
    <div className="admin-login-shell">
      <Card className="admin-login-card p-0">
        <CardHeader className="space-y-0 px-10 pb-8 pt-10 text-center">
          <div className="mb-7 flex flex-col items-center gap-2">
            <div className="admin-login-mark">
              <SiteBrandLockup className="scale-[0.92] origin-center" />
            </div>
          </div>
          <CardTitle className="mt-5 mb-1 text-center text-[24px] font-bold tracking-[-0.03em] text-[#102A43]">
            Admin access
          </CardTitle>
          <CardDescription className="mb-8 text-center text-[14px] leading-6 text-[#71869B]">
            Volunteer workspace for keeping the map accurate.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-10 pt-0">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#567089]">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8da7bf]" />
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
              <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#567089]">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8da7bf]" />
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
                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#ae3c3c]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="mt-4 h-[48px] w-full rounded-none border border-[#0057B7] bg-transparent px-6 text-[15px] font-bold tracking-tight text-[#0057B7] shadow-none transition-colors hover:bg-[#0057B7] hover:text-white hover:shadow-none"
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
