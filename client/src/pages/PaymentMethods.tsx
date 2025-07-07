import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Shield, 
  Check, 
  ArrowLeft,
  Lock,
  Star,
  Globe,
  Zap
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const paymentMethods = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: CreditCard,
    description: "Visa, Mastercard, American Express",
    fees: "No additional fees",
    processing: "Instant",
    popular: true
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: Wallet,
    description: "Pay with your PayPal account",
    fees: "No additional fees",
    processing: "Instant",
    popular: false
  },
  {
    id: "apple",
    name: "Apple Pay",
    icon: Smartphone,
    description: "Touch ID or Face ID",
    fees: "No additional fees",
    processing: "Instant",
    popular: false
  },
  {
    id: "google",
    name: "Google Pay",
    icon: Smartphone,
    description: "Pay with Google",
    fees: "No additional fees",
    processing: "Instant",
    popular: false
  }
];

const cardBrands = [
  { name: "Visa", logo: "💳" },
  { name: "Mastercard", logo: "💳" },
  { name: "American Express", logo: "💳" },
  { name: "Discover", logo: "💳" }
];

export default function PaymentMethods() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    email: "",
    country: ""
  });

  // Get selected plan from localStorage or fetch from API
  const getSelectedPlan = () => {
    try {
      const stored = localStorage.getItem('selectedPlan');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.log('No stored plan found');
    }
    
    // Default to Professional plan if nothing stored
    return {
      id: 2,
      name: 'Professional',
      price: 29,
      description: 'Perfect for maritime professionals'
    };
  };

  const selectedPlan = getSelectedPlan();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing for frontend testing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    
    // Show success message
    toast({
      title: "Payment Successful! 🎉",
      description: "Your subscription has been activated. Welcome to PetroDealHub Professional!",
      duration: 5000,
    });
    
    // Redirect to dashboard
    setTimeout(() => {
      setLocation("/dashboard");
    }, 1000);
  };

  const getMethodIcon = (method: typeof paymentMethods[0]) => {
    const IconComponent = method.icon;
    return <IconComponent className="h-6 w-6" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={() => setLocation("/plans")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Payment Method
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Secure, fast, and trusted by thousands of maritime professionals worldwide
            </p>
          </motion.div>

          {/* Security Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">256-bit SSL Encrypted</span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Methods Selection */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred payment method
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.map((method) => (
                    <motion.div
                      key={method.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedMethod === method.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedMethod === method.id ? "bg-blue-100" : "bg-gray-100"
                          }`}>
                            {getMethodIcon(method)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{method.name}</h3>
                              {method.popular && (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                  <Star className="h-3 w-3 mr-1" />
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{method.description}</p>
                            <p className="text-xs text-green-600">{method.fees}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            selectedMethod === method.id
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}>
                            {selectedMethod === method.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Check className="h-3 w-3 text-white m-0.5" />
                              </motion.div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{method.processing}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Payment Form */}
              <AnimatePresence mode="wait">
                {selectedMethod === "card" && (
                  <motion.div
                    key="card-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6"
                  >
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Card Information</CardTitle>
                        <CardDescription>
                          Enter your card details securely
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <div className="relative">
                              <Input
                                id="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={formData.cardNumber}
                                onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
                                maxLength={19}
                                className="pr-12"
                              />
                              <div className="absolute right-3 top-2.5">
                                <CreditCard className="h-5 w-5 text-gray-400" />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiryDate">Expiry Date</Label>
                              <Input
                                id="expiryDate"
                                placeholder="MM/YY"
                                value={formData.expiryDate}
                                onChange={(e) => handleInputChange("expiryDate", formatExpiryDate(e.target.value))}
                                maxLength={5}
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvv">CVV</Label>
                              <div className="relative">
                                <Input
                                  id="cvv"
                                  placeholder="123"
                                  value={formData.cvv}
                                  onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, '').slice(0, 4))}
                                  maxLength={4}
                                  className="pr-8"
                                />
                                <div className="absolute right-2 top-2.5">
                                  <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="cardName">Cardholder Name</Label>
                            <Input
                              id="cardName"
                              placeholder="John Doe"
                              value={formData.cardName}
                              onChange={(e) => handleInputChange("cardName", e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="john@example.com"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="country">Country</Label>
                            <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="us">United States</SelectItem>
                                <SelectItem value="uk">United Kingdom</SelectItem>
                                <SelectItem value="ca">Canada</SelectItem>
                                <SelectItem value="au">Australia</SelectItem>
                                <SelectItem value="de">Germany</SelectItem>
                                <SelectItem value="fr">France</SelectItem>
                                <SelectItem value="jp">Japan</SelectItem>
                                <SelectItem value="sg">Singapore</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              type="submit"
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg font-semibold"
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Processing...
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Lock className="h-4 w-4" />
                                  Complete Payment
                                </div>
                              )}
                            </Button>
                          </motion.div>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {selectedMethod !== "card" && (
                  <motion.div
                    key="other-payment"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6"
                  >
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                      <CardContent className="py-12 text-center">
                        <div className="mb-4">
                          {getMethodIcon(paymentMethods.find(m => m.id === selectedMethod)!)}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          {paymentMethods.find(m => m.id === selectedMethod)?.name}
                        </h3>
                        <p className="text-gray-600 mb-6">
                          You'll be redirected to complete your payment securely
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold"
                            onClick={handleSubmit}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                              </div>
                            ) : (
                              `Continue with ${paymentMethods.find(m => m.id === selectedMethod)?.name}`
                            )}
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Order Summary Sidebar */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>{selectedPlan.name || 'Professional Plan'}</span>
                    <span className="font-semibold">
                      {(selectedPlan.monthlyPrice || selectedPlan.price) === 0 ? 'Free' : `$${selectedPlan.monthlyPrice || selectedPlan.price || 29}/month`}
                    </span>
                  </div>
                  {((selectedPlan.monthlyPrice || selectedPlan.price) || 29) > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Setup fee</span>
                        <span className="line-through">$10</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>First month discount</span>
                        <span>-$10</span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total due today</span>
                    <span>
                      {(selectedPlan.monthlyPrice || selectedPlan.price) === 0 ? 'Free' : `$${Math.max(0, ((selectedPlan.monthlyPrice || selectedPlan.price) || 29) - 10)}`}
                    </span>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold text-blue-900 mb-2">What's included:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3" />
                        Real-time vessel tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3" />
                        Advanced analytics
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3" />
                        Document generation
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3" />
                        Priority support
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Shield className="h-4 w-4" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Globe className="h-4 w-4" />
                      <span>Available worldwide</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Zap className="h-4 w-4" />
                      <span>Instant activation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accepted Cards */}
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Accepted Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {cardBrands.map((brand) => (
                      <div
                        key={brand.name}
                        className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50"
                      >
                        <span className="text-2xl">{brand.logo}</span>
                        <span className="text-sm">{brand.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Lock className="h-4 w-4" />
                      <span>SSL secured & encrypted</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}