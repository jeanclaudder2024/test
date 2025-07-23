import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  Globe, 
  Target, 
  Shield, 
  TrendingUp, 
  Users, 
  Award, 
  Zap, 
  CheckCircle,
  Building2,
  Ship,
  MapPin,
  BarChart3,
  FileText,
  BookOpen,
  Handshake,
  Eye,
  Lock,
  Lightbulb,
  ChevronRight,
  MenuIcon,
  XIcon,
  ArrowLeft,
  Mail,
  Phone,
  ExternalLink,
  Cpu,
  Database,
  Network,
  Activity,
  Star,
  Rocket,
  Brain,
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import "../styles/about-animations.css";

export default function About() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Navigation */}
      <header 
        className={`px-4 lg:px-6 h-40 flex items-center justify-between fixed w-full z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-slate-900/90 border-b border-orange-500/20 backdrop-blur-lg shadow-md" 
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-2xl">
          <img src="/assets/petrodealhub-logo.png" alt="PetroDealHub Logo" className="h-36 w-auto" />
          <span className="text-white sr-only">PetroDealHub</span>
        </div>
        
        {/* Desktop Menu */}
        <nav className="hidden lg:flex gap-8 items-center">
          <Link 
            href="/" 
            className="text-sm font-medium text-white/80 hover:text-orange-500 transition-colors"
          >
            Home
          </Link>
          <span className="text-sm font-medium text-orange-500">
            About
          </span>
          <div className="h-6 w-px bg-slate-700"></div>
          <Link href="/refineries" className="text-sm font-medium text-white/80 hover:text-orange-500 transition-colors">
            Refineries
          </Link>
          <Link href="/vessels" className="text-sm font-medium text-white/80 hover:text-orange-500 transition-colors">
            Vessels
          </Link>
        </nav>
        
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
              Dashboard
            </Button>
          </Link>
          <Link href="/vessels">
            <Button size="default" className="bg-orange-500 hover:bg-orange-600 text-white">
              View Vessels
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
            <XIcon className="h-6 w-6 text-white" />
          ) : (
            <MenuIcon className="h-6 w-6 text-white" />
          )}
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/98 backdrop-blur-lg pt-40 px-4 py-6 flex flex-col">
          <nav className="flex flex-col gap-4">
            <Link href="/" className="text-lg font-medium py-2 border-b border-slate-800/80 text-white" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <span className="text-lg font-medium py-2 border-b border-slate-800/80 text-orange-500">About</span>
            <Link href="/refineries" className="text-lg font-medium py-2 border-b border-slate-800/80 text-white" onClick={() => setMobileMenuOpen(false)}>
              Refineries
            </Link>
            <Link href="/vessels" className="text-lg font-medium py-2 border-b border-slate-800/80 text-white" onClick={() => setMobileMenuOpen(false)}>
              Vessels
            </Link>
          </nav>
          <div className="mt-auto flex flex-col gap-3 pt-6">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full border-slate-700 text-white">Dashboard</Button>
            </Link>
            <Link href="/vessels" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">View Vessels</Button>
            </Link>
          </div>
        </div>
      )}


      
      {/* Main Content */}
      <div className="pt-40">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-[#001122]">
        {/* Advanced Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,111,0,0.15),transparent_40%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,51,102,0.2),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,111,0,0.08),transparent_60%)]"></div>
        
        {/* Animated Geometric Patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 border border-orange-500/20 rounded-full animate-spin-slow"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 border border-orange-400/15 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-10 w-32 h-32 bg-orange-500/5 rounded-full animate-bounce"></div>
          <div className="absolute top-10 right-1/3 w-16 h-16 bg-gradient-to-r from-orange-500/10 to-transparent rotate-45 animate-pulse"></div>
        </div>
        
        {/* Floating Data Visualization Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-32 left-1/4 flex items-center gap-2 bg-slate-800/40 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-500/20 animate-float">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/70 text-sm">298 Active Vessels</span>
          </div>
          <div className="absolute top-48 right-1/4 flex items-center gap-2 bg-slate-800/40 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-500/20 animate-float-delayed">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-white/70 text-sm">46 Global Ports</span>
          </div>
          <div className="absolute bottom-32 left-1/3 flex items-center gap-2 bg-slate-800/40 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-500/20 animate-float">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <span className="text-white/70 text-sm">Live Tracking</span>
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            <div className="mb-8 flex justify-center">
              <Badge variant="outline" className="bg-gradient-to-r from-orange-500/20 via-orange-600/20 to-orange-500/20 text-orange-300 border-orange-500/30 px-8 py-3 text-lg font-semibold backdrop-blur-sm">
                <Globe className="w-4 h-4 mr-2" />
                About PetroDealHub
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-10 leading-tight">
              <span className="text-white">The Future of</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 animate-gradient-x">
                Oil Trading
              </span>
              <br />
              <span className="text-white/90 text-3xl md:text-4xl lg:text-5xl font-light">Intelligence Platform</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Revolutionizing petroleum trading through advanced analytics, real-time vessel tracking, 
              and transparent deal execution. Where global oil trade meets cutting-edge technology.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-3 bg-slate-900/90 backdrop-blur-sm px-6 py-4 rounded-2xl border border-orange-500/30 group-hover:border-orange-500/50 transition-all">
                  <Globe className="h-6 w-6 text-orange-400" />
                  <div className="text-left">
                    <div className="text-white font-semibold">Global Network</div>
                    <div className="text-white/60 text-sm">Worldwide Coverage</div>
                  </div>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-3 bg-slate-900/90 backdrop-blur-sm px-6 py-4 rounded-2xl border border-blue-500/30 group-hover:border-blue-500/50 transition-all">
                  <Shield className="h-6 w-6 text-blue-400" />
                  <div className="text-left">
                    <div className="text-white font-semibold">Secure & Trusted</div>
                    <div className="text-white/60 text-sm">Enterprise Grade</div>
                  </div>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-3 bg-slate-900/90 backdrop-blur-sm px-6 py-4 rounded-2xl border border-green-500/30 group-hover:border-green-500/50 transition-all">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                  <div className="text-left">
                    <div className="text-white font-semibold">AI-Powered</div>
                    <div className="text-white/60 text-sm">Smart Analytics</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/vessels">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 group">
                  Explore Platform
                  <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-32 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Advanced Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,rgba(255,111,0,0.1),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,51,102,0.05),transparent_50%,rgba(255,111,0,0.05))]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-20">
              <Badge variant="outline" className="mb-8 bg-gradient-to-r from-orange-500/20 via-orange-600/20 to-orange-500/20 text-orange-300 border-orange-500/30 px-8 py-4 text-xl font-semibold backdrop-blur-sm">
                <Target className="w-5 h-5 mr-3" />
                Our Mission & Vision
              </Badge>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-12 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-white">
                  Transforming Global
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600">
                  Oil Trade Intelligence
                </span>
              </h2>
              <p className="text-2xl text-white/80 max-w-5xl mx-auto leading-relaxed font-light">
                We're building the world's most advanced petroleum trading ecosystem, where transparency meets technology 
                and global commerce meets intelligent automation.
              </p>
            </div>

            {/* Mission Cards Grid */}
            <div className="grid lg:grid-cols-3 gap-8 mb-20">
              {/* Mission Card 1 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <Card className="relative bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-800/60 border-slate-700/30 hover:border-orange-500/50 transition-all duration-500 group backdrop-blur-sm shadow-2xl hover:shadow-orange-500/20 rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                  <CardHeader className="p-8">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl inline-flex group-hover:scale-110 transition-all duration-300">
                        <BarChart3 className="h-8 w-8 text-orange-400" />
                      </div>
                    </div>
                    <CardTitle className="text-white text-2xl font-bold mb-4 group-hover:text-orange-100 transition-colors">Real-Time Analytics</CardTitle>
                    <CardDescription className="text-white/80 leading-relaxed text-lg">
                      Advanced vessel tracking, market analysis, and deal validation powered by AI-driven insights 
                      and real-time data processing across global maritime networks.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Mission Card 2 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <Card className="relative bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-800/60 border-slate-700/30 hover:border-blue-500/50 transition-all duration-500 group backdrop-blur-sm shadow-2xl hover:shadow-blue-500/20 rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                  <CardHeader className="p-8">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl inline-flex group-hover:scale-110 transition-all duration-300">
                        <Shield className="h-8 w-8 text-blue-400" />
                      </div>
                    </div>
                    <CardTitle className="text-white text-2xl font-bold mb-4 group-hover:text-blue-100 transition-colors">Transparent Security</CardTitle>
                    <CardDescription className="text-white/80 leading-relaxed text-lg">
                      Enterprise-grade security with complete transaction transparency, encrypted communications, 
                      and blockchain-verified deal authenticity for maximum trust and reliability.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Mission Card 3 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <Card className="relative bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-800/60 border-slate-700/30 hover:border-green-500/50 transition-all duration-500 group backdrop-blur-sm shadow-2xl hover:shadow-green-500/20 rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
                  <CardHeader className="p-8">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl inline-flex group-hover:scale-110 transition-all duration-300">
                        <Globe className="h-8 w-8 text-green-400" />
                      </div>
                    </div>
                    <CardTitle className="text-white text-2xl font-bold mb-4 group-hover:text-green-100 transition-colors">Global Network</CardTitle>
                    <CardDescription className="text-white/80 leading-relaxed text-lg">
                      Worldwide connectivity linking traders, brokers, refineries, and maritime operators 
                      through intelligent matching algorithms and automated deal execution systems.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>

            {/* Statistics Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/30 group-hover:border-orange-500/50 transition-all">
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-2">298+</div>
                    <div className="text-white/80 font-medium">Active Vessels</div>
                    <div className="text-white/60 text-sm">Real-time tracking</div>
                  </div>
                </div>
              </div>

              <div className="text-center group">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/30 group-hover:border-blue-500/50 transition-all">
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-2">46+</div>
                    <div className="text-white/80 font-medium">Global Ports</div>
                    <div className="text-white/60 text-sm">Worldwide coverage</div>
                  </div>
                </div>
              </div>

              <div className="text-center group">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/30 group-hover:border-green-500/50 transition-all">
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 mb-2">24/7</div>
                    <div className="text-white/80 font-medium">Live Monitoring</div>
                    <div className="text-white/60 text-sm">Always available</div>
                  </div>
                </div>
              </div>

              <div className="text-center group">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/30 group-hover:border-purple-500/50 transition-all">
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-2">AI</div>
                    <div className="text-white/80 font-medium">Powered Intelligence</div>
                    <div className="text-white/60 text-sm">Smart automation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-32 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-pattern-grid opacity-30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,111,0,0.08),transparent_60%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-20">
              <Badge variant="outline" className="mb-8 bg-gradient-to-r from-blue-500/20 via-blue-600/20 to-blue-500/20 text-blue-300 border-blue-500/30 px-8 py-4 text-xl font-semibold backdrop-blur-sm">
                <Cpu className="w-5 h-5 mr-3" />
                Advanced Technology Stack
              </Badge>
              <h2 className="text-5xl md:text-6xl font-black mb-12 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-white">
                  Powered by
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600">
                  Cutting-Edge Innovation
                </span>
              </h2>
              <p className="text-2xl text-white/80 max-w-5xl mx-auto leading-relaxed font-light">
                Our platform leverages the latest in AI, blockchain, and real-time data processing 
                to deliver unparalleled performance and reliability.
              </p>
            </div>

            {/* Technology Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Tech Card 1 - AI & Machine Learning */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <Card className="relative glass-effect-dark rounded-3xl overflow-hidden group-hover:scale-105 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-600"></div>
                  <CardHeader className="p-8">
                    <div className="relative mb-6">
                      <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-2xl inline-flex">
                        <Brain className="h-8 w-8 text-purple-400" />
                      </div>
                    </div>
                    <CardTitle className="text-white text-2xl font-bold mb-4">AI & Machine Learning</CardTitle>
                    <CardDescription className="text-white/80 leading-relaxed text-lg">
                      Advanced neural networks for predictive analytics, automated deal matching, 
                      and intelligent market insights powered by GPT-4 and custom ML models.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Tech Card 2 - Real-time Data Processing */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <Card className="relative glass-effect-dark rounded-3xl overflow-hidden group-hover:scale-105 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>
                  <CardHeader className="p-8">
                    <div className="relative mb-6">
                      <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl inline-flex">
                        <Activity className="h-8 w-8 text-green-400" />
                      </div>
                    </div>
                    <CardTitle className="text-white text-2xl font-bold mb-4">Real-time Processing</CardTitle>
                    <CardDescription className="text-white/80 leading-relaxed text-lg">
                      High-performance data streams processing vessel positions, market prices, 
                      and deal status with sub-second latency using advanced WebSocket architecture.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Tech Card 3 - Blockchain Security */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <Card className="relative glass-effect-dark rounded-3xl overflow-hidden group-hover:scale-105 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-600"></div>
                  <CardHeader className="p-8">
                    <div className="relative mb-6">
                      <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-2xl inline-flex">
                        <Lock className="h-8 w-8 text-orange-400" />
                      </div>
                    </div>
                    <CardTitle className="text-white text-2xl font-bold mb-4">Blockchain Security</CardTitle>
                    <CardDescription className="text-white/80 leading-relaxed text-lg">
                      Immutable transaction records, smart contract automation, 
                      and cryptographic verification ensuring maximum security and transparency.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Tech Card 4 - Cloud Infrastructure */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <Card className="relative glass-effect-dark rounded-3xl overflow-hidden group-hover:scale-105 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-600"></div>
                  <CardHeader className="p-8">
                    <div className="relative mb-6">
                      <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-2xl inline-flex">
                        <Database className="h-8 w-8 text-blue-400" />
                      </div>
                    </div>
                    <CardTitle className="text-white text-2xl font-bold mb-4">Cloud Infrastructure</CardTitle>
                    <CardDescription className="text-white/80 leading-relaxed text-lg">
                      Enterprise-grade cloud architecture with auto-scaling, 
                      global CDN distribution, and 99.9% uptime SLA for maximum reliability.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Tech Card 5 - API Integration */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <Card className="relative glass-effect-dark rounded-3xl overflow-hidden group-hover:scale-105 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-600"></div>
                  <CardHeader className="p-8">
                    <div className="relative mb-6">
                      <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-2xl inline-flex">
                        <Network className="h-8 w-8 text-yellow-400" />
                      </div>
                    </div>
                    <CardTitle className="text-white text-2xl font-bold mb-4">API Integration</CardTitle>
                    <CardDescription className="text-white/80 leading-relaxed text-lg">
                      Seamless integration with maritime APIs, financial systems, 
                      and third-party services through robust RESTful and GraphQL endpoints.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Tech Card 6 - Advanced Analytics */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <Card className="relative glass-effect-dark rounded-3xl overflow-hidden group-hover:scale-105 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-600"></div>
                  <CardHeader className="p-8">
                    <div className="relative mb-6">
                      <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl inline-flex">
                        <Settings className="h-8 w-8 text-indigo-400" />
                      </div>
                    </div>
                    <CardTitle className="text-white text-2xl font-bold mb-4">Advanced Analytics</CardTitle>
                    <CardDescription className="text-white/80 leading-relaxed text-lg">
                      Comprehensive business intelligence with custom dashboards, 
                      predictive modeling, and automated reporting for strategic decision making.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Item 3 */}
      <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group">
        <CardHeader>
          <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-6 w-6 text-orange-500" />
          </div>
          <CardTitle className="text-white">Real-time Intelligence</CardTitle>
          <CardDescription className="text-white/70">
            Provide real-time data intelligence on refineries, vessels, and trade dynamics
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Mission Item 4 */}
      <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group">
        <CardHeader>
          <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-4 group-hover:scale-110 transition-transform">
            <Lock className="h-6 w-6 text-orange-500" />
          </div>
          <CardTitle className="text-white">Secure Environment</CardTitle>
          <CardDescription className="text-white/70">
            Offer secure environments for negotiating and managing deals with complete protection
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Mission Item 5 */}
              <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group">
                <CardHeader>
                  <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-white">Risk Protection</CardTitle>
                  <CardDescription className="text-white/70">
                    Help users protect capital, minimize risk, and close verified deals with confidence
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Mission Item 6 */}
              <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group">
                <CardHeader>
                  <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-4 group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-white">Verified Deals</CardTitle>
                  <CardDescription className="text-white/70">
                    Ensure all transactions are verified, authentic, and backed by reliable documentation
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Built for Global Standards */}
      <section className="py-20 bg-[#002244]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30">
                Global Standards
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                A Platform Built for Global Standards
              </h2>
              <p className="text-white/70 text-lg max-w-3xl mx-auto">
                PetroDealHub serves as a comprehensive commercial interface for professionals across the petroleum industry
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Industry 1 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Zap className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Crude & Refined Trading</h3>
                </div>
                <p className="text-white/70">Advanced tools for crude oil and refined petroleum product trading operations</p>
              </div>

              {/* Industry 2 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Ship className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Marine Shipping & Logistics</h3>
                </div>
                <p className="text-white/70">Comprehensive vessel tracking and maritime logistics management solutions</p>
              </div>

              {/* Industry 3 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Building2 className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Refinery Deal Desks</h3>
                </div>
                <p className="text-white/70">Specialized tools for refinery operations and deal desk management</p>
              </div>

              {/* Industry 4 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <FileText className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Compliance & Documentation</h3>
                </div>
                <p className="text-white/70">Automated compliance management and document processing systems</p>
              </div>

              {/* Industry 5 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Globe className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">National Oil Companies</h3>
                </div>
                <p className="text-white/70">Enterprise solutions for national oil companies and government institutions</p>
              </div>

              {/* Industry 6 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Energy Institutions</h3>
                </div>
                <p className="text-white/70">Comprehensive platforms for energy-focused financial and trading institutions</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-white/80 text-lg font-medium">
                Our systems are built on structured data layers, secure pipelines, verified business logic, and a user experience crafted for real traders and decision-makers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Training & Support Section */}
      <section className="py-20 bg-[#003366]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30">
              Training & Support
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Training. Support. Empowerment.
            </h2>
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              We believe knowledge drives precision. That's why PetroDealHub offers continuous onboarding, guidance, and training modules for our subscribers. Whether you're an emerging broker or a seasoned refinery executive, you'll always know what's next, what's required, and what's real in your deal pipeline.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader className="text-center">
                  <div className="p-4 bg-orange-500/20 rounded-xl inline-flex mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-orange-500" />
                  </div>
                  <CardTitle className="text-white">Continuous Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70">Ongoing training modules and educational resources for all skill levels</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader className="text-center">
                  <div className="p-4 bg-orange-500/20 rounded-xl inline-flex mx-auto mb-4">
                    <Users className="h-8 w-8 text-orange-500" />
                  </div>
                  <CardTitle className="text-white">Expert Guidance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70">Professional support from industry experts and trading specialists</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader className="text-center">
                  <div className="p-4 bg-orange-500/20 rounded-xl inline-flex mx-auto mb-4">
                    <Lightbulb className="h-8 w-8 text-orange-500" />
                  </div>
                  <CardTitle className="text-white">Smart Onboarding</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70">Intelligent onboarding process tailored to your experience and role</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Clarity Section */}
      <section className="py-20 bg-[#002244]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30">
                Trust & Protection
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Trust, Clarity, and Deal Protection
              </h2>
              <p className="text-white/70 text-lg max-w-3xl mx-auto">
                At the heart of PetroDealHub is a commitment to transparency. We help companies operate with confidence and security.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Trust Point 1 */}
              <div className="flex gap-4 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="p-3 bg-orange-500/20 rounded-lg shrink-0">
                  <Shield className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Avoid Misinformation</h3>
                  <p className="text-white/70">Eliminate unreliable middlemen and access verified, authentic market data</p>
                </div>
              </div>

              {/* Trust Point 2 */}
              <div className="flex gap-4 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="p-3 bg-orange-500/20 rounded-lg shrink-0">
                  <Eye className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Complete Visibility</h3>
                  <p className="text-white/70">Maintain deal visibility from Day 1 to final delivery with real-time tracking</p>
                </div>
              </div>

              {/* Trust Point 3 */}
              <div className="flex gap-4 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="p-3 bg-orange-500/20 rounded-lg shrink-0">
                  <FileText className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Clear Legal Structures</h3>
                  <p className="text-white/70">Operate with transparent legal frameworks and honest pricing mechanisms</p>
                </div>
              </div>

              {/* Trust Point 4 */}
              <div className="flex gap-4 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="p-3 bg-orange-500/20 rounded-lg shrink-0">
                  <Handshake className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Preserve Trust & Security</h3>
                  <p className="text-white/70">Maintain client trust, financial security, and operational integrity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Scale Section */}
      <section className="py-20 bg-[#003366]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30">
              Global Vision
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Driven by Vision. Designed for Scale.
            </h2>
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              Our team spans multiple countries and time zones, combining deep oil & gas expertise with scalable digital architecture. Whether you're in Houston, Dubai, Rotterdam, or Singapore — PetroDealHub speaks your language.
            </p>
            <p className="text-white/80 text-xl font-medium mb-8">
              We are building the future of petroleum trading — one deal, one tanker, one secure connection at a time.
            </p>

            {/* Global Presence */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="p-4 bg-orange-500/20 rounded-xl inline-flex mb-3">
                  <MapPin className="h-6 w-6 text-orange-500" />
                </div>
                <h4 className="text-white font-semibold">Houston</h4>
                <p className="text-white/60 text-sm">Americas Hub</p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-orange-500/20 rounded-xl inline-flex mb-3">
                  <MapPin className="h-6 w-6 text-orange-500" />
                </div>
                <h4 className="text-white font-semibold">Dubai</h4>
                <p className="text-white/60 text-sm">Middle East Hub</p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-orange-500/20 rounded-xl inline-flex mb-3">
                  <MapPin className="h-6 w-6 text-orange-500" />
                </div>
                <h4 className="text-white font-semibold">Rotterdam</h4>
                <p className="text-white/60 text-sm">Europe Hub</p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-orange-500/20 rounded-xl inline-flex mb-3">
                  <MapPin className="h-6 w-6 text-orange-500" />
                </div>
                <h4 className="text-white font-semibold">Singapore</h4>
                <p className="text-white/60 text-sm">Asia Pacific Hub</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              🌐 PetroDealHub — The Global Oil Trade Platform
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Precision. Protection. Power.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full">
                <Award className="h-5 w-5 text-white" />
                <span className="text-white font-medium">Precision</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full">
                <Shield className="h-5 w-5 text-white" />
                <span className="text-white font-medium">Protection</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full">
                <Zap className="h-5 w-5 text-white" />
                <span className="text-white font-medium">Power</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">P</span>
                  </div>
                  <span className="text-white font-bold text-2xl">PetroDealHub</span>
                </div>
                <p className="text-white/70 mb-6 max-w-md">
                  The global platform for petroleum trading intelligence, transparency, and secure deal execution. Empowering brokers, traders, and industry professionals worldwide.
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-white/60">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">contact@petrodealhub.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">+1 (555) 123-4567</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-semibold mb-4 text-white">Platform</h3>
                <ul className="space-y-2">
                  <li><Link href="/vessels" className="text-white/60 hover:text-orange-500 transition-colors">Vessel Tracking</Link></li>
                  <li><Link href="/refineries" className="text-white/60 hover:text-orange-500 transition-colors">Refineries</Link></li>
                  <li><Link href="/ports" className="text-white/60 hover:text-orange-500 transition-colors">Ports</Link></li>
                  <li><Link href="/oil-prices" className="text-white/60 hover:text-orange-500 transition-colors">Oil Prices</Link></li>
                  <li><Link href="/dashboard" className="text-white/60 hover:text-orange-500 transition-colors">Dashboard</Link></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="font-semibold mb-4 text-white">Company</h3>
                <ul className="space-y-2">
                  <li><span className="text-orange-500">About Us</span></li>
                  <li><Link href="/careers" className="text-white/60 hover:text-orange-500 transition-colors">Careers</Link></li>
                  <li><Link href="/contact" className="text-white/60 hover:text-orange-500 transition-colors">Contact</Link></li>
                  <li><Link href="/privacy" className="text-white/60 hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-white/60 hover:text-orange-500 transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between">
              <div className="text-sm text-white/50 mb-4 md:mb-0">
                © 2025 PetroDealHub. All rights reserved. | Built for the global petroleum trading industry.
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-white/40">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">Global Platform</span>
                </div>
                <div className="flex items-center gap-2 text-white/40">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Secure Trading</span>
                </div>
                <div className="flex items-center gap-2 text-white/40">
                  <Award className="h-4 w-4" />
                  <span className="text-sm">Industry Leading</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}