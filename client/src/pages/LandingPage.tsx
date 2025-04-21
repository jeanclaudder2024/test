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

      {/* Hero Section - Maritime Design */}
      <section className="w-full pt-24 pb-32 md:pt-32 md:pb-40 lg:pt-40 lg:pb-48 border-b relative overflow-hidden bg-[#15151e]">
        {/* Background image - sunset with vessel */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1974&auto=format&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#15151e]/90 via-[#15151e]/70 to-[#15151e]/90"></div>
        
        <div className="container px-4 md:px-6 flex flex-col items-start gap-8 relative z-10 h-full">
          <div className="space-y-6 max-w-2xl">
            {/* Logo badge */}
            <div className="inline-flex items-center py-1 px-3 rounded-lg bg-[#bf5c45]/20 border border-[#bf5c45]/30 mb-4">
              <Ship className="h-5 w-5 text-[#f6d2c7] mr-2" />
              <span className="text-sm font-semibold text-[#f6d2c7]">AsiStream</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
              <span className="block mb-2">Track Your Fleet</span>
              <span className="block text-[#bf5c45]">in Real-Time.</span>
              <span className="block">Optimize Your</span>
              <span className="block text-[#bf5c45]">Ship Operations.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#f6d2c7]/90 max-w-2xl">
              Manage up to 10 ships with live location tracking, fuel monitoring, and trip management.
            </p>
          </div>
          
          <div className="mt-6">
            <Link href="/auth">
              <Button size="lg" className="rounded-md bg-[#bf5c45] hover:bg-[#a3503c] text-white shadow-lg px-6 py-3 text-base font-medium">
                Get Started Now
              </Button>
            </Link>
          </div>
          
          {/* Stats cards - maritime style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 w-full max-w-4xl self-center">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-[#15151e]/80 backdrop-blur-sm rounded-lg p-4 text-center border border-[#bf5c45]/20 shadow-xl"
              >
                <p className="text-2xl md:text-3xl font-bold text-[#bf5c45]">{stat.value}</p>
                <p className="text-sm text-[#f6d2c7]/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Oil tanker image */}
        <div className="absolute bottom-0 right-0 w-2/5 max-w-xl z-20 hidden lg:block transform translate-y-1/4">
          <img src={oilTankerSvg} alt="Oil Tanker" className="w-full h-auto drop-shadow-2xl" />
        </div>
      </section>

      {/* Features Section - Maritime Style */}
      <section id="features" className="w-full py-16 md:py-24 lg:py-32 border-b bg-[#f5f2ed]">
        <div className="container px-4 md:px-6">
          {/* Section header */}
          <div className="flex flex-col gap-4 mb-16">
            <div className="space-y-4 max-w-[58rem]">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-[#15151e]">
                Powerful Tools for Ship <span className="text-[#bf5c45]">Owners and Drivers</span>
              </h2>
              <p className="text-[#15151e]/80 text-lg max-w-2xl">
                Our key features of the app that make it essential for ship owners and drivers.
              </p>
            </div>
          </div>
          
          {/* Feature cards grid - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#f1e6df]">
              <div className="p-6">
                <div className="w-12 h-12 bg-[#f8efe9] rounded-lg flex items-center justify-center mb-4">
                  <Map className="h-6 w-6 text-[#bf5c45]" />
                </div>
                <h3 className="text-xl font-bold text-[#15151e] mb-2">Real-Time Location Tracking</h3>
                <p className="text-[#15151e]/70">
                  Track the exact position of your vessels in real-time across global waters with accurate GPS positioning.
                </p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#f1e6df]">
              <div className="p-6">
                <div className="w-12 h-12 bg-[#f8efe9] rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-[#bf5c45]" />
                </div>
                <h3 className="text-xl font-bold text-[#15151e] mb-2">Fuel Monitoring</h3>
                <p className="text-[#15151e]/70">
                  Keep track of fuel consumption, costs, and efficiency to optimize operations and reduce expenses.
                </p>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#f1e6df]">
              <div className="p-6">
                <div className="w-12 h-12 bg-[#f8efe9] rounded-lg flex items-center justify-center mb-4">
                  <Ship className="h-6 w-6 text-[#bf5c45]" />
                </div>
                <h3 className="text-xl font-bold text-[#15151e] mb-2">Ship Management</h3>
                <p className="text-[#15151e]/70">
                  Comprehensive vessel management including maintenance schedules, crew assignments, and document storage.
                </p>
              </div>
            </div>
          </div>
          
          {/* Steps section - based on reference image */}
          <div className="mt-12 mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-[#15151e] mb-6">
              Simple Steps to <span className="text-[#bf5c45]">Manage Your Fleet</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {/* Step 1 */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#f1e6df] relative">
                <div className="absolute top-0 left-0 w-16 h-16 flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#bf5c45] rounded-br-xl flex items-center justify-center text-white font-bold text-xl">
                    01
                  </div>
                </div>
                <div className="p-6 pt-10 mt-8">
                  <h3 className="text-xl font-bold text-[#15151e] mb-2">Sign Up and Add Your Ships</h3>
                  <p className="text-[#15151e]/70">
                    Create an account and register your ships in the app. Add details such as vessel type, capacity, and crew information.
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#f1e6df] relative">
                <div className="absolute top-0 left-0 w-16 h-16 flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#bf5c45] rounded-br-xl flex items-center justify-center text-white font-bold text-xl">
                    02
                  </div>
                </div>
                <div className="p-6 pt-10 mt-8">
                  <h3 className="text-xl font-bold text-[#15151e] mb-2">Install Tracking Devices</h3>
                  <p className="text-[#15151e]/70">
                    Set up our tracking hardware on your vessels to enable real-time monitoring and data collection.
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#f1e6df] relative">
                <div className="absolute top-0 left-0 w-16 h-16 flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#bf5c45] rounded-br-xl flex items-center justify-center text-white font-bold text-xl">
                    03
                  </div>
                </div>
                <div className="p-6 pt-10 mt-8">
                  <h3 className="text-xl font-bold text-[#15151e] mb-2">Monitor Your Fleet</h3>
                  <p className="text-[#15151e]/70">
                    Access the dashboard to view real-time data, track vessel locations, and manage operations from anywhere.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feature showcase with image - maritime style */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24 items-center mt-16 bg-white p-8 rounded-xl shadow-lg border border-[#f1e6df]">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1494412651409-8963ce7935a7?q=80&w=2070&auto=format&fit=crop" 
                alt="Ship at sea" 
                className="w-full h-auto rounded-xl object-cover shadow-lg"
              />
              <div className="absolute bottom-4 right-4 bg-[#bf5c45]/90 text-white px-3 py-1 rounded-md text-sm font-medium">
                Premium Feature
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-[#15151e]">Empowering Ship Owners & Drivers with Smart Fleet Management</h3>
              
              <p className="text-[#15151e]/80">
                At AsiStream, we believe in making ship management simple, efficient, and data-driven. Our mission is to empower ship owners and drivers with real-time tracking, fuel monitoring, and comprehensive trip management tools.
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="mr-3 mt-1 bg-[#f8efe9] p-1 rounded-full">
                    <Check className="h-4 w-4 text-[#bf5c45]" />
                  </div>
                  <span className="text-[#15151e]/80">Real-time vessel tracking across global waters</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 mt-1 bg-[#f8efe9] p-1 rounded-full">
                    <Check className="h-4 w-4 text-[#bf5c45]" />
                  </div>
                  <span className="text-[#15151e]/80">Advanced fuel consumption monitoring and optimization</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 mt-1 bg-[#f8efe9] p-1 rounded-full">
                    <Check className="h-4 w-4 text-[#bf5c45]" />
                  </div>
                  <span className="text-[#15151e]/80">Comprehensive trip planning and management</span>
                </li>
              </ul>
              
              <Button className="rounded-md bg-[#bf5c45] hover:bg-[#a3503c] text-white shadow-lg px-5 py-2.5">
                Learn More
              </Button>
            </div>
          </div>
          
          {/* Dashboard preview section */}
          <div className="p-8 bg-[#15151e] rounded-xl shadow-2xl mb-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_#bf5c45_0%,_transparent_50%)] opacity-10 z-0"></div>
            
            <div className="relative z-10 mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Vessel Dashboard <span className="text-[#bf5c45]">Preview</span>
              </h2>
              <p className="text-white/80 max-w-2xl">
                Our intuitive dashboard provides comprehensive vessel data at a glance. Track locations, monitor fuel consumption, and manage your fleet efficiently.
              </p>
            </div>
            
            <div className="bg-[#1c1c25] p-6 rounded-xl border border-[#2c2c38] shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Ship className="h-5 w-5 text-[#bf5c45] mr-2" />
                  <span className="text-white font-medium">Vessel Dashboard</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#bf5c45]"></div>
                  <div className="w-2 h-2 rounded-full bg-white/20"></div>
                  <div className="w-2 h-2 rounded-full bg-white/20"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#232330] p-4 rounded-lg border border-[#2c2c38]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/60 text-sm">Container Ship</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-green-500 text-xs">Active</span>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white">$56,863</p>
                  <div className="flex mt-1">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className={`w-1 h-6 rounded-sm mx-0.5 ${i < 4 ? 'bg-[#bf5c45]' : 'bg-[#bf5c45]/30'}`}></div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[#232330] p-4 rounded-lg border border-[#2c2c38]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/60 text-sm">Ro-Ro Ship</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-green-500 text-xs">Active</span>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white">$92,649</p>
                  <div className="flex mt-1">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className={`w-1 h-6 rounded-sm mx-0.5 ${i < 3 ? 'bg-[#bf5c45]' : 'bg-[#bf5c45]/30'}`}></div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[#232330] p-4 rounded-lg border border-[#2c2c38]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/60 text-sm">Bulk Carrier</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mr-1"></div>
                      <span className="text-amber-500 text-xs">Docked</span>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white">$13,946</p>
                  <div className="flex mt-1">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className={`w-1 h-6 rounded-sm mx-0.5 ${i < 2 ? 'bg-[#bf5c45]' : 'bg-[#bf5c45]/30'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Button className="bg-[#bf5c45] hover:bg-[#a3503c] text-white">
                  View Full Dashboard
                </Button>
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