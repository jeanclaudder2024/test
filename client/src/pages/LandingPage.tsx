import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IndustrySlider from "@/components/ui/IndustrySlider";
import { 
  Check, 
  ChevronRight, 
  Ship, 
  BarChart3, 
  Globe, 
  Shield, 
  Zap, 
  Search,
  MapPin,
  LineChart,
  Play,
  Building2,
  Factory,
  TimerReset,
  Clock,
  FileText,
  Network,
  Flame,
  Droplet,
  ServerCrash,
  RefreshCw,
  Users,
  BookOpen,
  Handshake,
  ArrowRight,
  Phone,
  Mail,
  CheckCircle,
  Calendar,
  CheckCircle2,
  Menu,
  Droplets,
  Fuel
} from "lucide-react";
import Header from "@/components/Header";
import SubscriptionPlans from "@/components/subscription/SubscriptionPlans";

// Used for stats counter animation
const AnimatedCounter = ({ value, label, duration = 2000, prefix = "", suffix = "" }: { 
  value: number, 
  label: string, 
  duration?: number,
  prefix?: string,
  suffix?: string 
}) => {
  const [count, setCount] = useState(0);
  const steps = 30;
  const increment = value / steps;

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prevCount => {
        const newCount = prevCount + increment;
        return newCount >= value ? value : newCount;
      });
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value, increment, duration, steps]);

  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        {prefix}{Math.round(count).toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-white/70">{label}</div>
    </div>
  );
};

const Testimonial = ({ quote, author, company, avatarChar }: { 
  quote: string, 
  author: string, 
  company: string,
  avatarChar: string
}) => (
  <div className="bg-slate-800/80 rounded-lg p-6 shadow-md border border-slate-700/50 h-full flex flex-col">
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-xl">
        {avatarChar}
      </div>
      <div className="ml-4">
        <h4 className="font-semibold text-white">{author}</h4>
        <p className="text-sm text-white/60">{company}</p>
      </div>
    </div>
    <p className="text-white/80 mb-4 flex-1">"{quote}"</p>
    <div className="flex text-yellow-500">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  </div>
);

export default function LandingPage() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const whyUsRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch subscription plans (no cache to always get latest)
  const { data: subscriptionPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/subscription-plans'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/subscription-plans');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }
      const plans = await response.json();
      return plans.map((plan: any) => ({
        ...plan,
        price: parseFloat(plan.price),
        isPopular: plan.id === 2 // Professional plan is popular
      }));
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache the results
  });

  // Fetch landing page content from database
  const { data: landingContent, isLoading: contentLoading, refetch: refetchContent } = useQuery({
    queryKey: ['/api/landing-content'],
    queryFn: async () => {
      const response = await fetch('/api/landing-content');
      if (!response.ok) {
        throw new Error('Failed to fetch landing content');
      }
      return response.json();
    },
    staleTime: 60000, // Cache for 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  // Handle trial start - redirect to registration with message
  const handleStartTrial = (planId: number) => {
    // Always show message and redirect to registration
    toast({
      title: "Create Your Account to Start Free Trial",
      description: "Please register to begin your 5-day free trial. No credit card required!",
      variant: "default",
    });
    
    // Store the selected plan and redirect to registration
    localStorage.setItem('selectedTrialPlan', planId.toString());
    navigate('/register?trial=true&plan=' + planId);
  };



  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="home" />

      {/* Hero Section */}
      <section className="pt-40 min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#003366] to-slate-900 text-white flex items-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,111,0,0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(0,51,102,0.2),transparent_50%)]"></div>
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMHYxaC0xVjBoMXptMCA1OXYxaC0xdi0xaDF6TTEgMHYxSDB2LTFIMXM2MCAwaDB2NjBIMHYtMWgxVjBoNTl2NTlIMXoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')]"></div>
          
          {/* Ship/tanker routes */}
          <svg className="absolute inset-0 w-full h-full opacity-10" width="100%" height="100%" preserveAspectRatio="none">
            <path d="M0,100 C150,200 350,0 500,100 C650,200 750,100 1000,150 L1000,500 L0,500 Z" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <path d="M0,200 C150,150 350,300 500,200 C650,100 750,300 1000,250 L1000,500 L0,500 Z" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <path d="M0,300 C150,400 350,200 500,300 C650,400 750,200 1000,300 L1000,500 L0,500 Z" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            
            {/* Animated tankers */}
            <circle className="animate-ping-slow" cx="100" cy="100" r="3" fill="rgba(255,111,0,0.7)" />
            <circle className="animate-ping-slow" cx="300" cy="50" r="3" fill="rgba(255,111,0,0.7)" />
            <circle className="animate-ping-slow" cx="500" cy="150" r="3" fill="rgba(255,111,0,0.7)" />
            <circle className="animate-ping-slow" cx="700" cy="100" r="3" fill="rgba(255,111,0,0.7)" />
            <circle className="animate-ping-slow" cx="900" cy="200" r="3" fill="rgba(255,111,0,0.7)" />
          </svg>
        </div>
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10 py-20 mt-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text */}
              <div className="fade-in-up">
                <Badge variant="outline" className="px-4 py-1 bg-orange-500/20 text-white border-orange-500/30 backdrop-blur-sm mb-6 inline-flex items-center">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse"></div>
                  Premier Oil Trading Platform
                </Badge>
                
{(() => {
                  const heroContent = landingContent?.find((content: any) => content.section === 'hero');
                  if (contentLoading || !heroContent) {
                    return (
                      <>
                        <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-tight mb-6 tracking-tight">
                          Loading...
                        </h1>
                        <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-2xl">
                          Loading content...
                        </p>
                      </>
                    );
                  }
                  
                  return (
                    <>
                      <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-tight mb-6 tracking-tight">
                        {heroContent.title}
                        {heroContent.subtitle && (
                          <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent block mt-2">
                            {heroContent.subtitle}
                          </span>
                        )}
                      </h1>
                      
                      <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-2xl">
                        {heroContent.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 mb-12">
                        <Link href={heroContent.buttonLink || "/dashboard"}>
                          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 py-6 rounded-md shadow-lg shadow-orange-500/20 hover:translate-y-[-2px] transition-all duration-200">
                            {heroContent.buttonText || "Get Started"}
                            <ChevronRight className="h-5 w-5 ml-1" />
                          </Button>
                        </Link>
                        <Link href="/vessels">
                          <Button size="lg" variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/30 font-medium px-8 py-6 rounded-md backdrop-blur-sm hover:translate-y-[-2px] transition-all duration-200">
                            Live Tanker Demo
                            <Play className="h-5 w-5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </>
                  );
                })()}
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
                  <div className="text-center bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <div className="flex justify-center mb-2">
                      <Ship className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-orange-400">2,499+</div>
                    <div className="text-xs text-white/70">Tracked Tankers</div>
                  </div>
                  <div className="text-center bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <div className="flex justify-center mb-2">
                      <Factory className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-orange-400">105+</div>
                    <div className="text-xs text-white/70">Global Refineries</div>
                  </div>
                  <div className="text-center bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <div className="flex justify-center mb-2">
                      <FileText className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-orange-400">500M+</div>
                    <div className="text-xs text-white/70">In Tracked Deals</div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Interactive Map */}
              <div className="relative slide-in-right">
                <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 shadow-2xl shadow-orange-950/20 backdrop-blur-sm bg-slate-900/50">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-orange-500/50 via-transparent to-transparent"></div>
                  
                  {/* Control Bar */}
                  <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-xs text-white/70">Global Tanker Network</div>
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-white/70" />
                      <Menu className="h-4 w-4 text-white/70" />
                    </div>
                  </div>
                  
                  {/* Map Content */}
                  <div className="aspect-[4/3] bg-slate-900 relative overflow-hidden">
                    {/* World Map Background */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI1MCAxMDBDMzAwIDgwIDM1MCA5MCA0MDAgMTIwQzQ1MCAxNTAgNTAwIDE3MCA1NTAgMTYwQzYwMCAxNTAgNjUwIDEyMCA3MDAgMTMwQzc1MCAxNDAgODAwIDE4MCA4NTAgMTYwTDkwMCA2MDBMMTAwIDYwMFoiIGZpbGw9IiMxMTIyNDQiLz48cGF0aCBkPSJNMTUwIDIwMEMyMDAgMTgwIDI1MCAxOTAgMzAwIDIyMEMzNTAgMjUwIDQwMCAyNzAgNDUwIDI2MEM1MDAgMjUwIDU1MCAyMjAgNjAwIDIzMEM2NTAgMjQwIDcwMCAyODAgNzUwIDI2MEw4MDAgNjAwTDUwIDYwMFoiIGZpbGw9IiMxMTIyNDQiLz48cGF0aCBkPSJNNTAgMzAwQzEwMCAyODAgMTUwIDI5MCAyMDAgMzIwQzI1MCAzNTAgMzAwIDM3MCAzNTAgMzYwQzQwMCAzNTAgNDUwIDMyMCA1MDAgMzMwQzU1MCAzNDAgNjAwIDM4MCA2NTAgMzYwTDcwMCA2MDBMMCAgIDYwMFoiIGZpbGw9IiMxMTIyNDQiLz48L3N2Zz4K')]"
                      style={{ opacity: 0.3, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    ></div>
                    
                    {/* Interactive Elements */}
                    <div className="absolute inset-0 p-4">
                      {/* Vessel Routes */}
                      <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="none">
                        {/* Routes */}
                        <path className="animate-dash" d="M100,150 C200,100 300,200 400,150 C500,100 600,150 700,100" stroke="rgba(255,111,0,0.5)" strokeWidth="2" strokeDasharray="5,5" fill="none" />
                        <path className="animate-dash-reverse" d="M50,300 C150,250 250,350 350,300 C450,250 550,300 650,250" stroke="rgba(255,111,0,0.5)" strokeWidth="2" strokeDasharray="5,5" fill="none" />
                        <path className="animate-dash" d="M150,450 C250,400 350,500 450,450 C550,400 650,450 750,400" stroke="rgba(255,111,0,0.5)" strokeWidth="2" strokeDasharray="5,5" fill="none" />
                        
                        {/* Ports */}
                        <circle cx="100" cy="150" r="6" fill="rgba(255,200,50,0.8)" />
                        <circle cx="400" cy="150" r="6" fill="rgba(255,200,50,0.8)" />
                        <circle cx="700" cy="100" r="6" fill="rgba(255,200,50,0.8)" />
                        
                        {/* Tankers */}
                        <circle className="animate-pulse-slow" cx="200" cy="125" r="4" fill="#FF6F00" />
                        <circle className="animate-pulse-slow" cx="550" cy="125" r="4" fill="#FF6F00" />
                        
                        <circle className="animate-pulse-slow" cx="150" cy="275" r="4" fill="#FF6F00" />
                        <circle className="animate-pulse-slow" cx="450" cy="275" r="4" fill="#FF6F00" />
                        
                        <circle className="animate-pulse-slow" cx="250" cy="425" r="4" fill="#FF6F00" />
                        <circle className="animate-pulse-slow" cx="550" cy="425" r="4" fill="#FF6F00" />
                        
                        {/* Refineries */}
                        <rect x="125" y="175" width="10" height="10" fill="#FF6F00" rx="2" />
                        <rect x="425" y="175" width="10" height="10" fill="#FF6F00" rx="2" />
                        <rect x="725" y="125" width="10" height="10" fill="#FF6F00" rx="2" />
                      </svg>
                      
                      {/* Live Labels */}
                      <div className="absolute top-3 left-3 bg-slate-800/80 backdrop-blur-sm text-xs text-white px-2 py-1 rounded flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                        LIVE TRACKING
                      </div>
                      
                      {/* Controls */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                        <button className="w-8 h-8 rounded bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700/80 transition-colors flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                        <button className="w-8 h-8 rounded bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700/80 transition-colors flex items-center justify-center">
                          <svg width="14" height="2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                      
                      {/* Bottom Panel */}
                      <div className="absolute left-0 right-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 to-transparent flex items-end">
                        <div className="w-full h-10 px-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-sm border-t border-slate-700/30">
                          <div className="text-xs text-white/70">2,499 active tankers</div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          </div>
                          <div className="text-xs text-white/70">05:23:14 UTC</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -bottom-4 -right-4 bg-slate-800/80 backdrop-blur-xl text-white text-sm px-4 py-2 rounded-full border border-slate-700/30 shadow-lg">
                  <div className="flex items-center">
                    <div className="flex -space-x-2 mr-3">
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs border-2 border-slate-800">T</div>
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs border-2 border-slate-800">R</div>
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs border-2 border-slate-800">D</div>
                    </div>
                    <span className="font-medium">End-to-End Deal Flow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Showcase Slider Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMHYxaC0xVjBoMXptMCA1OXYxaC0xdi0xaDF6TTEgMHYxSDB2LTFIMXM2MCAwaDB2NjBIMHYtMWgxVjBoNTl2NTlIMXoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L2c+PC9zdmc+')]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30">Global Infrastructure</Badge>
{(() => {
              const industryContent = landingContent?.find((content: any) => content.section === 'industry');
              return (
                <>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                    {industryContent?.title || "Connecting the World's Energy Infrastructure"}
                  </h2>
                  <p className="text-white/70 text-lg">
                    {industryContent?.description || "From massive refineries to state-of-the-art tankers and strategic ports worldwide"}
                  </p>
                </>
              );
            })()}
          </div>

          <IndustrySlider />
        </div>
      </section>

      {/* Why PetroDealHub? Section */}
      <section id="why-us" ref={whyUsRef} className="bg-[#003366] py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,111,0,0.05),transparent_40%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_70%,rgba(255,111,0,0.05),transparent_40%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30">The Problem & Solution</Badge>
{(() => {
              const whyUsContent = landingContent?.find((content: any) => content.section === 'why-us');
              return (
                <>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                    {whyUsContent?.title || "Traditional Oil Trading is Broken. We're Here to Fix It."}
                  </h2>
                  <p className="text-white/70 text-lg">
                    {whyUsContent?.description || "Our platform transforms the fragmented, inefficient petroleum trading process into a streamlined, secure digital ecosystem."}
                  </p>
                </>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Pillar 1 */}
            <div className="bg-slate-800/40 rounded-xl p-8 border border-slate-700/50 backdrop-blur-sm relative group hover:bg-slate-800/60 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-6">
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Speed</h3>
              <p className="text-white/70 mb-6">
                Reduce deal time from weeks to hours with our streamlined digital processes and automated workflows.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Real-time tanker position updates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Instant refinery capacity checks</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Automated document generation</span>
                </li>
              </ul>
            </div>
            
            {/* Pillar 2 */}
            <div className="bg-slate-800/40 rounded-xl p-8 border border-slate-700/50 backdrop-blur-sm relative group hover:bg-slate-800/60 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-6">
                <Globe className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Transparency</h3>
              <p className="text-white/70 mb-6">
                Gain unprecedented visibility with trusted, verified data and connections across the entire supply chain.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Verified broker and trader profiles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Authenticated refinery connections</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">End-to-end transaction visibility</span>
                </li>
              </ul>
            </div>
            
            {/* Pillar 3 */}
            <div className="bg-slate-800/40 rounded-xl p-8 border border-slate-700/50 backdrop-blur-sm relative group hover:bg-slate-800/60 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-6">
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Smart Docs</h3>
              <p className="text-white/70 mb-6">
                Automated, verified, and secure trade documentation for every step of the petroleum deal process.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">LOI, SPA, B/L, SGS automated generation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Secure digital signature integration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Compliant document management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Showcase Section */}
      <section id="features" ref={featuresRef} className="bg-gradient-to-br from-slate-950 to-[#002244] py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMHYxaC0xVjBoMXptMCA1OXYxaC0xdi0xaDF6TTEgMHYxSDB2LTFIMXM2MCAwaDB2NjBIMHYtMWgxVjBoNTl2NTlIMXoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L2c+PC9zdmc+')]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30">Platform Features</Badge>
{(() => {
              const featuresContent = landingContent?.find((content: any) => content.section === 'features');
              return (
                <>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                    {featuresContent?.title || "Complete Petroleum Trading Ecosystem"}
                  </h2>
                  <p className="text-white/70 text-lg">
                    {featuresContent?.description || "An all-in-one platform designed to handle every aspect of modern petroleum trading"}
                  </p>
                </>
              );
            })()}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative overflow-hidden rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="p-8">
                <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-6">
                  <Ship className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Tanker Tracking</h3>
                <p className="text-white/70 mb-4">
                  Real-time global monitoring of oil vessels with advanced filtering and analytics
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">Live position & status updates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">Cargo type & capacity visibility</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">Historical route analysis</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="p-8">
                <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-6">
                  <Factory className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Refinery Intelligence</h3>
                <p className="text-white/70 mb-4">
                  Complete global refinery database with capacity and operational insights
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">Real-time capacity availability</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">Product specifications & capabilities</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">Direct refinery connectivity</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="p-8">
                <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-6">
                  <Handshake className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Deal Execution</h3>
                <p className="text-white/70 mb-4">
                  Secure, digital negotiation and finalization of petroleum trades
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">Digital offer & acceptance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">Automated compliance checks</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">Real-time price evaluation tools</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Feature 4 */}
            <div className="group relative overflow-hidden rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="p-8">
                <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-6">
                  <FileText className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Document Management</h3>
                <p className="text-white/70 mb-4">
                  Generate, store, and manage all essential trade documentation
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">LOI, SPA, B/L, SGS automation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">Secure document storage</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">E-signature integration</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Feature 5 */}
            <div className="group relative overflow-hidden rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="p-8">
                <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-6">
                  <Droplets className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Multi-Product Support</h3>
                <p className="text-white/70 mb-4">
                  Comprehensive tools for trading various petroleum products
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">Crude oil, diesel, gasoline tracking</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">Jet fuel & petroleum coke deals</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">Product-specific documentation</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Feature 6 */}
            <div className="group relative overflow-hidden rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="p-8">
                <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-6">
                  <LineChart className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Analytics & Reporting</h3>
                <p className="text-white/70 mb-4">
                  Powerful insights into market trends and deal performance
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">Custom analytics dashboards</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">Transaction performance metrics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">Advanced export capabilities</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" ref={howItWorksRef} className="bg-[#002244] py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,111,0,0.05),transparent_40%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30">Process</Badge>
{(() => {
              const howItWorksContent = landingContent?.find((content: any) => content.section === 'how-it-works');
              return (
                <>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                    {howItWorksContent?.title || "How PetroDealHub Works"}
                  </h2>
                  <p className="text-white/70 text-lg">
                    {howItWorksContent?.description || "Our streamlined petroleum trading workflow connects every step of the deal process in one platform"}
                  </p>
                </>
              );
            })()}
          </div>
          
          <div className="max-w-5xl mx-auto">
            {/* Horizontal Step Process (Desktop) */}
            <div className="hidden md:block">
              <div className="relative">
                {/* Connection Line */}
                <div className="absolute top-16 left-0 right-0 h-2 bg-slate-700/50">
                  <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-orange-500 to-orange-400 transform origin-left animate-[linear_10s_infinite_alternate]"></div>
                </div>
                
                <div className="grid grid-cols-4 gap-6">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute top-[56px] left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full border-4 border-orange-500 bg-slate-900 z-10"></div>
                    <div className="text-center mb-20">
                      <div className="p-3 bg-orange-500/20 rounded-full inline-flex mb-6 mx-auto">
                        <Ship className="h-8 w-8 text-orange-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">Track & Discover</h3>
                      <p className="text-white/70">
                        Monitor live tanker positions and available cargo worldwide
                      </p>
                    </div>
                    
                    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
                      <h4 className="font-medium text-white text-sm mb-2">Key Activities:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                          <span className="text-white/80 text-xs">Identify vessel locations</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                          <span className="text-white/80 text-xs">Review cargo types & capacities</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                          <span className="text-white/80 text-xs">Evaluate tanker availability</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="relative">
                    <div className="absolute top-[56px] left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full border-4 border-orange-500 bg-slate-900 z-10"></div>
                    <div className="text-center mb-20">
                      <div className="p-3 bg-orange-500/20 rounded-full inline-flex mb-6 mx-auto">
                        <Factory className="h-8 w-8 text-orange-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">Connect to Refineries</h3>
                      <p className="text-white/70">
                        Link with available refinery slots and capacity worldwide
                      </p>
                    </div>
                    
                    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
                      <h4 className="font-medium text-white text-sm mb-2">Key Activities:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                          <span className="text-white/80 text-xs">Check refinery availability</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                          <span className="text-white/80 text-xs">Verify processing capabilities</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                          <span className="text-white/80 text-xs">Reserve processing capacity</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="relative">
                    <div className="absolute top-[56px] left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full border-4 border-orange-500 bg-slate-900 z-10"></div>
                    <div className="text-center mb-20">
                      <div className="p-3 bg-orange-500/20 rounded-full inline-flex mb-6 mx-auto">
                        <Handshake className="h-8 w-8 text-orange-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">Negotiate & Secure</h3>
                      <p className="text-white/70">
                        Conduct secure deal discussions between all parties
                      </p>
                    </div>
                    
                    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
                      <h4 className="font-medium text-white text-sm mb-2">Key Activities:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                          <span className="text-white/80 text-xs">Digital price negotiation</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                          <span className="text-white/80 text-xs">Secure offer management</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                          <span className="text-white/80 text-xs">Term sheet preparation</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Step 4 */}
                  <div className="relative">
                    <div className="absolute top-[56px] left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full border-4 border-orange-500 bg-slate-900 z-10"></div>
                    <div className="text-center mb-20">
                      <div className="p-3 bg-orange-500/20 rounded-full inline-flex mb-6 mx-auto">
                        <FileText className="h-8 w-8 text-orange-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">Document & Execute</h3>
                      <p className="text-white/70">
                        Finalize with automated, verified document generation
                      </p>
                    </div>
                    
                    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
                      <h4 className="font-medium text-white text-sm mb-2">Key Activities:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                          <span className="text-white/80 text-xs">Generate LOI, SPA, B/L documents</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                          <span className="text-white/80 text-xs">Secure digital signatures</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                          <span className="text-white/80 text-xs">Track execution compliance</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Vertical Step Process (Mobile) */}
            <div className="md:hidden">
              <div className="space-y-10">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-6 w-1 bg-slate-700/50"></div>
                  <div className="flex">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-orange-500 bg-slate-900 flex items-center justify-center z-10">
                        <span className="text-white font-bold">1</span>
                      </div>
                      <div className="absolute top-14 left-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-transparent h-[calc(100%-56px)]"></div>
                    </div>
                    <div className="ml-6 pb-10">
                      <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-4">
                        <Ship className="h-6 w-6 text-orange-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">Track & Discover</h3>
                      <p className="text-white/70 mb-4">
                        Monitor live tanker positions and available cargo worldwide
                      </p>
                      <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                            <span className="text-white/80 text-sm">Identify vessel locations</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                            <span className="text-white/80 text-sm">Review cargo types & capacities</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-6 w-1 bg-slate-700/50"></div>
                  <div className="flex">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-orange-500 bg-slate-900 flex items-center justify-center z-10">
                        <span className="text-white font-bold">2</span>
                      </div>
                      <div className="absolute top-14 left-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-transparent h-[calc(100%-56px)]"></div>
                    </div>
                    <div className="ml-6 pb-10">
                      <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-4">
                        <Factory className="h-6 w-6 text-orange-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">Connect to Refineries</h3>
                      <p className="text-white/70 mb-4">
                        Link with available refinery slots and capacity worldwide
                      </p>
                      <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                            <span className="text-white/80 text-sm">Check refinery availability</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                            <span className="text-white/80 text-sm">Verify processing capabilities</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-6 w-1 bg-slate-700/50"></div>
                  <div className="flex">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-orange-500 bg-slate-900 flex items-center justify-center z-10">
                        <span className="text-white font-bold">3</span>
                      </div>
                      <div className="absolute top-14 left-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-transparent h-[calc(100%-56px)]"></div>
                    </div>
                    <div className="ml-6 pb-10">
                      <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-4">
                        <Handshake className="h-6 w-6 text-orange-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">Negotiate & Secure</h3>
                      <p className="text-white/70 mb-4">
                        Conduct secure deal discussions between all parties
                      </p>
                      <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                            <span className="text-white/80 text-sm">Digital price negotiation</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                            <span className="text-white/80 text-sm">Secure offer management</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 4 */}
                <div className="relative">
                  <div className="flex">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-orange-500 bg-slate-900 flex items-center justify-center z-10">
                        <span className="text-white font-bold">4</span>
                      </div>
                    </div>
                    <div className="ml-6">
                      <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-4">
                        <FileText className="h-6 w-6 text-orange-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">Document & Execute</h3>
                      <p className="text-white/70 mb-4">
                        Finalize with automated, verified document generation
                      </p>
                      <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                            <span className="text-white/80 text-sm">Generate LOI, SPA, B/L documents</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-orange-500 shrink-0 mt-0.5" />
                            <span className="text-white/80 text-sm">Secure digital signatures</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" ref={resultsRef} className="bg-gradient-to-br from-[#001f3f] to-slate-900 py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,111,0,0.05),transparent_60%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30">Real Results</Badge>
{(() => {
              const resultsContent = landingContent?.find((content: any) => content.section === 'results');
              return (
                <>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                    {resultsContent?.title || "Delivering Results That Matter"}
                  </h2>
                  <p className="text-white/70 text-lg">
                    {resultsContent?.description || "Trusted by petroleum professionals worldwide with proven impact"}
                  </p>
                </>
              );
            })()}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16">
            <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm text-center">
              <AnimatedCounter value={200} label="Global Deals Executed" suffix="+" />
            </div>
            <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm text-center">
              <AnimatedCounter value={500} label="In Tracked Transactions" prefix="$" suffix="M+" />
            </div>
            <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm text-center">
              <AnimatedCounter value={15} label="Faster Closing Time" suffix="%" />
            </div>
            <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm text-center">
              <AnimatedCounter value={50} label="Refinery Zones Worldwide" suffix="+" />
            </div>
          </div>
          
          {/* Testimonials */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-white text-center mb-12">What Our Customers Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Testimonial 
                quote="PetroDealHub has revolutionized our petroleum trading process. The real-time tracking and smart documentation features have cut our deal time in half."
                author="Sarah Johnson"
                company="Global Energy Trading"
                avatarChar="S"
              />
              <Testimonial 
                quote="The platform's refinery connection features give us unprecedented visibility into processing capacities worldwide. This has been a game-changer for our operations."
                author="Mohammed Al-Farsi"
                company="Gulf Oil Distribution Co."
                avatarChar="M"
              />
              <Testimonial 
                quote="Document management used to be our biggest headache. Now, with automated LOIs and SPAs, we can focus on making deals instead of paperwork."
                author="Carlos Rodriguez"
                company="Atlantic Petroleum Brokers"
                avatarChar="C"
              />
            </div>
          </div>
          
          {/* Partner Logos */}
          <div className="mt-20">
            <div className="text-center mb-10 text-white/50 text-sm font-medium">TRUSTED BY LEADING COMPANIES</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 items-center justify-items-center opacity-50">
              <div className="text-2xl font-bold text-white/60">EnergyX</div>
              <div className="text-2xl font-bold text-white/60">PetroGlobal</div>
              <div className="text-2xl font-bold text-white/60">OceanOil</div>
              <div className="text-2xl font-bold text-white/60">TradeTanker</div>
              <div className="text-2xl font-bold text-white/60">RefineCorp</div>
              <div className="text-2xl font-bold text-white/60">FuelFutures</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#003366] via-slate-900 to-[#001f3f] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,111,0,0.1),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800/40 rounded-2xl p-10 border border-slate-700/50 backdrop-blur-sm shadow-xl">
              <div className="text-center mb-8">
{(() => {
                  const ctaContent = landingContent?.find((content: any) => content.section === 'cta');
                  return (
                    <>
                      <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        {ctaContent?.title || "Transform Your Oil & Petroleum Trading Today"}
                      </h2>
                      <p className="text-lg text-white/80 max-w-2xl mx-auto">
                        {ctaContent?.description || "Join industry leaders who are already leveraging PetroDealHub for faster, smarter, and more profitable petroleum deals."}
                      </p>
                    </>
                  );
                })()}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="p-2 bg-orange-500/20 rounded-lg mr-4 shrink-0">
                      <CheckCircle className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-1">Streamlined Deal Workflow</h4>
                      <p className="text-sm text-white/70">Connect every step of the petroleum trading process</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="p-2 bg-orange-500/20 rounded-lg mr-4 shrink-0">
                      <CheckCircle className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-1">Advanced Tanker Intelligence</h4>
                      <p className="text-sm text-white/70">Real-time, global vessel monitoring and tracking</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="p-2 bg-orange-500/20 rounded-lg mr-4 shrink-0">
                      <CheckCircle className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-1">Automated Documentation</h4>
                      <p className="text-sm text-white/70">Effortless generation of all required trade documents</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-900/70 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-xl font-bold mb-4 text-center text-white">Book Your Free Demo</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="text-sm text-white/70 mb-1 block">Full Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-orange-500" 
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/70 mb-1 block">Company Email</label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-orange-500" 
                        placeholder="your@company.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/70 mb-1 block">Company</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-orange-500" 
                        placeholder="Your company name"
                      />
                    </div>
                    <Button className="w-full py-6 bg-orange-500 hover:bg-orange-600 text-white">
{(() => {
                        const ctaContent = landingContent?.find((content: any) => content.section === 'cta');
                        return ctaContent?.buttonText || "Request Demo Now";
                      })()}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <p className="text-xs text-center text-white/50 mt-4">
                      By submitting, you agree to our Terms of Service & Privacy Policy
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section id="pricing" className="bg-gradient-to-br from-slate-950 to-[#002244] py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,111,0,0.1),transparent_60%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="outline" className="px-4 py-1 bg-orange-500/20 text-white border-orange-500/30 backdrop-blur-sm mb-6 inline-flex items-center">
              <div className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse"></div>
              Flexible Pricing Plans
            </Badge>
{(() => {
              const pricingContent = landingContent?.find((content: any) => content.section === 'pricing');
              return (
                <>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                    {pricingContent?.title || "Choose the Perfect Plan for Your Business"}
                  </h2>
                  <p className="text-lg text-white/80 max-w-3xl mx-auto mb-6">
                    {pricingContent?.description || "Our subscription plans are designed to meet the needs of oil trading operations of all sizes, from independent brokers to large international corporations."}
                  </p>
                </>
              );
            })()}
            <div className="inline-flex items-center gap-6 text-sm text-orange-300/80">
              <span>✅ 5-Day free trial for every plan</span>
              <span>•</span>
              <span>✅ No credit card required</span>
              <span>•</span>
              <span>✅ Cancel anytime</span>
            </div>
          </div>
          
          {/* Use the improved SubscriptionPlans component with monthly/yearly toggle */}
          <SubscriptionPlans onSelectPlan={handleStartTrial} />
          
          <div className="mt-16 text-center">
            <p className="text-white/70 mb-6">
              Need a custom solution for your specific business requirements?
            </p>
            <Link href="/auth">
              <Button variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10 font-medium px-6 py-2">
                Contact Our Enterprise Team
                <Phone className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/50 py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 font-bold text-2xl mb-4">
                <img src="/assets/petrodealhub-logo.png" alt="PetroDealHub Logo" className="h-36 w-auto" />
                <span className="text-white sr-only">PetroDealHub</span>
              </div>
              <p className="text-white/60 mb-6 max-w-md">
                The premier platform for petroleum trading professionals, providing real-time tanker tracking, 
                refinery intelligence, and smart document automation.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-white/60 hover:text-orange-500 hover:bg-slate-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-white/60 hover:text-orange-500 hover:bg-slate-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-white/60 hover:text-orange-500 hover:bg-slate-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Platform</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-white/60 hover:text-orange-500">Features</Link></li>
                <li><Link href="#how-it-works" className="text-white/60 hover:text-orange-500">How It Works</Link></li>
                <li><Link href="/pricing" className="text-white/60 hover:text-orange-500">Pricing</Link></li>
                <li><Link href="/refineries" className="text-white/60 hover:text-orange-500">Refineries</Link></li>
                <li><Link href="/vessels" className="text-white/60 hover:text-orange-500">Vessels</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-white/60 hover:text-orange-500">Blog</Link></li>
                <li><Link href="/documentation" className="text-white/60 hover:text-orange-500">Documentation</Link></li>
                <li><Link href="/support" className="text-white/60 hover:text-orange-500">Support</Link></li>
                <li><Link href="/api" className="text-white/60 hover:text-orange-500">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-white/60 hover:text-orange-500">About Us</Link></li>
                <li><Link href="/careers" className="text-white/60 hover:text-orange-500">Careers</Link></li>
                <li><Link href="/privacy" className="text-white/60 hover:text-orange-500">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-white/60 hover:text-orange-500">Terms of Service</Link></li>
                <li><Link href="/contact" className="text-white/60 hover:text-orange-500">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-white/50">
              © 2025 PetroDealHub. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-4">
              <a href="#" className="text-sm text-white/50 hover:text-orange-500">Privacy Policy</a>
              <span className="text-white/30">|</span>
              <a href="#" className="text-sm text-white/50 hover:text-orange-500">Terms of Service</a>
              <span className="text-white/30">|</span>
              <a href="#" className="text-sm text-white/50 hover:text-orange-500">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}