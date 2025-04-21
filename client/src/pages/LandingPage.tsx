import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight, Anchor, BarChart3, Globe, Shield, Zap, Ship, Factory, Database, Map } from "lucide-react";

// Import SVG assets
import oilTankerSvg from "../assets/oil_tanker.svg";
import refinerySvg from "../assets/refinery.svg";
import oceanBackgroundSvg from "../assets/ocean_background.svg";
import statsCardSvg from "../assets/stats_card.svg";

export default function LandingPage() {
  // Stats data
  const stats = [
    { value: "22,467", label: "Vessels Tracked" },
    { value: "14,004", label: "Oil Tankers" },
    { value: "42", label: "Global Refineries" },
    { value: "12.8B", label: "Barrels Capacity" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b backdrop-blur-sm bg-background/50 fixed w-full z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Anchor className="h-6 w-6" />
          <span>AsiStream</span>
        </div>
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
            Testimonials
          </Link>
          <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <Button variant="outline" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="sm">
              Get Started
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section - Professional Design */}
      <section className="w-full pt-24 pb-32 md:pt-32 md:pb-40 lg:pt-40 lg:pb-48 border-b relative overflow-hidden bg-slate-900">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#3a7bd5_0%,_transparent_50%)] opacity-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#00d2ff_0%,_transparent_50%)] opacity-10"></div>
        <div className="absolute inset-0 bg-grid-slate-700/20 bg-[size:40px_40px]"></div>
        
        {/* Abstract shapes */}
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-gradient-to-br from-primary/30 to-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-[10%] w-72 h-72 bg-gradient-to-tr from-blue-600/20 to-primary/20 rounded-full blur-3xl"></div>
        
        <div className="container px-4 md:px-6 flex flex-col items-center gap-8 text-center relative z-10">
          <div className="space-y-6 max-w-4xl">
            {/* Professional badge */}
            <div className="inline-flex items-center py-1 px-3 rounded-full bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm mb-4 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-slate-200">Maritime Intelligence Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              <span className="block mb-2">Advanced Maritime</span>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-primary bg-clip-text text-transparent">Intelligence Platform</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
              Powerful AI-driven vessel tracking and analytics for industry professionals
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link href="/auth">
              <Button size="lg" className="rounded-md bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30">
                Start Free Trial
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="rounded-md text-slate-200 border-slate-700 hover:bg-slate-800">
                Learn More
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="flex items-center gap-3 mt-8 bg-slate-800/50 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-700/50">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300 border-2 border-slate-800">E</div>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300 border-2 border-slate-800">B</div>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300 border-2 border-slate-800">S</div>
            </div>
            <div className="text-sm text-slate-300">
              Trusted by <span className="font-semibold text-white">5,000+</span> shipping professionals
            </div>
          </div>
          
          {/* Stats cards - professional style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 w-full max-w-4xl">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-slate-700/60 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Professional visual elements */}
        <div className="absolute bottom-0 right-0 w-1/3 max-w-md z-20 hidden lg:block">
          <div className="relative">
            <img src={oilTankerSvg} alt="Oil Tanker" className="w-full h-auto drop-shadow-2xl" />
            <div className="absolute -top-8 -right-4 bg-slate-800/90 backdrop-blur-sm rounded-md shadow-lg px-3 py-2 z-30 border border-slate-700 text-xs flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
              <span className="text-slate-300">Live Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Professional Style */}
      <section id="features" className="w-full py-16 md:py-24 lg:py-32 border-b bg-slate-50 dark:bg-slate-950/50">
        <div className="container px-4 md:px-6">
          {/* Section header */}
          <div className="flex flex-col items-center justify-center gap-4 text-center mb-16">
            <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800/60 shadow-md mb-2">
              <Database className="h-8 w-8 text-slate-700 dark:text-slate-300" />
            </div>
            <div className="space-y-2 max-w-[58rem]">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-slate-900 dark:text-white">
                Enterprise-Grade <span className="text-primary">Maritime Intelligence</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-3xl mx-auto">
                Our platform combines real-time tracking with advanced analytics to provide comprehensive maritime intelligence for industry professionals
              </p>
            </div>
          </div>
          
          {/* Feature showcase with image - professional style */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-center">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 rounded-2xl blur-sm"></div>
              <div className="relative overflow-hidden rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 rounded-md px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 z-10">
                  Premium Feature
                </div>
                <img 
                  src={refinerySvg} 
                  alt="Oil Refinery" 
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-sm font-medium text-slate-800 dark:text-slate-300 mb-4">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-1.5"></span>
                  Enterprise Solution
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Global Refinery Network</h3>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                Track the operations of 42 major refineries across the world with detailed status monitoring and capacity analytics. 
                Our system provides real-time updates on operational status, maintenance schedules, and production levels.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="mr-3 mt-1 bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-full">
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">Real-time refinery operational status monitoring</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 mt-1 bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-full">
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">Production capacity and utilization metrics</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 mt-1 bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-full">
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">Maintenance schedule forecasting and alerts</span>
                </li>
              </ul>
              
              <Button className="mt-6 rounded-md bg-slate-900 hover:bg-slate-800 text-white dark:bg-primary dark:hover:bg-primary/90 dark:text-white shadow-lg px-5 py-2.5">
                Explore Refineries
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
          
          {/* Stats card image showcase - professional style */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 lg:order-1 space-y-8">
              <div>
                <div className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-sm font-medium text-slate-800 dark:text-slate-300 mb-4">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-1.5"></span>
                  Data-Driven Insights
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Advanced Maritime Analytics</h3>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                Leverage our powerful analytics tools to gain unprecedented insights into global maritime traffic patterns, 
                cargo volumes, and market trends. Make data-driven decisions with confidence using our comprehensive dashboards.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="mr-3 mt-1 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full">
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">Interactive data visualization dashboards</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 mt-1 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full">
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">Predictive analytics for vessel routing and ETA</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 mt-1 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full">
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">Custom report generation and export capabilities</span>
                </li>
              </ul>
              
              <Button className="mt-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-5 py-2.5">
                View Analytics Demo
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
            
            <div className="order-1 lg:order-2 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-800/50 dark:to-blue-700/50 rounded-2xl blur-sm"></div>
              <div className="relative overflow-hidden rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 rounded-md px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 z-10">
                  Enterprise Dashboard
                </div>
                <img 
                  src={statsCardSvg} 
                  alt="Analytics Dashboard" 
                  className="w-full h-auto transform hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
          
          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {/* Feature 1 */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-600/90 to-blue-900/90 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
              <CardHeader>
                <div className="p-3 rounded-lg bg-white/20 w-fit mb-4">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Global Vessel Tracking</CardTitle>
                <CardDescription className="text-white/80">
                  Real-time monitoring of over 22,000 vessels worldwide with detailed position data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Interactive world map visualization</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Detailed vessel information</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Historical route tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-purple-600/90 to-purple-900/90 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
              <CardHeader>
                <div className="p-3 rounded-lg bg-white/20 w-fit mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Advanced Analytics</CardTitle>
                <CardDescription className="text-white/80">
                  Powerful data analysis tools for making informed business decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Predictive route analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Cargo volume reporting</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Market trend visualization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-600/90 to-emerald-900/90 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
              <CardHeader>
                <div className="p-3 rounded-lg bg-white/20 w-fit mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">AI-Powered Assistant</CardTitle>
                <CardDescription className="text-white/80">
                  Intelligent maritime insights and automated document generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Natural language vessel queries</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Automated document generation</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Market intelligence reports</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-amber-600/90 to-amber-900/90 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
              <CardHeader>
                <div className="p-3 rounded-lg bg-white/20 w-fit mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Elite Membership</CardTitle>
                <CardDescription className="text-white/80">
                  Premium features for oil brokers and industry professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Direct messaging with carriers</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Tender bidding tools</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Advanced cargo analytics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Feature 5 */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-pink-600/90 to-pink-900/90 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
              <CardHeader>
                <div className="p-3 rounded-lg bg-white/20 w-fit mb-4">
                  <Factory className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Refinery Analytics</CardTitle>
                <CardDescription className="text-white/80">
                  Comprehensive monitoring of global oil refineries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Production capacity tracking</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Maintenance schedule alerts</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Regional supply chain analysis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Feature 6 */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600/90 to-indigo-900/90 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
              <CardHeader>
                <div className="p-3 rounded-lg bg-white/20 w-fit mb-4">
                  <Map className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Interactive Mapping</CardTitle>
                <CardDescription className="text-white/80">
                  Powerful geospatial visualization tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Custom map layers and filters</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Route optimization tools</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-white" />
                    <span>Vessel density heat maps</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 border-b">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-2">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Choose Your Plan
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[46rem] mx-auto">
                Select the plan that best fits your business needs
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {/* Basic Plan */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-80 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex flex-col h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 backdrop-blur-sm border border-blue-200 dark:border-blue-800/30 rounded-xl overflow-hidden">
                <div className="pt-6 px-6 pb-2 relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Basic</h3>
                      <p className="text-sm text-blue-600/70 dark:text-blue-400/70 mt-1">Essential tracking for small operations</p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Ship className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="mt-6 pb-6 border-b border-blue-200/50 dark:border-blue-800/20">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">$99</span>
                      <span className="ml-1 text-sm text-blue-500/70 dark:text-blue-400/70">/month</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-6 flex-1">
                  <ul className="space-y-4 text-sm">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-3">
                        <Check className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      </div>
                      <span className="text-foreground dark:text-gray-300">Access to global vessel tracking</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-3">
                        <Check className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      </div>
                      <span className="text-foreground dark:text-gray-300">Basic analytics dashboard</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-3">
                        <Check className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      </div>
                      <span className="text-foreground dark:text-gray-300">Standard document templates</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-3">
                        <Check className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      </div>
                      <span className="text-foreground dark:text-gray-300">Email support</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-6 pt-2 mt-auto relative">
                  <Link href="/auth" className="w-full">
                    <button className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex flex-col h-full bg-gradient-to-br from-purple-600 to-purple-800 border border-purple-400/30 rounded-xl overflow-hidden">
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-bl-lg shadow-lg transform rotate-0">
                    Most Popular
                  </div>
                </div>
                
                <div className="pt-6 px-6 pb-2 relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Premium</h3>
                      <p className="text-sm text-purple-200/90 mt-1">Advanced features for growing businesses</p>
                    </div>
                    <div className="p-3 bg-purple-500/40 rounded-full">
                      <BarChart3 className="h-6 w-6 text-purple-100" />
                    </div>
                  </div>
                  
                  <div className="mt-6 pb-6 border-b border-purple-500/30">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-white">$199</span>
                      <span className="ml-1 text-sm text-purple-200/80">/month</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-6 flex-1">
                  <ul className="space-y-4 text-sm">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 p-1 bg-purple-500/40 rounded-full mr-3">
                        <Check className="h-4 w-4 text-purple-100" />
                      </div>
                      <span className="text-white">Everything in Basic</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 p-1 bg-purple-500/40 rounded-full mr-3">
                        <Check className="h-4 w-4 text-purple-100" />
                      </div>
                      <span className="text-white">Advanced analytics and reporting</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 p-1 bg-purple-500/40 rounded-full mr-3">
                        <Check className="h-4 w-4 text-purple-100" />
                      </div>
                      <span className="text-white">AI-powered document generation</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 p-1 bg-purple-500/40 rounded-full mr-3">
                        <Check className="h-4 w-4 text-purple-100" />
                      </div>
                      <span className="text-white">Historical data (up to 12 months)</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 p-1 bg-purple-500/40 rounded-full mr-3">
                        <Check className="h-4 w-4 text-purple-100" />
                      </div>
                      <span className="text-white">Priority email & phone support</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-6 pt-2 mt-auto relative">
                  <Link href="/auth" className="w-full">
                    <button className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-lg font-medium transition duration-200 shadow-lg shadow-orange-500/30 hover:shadow-orange-600/40">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Elite Plan */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-600 rounded-2xl blur opacity-30 group-hover:opacity-80 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex flex-col h-full bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800/30 rounded-xl overflow-hidden">
                <div className="pt-6 px-6 pb-2 relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Elite</h3>
                      <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70 mt-1">Premium features for industry professionals</p>
                    </div>
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                      <Zap className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                    </div>
                  </div>
                  
                  <div className="mt-6 pb-6 border-b border-emerald-200/50 dark:border-emerald-800/20">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">$399</span>
                      <span className="ml-1 text-sm text-emerald-500/70 dark:text-emerald-400/70">/month</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-6 flex-1">
                  <ul className="space-y-4 text-sm">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mr-3">
                        <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <span className="text-foreground dark:text-gray-300">Everything in Premium</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mr-3">
                        <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <span className="text-foreground dark:text-gray-300">Elite broker dashboard</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mr-3">
                        <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <span className="text-foreground dark:text-gray-300">Direct messaging with carriers</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mr-3">
                        <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <span className="text-foreground dark:text-gray-300">Tender bidding tools</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mr-3">
                        <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <span className="text-foreground dark:text-gray-300">Custom API access</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mr-3">
                        <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <span className="text-foreground dark:text-gray-300">Dedicated account manager</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-6 pt-2 mt-auto relative">
                  <Link href="/auth" className="w-full">
                    <button className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-600/30">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Transform Your Maritime Operations?
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[46rem] mx-auto">
                Join thousands of shipping professionals who trust AsiStream for their maritime intelligence needs
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 min-w-[176px] mt-6">
              <Link href="/auth">
                <Button size="lg">
                  Start Free Trial
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 border-t">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-xl text-primary">
                <Anchor className="h-6 w-6" />
                <span>AsiStream</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The next generation of maritime intelligence
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
                <li>Integrations</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>Documentation</li>
                <li>Blog</li>
                <li>Case Studies</li>
                <li>Support</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>About</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              © 2025 AsiStream. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}