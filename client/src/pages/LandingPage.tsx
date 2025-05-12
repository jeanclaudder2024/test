import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Check, 
  ChevronRight, 
  Anchor, 
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
  GanttChart,
  Wifi,
  Users,
  MenuIcon,
  XIcon
} from "lucide-react";

// Used for stats counter animation
const AnimatedCounter = ({ value, label, duration = 2000 }: { value: number, label: string, duration?: number }) => {
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
      <div className="text-4xl md:text-5xl font-bold text-primary-100 mb-2">
        {Math.round(count).toLocaleString()}+
      </div>
      <div className="text-sm text-white/70">{label}</div>
    </div>
  );
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <header 
        className={`px-4 lg:px-6 h-20 flex items-center justify-between fixed w-full z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-background/90 border-b border-border/50 backdrop-blur-lg shadow-md" 
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-2xl">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 backdrop-blur-sm">
            <Ship className="h-6 w-6 text-primary" />
          </div>
          <span className={scrolled ? "text-foreground" : "text-white"}>OceanTrack</span>
        </div>
        
        {/* Desktop Menu */}
        <nav className="hidden lg:flex gap-8 items-center">
          <Link href="#features" className={`text-sm font-medium hover:text-primary transition-colors ${scrolled ? "text-foreground/80" : "text-white/80"}`}>
            Features
          </Link>
          <Link href="#solutions" className={`text-sm font-medium hover:text-primary transition-colors ${scrolled ? "text-foreground/80" : "text-white/80"}`}>
            Solutions
          </Link>
          <Link href="#testimonials" className={`text-sm font-medium hover:text-primary transition-colors ${scrolled ? "text-foreground/80" : "text-white/80"}`}>
            Testimonials
          </Link>
          <Link href="#pricing" className={`text-sm font-medium hover:text-primary transition-colors ${scrolled ? "text-foreground/80" : "text-white/80"}`}>
            Pricing
          </Link>
          <div className="h-6 w-px bg-border/50"></div>
          <Link href="/refineries" className={`text-sm font-medium hover:text-primary transition-colors ${scrolled ? "text-foreground/80" : "text-white/80"}`}>
            Refineries
          </Link>
          <Link href="/vessels" className={`text-sm font-medium hover:text-primary transition-colors ${scrolled ? "text-foreground/80" : "text-white/80"}`}>
            Vessels
          </Link>
        </nav>
        
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/auth">
            <Button variant="ghost" className={scrolled ? "text-foreground" : "text-white hover:text-white hover:bg-white/10"}>
              Log In
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="default" className="bg-primary hover:bg-primary/90">
              Get Started
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <XIcon className={`h-6 w-6 ${scrolled ? "text-foreground" : "text-white"}`} />
          ) : (
            <MenuIcon className={`h-6 w-6 ${scrolled ? "text-foreground" : "text-white"}`} />
          )}
        </button>
      </header>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-lg pt-20 px-4 py-6 flex flex-col">
          <nav className="flex flex-col gap-4">
            <Link href="#features" className="text-lg font-medium py-2 border-b border-border/20" onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
            <Link href="#solutions" className="text-lg font-medium py-2 border-b border-border/20" onClick={() => setMobileMenuOpen(false)}>
              Solutions
            </Link>
            <Link href="#testimonials" className="text-lg font-medium py-2 border-b border-border/20" onClick={() => setMobileMenuOpen(false)}>
              Testimonials
            </Link>
            <Link href="#pricing" className="text-lg font-medium py-2 border-b border-border/20" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </Link>
            <Link href="/refineries" className="text-lg font-medium py-2 border-b border-border/20" onClick={() => setMobileMenuOpen(false)}>
              Refineries
            </Link>
            <Link href="/vessels" className="text-lg font-medium py-2 border-b border-border/20" onClick={() => setMobileMenuOpen(false)}>
              Vessels
            </Link>
          </nav>
          <div className="mt-auto flex flex-col gap-3 pt-6">
            <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">Log In</Button>
            </Link>
            <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">Get Started</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="w-full min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-primary-950 to-slate-900 text-white flex items-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(30,64,175,0.25),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(79,70,229,0.2),transparent_50%)]"></div>
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMHYxaC0xVjBoMXptMCA1OXYxaC0xdi0xaDF6TTEgMHYxSDB2LTFIMXM2MCAwaDB2NjBIMHYtMWgxVjBoNTl2NTlIMXoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')]"></div>
          
          {/* Ship routes */}
          <svg className="absolute inset-0 w-full h-full opacity-10" width="100%" height="100%" preserveAspectRatio="none">
            <path d="M0,100 C150,200 350,0 500,100 C650,200 750,100 1000,150 L1000,500 L0,500 Z" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <path d="M0,200 C150,150 350,300 500,200 C650,100 750,300 1000,250 L1000,500 L0,500 Z" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <path d="M0,300 C150,400 350,200 500,300 C650,400 750,200 1000,300 L1000,500 L0,500 Z" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            
            {/* Animated vessels */}
            <circle className="animate-ping-slow" cx="100" cy="100" r="3" fill="rgba(255,255,255,0.7)" />
            <circle className="animate-ping-slow" cx="300" cy="50" r="3" fill="rgba(255,255,255,0.7)" />
            <circle className="animate-ping-slow" cx="500" cy="150" r="3" fill="rgba(255,255,255,0.7)" />
            <circle className="animate-ping-slow" cx="700" cy="100" r="3" fill="rgba(255,255,255,0.7)" />
            <circle className="animate-ping-slow" cx="900" cy="200" r="3" fill="rgba(255,255,255,0.7)" />
            
            <circle className="animate-ping-slow" cx="150" cy="200" r="3" fill="rgba(255,255,255,0.7)" />
            <circle className="animate-ping-slow" cx="350" cy="250" r="3" fill="rgba(255,255,255,0.7)" />
            <circle className="animate-ping-slow" cx="550" cy="200" r="3" fill="rgba(255,255,255,0.7)" />
            <circle className="animate-ping-slow" cx="750" cy="300" r="3" fill="rgba(255,255,255,0.7)" />
            
            <circle className="animate-ping-slow" cx="200" cy="300" r="3" fill="rgba(255,255,255,0.7)" />
            <circle className="animate-ping-slow" cx="400" cy="350" r="3" fill="rgba(255,255,255,0.7)" />
            <circle className="animate-ping-slow" cx="600" cy="300" r="3" fill="rgba(255,255,255,0.7)" />
            <circle className="animate-ping-slow" cx="800" cy="400" r="3" fill="rgba(255,255,255,0.7)" />
          </svg>
        </div>
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10 py-20 mt-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text */}
              <div>
                <Badge variant="outline" className="px-4 py-1 bg-white/10 text-white border-primary/30 backdrop-blur-sm mb-6 inline-flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></div>
                  Maritime Intelligence Platform
                </Badge>
                
                <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-tight mb-6 tracking-tight">
                  Advanced Maritime Intelligence with 
                  <span className="bg-gradient-to-r from-primary-300 to-blue-300 bg-clip-text text-transparent block md:inline">
                    {" "}Real-Time Tracking
                  </span>
                </h1>
                
                <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-2xl">
                  Monitor global maritime traffic with precision. Track vessels, analyze routes, and access real-time data for 
                  refineries and ports worldwide through our comprehensive intelligence platform.
                </p>
                
                <div className="flex flex-wrap gap-4 mb-12">
                  <Link href="/refineries">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-6 rounded-md shadow-lg shadow-primary/20 hover:translate-y-[-2px] transition-all duration-200">
                      Explore Refineries
                      <ChevronRight className="h-5 w-5 ml-1" />
                    </Button>
                  </Link>
                  <Link href="/vessels">
                    <Button size="lg" variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/30 font-medium px-8 py-6 rounded-md backdrop-blur-sm hover:translate-y-[-2px] transition-all duration-200">
                      Live Tracking Demo
                      <Play className="h-5 w-5 ml-1" />
                    </Button>
                  </Link>
                </div>
                
                {/* Animated Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
                  <AnimatedCounter value={2499} label="Vessels Tracked" />
                  <AnimatedCounter value={223} label="Global Ports" />
                  <AnimatedCounter value={105} label="Refineries" />
                </div>
              </div>
              
              {/* Right Column - Interactive Map */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-primary-950/40 backdrop-blur-sm bg-slate-950/50">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 via-transparent to-transparent"></div>
                  
                  {/* Control Bar */}
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-xs text-white/70">Maritime Intelligence Dashboard</div>
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-white/70" />
                      <MenuIcon className="h-4 w-4 text-white/70" />
                    </div>
                  </div>
                  
                  {/* Map Content */}
                  <div className="aspect-[4/3] bg-slate-900 relative overflow-hidden">
                    {/* World Map Background */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI1MCAxMDBDMzAwIDgwIDM1MCA5MCA0MDAgMTIwQzQ1MCAxNTAgNTAwIDE3MCA1NTAgMTYwQzYwMCAxNTAgNjUwIDEyMCA3MDAgMTMwQzc1MCAxNDAgODAwIDE4MCA4NTAgMTYwTDkwMCA2MDBMMTAwIDYwMFoiIGZpbGw9IiMxMTIyNDQiLz48cGF0aCBkPSJNMTUwIDIwMEMyMDAgMTgwIDI1MCAxOTAgMzAwIDIyMEMzNTAgMjUwIDQwMCAyNzAgNDUwIDI2MEM1MDAgMjUwIDU1MCAyMjAgNjAwIDIzMEM2NTAgMjQwIDcwMCAyODAgNzUwIDI2MEw4MDAgNjAwTDUwIDYwMFoiIGZpbGw9IiMxMTIyNDQiLz48cGF0aCBkPSJNNTAgMzAwQzEwMCAyODAgMTUwIDI5MCAyMDAgMzIwQzI1MCAzNTAgMzAwIDM3MCAzNTAgMzYwQzQwMCAzNTAgNDUwIDMyMCA1MDAgMzMwQzU1MCAzNDAgNjAwIDM4MCA2NTAgMzYwTDcwMCA2MDBMMCAgIDYwMFoiIGZpbGw9IiMxMTIyNDQiLz48L3N2Zz4K')]"
                      style={{ opacity: 0.2, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    ></div>
                    
                    {/* Interactive Elements */}
                    <div className="absolute inset-0 p-4">
                      {/* Vessel Routes */}
                      <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="none">
                        {/* Routes */}
                        <path className="animate-dash" d="M100,150 C200,100 300,200 400,150 C500,100 600,150 700,100" stroke="rgba(50,120,255,0.5)" strokeWidth="2" strokeDasharray="5,5" fill="none" />
                        <path className="animate-dash-reverse" d="M50,300 C150,250 250,350 350,300 C450,250 550,300 650,250" stroke="rgba(100,200,255,0.5)" strokeWidth="2" strokeDasharray="5,5" fill="none" />
                        <path className="animate-dash" d="M150,450 C250,400 350,500 450,450 C550,400 650,450 750,400" stroke="rgba(0,170,255,0.5)" strokeWidth="2" strokeDasharray="5,5" fill="none" />
                        
                        {/* Ports */}
                        <circle cx="100" cy="150" r="6" fill="rgba(255,200,50,0.8)" />
                        <circle cx="400" cy="150" r="6" fill="rgba(255,200,50,0.8)" />
                        <circle cx="700" cy="100" r="6" fill="rgba(255,200,50,0.8)" />
                        
                        {/* Vessels */}
                        <circle className="animate-pulse-slow" cx="200" cy="125" r="4" fill="#60A5FA" />
                        <circle className="animate-pulse-slow" cx="550" cy="125" r="4" fill="#60A5FA" />
                        
                        <circle className="animate-pulse-slow" cx="150" cy="275" r="4" fill="#60A5FA" />
                        <circle className="animate-pulse-slow" cx="450" cy="275" r="4" fill="#60A5FA" />
                        
                        <circle className="animate-pulse-slow" cx="250" cy="425" r="4" fill="#60A5FA" />
                        <circle className="animate-pulse-slow" cx="550" cy="425" r="4" fill="#60A5FA" />
                        
                        {/* Refineries */}
                        <rect x="125" y="175" width="10" height="10" fill="#F97316" rx="2" />
                        <rect x="425" y="175" width="10" height="10" fill="#F97316" rx="2" />
                        <rect x="725" y="125" width="10" height="10" fill="#F97316" rx="2" />
                      </svg>
                      
                      {/* Live Labels */}
                      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-xs text-white px-2 py-1 rounded flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                        LIVE DATA
                      </div>
                      
                      {/* Controls */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                        <button className="w-8 h-8 rounded bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                        <button className="w-8 h-8 rounded bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center">
                          <svg width="14" height="2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                      
                      {/* Bottom Panel */}
                      <div className="absolute left-0 right-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 to-transparent flex items-end">
                        <div className="w-full h-10 px-4 flex items-center justify-between bg-slate-950/90 backdrop-blur-sm border-t border-white/10">
                          <div className="text-xs text-white/70">2,499 vessels active</div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          </div>
                          <div className="text-xs text-white/70">05:23:14 UTC</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -bottom-4 -right-4 bg-white/5 backdrop-blur-xl text-white text-sm px-4 py-2 rounded-full border border-white/10 shadow-lg">
                  <div className="flex items-center">
                    <div className="flex -space-x-2 mr-3">
                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-xs border-2 border-white/10">R</div>
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs border-2 border-white/10">V</div>
                      <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs border-2 border-white/10">P</div>
                    </div>
                    <span className="font-medium">Intelligent Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Premium Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Advanced Maritime Intelligence Tools</h2>
            <p className="text-muted-foreground text-lg">
              Our comprehensive platform provides essential tools for maritime professionals to track, analyze, and optimize operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border border-border/50 bg-gradient-to-b from-background to-muted/30 overflow-hidden group relative hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Ship className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-Time Vessel Tracking</CardTitle>
                <CardDescription>Monitor maritime traffic with live GPS updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Track 2,499+ vessels worldwide</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Live position and speed data</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Advanced filtering by vessel type</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border border-border/50 bg-gradient-to-b from-background to-muted/30 overflow-hidden group relative hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Factory className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Refinery Intelligence</CardTitle>
                <CardDescription>Complete global refinery database</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Data on 105+ refineries worldwide</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Production capacity insights</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Connected port integration</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border border-border/50 bg-gradient-to-b from-background to-muted/30 overflow-hidden group relative hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Port Management</CardTitle>
                <CardDescription>Comprehensive port database</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Data on 223+ ports globally</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Port capacity and specifications</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Vessel traffic analysis</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border border-border/50 bg-gradient-to-b from-background to-muted/30 overflow-hidden group relative hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <LineChart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>Powerful data visualization tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Custom reporting dashboards</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Historical data analysis</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Export tools for reports</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border border-border/50 bg-gradient-to-b from-background to-muted/30 overflow-hidden group relative hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <TimerReset className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-Time Alerts</CardTitle>
                <CardDescription>Stay informed with instant notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Custom alert parameters</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Email and SMS notifications</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Geofencing capabilities</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border border-border/50 bg-gradient-to-b from-background to-muted/30 overflow-hidden group relative hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <GanttChart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Comprehensive Documentation</CardTitle>
                <CardDescription>Complete document management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Bill of lading tracking</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Cargo manifests management</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">Secure document storage</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solutions Section with Tabs */}
      <section id="solutions" className="bg-muted/30 py-20 lg:py-32 border-y border-border/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Industry Solutions</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Tailored for Your Maritime Needs</h2>
            <p className="text-muted-foreground text-lg">
              Our platform provides specialized solutions for different industry segments within the maritime sector.
            </p>
          </div>

          <Tabs defaultValue="shipping" className="max-w-5xl mx-auto">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-8">
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="oil">Oil & Gas</TabsTrigger>
              <TabsTrigger value="ports">Ports</TabsTrigger>
              <TabsTrigger value="trading">Trading</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="shipping" className="border rounded-lg p-6 bg-card shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Shipping Fleet Management</h3>
                  <p className="text-muted-foreground mb-6">
                    Optimize your fleet operations with real-time tracking, route analysis, and comprehensive vessel intelligence.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Complete fleet tracking and management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Route optimization and fuel efficiency</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Maintenance scheduling and alerts</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Crew management integration</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/vessels">
                      <Button>Explore Fleet Solutions</Button>
                    </Link>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-6 border border-border/40">
                  <div className="aspect-video relative overflow-hidden rounded-md bg-slate-950">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(50,80,150,0.2),transparent_50%)]"></div>
                    <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 500 300">
                      <path d="M0,50 C100,30 200,70 300,50 C400,30 500,50 600,40" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5,5" fill="none" className="animate-dash" />
                      <circle cx="150" cy="50" r="5" fill="#60A5FA" className="animate-pulse" />
                      <circle cx="300" cy="50" r="5" fill="#60A5FA" className="animate-pulse" />
                      <circle cx="450" cy="40" r="5" fill="#60A5FA" className="animate-pulse" />
                      
                      <path d="M0,100 C100,120 200,80 300,100 C400,120 500,100 600,110" stroke="#60A5FA" strokeWidth="2" strokeDasharray="5,5" fill="none" className="animate-dash-reverse" />
                      <circle cx="150" cy="100" r="5" fill="#93C5FD" className="animate-pulse" />
                      <circle cx="300" cy="100" r="5" fill="#93C5FD" className="animate-pulse" />
                      <circle cx="450" cy="110" r="5" fill="#93C5FD" className="animate-pulse" />
                      
                      <path d="M0,150 C100,170 200,130 300,150 C400,170 500,150 600,160" stroke="#60A5FA" strokeWidth="2" strokeDasharray="5,5" fill="none" className="animate-dash" />
                      <circle cx="150" cy="150" r="5" fill="#60A5FA" className="animate-pulse" />
                      <circle cx="300" cy="150" r="5" fill="#60A5FA" className="animate-pulse" />
                      <circle cx="450" cy="160" r="5" fill="#60A5FA" className="animate-pulse" />
                    </svg>
                    
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-950 to-transparent"></div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-background/50 rounded border border-border/30">
                      <div className="text-2xl font-bold text-primary">127</div>
                      <div className="text-xs text-muted-foreground">Vessels</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded border border-border/30">
                      <div className="text-2xl font-bold text-primary">43</div>
                      <div className="text-xs text-muted-foreground">Routes</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded border border-border/30">
                      <div className="text-2xl font-bold text-primary">98%</div>
                      <div className="text-xs text-muted-foreground">Uptime</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="oil" className="border rounded-lg p-6 bg-card shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Oil & Gas Intelligence</h3>
                  <p className="text-muted-foreground mb-6">
                    Monitor global oil movements, refinery operations, and gain valuable insights into supply chains.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Global refinery operations monitoring</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Tanker fleet tracking and analysis</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Supply chain visualization</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Market intelligence reporting</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/refineries">
                      <Button>Explore Oil & Gas Solutions</Button>
                    </Link>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-6 border border-border/40">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-square bg-slate-950 rounded-md relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Factory className="h-16 w-16 text-primary/20" />
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <div className="text-4xl font-bold text-primary">105</div>
                        <div className="text-sm text-muted-foreground">Global Refineries</div>
                      </div>
                    </div>
                    <div className="aspect-square bg-slate-950 rounded-md relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Ship className="h-16 w-16 text-primary/20" />
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <div className="text-4xl font-bold text-primary">583</div>
                        <div className="text-sm text-muted-foreground">Tanker Vessels</div>
                      </div>
                    </div>
                    <div className="col-span-2 aspect-[2/1] bg-slate-950 rounded-md relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(50,80,150,0.2),transparent_50%)]"></div>
                      <div className="absolute inset-0 p-4 flex flex-col">
                        <div className="text-sm font-medium mb-2">Global Capacity</div>
                        <div className="flex-1 grid grid-cols-10 gap-1">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <div 
                              key={i} 
                              className="bg-primary/10 rounded-sm" 
                              style={{ 
                                height: `${Math.max(15, Math.random() * 100)}%`,
                                opacity: 0.5 + Math.random() * 0.5
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ports" className="border rounded-lg p-6 bg-card shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Port Operations & Management</h3>
                  <p className="text-muted-foreground mb-6">
                    Optimize port operations with real-time vessel tracking, berth planning, and traffic management tools.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Vessel arrival prediction</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Berth allocation optimization</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Port congestion monitoring</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Cargo throughput tracking</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/ports">
                      <Button>Explore Port Solutions</Button>
                    </Link>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-6 border border-border/40">
                  <div className="aspect-video bg-slate-950 rounded-md relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapPin className="h-32 w-32 text-primary/10" />
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-10 bg-slate-900/80 backdrop-blur-sm flex items-center px-4">
                      <div className="text-sm font-medium">Port Operations Dashboard</div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-2">
                      <div className="bg-background/20 backdrop-blur-sm rounded p-2 text-center">
                        <div className="text-xl font-bold text-primary">23</div>
                        <div className="text-xs">Arriving</div>
                      </div>
                      <div className="bg-background/20 backdrop-blur-sm rounded p-2 text-center">
                        <div className="text-xl font-bold text-primary">17</div>
                        <div className="text-xs">Docked</div>
                      </div>
                      <div className="bg-background/20 backdrop-blur-sm rounded p-2 text-center">
                        <div className="text-xl font-bold text-primary">12</div>
                        <div className="text-xs">Departing</div>
                      </div>
                      <div className="bg-background/20 backdrop-blur-sm rounded p-2 text-center">
                        <div className="text-xl font-bold text-primary">85%</div>
                        <div className="text-xs">Capacity</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between bg-slate-900 rounded-md p-3">
                    <div className="text-sm">Port Efficiency Score</div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-40 bg-muted/30 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "78%" }}></div>
                      </div>
                      <div className="text-sm font-medium">78%</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="trading" className="border rounded-lg p-6 bg-card shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Trading & Commodity Flow</h3>
                  <p className="text-muted-foreground mb-6">
                    Track commodity movements, analyze trade flows, and gain insights for trading strategies.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Commodity flow analysis and visualization</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Trade route pattern identification</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Market supply/demand indicators</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Advanced trading analytics</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/trading">
                      <Button>Explore Trading Solutions</Button>
                    </Link>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-6 border border-border/40">
                  <div className="aspect-video bg-slate-950 rounded-md relative overflow-hidden">
                    <div className="absolute inset-0 p-6">
                      <div className="h-full flex flex-col">
                        <div className="text-sm font-medium mb-4">Trade Flow Analysis</div>
                        <div className="flex-1 grid grid-cols-1 grid-rows-4 gap-3">
                          <div className="bg-background/10 rounded-sm relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0 bg-green-500/70" style={{ width: "65%" }}></div>
                            <div className="absolute inset-0 flex items-center justify-between px-3">
                              <span className="text-xs font-medium">Crude Oil</span>
                              <span className="text-xs">65%</span>
                            </div>
                          </div>
                          <div className="bg-background/10 rounded-sm relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0 bg-blue-500/70" style={{ width: "43%" }}></div>
                            <div className="absolute inset-0 flex items-center justify-between px-3">
                              <span className="text-xs font-medium">LNG</span>
                              <span className="text-xs">43%</span>
                            </div>
                          </div>
                          <div className="bg-background/10 rounded-sm relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0 bg-yellow-500/70" style={{ width: "78%" }}></div>
                            <div className="absolute inset-0 flex items-center justify-between px-3">
                              <span className="text-xs font-medium">Petroleum Products</span>
                              <span className="text-xs">78%</span>
                            </div>
                          </div>
                          <div className="bg-background/10 rounded-sm relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0 bg-purple-500/70" style={{ width: "37%" }}></div>
                            <div className="absolute inset-0 flex items-center justify-between px-3">
                              <span className="text-xs font-medium">Chemicals</span>
                              <span className="text-xs">37%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-slate-900 rounded border border-border/30">
                      <div className="text-2xl font-bold text-primary">$327M</div>
                      <div className="text-xs text-muted-foreground">Daily Volume</div>
                    </div>
                    <div className="text-center p-3 bg-slate-900 rounded border border-border/30">
                      <div className="text-2xl font-bold text-primary">842</div>
                      <div className="text-xs text-muted-foreground">Active Routes</div>
                    </div>
                    <div className="text-center p-3 bg-slate-900 rounded border border-border/30">
                      <div className="text-2xl font-bold text-primary">+12%</div>
                      <div className="text-xs text-muted-foreground">Growth</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="border rounded-lg p-6 bg-card shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Advanced Maritime Analytics</h3>
                  <p className="text-muted-foreground mb-6">
                    Powerful analytics tools to transform raw maritime data into actionable intelligence.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Custom analytics dashboards</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Predictive maritime intelligence</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Historical data analysis</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                      <span>Advanced reporting tools</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/dashboard">
                      <Button>Explore Analytics Solutions</Button>
                    </Link>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-6 border border-border/40">
                  <div className="aspect-video bg-slate-950 rounded-md relative overflow-hidden">
                    <div className="absolute inset-0 p-6">
                      <div className="h-full grid grid-cols-2 grid-rows-2 gap-3">
                        <div className="bg-background/10 rounded p-3">
                          <div className="text-xs font-medium mb-2">Vessel Activity</div>
                          <svg viewBox="0 0 100 30" className="w-full h-12 stroke-primary fill-none">
                            <path d="M0,15 Q10,5 20,25 T40,15 T60,15 T80,5 T100,15" strokeWidth="2" />
                          </svg>
                          <div className="mt-2 text-xs text-right">+12.5%</div>
                        </div>
                        <div className="bg-background/10 rounded p-3">
                          <div className="text-xs font-medium mb-2">Port Traffic</div>
                          <div className="flex items-end h-12 gap-1">
                            {Array.from({ length: 7 }).map((_, i) => (
                              <div 
                                key={i} 
                                className="flex-1 bg-primary/60 rounded-sm"
                                style={{ 
                                  height: `${30 + Math.random() * 70}%`,
                                }}
                              ></div>
                            ))}
                          </div>
                          <div className="mt-2 text-xs text-right">+8.3%</div>
                        </div>
                        <div className="bg-background/10 rounded p-3">
                          <div className="text-xs font-medium mb-2">Regional Distribution</div>
                          <div className="flex items-center justify-center h-12">
                            <div className="w-12 h-12 rounded-full bg-slate-800 relative">
                              <div className="absolute inset-0 border-4 border-primary rounded-full" 
                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)' }}>
                              </div>
                              <div className="absolute inset-0 border-4 border-blue-400 rounded-full" 
                                style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%, 0 0)' }}>
                              </div>
                              <div className="absolute inset-0 border-4 border-green-400 rounded-full" 
                                style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 100% 0)' }}>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-background/10 rounded p-3">
                          <div className="text-xs font-medium mb-2">Cargo Types</div>
                          <div className="flex h-12 gap-1">
                            <div className="w-1/4 bg-primary/80 rounded-sm"></div>
                            <div className="w-2/5 bg-blue-500/80 rounded-sm"></div>
                            <div className="w-1/5 bg-green-500/80 rounded-sm"></div>
                            <div className="w-3/20 bg-yellow-500/80 rounded-sm"></div>
                          </div>
                          <div className="mt-2 flex justify-between text-xs">
                            <span>Oil</span>
                            <span>LNG</span>
                            <span>Bulk</span>
                            <span>Other</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm">Real-time data processing</div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></div>
                      Live
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Pricing Plans</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Choose the Right Plan for Your Needs</h2>
            <p className="text-muted-foreground text-lg">
              Flexible pricing options designed to accommodate businesses of all sizes, from startups to enterprise organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="border border-border/50 relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Essential tracking features</CardDescription>
                <div className="mt-4 flex items-baseline text-4xl font-bold">
                  $99<span className="ml-1 text-sm font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Track up to 100 vessels</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Basic refinery data</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Standard port information</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Daily data updates</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Email support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/auth" className="w-full">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Professional Plan */}
            <Card className="border-primary/50 relative overflow-hidden bg-gradient-to-b from-primary/5 to-background hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 inset-x-0 h-2 bg-primary"></div>
              <div className="absolute -top-5 -right-5 bg-primary text-white text-xs font-bold py-1 px-8 rotate-45 transform origin-bottom-right">
                POPULAR
              </div>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <CardDescription>Advanced features for businesses</CardDescription>
                <div className="mt-4 flex items-baseline text-4xl font-bold">
                  $199<span className="ml-1 text-sm font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Track up to 1,000 vessels</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Detailed refinery information</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Advanced port analytics</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Real-time data updates</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Historical data (6 months)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Priority email & phone support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Custom reporting tools</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/auth" className="w-full">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border border-border/50 relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>Full features for large organizations</CardDescription>
                <div className="mt-4 flex items-baseline text-4xl font-bold">
                  $399<span className="ml-1 text-sm font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Unlimited vessel tracking</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Complete global refinery database</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Advanced analytics platform</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Real-time tracking with alerts</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Historical data (unlimited)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>24/7 dedicated support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>API access & integration</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span>Custom development options</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/auth" className="w-full">
                  <Button variant="outline" className="w-full">Contact Sales</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-muted/30 py-20 lg:py-32 border-y border-border/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Trusted by Maritime Professionals</h2>
            <p className="text-muted-foreground text-lg">
              Discover how our platform has transformed maritime operations for businesses around the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                  S
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-sm text-muted-foreground">Fleet Manager, GlobalShipping Inc.</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "This platform has revolutionized how we manage our fleet operations. The real-time tracking and analytics have helped us optimize routes and significantly reduce fuel costs."
              </p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Mehdi Al-Farsi</h4>
                  <p className="text-sm text-muted-foreground">Operations Director, Gulf Energy Trading</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "The refinery tracking features have given us unprecedented visibility into our supply chain. We can now make data-driven decisions that have improved our procurement strategy."
              </p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                  L
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Luis Hernandez</h4>
                  <p className="text-sm text-muted-foreground">Port Operations Manager, Atlantic Harbors</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "The port management tools have streamlined our operations and reduced congestion. We've seen a 30% improvement in berth utilization since implementing this system."
              </p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>

          {/* Logos */}
          <div className="mt-20">
            <div className="text-center mb-10 text-muted-foreground text-sm font-medium">TRUSTED BY LEADING COMPANIES</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 items-center justify-items-center opacity-70">
              <div className="text-2xl font-bold text-foreground/70">MarineX</div>
              <div className="text-2xl font-bold text-foreground/70">OceanTech</div>
              <div className="text-2xl font-bold text-foreground/70">ShipGlobal</div>
              <div className="text-2xl font-bold text-foreground/70">PetroCorp</div>
              <div className="text-2xl font-bold text-foreground/70">SeaTrade</div>
              <div className="text-2xl font-bold text-foreground/70">PortLink</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-950 via-slate-900 to-primary-950 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(30,64,175,0.2),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Maritime Operations?</h2>
            <p className="text-lg md:text-xl mb-10 text-white/80">
              Join thousands of maritime professionals using our platform to enhance their operations, increase efficiency, and make data-driven decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8">
                  Get Started Now
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/refineries">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                  Explore Refineries
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/20 py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 font-bold text-2xl mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
                  <Ship className="h-6 w-6 text-primary" />
                </div>
                <span>OceanTrack</span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                Advanced maritime intelligence platform providing real-time vessel tracking, refinery data, and port management tools.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-muted-foreground hover:text-primary">Features</Link></li>
                <li><Link href="/pricing" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
                <li><Link href="/testimonials" className="text-muted-foreground hover:text-primary">Testimonials</Link></li>
                <li><Link href="/roadmap" className="text-muted-foreground hover:text-primary">Roadmap</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/documentation" className="text-muted-foreground hover:text-primary">Documentation</Link></li>
                <li><Link href="/api" className="text-muted-foreground hover:text-primary">API Reference</Link></li>
                <li><Link href="/blog" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                <li><Link href="/support" className="text-muted-foreground hover:text-primary">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-muted-foreground hover:text-primary">About</Link></li>
                <li><Link href="/careers" className="text-muted-foreground hover:text-primary">Careers</Link></li>
                <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-muted-foreground">
              © 2025 OceanTrack. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</a>
              <span className="mx-3 text-muted-foreground">|</span>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom animations are now defined in the tailwind.config.ts file */}
    </div>
  );
}