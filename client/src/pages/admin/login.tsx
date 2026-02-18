import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, AlertCircle, User } from "lucide-react";
import { login } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [_, setLocation] = useLocation();
  const { t } = useI18n();

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center">
              <img
                src="/header-logo.png"
                alt="BuyUkrainian.ca"
                className="h-[61px] w-auto object-contain ml-[-12px]"
              />
              <div className="flex flex-col justify-center ml-[-22px] h-10 font-instrument">
                <span className="text-[16.5px] font-medium tracking-[-0.02em] text-[#2D50A0]/70 leading-none">
                  Ukrainian Products
                </span>
                <span className="text-[16.5px] font-medium tracking-[-0.02em] text-[#2D50A0]/70 leading-none mt-[2px]">
                  in Canada
                </span>
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-bold text-slate-400 uppercase tracking-wider font-ui">
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
                  className="pl-11 h-12 rounded-xl border-slate-200 focus:border-brand-navy/20 focus:ring-brand-navy/5"
                  data-testid="input-admin-username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider font-ui">
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
                  className={`pl-11 h-12 rounded-xl border-slate-200 focus:border-brand-navy/20 focus:ring-brand-navy/5 ${error ? "border-red-500" : ""}`}
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
              className="w-full h-[54px] rounded-full bg-[linear-gradient(to_bottom,#3A3F4F,#2F3341)] text-white font-medium text-[16px] tracking-tight antialiased transition-all duration-300 shadow-md hover:shadow-lg hover:bg-[linear-gradient(to_bottom,#3A3F4F,#3A3F4F)] hover:scale-[1.02] active:scale-[0.98] mt-4"
              disabled={isLoading || !password}
              data-testid="button-admin-login"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
