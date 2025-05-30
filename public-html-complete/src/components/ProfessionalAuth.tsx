import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Shield, Mail, Lock, User, Building, CheckCircle, AlertCircle, Ship, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuthResponse {
  success: boolean;
  message: string;
  user?: any;
  token?: string;
  requiresVerification?: boolean;
  requiresOtp?: boolean;
  email?: string;
  tempToken?: string;
  nextStep?: string;
}

interface ProfessionalAuthProps {
  onSuccess: (user: any, token: string) => void;
}

export function ProfessionalAuth({ onSuccess }: ProfessionalAuthProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showLoginOtp, setShowLoginOtp] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [tempToken, setTempToken] = useState('');
  const { toast } = useToast();

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 25;
    return Math.min(score, 100);
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 30) return "bg-red-500";
    if (strength < 60) return "bg-yellow-500";
    if (strength < 80) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 30) return "Weak";
    if (strength < 60) return "Fair";
    if (strength < 80) return "Good";
    return "Strong";
  };

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: ''
  });
  
  // Password visibility and strength
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    emailOrUsername: '',
    password: ''
  });

  // OTP form state
  const [otpForm, setOtpForm] = useState({
    otpCode: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (registerForm.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          firstName: registerForm.firstName,
          lastName: registerForm.lastName,
          company: registerForm.company
        }),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setPendingEmail(registerForm.email);
        setShowEmailVerification(true);
        toast({
          title: "Account Created Successfully",
          description: "Please check your email for the verification code.",
        });
      } else {
        setError(data.message);
        toast({
          title: "Registration Failed",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
      toast({
        title: "Registration Error",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrUsername: loginForm.emailOrUsername,
          password: loginForm.password
        }),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        if (data.requiresVerification) {
          setPendingEmail(data.email || '');
          setShowEmailVerification(true);
          setSuccess(data.message);
        } else if (data.requiresOtp) {
          setPendingEmail(data.email || '');
          setTempToken(data.tempToken || '');
          setShowLoginOtp(true);
          setSuccess(data.message);
        } else {
          // Direct login success
          onSuccess(data.user, data.token || '');
          toast({
            title: "Welcome Back!",
            description: "Successfully logged into your professional account.",
          });
        }
      } else {
        setError(data.message);
        toast({
          title: "Login Failed",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      toast({
        title: "Login Error",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pendingEmail,
          otpCode: otpForm.otpCode
        }),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setShowEmailVerification(false);
        setActiveTab('login');
        toast({
          title: "Email Verified!",
          description: "Your account is now fully activated. Please login.",
        });
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Email verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pendingEmail,
          otpCode: otpForm.otpCode,
          tempToken: tempToken
        }),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        onSuccess(data.user, data.token || '');
        toast({
          title: "Welcome Back!",
          description: "Successfully logged into your professional account.",
        });
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async (type: 'email_verification' | 'login_verification') => {
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pendingEmail,
          type: type
        }),
      });
      
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error) {
      toast({
        title: "Resend Failed",
        description: "Failed to resend verification code.",
        variant: "destructive"
      });
    }
  };

  // Email Verification Screen
  if (showEmailVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a verification code to<br />
              <strong>{pendingEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otpCode">6-Digit Verification Code</Label>
                <Input
                  id="otpCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otpForm.otpCode}
                  onChange={(e) => setOtpForm({ ...otpForm, otpCode: e.target.value })}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Email
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              variant="ghost" 
              onClick={() => resendVerificationCode('email_verification')}
              className="text-sm"
            >
              Didn't receive the code? Resend
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShowEmailVerification(false)}
              className="text-sm"
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Login OTP Verification Screen
  if (showLoginOtp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">Secure Login Verification</CardTitle>
            <CardDescription>
              Enter the verification code sent to<br />
              <strong>{pendingEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginOtpVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginOtpCode">6-Digit Login Code</Label>
                <Input
                  id="loginOtpCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otpForm.otpCode}
                  onChange={(e) => setOtpForm({ ...otpForm, otpCode: e.target.value })}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Login
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              variant="ghost" 
              onClick={() => resendVerificationCode('login_verification')}
              className="text-sm"
            >
              Didn't receive the code? Resend
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShowLoginOtp(false)}
              className="text-sm"
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Main Authentication Screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Ship className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">PetroDealHub</CardTitle>
          <CardDescription>Professional Maritime Oil Trading Platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailOrUsername">Email or Username</Label>
                  <Input
                    id="emailOrUsername"
                    type="text"
                    placeholder="Enter your email or username"
                    value={loginForm.emailOrUsername}
                    onChange={(e) => setLoginForm({ ...loginForm, emailOrUsername: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Lock className="mr-2 h-4 w-4" />
                  Secure Login
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={registerForm.firstName}
                      onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Smith"
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="Choose a unique username"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Professional Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Your oil trading company"
                    value={registerForm.company}
                    onChange={(e) => setRegisterForm({ ...registerForm, company: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={registerForm.password}
                      onChange={(e) => {
                        setRegisterForm({ ...registerForm, password: e.target.value });
                        setPasswordStrength(calculatePasswordStrength(e.target.value));
                      }}
                      className="bg-slate-50 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {registerForm.password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Password Strength:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength < 30 ? 'text-red-600' :
                          passwordStrength < 60 ? 'text-yellow-600' :
                          passwordStrength < 80 ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {getPasswordStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <Progress 
                        value={passwordStrength} 
                        className={`h-2 ${getPasswordStrengthColor(passwordStrength)}`}
                      />
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`flex items-center ${registerForm.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            8+ characters
                          </div>
                          <div className={`flex items-center ${/[A-Z]/.test(registerForm.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Uppercase letter
                          </div>
                          <div className={`flex items-center ${/[a-z]/.test(registerForm.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Lowercase letter
                          </div>
                          <div className={`flex items-center ${/[0-9]/.test(registerForm.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Number
                          </div>
                          <div className={`flex items-center ${/[^a-zA-Z0-9]/.test(registerForm.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Special character
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      className="bg-slate-50 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Passwords do not match
                    </p>
                  )}
                </div>
                

                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <User className="mr-2 h-4 w-4" />
                  Create Professional Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            Secure maritime trading platform with enterprise-level authentication
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}