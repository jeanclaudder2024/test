import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Register() {
  const [, setLocation] = useLocation();
  const { signUp, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsSubmitting(false);
      return;
    }

    if (!formData.agreedToTerms) {
      setError("Please agree to the Terms of Service");
      setIsSubmitting(false);
      return;
    }

    const result = await signUp(formData.email, formData.password);
    
    if (result.success) {
      setLocation("/dashboard");
    } else {
      setError(result.error || "Registration failed");
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error when user starts typing
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,111,0,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(0,51,102,0.15),transparent_50%)]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img src="/assets/petrodealhub-logo.png" alt="PetroDealHub" className="h-8 w-auto" />
              <span className="text-xl font-bold text-white">PetroDealHub</span>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Create your account
            </CardTitle>
            <CardDescription className="text-white/60">
              Start your 3-day free trial today
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Trial Benefits */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-orange-400" />
                <span className="text-orange-400 font-medium">3-Day Free Trial</span>
              </div>
              <p className="text-white/70 text-sm">
                Full access to all features including vessel tracking, market data, and trading tools.
              </p>
            </div>

            {error && (
              <Alert className="border-red-500/20 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:ring-orange-500/20"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min. 6 characters)"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:ring-orange-500/20"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-white/40 hover:text-white/60"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:ring-orange-500/20"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-white/40 hover:text-white/60"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms"
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreedToTerms", checked as boolean)}
                    className="mt-1 border-white/20 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    required
                    disabled={isSubmitting}
                  />
                  <div className="text-sm text-white/80 leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms">
                      <span className="text-orange-400 hover:text-orange-300 underline">
                        Terms of Service
                      </span>
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy">
                      <span className="text-orange-400 hover:text-orange-300 underline">
                        Privacy Policy
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-6 rounded-lg shadow-lg shadow-orange-500/20 transition-all duration-200 hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !formData.agreedToTerms}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Start free trial
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <span className="text-white/60">Already have an account? </span>
              <Link href="/login">
                <span className="text-orange-400 hover:text-orange-300 font-medium cursor-pointer">
                  Sign in
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}