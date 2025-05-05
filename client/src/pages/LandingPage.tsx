import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight, Anchor, BarChart3, Globe, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b backdrop-blur-sm bg-background/50 fixed w-full z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Anchor className="h-6 w-6" />
          <span>Vesselian</span>
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

      {/* Hero Section */}
      <section className="w-full min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 to-primary-950 text-white">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDEwQzUwIDggMTEwIDMwIDE1MCAzOEMyMDAgNTAgMjUwIDYwIDMwMCA2NUMzNTAgNzAgNDAwIDc1IDQ1MCA3NUM1MDAgNzUgNTUwIDcwIDYwMCA2NUM2NTAgNjAgNzAwIDU1IDc1MCA1MEM4MDAgNDUgODUwIDQwIDkwMCAzNUM5NTAgMzAgMTAwMCAyNSAxMDUwIDI1QzExMDAgMjUgMTE1MCAzMCAxMjAwIDMwQzEyNTAgMzAgMTMwMCAyNSAxMzUwIDI1QzE0MDAgMjUgMTQ1MCAzMCAxNTAwIDMwQzE1NTAgMzAgMTYwMCAyNSAxNjUwIDI1QzE3MDAgMjUgMTc1MCAzMCAxODAwIDMwQzE4NTAgMzAgMTkwMCAyNSAxOTUwIDI1QzIwMDAgMjUgMjA1MCAzMCAyMTAwIDMwQzIxNTAgMzAgMjIwMCAyNSAyMjUwIDIwQzIzMDAgMTUgMjM1MCA1IDI0MDAgMEMyNDUwIC01IDI1MDAgLTUgMjU1MCAtNUMyNjAwIC01IDI2NTAgLTUgMjcwMCAtNUMyNzUwIC01IDI4MDAgLTUgMjg1MCAtNUMyOTAwIC01IDI5NTAgLTUgMzAwMCAtNUMzMDUwIC01IDMxMDAgLTUgMzE1MCAtNUMzMjAwIC01IDMyNTAgLTUgMzMwMCAtNUMzMzUwIC01IDM0MDAgLTUgMzQ1MCAtNUMzNTAwIC01IDM1NTAgLTUgMzYwMCAtNUMzNjUwIC01IDM3MDAgLTUgMzc1MCAtNUMzODAwIC01IDM4NTAgLTUgMzkwMCAtNUMzOTUwIC01IDQwMDAgLTUgNDA1MCAtNUM0MTAwIC01IDQxNTAgLTUgNDIwMCAtNUM0MjUwIC01IDQzMDAgLTUgNDM1MCAtNUM0NDAwIC01IDQ0NTAgLTUgNDUwMCAtNUM0NTUwIC01IDQ2MDAgLTUgNDY1MCAtNUM0NzAwIC01IDQ3NTAgLTUgNDgwMCAtNUM0ODUwIC01IDQ5MDAgLTUgNDk1MCAtNUM1MDAwIC01IDUwNTAgLTUgNTEwMCAtNUM1MTUwIC01IDUyMDAgLTUgNTI1MCAtNUM1MzAwIC01IDUzNTAgLTUgNTQwMCAtNUM1NDUwIC01IDU1MDAgLTUgNTU1MCAtNUM1NjAwIC01IDU2NTAgLTUgNTcwMCAtNUM1NzUwIC01IDU4MDAgLTUgNTg1MCAtNUM1OTAwIC01IDU5NTAgLTUgNjAwMCAtNUM2MDUwIC01IDYxMDAgLTUgNjE1MCAtNUM2MjAwIC01IDYyNTAgLTUgNjMwMCAtNUM2MzUwIC01IDY0MDAgLTUgNjQ1MCAtNUM2NTAwIC01IDY1NTAgLTUgNjYwMCAtNUM2NjUwIC01IDY3MDAgLTUgNjc1MCAtNUM2ODAwIC01IDY4NTAgLTUgNjkwMCAtNUM2OTUwIC01IDcwMDAgLTUgNzA1MCAtNUM3MTAwIC01IDcxNTAgLTUgNzIwMCAtNUM3MjUwIC01IDczMDAgLTUgNzM1MCAtNUM3NDAwIC01IDc0NTAgLTUgNzUwMCAtNUM3NTUwIC01IDc2MDAgLTUgNzY1MCAtNUM3NzAwIC01IDc3NTAgLTUgNzgwMCAtNUM3ODUwIC01IDc5MDAgLTUgNzk1MCAtNUM4MDAwIC01IDgwNTAgLTUgODEwMCAtNUM4MTUwIC01IDgyMDAgLTUgODI1MCAtNUM4MzAwIC01IDgzNTAgLTUgODQwMCAtNUM4NDUwIC01IDg1MDAgLTUgODU1MCAtNUM4NjAwIC01IDg2NTAgLTUgODcwMCAtNUM4NzUwIC01IDg4MDAgLTUgODg1MCAtNUM4OTAwIC01IDg5NTAgLTUgOTAwMCAtNUM5MDUwIC01IDkxMDAgLTUgOTE1MCAtNUM5MjAwIC01IDkyNTAgLTUgOTMwMCAtNUM5MzUwIC01IDk0MDAgLTUgOTQ1MCAtNUM5NTAwIC01IDk1NTAgLTUgOTYwMCAtNUM5NjUwIC01IDk3MDAgLTUgOTc1MCAtNUM5ODAwIC01IDk4NTAgLTUgOTkwMCAtNUM5OTUwIC01IDEwMDAwIC01IDEwMDUwIC01TDEwMDUwIDEwNUwwIDEwNVoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] bg-no-repeat bg-top"
            style={{ animationName: 'wave', animationDuration: '20s', animationIterationCount: 'infinite', animationDirection: 'alternate' }}
          ></div>
          <div className="absolute bottom-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDEwQzMwIDEwIDYwIDQwIDkwIDUwQzEyMCA2MCAxNTAgNTAgMTgwIDQwQzIxMCAzMCAyNDAgMjAgMjcwIDIwQzMwMCAyMCAzMzAgMzAgMzYwIDQwQzM5MCA1MCA0MjAgNjAgNDUwIDYwQzQ4MCA2MCA1MTAgNTAgNTQwIDQwQzU3MCAzMCA2MDAgMjAgNjMwIDIwQzY2MCAyMCA2OTAgMzAgNzIwIDQwQzc1MCA1MCA3ODAgNjAgODEwIDYwQzg0MCA2MCA4NzAgNTAgOTAwIDQwQzkzMCAzMCA5NjAgMjAgOTkwIDIwQzEwMjAgMjAgMTA1MCAzMCAxMDgwIDQwQzExMTAgNTAgMTE0MCA2MCAxMTcwIDYwQzEyMDAgNjAgMTIzMCA1MCAxMjYwIDQwQzEyOTAgMzAgMTMyMCAyMCAxMzUwIDIwQzEzODAgMjAgMTQxMCAzMCAxNDQwIDQwQzE0NzAgNTAgMTUwMCA2MCAxNTMwIDYwQzE1NjAgNjAgMTU5MCA1MCAxNjIwIDQwQzE2NTAgMzAgMTY4MCAyMCAxNzEwIDIwQzE3NDAgMjAgMTc3MCAzMCAxODAwIDQwQzE4MzAgNTAgMTg2MCA2MCAxODkwIDYwQzE5MjAgNjAgMTk1MCA1MCAxOTgwIDQwQzIwMTAgMzAgMjA0MCAyMCAyMDcwIDIwQzIxMDAgMjAgMjEzMCAzMCAyMTYwIDQwQzIxOTAgNTAgMjIyMCA2MCAyMjUwIDYwQzIyODAgNjAgMjMxMCA1MCAyMzQwIDQwQzIzNzAgMzAgMjQwMCAyMCAyNDMwIDIwQzI0NjAgMjAgMjQ5MCAzMCAyNTIwIDQwQzI1NTAgNTAgMjU4MCA2MCAyNjEwIDYwQzI2NDAgNjAgMjY3MCA1MCAyNzAwIDQwQzI3MzAgMzAgMjc2MCAyMCAyNzkwIDIwQzI4MjAgMjAgMjg1MCAzMCAyODgwIDQwQzI5MTAgNTAgMjk0MCA2MCAyOTcwIDYwQzMwMDAgNjAgMzAzMCA1MCAzMDYwIDQwQzMwOTAgMzAgMzEyMCAyMCAzMTUwIDIwQzMxODAgMjAgMzIxMCAzMCAzMjQwIDQwQzMyNzAgNTAgMzMwMCA2MCAzMzMwIDYwQzMzNjAgNjAgMzM5MCA1MCAzNDIwIDQwQzM0NTAgMzAgMzQ4MCAyMCAzNTEwIDIwQzM1NDAgMjAgMzU3MCAzMCAzNjAwIDQwQzM2MzAgNTAgMzY2MCA2MCAzNjkwIDYwQzM3MjAgNjAgMzc1MCA1MCAzNzgwIDQwQzM4MTAgMzAgMzg0MCAyMCAzODcwIDIwQzM5MDAgMjAgMzkzMCAzMCAzOTYwIDQwQzM5OTAgNTAgNDAyMCA2MCA0MDUwIDYwQzQwODAgNjAgNDExMCA1MCA0MTQwIDQwQzQxNzAgMzAgNDIwMCAyMCA0MjMwIDIwQzQyNjAgMjAgNDI5MCAzMCA0MzIwIDQwQzQzNTAgNTAgNDM4MCA2MCA0NDEwIDYwQzQ0NDAgNjAgNDQ3MCA1MCA0NTAwIDQwQzQ1MzAgMzAgNDU2MCAyMCA0NTkwIDIwQzQ2MjAgMjAgNDY1MCAzMCA0NjgwIDQwQzQ3MTAgNTAgNDc0MCA2MCA0NzcwIDYwQzQ4MDAgNjAgNDgzMCA1MCA0ODYwIDQwQzQ4OTAgMzAgNDkyMCAyMCA0OTUwIDIwQzQ5ODAgMjAgNTAxMCAzMCA1MDQwIDQwQzUwNzAgNTAgNTEwMCA2MCA1MTMwIDYwQzUxNjAgNjAgNTE5MCA1MCA1MjIwIDQwQzUyNTAgMzAgNTI4MCAyMCA1MzEwIDIwQzUzNDAgMjAgNTM3MCAzMCA1NDAwIDQwQzU0MzAgNTAgNTQ2MCA2MCA1NDkwIDYwQzU1MjAgNjAgNTU1MCA1MCA1NTgwIDQwQzU2MTAgMzAgNTY0MCAyMCA1NjcwIDIwQzU3MDAgMjAgNTczMCAzMCA1NzYwIDQwQzU3OTAgNTAgNTgyMCA2MCA1ODUwIDYwQzU4ODAgNjAgNTkxMCA1MCA1OTQwIDQwQzU5NzAgMzAgNjAwMCAyMCA2MDMwIDIwQzYwNjAgMjAgNjA5MCAzMCA2MTIwIDQwQzYxNTAgNTAgNjE4MCA2MCA2MjEwIDYwQzYyNDAgNjAgNjI3MCA1MCA2MzAwIDQwQzYzMzAgMzAgNjM2MCAyMCA2MzkwIDIwQzY0MjAgMjAgNjQ1MCAzMCA2NDgwIDQwQzY1MTAgNTAgNjU0MCA2MCA2NTcwIDYwQzY2MDAgNjAgNjYzMCA1MCA2NjYwIDQwQzY2OTAgMzAgNjcyMCAyMCA2NzUwIDIwQzY3ODAgMjAgNjgxMCAzMCA2ODQwIDQwQzY4NzAgNTAgNjkwMCA2MCA2OTMwIDYwQzY5NjAgNjAgNjk5MCA1MCA3MDIwIDQwQzcwNTAgMzAgNzA4MCAyMCA3MTEwIDIwQzcxNDAgMjAgNzE3MCAzMCA3MjAwIDQwQzcyMzAgNTAgNzI2MCA2MCA3MjkwIDYwQzczMjAgNjAgNzM1MCA1MCA3MzgwIDQwQzc0MTAgMzAgNzQ0MCAyMCA3NDcwIDIwQzc1MDAgMjAgNzUzMCAzMCA3NTYwIDQwQzc1OTAgNTAgNzYyMCA2MCA3NjUwIDYwQzc2ODAgNjAgNzcxMCA1MCA3NzQwIDQwQzc3NzAgMzAgNzgwMCAyMCA3ODMwIDIwQzc4NjAgMjAgNzg5MCAzMCA3OTIwIDQwQzc5NTAgNTAgNzk4MCA2MCA4MDEwIDYwQzgwNDAgNjAgODA3MCA1MCA4MTAwIDQwQzgxMzAgMzAgODE2MCAyMCA4MTkwIDIwQzgyMjAgMjAgODI1MCAzMCA4MjgwIDQwQzgzMTAgNTAgODM0MCA2MCA4MzcwIDYwQzg0MDAgNjAgODQzMCA1MCA4NDYwIDQwQzg0OTAgMzAgODUyMCAyMCA4NTUwIDIwQzg1ODAgMjAgODYxMCAzMCA4NjQwIDQwQzg2NzAgNTAgODcwMCA2MCA4NzMwIDYwQzg3NjAgNjAgODc5MCA1MCA4ODIwIDQwQzg4NTAgMzAgODg4MCAyMCA4OTEwIDIwQzg5NDAgMjAgODk3MCAzMCA5MDAwIDQwQzkwMzAgNTAgOTA2MCA2MCA5MDkwIDYwQzkxMjAgNjAgOTE1MCA1MCA5MTgwIDQwQzkyMTAgMzAgOTI0MCAyMCA5MjcwIDIwQzkyNzAgMjAgOTMwMCAzMCA5MzMwIDQwQzkzNjAgNTAgOTM5MCA2MCA5NDIwIDYwQzk0NTAgNjAgOTQ4MCA1MCA5NTEwIDQwQzk1NDAgMzAgOTU3MCAyMCA5NjAwIDIwQzk2MzAgMjAgOTY2MCAzMCA5NjkwIDQwQzk3MjAgNTAgOTc1MCA2MCA5NzgwIDYwQzk4MTAgNjAgOTg0MCA1MCA5ODcwIDQwQzk5MDAgMzAgOTkzMCAyMCA5OTYwIDIwQzk5OTAgMjAgMTAwMjAgMzAgMTAwNTAgNDBMMTAwNTAgMTA1TDAgMTA1WiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')] bg-no-repeat bg-bottom opacity-50"
            style={{ animationName: 'wave', animationDuration: '15s', animationIterationCount: 'infinite', animationDirection: 'alternate' }}
          ></div>
        </div>
        
        {/* Content Container */}
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10 flex flex-col md:flex-row items-center">
          {/* Left Content */}
          <div className="w-full md:w-1/2 mb-12 md:mb-0 fade-in-up">
            <div className="inline-block px-4 py-1 rounded-full bg-primary/20 text-primary-100 text-sm font-semibold mb-6 backdrop-blur-sm">
              Leading Maritime Intelligence Platform
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
              Advanced <span className="text-primary-300">Maritime</span> Intelligence at Your Fingertips
            </h1>
            <p className="text-lg md:text-xl text-primary-100/80 mb-8 max-w-xl">
              Track thousands of vessels worldwide with advanced analytics, real-time monitoring, and AI-powered insights for maritime professionals.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-medium text-base px-8 py-6 rounded-md shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-105">
                  Explore Dashboard
                </Button>
              </Link>
              <Link href="/live-tracking">
                <Button size="lg" variant="outline" className="border-primary/30 text-primary-100 hover:bg-primary/10 font-medium text-base px-8 py-6 rounded-md backdrop-blur-md">
                  Live Tracking
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center md:text-left">
                <div className="text-3xl md:text-4xl font-bold text-primary-100">2,499+</div>
                <div className="text-sm text-primary-200/70">Vessels Tracked</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-3xl md:text-4xl font-bold text-primary-100">73+</div>
                <div className="text-sm text-primary-200/70">Global Ports</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-3xl md:text-4xl font-bold text-primary-100">70+</div>
                <div className="text-sm text-primary-200/70">Refineries</div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Interactive Demo/Visual */}
          <div className="w-full md:w-1/2 md:pl-12 slide-in-right">
            <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-primary-950/40 border border-primary-800/30 backdrop-blur-sm">
              <div className="aspect-[16/9] bg-primary-900/60 flex items-center justify-center p-6">
                {/* SVG Illustration of Maritime Map */}
                <svg width="100%" height="100%" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                  {/* Ocean */}
                  <rect width="800" height="500" fill="#162c4a" />
                  
                  {/* Land Mass */}
                  <path d="M0 100C50 110 100 120 150 115C200 110 250 90 300 85C350 80 400 90 450 100C500 110 550 120 600 115C650 110 700 90 750 80C800 70 850 70 900 70L900 500L0 500L0 100Z" fill="#193359" />
                  
                  {/* Grid Lines */}
                  <g opacity="0.1" stroke="#FFFFFF">
                    <line x1="0" y1="100" x2="800" y2="100" strokeWidth="1" />
                    <line x1="0" y1="200" x2="800" y2="200" strokeWidth="1" />
                    <line x1="0" y1="300" x2="800" y2="300" strokeWidth="1" />
                    <line x1="0" y1="400" x2="800" y2="400" strokeWidth="1" />
                    <line x1="100" y1="0" x2="100" y2="500" strokeWidth="1" />
                    <line x1="200" y1="0" x2="200" y2="500" strokeWidth="1" />
                    <line x1="300" y1="0" x2="300" y2="500" strokeWidth="1" />
                    <line x1="400" y1="0" x2="400" y2="500" strokeWidth="1" />
                    <line x1="500" y1="0" x2="500" y2="500" strokeWidth="1" />
                    <line x1="600" y1="0" x2="600" y2="500" strokeWidth="1" />
                    <line x1="700" y1="0" x2="700" y2="500" strokeWidth="1" />
                  </g>
                  
                  {/* Ship Routes */}
                  <path d="M150 150C200 180 250 200 300 220C350 240 400 250 450 230C500 210 550 170 600 150C650 130 700 120 750 150" stroke="#60A5FA" strokeWidth="2" strokeDasharray="5 5" />
                  <path d="M100 300C150 280 200 270 250 290C300 310 350 340 400 350C450 360 500 350 550 320C600 290 650 270 700 290" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5 5" />
                  <path d="M200 400C250 380 300 370 350 390C400 410 450 440 500 450C550 460 600 450 650 420" stroke="#2563EB" strokeWidth="2" strokeDasharray="5 5" />
                  
                  {/* Ship Icons */}
                  <circle cx="150" cy="150" r="6" fill="#C084FC" className="pulse" />
                  <circle cx="300" cy="220" r="6" fill="#C084FC" className="pulse" />
                  <circle cx="450" cy="230" r="6" fill="#C084FC" className="pulse" />
                  <circle cx="600" cy="150" r="6" fill="#C084FC" className="pulse" />
                  <circle cx="750" cy="150" r="6" fill="#C084FC" className="pulse" />
                  
                  <circle cx="100" cy="300" r="5" fill="#60A5FA" className="pulse" />
                  <circle cx="250" cy="290" r="5" fill="#60A5FA" className="pulse" />
                  <circle cx="400" cy="350" r="5" fill="#60A5FA" className="pulse" />
                  <circle cx="550" cy="320" r="5" fill="#60A5FA" className="pulse" />
                  <circle cx="700" cy="290" r="5" fill="#60A5FA" className="pulse" />
                  
                  <circle cx="200" cy="400" r="4" fill="#3B82F6" className="pulse" />
                  <circle cx="350" cy="390" r="4" fill="#3B82F6" className="pulse" />
                  <circle cx="500" cy="450" r="4" fill="#3B82F6" className="pulse" />
                  <circle cx="650" cy="420" r="4" fill="#3B82F6" className="pulse" />
                  
                  {/* Port Markers */}
                  <circle cx="150" cy="100" r="8" fill="#FFC107" opacity="0.8" />
                  <circle cx="350" cy="85" r="8" fill="#FFC107" opacity="0.8" />
                  <circle cx="600" cy="115" r="8" fill="#FFC107" opacity="0.8" />
                  <circle cx="750" cy="80" r="8" fill="#FFC107" opacity="0.8" />
                  
                  {/* Refinery Markers */}
                  <rect x="175" y="125" width="10" height="10" rx="2" fill="#F97316" opacity="0.8" />
                  <rect x="375" y="110" width="10" height="10" rx="2" fill="#F97316" opacity="0.8" />
                  <rect x="625" y="140" width="10" height="10" rx="2" fill="#F97316" opacity="0.8" />
                  <rect x="775" y="105" width="10" height="10" rx="2" fill="#F97316" opacity="0.8" />
                </svg>
                
                {/* Interactive Elements */}
                <div className="absolute top-4 left-4 bg-primary-950/60 backdrop-blur-md rounded-lg px-3 py-2 text-xs text-primary-100 font-mono border border-primary-800/30">
                  Live Tracking: 2,499 vessels
                </div>
                
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <div className="bg-primary-950/60 backdrop-blur-md rounded-lg px-3 py-2 text-xs text-primary-100 border border-primary-800/30 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                    Realtime
                  </div>
                </div>
              </div>
              
              {/* Control Panel */}
              <div className="bg-slate-900/90 backdrop-blur-md p-4 border-t border-primary-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-primary-400"></div>
                    <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  </div>
                  <div className="text-xs text-primary-100 font-mono">MyShipTracking Elite Dashboard</div>
                  <div className="flex space-x-2">
                    <div className="text-primary-100/60 hover:text-primary-100 cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 5L9 12L15 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="text-primary-100/60 hover:text-primary-100 cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
              <div className="bg-primary-900/40 backdrop-blur-sm border border-primary-800/30 rounded-full px-4 py-1.5 text-xs font-medium text-primary-100">
                Real-time Tracking
              </div>
              <div className="bg-primary-900/40 backdrop-blur-sm border border-primary-800/30 rounded-full px-4 py-1.5 text-xs font-medium text-primary-100">
                Global Coverage
              </div>
              <div className="bg-primary-900/40 backdrop-blur-sm border border-primary-800/30 rounded-full px-4 py-1.5 text-xs font-medium text-primary-100">
                Advanced Analytics
              </div>
              <div className="bg-primary-900/40 backdrop-blur-sm border border-primary-800/30 rounded-full px-4 py-1.5 text-xs font-medium text-primary-100">
                AI Assistance
              </div>
            </div>
          </div>
        </div>
        
        {/* Scrolling Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <span className="text-xs text-primary-200/70 mb-2">Scroll to Explore</span>
          <div className="w-6 h-10 border-2 border-primary-200/30 rounded-full flex justify-center">
            <span className="block w-1 h-2 bg-primary-200/60 rounded-full mt-2 animate-bounce"></span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32 border-b">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="space-y-2 max-w-[58rem]">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Powerful Maritime Intelligence
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-3xl mx-auto">
                Our platform combines real-time tracking with advanced analytics to provide comprehensive maritime intelligence
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {/* Feature 1 */}
            <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm">
              <CardHeader>
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Global Vessel Tracking</CardTitle>
                <CardDescription>
                  Real-time monitoring of over 22,000 vessels worldwide with detailed position data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Interactive world map visualization</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Detailed vessel information</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Historical route tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm">
              <CardHeader>
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Powerful data analysis tools for making informed business decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Predictive route analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Cargo volume reporting</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Market trend visualization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm">
              <CardHeader>
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Assistant</CardTitle>
                <CardDescription>
                  Intelligent maritime insights and automated document generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Natural language vessel queries</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Automated document generation</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Market intelligence reports</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm">
              <CardHeader>
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Elite Membership</CardTitle>
                <CardDescription>
                  Premium features for oil brokers and industry professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Direct messaging with carriers</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Tender bidding tools</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Advanced cargo analytics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Additional features can be added here */}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 border-b">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
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
            <Card className="flex flex-col border shadow-sm">
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <CardDescription>Essential tracking for small operations</CardDescription>
                <div className="mt-4 flex items-baseline text-primary">
                  <span className="text-4xl font-bold tracking-tight">$99</span>
                  <span className="ml-1 text-sm text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Access to global vessel tracking</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Basic analytics dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Standard document templates</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
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

            {/* Premium Plan */}
            <Card className="flex flex-col relative border shadow-sm overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-primary"></div>
              <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                Popular
              </div>
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>Advanced features for growing businesses</CardDescription>
                <div className="mt-4 flex items-baseline text-primary">
                  <span className="text-4xl font-bold tracking-tight">$199</span>
                  <span className="ml-1 text-sm text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Everything in Basic</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Advanced analytics and reporting</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>AI-powered document generation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Historical data (up to 12 months)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Priority email & phone support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/auth" className="w-full">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Elite Plan */}
            <Card className="flex flex-col border shadow-sm bg-gradient-to-b from-muted/50 to-background">
              <CardHeader>
                <CardTitle>Elite</CardTitle>
                <CardDescription>Premium features for industry professionals</CardDescription>
                <div className="mt-4 flex items-baseline text-primary">
                  <span className="text-4xl font-bold tracking-tight">$399</span>
                  <span className="ml-1 text-sm text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Everything in Premium</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Elite broker dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Direct messaging with carriers</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Tender bidding tools</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Custom API access</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Dedicated account manager</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/auth" className="w-full">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </CardFooter>
            </Card>
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